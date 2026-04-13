import { Worker } from 'bullmq'
import { chromium } from 'playwright'
import axios from 'axios'
import prisma from '../lib/prisma'
import { redisConnection } from '../lib/queue'

const runApiTestCase = async (testCase: any, env: any) => {
  const startTime = Date.now()
  let status = 'SUCCESS'
  let logs = ''
  let errorMessage = ''
  let results: any[] = []

  try {
    const url = testCase.url.startsWith('http') ? testCase.url : `${env.baseUrl}${testCase.url}`
    const response = await axios({
      method: testCase.method,
      url,
      headers: { ...env.headers, ...testCase.headers },
      params: { ...env.variables, ...testCase.params },
      data: testCase.body || {},
      validateStatus: () => true,
      timeout: 30000,
    })

    const duration = Date.now() - startTime
    
    // Assertion Engine (copied from debug API)
    results = (testCase.assertions || []).map((as: any) => {
      let actual: any = null
      let passed = false
      try {
        if (as.type === 'status_code') actual = response.status
        else if (as.type === 'header') actual = response.headers[as.path?.toLowerCase()]
        else if (as.type === 'json_body') {
          actual = response.data
          if (as.path) as.path.split('.').forEach((p: string) => actual = actual?.[p])
        }
        if (as.operator === 'equal') passed = String(actual) === String(as.expected)
        else if (as.operator === 'contains') passed = String(actual).includes(String(as.expected))
        else if (as.operator === 'exists') passed = actual !== undefined && actual !== null
      } catch (e) { passed = false }
      return { ...as, actual, passed }
    })

    if (results.some(r => !r.passed)) {
      status = 'FAILURE'
      errorMessage = 'One or more assertions failed'
    }
    
    logs = JSON.stringify({ response: response.data, assertionResults: results }, null, 2)
  } catch (e: any) {
    status = 'ERROR'
    errorMessage = e.message
  }

  return { status, duration: Date.now() - startTime, logs, errorMessage }
}

const runUiTestCase = async (testCase: any, env: any) => {
  const startTime = Date.now()
  let status = 'SUCCESS'
  let logs = ''
  let errorMessage = ''
  let screenshotUrl = null

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    const steps = testCase.steps || []
    for (const step of steps) {
      logs += `Executing step: ${step.type} - ${step.value || step.selector}\n`
      if (step.type === 'goto') {
        const url = step.value.startsWith('http') ? step.value : `${env.baseUrl}${step.value}`
        await page.goto(url)
      } else if (step.type === 'click') {
        await page.click(step.selector)
      } else if (step.type === 'fill') {
        await page.fill(step.selector, step.value)
      } else if (step.type === 'waitForSelector') {
        await page.waitForSelector(step.selector, { timeout: 10000 })
      } else if (step.type === 'assertVisible') {
        const isVisible = await page.isVisible(step.selector)
        if (!isVisible) throw new Error(`Element ${step.selector} is not visible`)
      }
    }
  } catch (e: any) {
    status = 'FAILURE'
    errorMessage = e.message
    try {
      // Capture screenshot on failure
      const screenshot = await page.screenshot()
      // In a real app, you'd upload this to S3. Here we'll just log its base64 or placeholder.
      screenshotUrl = 'data:image/png;base64,' + screenshot.toString('base64').substring(0, 100) + '...'
    } catch (ssErr) {}
  } finally {
    await browser.close()
  }

  return { status, duration: Date.now() - startTime, logs, errorMessage, screenshotUrl }
}

const worker = new Worker('test-execution', async (job) => {
  const { runId } = job.data
  console.log(`Starting TestRun: ${runId}`)

  try {
    const run = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        suite: {
          include: {
            items: {
              include: {
                apiTestCase: true,
                uiTestCase: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!run) return

    const env = await prisma.environment.findUnique({ where: { id: run.environmentId } })
    if (!env) return

    await prisma.testRun.update({
      where: { id: runId },
      data: { status: 'RUNNING', startTime: new Date() },
    })

    const items = run.suite?.items || []
    for (const item of items) {
      let result: any
      if (item.apiTestCase) {
        result = await runApiTestCase(item.apiTestCase, env)
        await prisma.testResult.create({
          data: {
            runId,
            apiTestCaseId: item.apiTestCaseId,
            ...result,
          },
        })
      } else if (item.uiTestCase) {
        result = await runUiTestCase(item.uiTestCase, env)
        await prisma.testResult.create({
          data: {
            runId,
            uiTestCaseId: item.uiTestCaseId,
            ...result,
          },
        })
      }
    }

    await prisma.testRun.update({
      where: { id: runId },
      data: { status: 'COMPLETED', endTime: new Date() },
    })
  } catch (error: any) {
    console.error(`Error in TestRun ${runId}:`, error)
    await prisma.testRun.update({
      where: { id: runId },
      data: { status: 'FAILED', endTime: new Date() },
    })
  }
}, { connection: redisConnection })

console.log('Worker is running...')
