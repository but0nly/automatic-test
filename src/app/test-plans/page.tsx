'use client'

import { useEffect, useState } from 'react'
import { Plus, Play, CalendarRange, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function TestPlansPage() {
  const [suites, setSuites] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [environments, setEnvironments] = useState<any[]>([])
  const [apiCases, setApiCases] = useState<any[]>([])
  const [uiCases, setUiCases] = useState<any[]>([])
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedEnvId, setSelectedEnvId] = useState<string>('')
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedApiCaseIds, setSelectedApiCaseIds] = useState<string[]>([])
  const [selectedUiCaseIds, setSelectedUiCaseIds] = useState<string[]>([])
  
  const [isRunOpen, setIsRunOpen] = useState(false)
  const [runningSuiteId, setRunningSuiteId] = useState<string | null>(null)

  const fetchData = async () => {
    const [s, p, e, ac, uc] = await Promise.all([
      fetch('/api/test-suites').then(res => res.json()),
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/environments').then(res => res.json()),
      fetch('/api/api-test-cases').then(res => res.json()),
      fetch('/api/ui-test-cases').then(res => res.json()),
    ])
    setSuites(s)
    setProjects(p)
    setEnvironments(e)
    setApiCases(ac)
    setUiCases(uc)
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async () => {
    if (!newName || !selectedProjectId) return
    await fetch('/api/test-suites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        projectId: selectedProjectId,
        apiCaseIds: selectedApiCaseIds,
        uiCaseIds: selectedUiCaseIds
      }),
    })
    setIsCreateOpen(false)
    fetchData()
  }

  const handleRun = async () => {
    if (!runningSuiteId || !selectedEnvId) return
    await fetch('/api/test-runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suiteId: runningSuiteId, environmentId: selectedEnvId }),
    })
    setIsRunOpen(false)
    alert('测试已启动，请在测试报告中查看进度。')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarRange className="h-8 w-8" />
            测试计划
          </h1>
          <p className="text-muted-foreground mt-2">将多个用例组合成测试集并执行</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button className="flex items-center gap-2"><Plus className="h-4 w-4" />新建计划</Button>} />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建测试计划</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>所属项目</Label>
                <Select onValueChange={(v) => setSelectedProjectId(v || '')} value={selectedProjectId}>
                  <SelectTrigger><SelectValue placeholder="选择项目" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>计划名称</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="如：全量接口回归" />
              </div>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <Label className="font-bold">接口用例</Label>
                  <div className="border rounded-md p-2 max-h-48 overflow-auto space-y-2">
                    {apiCases.filter(c => c.projectId === selectedProjectId).map(c => (
                      <div key={c.id} className="flex items-center gap-2">
                        <Checkbox checked={selectedApiCaseIds.includes(c.id)} onCheckedChange={(checked) => {
                          setSelectedApiCaseIds(checked ? [...selectedApiCaseIds, c.id] : selectedApiCaseIds.filter(id => id !== c.id))
                        }} />
                        <span className="text-xs truncate">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="font-bold">UI用例</Label>
                  <div className="border rounded-md p-2 max-h-48 overflow-auto space-y-2">
                    {uiCases.filter(c => c.projectId === selectedProjectId).map(c => (
                      <div key={c.id} className="flex items-center gap-2">
                        <Checkbox checked={selectedUiCaseIds.includes(c.id)} onCheckedChange={(checked) => {
                          setSelectedUiCaseIds(checked ? [...selectedUiCaseIds, c.id] : selectedUiCaseIds.filter(id => id !== c.id))
                        }} />
                        <span className="text-xs truncate">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!newName || !selectedProjectId}>创建计划</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>计划名称</TableHead>
              <TableHead>项目</TableHead>
              <TableHead className="text-center">用例数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suites.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.project.name}</TableCell>
                <TableCell className="text-center">{s._count.items}</TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Dialog open={isRunOpen && runningSuiteId === s.id} onOpenChange={(open) => {
                    setIsRunOpen(open)
                    if (open) {
                      setRunningSuiteId(s.id)
                      setSelectedProjectId(s.projectId)
                    }
                  }}>
                    <DialogTrigger render={<Button variant="outline" size="sm" className="flex items-center gap-2 ml-auto"><Play className="h-3 w-3" />立即运行</Button>} />
                    <DialogContent>
                      <DialogHeader><DialogTitle>执行测试计划</DialogTitle></DialogHeader>
                      <div className="py-4 space-y-4">
                        <Label>选择执行环境</Label>
                        <Select onValueChange={(v) => setSelectedEnvId(v || '')} value={selectedEnvId}>
                          <SelectTrigger><SelectValue placeholder="请选择运行环境" /></SelectTrigger>
                          <SelectContent>
                            {environments.filter(e => e.projectId === selectedProjectId).map(e => (
                              <SelectItem key={e.id} value={e.id}>{e.name} ({e.baseUrl})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {environments.filter(e => e.projectId === selectedProjectId).length === 0 && (
                          <p className="text-xs text-destructive">该项目暂无环境配置，请先创建环境。</p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button onClick={handleRun} disabled={!selectedEnvId}>确认启动</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
