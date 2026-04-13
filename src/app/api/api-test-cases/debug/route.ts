import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { method, url, headers, params, body: reqBody } = body

    if (!method || !url) {
      return NextResponse.json({ error: 'Method and URL are required' }, { status: 400 })
    }

    const startTime = Date.now()
    try {
      const response = await axios({
        method,
        url,
        headers: headers || {},
        params: params || {},
        data: reqBody || {},
        validateStatus: () => true, // Don't throw on error status
        timeout: 10000,
      })
      const duration = Date.now() - startTime

      // Run assertions
      const assertionResults = (body.assertions || []).map((as: any) => {
        let actual: any = null
        let passed = false

        try {
          if (as.type === 'status_code') {
            actual = response.status
          } else if (as.type === 'header') {
            actual = response.headers[as.path?.toLowerCase()]
          } else if (as.type === 'json_body') {
            // Simple path traversal for JSON body (e.g. "data.id")
            actual = response.data
            if (as.path) {
              const parts = as.path.split('.')
              for (const part of parts) {
                actual = actual?.[part]
              }
            }
          }

          if (as.operator === 'equal') {
            passed = String(actual) === String(as.expected)
          } else if (as.operator === 'contains') {
            passed = String(actual).includes(String(as.expected))
          } else if (as.operator === 'exists') {
            passed = actual !== undefined && actual !== null
          }
        } catch (e) {
          passed = false
        }

        return { ...as, actual, passed }
      })

      return NextResponse.json({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        duration,
        assertionResults,
      })
    } catch (axiosError: any) {
      return NextResponse.json({
        error: axiosError.message,
        details: axiosError.response?.data,
        duration: Date.now() - startTime,
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
