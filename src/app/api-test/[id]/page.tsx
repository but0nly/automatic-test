'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Play, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KeyValue {
  key: string
  value: string
}

interface Assertion {
  type: 'status_code' | 'json_body' | 'header'
  operator: 'equal' | 'contains' | 'exists'
  path?: string
  expected: string
}

export default function ApiTestCaseEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const isNew = resolvedParams.id === 'new'
  
  const [projects, setProjects] = useState<any[]>([])
  const [name, setName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  
  const [headers, setHeaders] = useState<KeyValue[]>([{ key: '', value: '' }])
  const [paramsList, setParamsList] = useState<KeyValue[]>([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  
  const [assertions, setAssertions] = useState<Assertion[]>([
    { type: 'status_code', operator: 'equal', expected: '200' }
  ])
  
  const [debugResponse, setDebugResponse] = useState<any>(null)
  const [isDebugging, setIsDebugging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(setProjects)
    
    if (!isNew) {
      fetch(`/api/api-test-cases/${resolvedParams.id}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name)
          setProjectId(data.projectId)
          setMethod(data.method)
          setUrl(data.url)
          
          // Convert JSON objects back to KV arrays
          if (data.headers) {
            setHeaders(Object.entries(data.headers).map(([key, value]) => ({ key, value: String(value) })))
          }
          if (data.params) {
            setParamsList(Object.entries(data.params).map(([key, value]) => ({ key, value: String(value) })))
          }
          if (data.body) {
            setBody(JSON.stringify(data.body, null, 2))
          }
          if (data.assertions) {
            setAssertions(data.assertions)
          }
        })
    }
  }, [isNew, resolvedParams.id])

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }])
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i))
  const updateHeader = (i: number, field: 'key' | 'value', val: string) => {
    const newHeaders = [...headers]
    newHeaders[i][field] = val
    setHeaders(newHeaders)
  }

  const addParam = () => setParamsList([...paramsList, { key: '', value: '' }])
  const removeParam = (i: number) => setParamsList(paramsList.filter((_, idx) => idx !== i))
  const updateParam = (i: number, field: 'key' | 'value', val: string) => {
    const newParams = [...paramsList]
    newParams[i][field] = val
    setParamsList(newParams)
  }

  const addAssertion = () => setAssertions([...assertions, { type: 'json_body', operator: 'equal', expected: '' }])
  const removeAssertion = (i: number) => setAssertions(assertions.filter((_, idx) => idx !== i))
  const updateAssertion = (i: number, field: keyof Assertion, val: string) => {
    const newAssertions = [...assertions]
    // @ts-ignore
    newAssertions[i][field] = val
    setAssertions(newAssertions)
  }

  const getRequestData = () => {
    const h: any = {}
    headers.forEach(kv => { if (kv.key) h[kv.key] = kv.value })
    const p: any = {}
    paramsList.forEach(kv => { if (kv.key) p[kv.key] = kv.value })
    
    let b = {}
    try { if (body) b = JSON.parse(body) } catch (e) {}

    return {
      name,
      method,
      url,
      projectId,
      headers: h,
      params: p,
      body: b,
      assertions,
    }
  }

  const handleSave = async () => {
    if (!name || !url || !projectId) {
      alert('请输入名称、URL和所属项目')
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch(isNew ? '/api/api-test-cases' : `/api/api-test-cases/${resolvedParams.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getRequestData()),
      })
      if (res.ok) router.push('/api-test')
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDebug = async () => {
    if (!url) return
    setIsDebugging(true)
    setDebugResponse(null)
    try {
      const res = await fetch('/api/api-test-cases/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getRequestData()),
      })
      const data = await res.json()
      setDebugResponse(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsDebugging(false)
    }
  }

  return (
    <div className="p-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? '新建接口用例' : '编辑接口用例'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="flex items-center gap-2" onClick={handleDebug} disabled={isDebugging}>
            <Play className="h-4 w-4" />
            {isDebugging ? '执行中...' : '调试运行'}
          </Button>
          <Button className="flex items-center gap-2" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? '保存中...' : '保存用例'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>所属项目</Label>
              <Select onValueChange={(v) => setProjectId(v || '')} value={projectId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择项目" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>用例名称</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="请输入用例名称" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Select onValueChange={(v) => setMethod(v || 'GET')} value={method}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/path" className="flex-1 font-mono" />
        </div>

        <Tabs defaultValue="params">
          <TabsList className="mb-4">
            <TabsTrigger value="params">查询参数</TabsTrigger>
            <TabsTrigger value="headers">请求头</TabsTrigger>
            <TabsTrigger value="body">请求体</TabsTrigger>
            <TabsTrigger value="assertions">断言规则</TabsTrigger>
          </TabsList>
          
          <TabsContent value="params" className="space-y-4">
            {paramsList.map((kv, i) => (
              <div key={i} className="flex gap-2">
                <Input value={kv.key} onChange={e => updateParam(i, 'key', e.target.value)} placeholder="参数名" className="flex-1" />
                <Input value={kv.value} onChange={e => updateParam(i, 'value', e.target.value)} placeholder="参数值" className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => removeParam(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addParam} className="mt-2"><Plus className="mr-2 h-4 w-4" /> 添加参数</Button>
          </TabsContent>

          <TabsContent value="headers" className="space-y-4">
            {headers.map((kv, i) => (
              <div key={i} className="flex gap-2">
                <Input value={kv.key} onChange={e => updateHeader(i, 'key', e.target.value)} placeholder="Header名" className="flex-1" />
                <Input value={kv.value} onChange={e => updateHeader(i, 'value', e.target.value)} placeholder="Header值" className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => removeHeader(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addHeader} className="mt-2"><Plus className="mr-2 h-4 w-4" /> 添加Header</Button>
          </TabsContent>

          <TabsContent value="body">
            <textarea
              className="w-full h-48 p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder='{ "key": "value" }'
            />
          </TabsContent>

          <TabsContent value="assertions" className="space-y-4">
            {assertions.map((as, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Select onValueChange={v => updateAssertion(i, 'type', v || 'status_code')} value={as.type}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status_code">状态码</SelectItem>
                    <SelectItem value="json_body">JSON主体</SelectItem>
                    <SelectItem value="header">响应头</SelectItem>
                  </SelectContent>
                </Select>
                {as.type !== 'status_code' && (
                  <Input value={as.path} onChange={e => updateAssertion(i, 'path', e.target.value)} placeholder="路径 (e.g. data.id)" className="w-48" />
                )}
                <Select onValueChange={v => updateAssertion(i, 'operator', v || 'equal')} value={as.operator}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">等于</SelectItem>
                    <SelectItem value="contains">包含</SelectItem>
                    <SelectItem value="exists">存在</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={as.expected} onChange={e => updateAssertion(i, 'expected', e.target.value)} placeholder="期望值" className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => removeAssertion(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addAssertion} className="mt-2"><Plus className="mr-2 h-4 w-4" /> 添加断言</Button>
          </TabsContent>
        </Tabs>

        {debugResponse && (
          <Card className="mt-4 border-blue-200 bg-blue-50/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>调试结果</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  debugResponse.status < 400 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {debugResponse.status} {debugResponse.statusText} • {debugResponse.duration}ms
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debugResponse.assertionResults && (
                <div className="mb-4 space-y-2">
                  <h4 className="text-sm font-semibold mb-2">断言结果</h4>
                  {debugResponse.assertionResults.map((as: any, i: number) => (
                    <div key={i} className={cn(
                      "text-xs p-2 rounded flex items-center justify-between border",
                      as.passed ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                    )}>
                      <span>
                        [{as.type === 'status_code' ? '状态码' : as.type === 'header' ? '响应头' : 'JSON主体'}] 
                        {as.path ? ` ${as.path}` : ''} 
                        {as.operator === 'equal' ? ' 等于 ' : as.operator === 'contains' ? ' 包含 ' : ' 存在 '}
                        {as.expected}
                      </span>
                      <span className="font-bold">{as.passed ? '通过' : `失败 (实际: ${as.actual})`}</span>
                    </div>
                  ))}
                </div>
              )}
              <h4 className="text-sm font-semibold mb-2">响应内容</h4>
              <pre className="text-xs font-mono bg-white p-4 border rounded max-h-64 overflow-auto">
                {JSON.stringify(debugResponse.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
