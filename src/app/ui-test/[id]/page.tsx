'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Step {
  type: 'goto' | 'click' | 'fill' | 'waitForSelector' | 'assertVisible'
  selector?: string
  value?: string
}

export default function UiTestCaseEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const isNew = resolvedParams.id === 'new'
  
  const [projects, setProjects] = useState<any[]>([])
  const [name, setName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [steps, setSteps] = useState<Step[]>([{ type: 'goto', value: '/' }])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(setProjects)
    
    if (!isNew) {
      fetch(`/api/ui-test-cases/${resolvedParams.id}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name)
          setProjectId(data.projectId)
          if (data.steps) setSteps(data.steps)
        })
    }
  }, [isNew, resolvedParams.id])

  const addStep = () => setSteps([...steps, { type: 'click', selector: '' }])
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i))
  const updateStep = (i: number, field: keyof Step, val: string) => {
    const newSteps = [...steps]
    // @ts-ignore
    newSteps[i][field] = val
    setSteps(newSteps)
  }

  const handleSave = async () => {
    if (!name || !projectId) {
      alert('请输入名称和所属项目')
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch(isNew ? '/api/ui-test-cases' : `/api/ui-test-cases/${resolvedParams.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, projectId, steps }),
      })
      if (res.ok) router.push('/ui-test')
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? '新建UI用例' : '编辑UI用例'}</h1>
        </div>
        <Button className="flex items-center gap-2" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? '保存中...' : '保存用例'}
        </Button>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">测试步骤</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2 items-center border p-3 rounded-md bg-gray-50/50">
                <div className="text-muted-foreground font-mono text-xs w-6">{i + 1}</div>
                <Select onValueChange={v => updateStep(i, 'type', v || 'click')} value={step.type}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goto">访问页面</SelectItem>
                    <SelectItem value="click">点击元素</SelectItem>
                    <SelectItem value="fill">输入内容</SelectItem>
                    <SelectItem value="waitForSelector">等待元素</SelectItem>
                    <SelectItem value="assertVisible">断言可见</SelectItem>
                  </SelectContent>
                </Select>

                {(step.type === 'click' || step.type === 'fill' || step.type === 'waitForSelector' || step.type === 'assertVisible') && (
                  <Input 
                    value={step.selector} 
                    onChange={e => updateStep(i, 'selector', e.target.value)} 
                    placeholder="CSS 选择器 (e.g. #login-btn)" 
                    className="flex-1 font-mono text-xs" 
                  />
                )}
                
                {(step.type === 'goto' || step.type === 'fill') && (
                  <Input 
                    value={step.value} 
                    onChange={e => updateStep(i, 'value', e.target.value)} 
                    placeholder={step.type === 'goto' ? "URL 路径 (e.g. /login)" : "输入值"} 
                    className="flex-1" 
                  />
                )}

                <Button variant="ghost" size="icon" onClick={() => removeStep(i)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addStep} className="mt-2">
              <Plus className="mr-2 h-4 w-4" /> 添加步骤
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
