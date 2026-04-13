'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Globe } from 'lucide-react'
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

interface Project {
  id: string
  name: string
}

interface Environment {
  id: string
  name: string
  baseUrl: string
  projectId: string
  project: Project
  createdAt: string
}

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBaseUrl, setNewBaseUrl] = useState('')
  const [newProjectId, setNewProjectId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchEnvironments = async () => {
    const res = await fetch('/api/environments')
    const data = await res.json()
    setEnvironments(data)
  }

  const fetchProjects = async () => {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data)
  }

  useEffect(() => {
    fetchEnvironments()
    fetchProjects()
  }, [])

  const handleCreate = async () => {
    if (!newName || !newBaseUrl || !newProjectId) return
    setIsLoading(true)
    try {
      await fetch('/api/environments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName, 
          baseUrl: newBaseUrl, 
          projectId: newProjectId 
        }),
      })
      setNewName('')
      setNewBaseUrl('')
      setNewProjectId('')
      setIsCreateOpen(false)
      fetchEnvironments()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个环境配置吗？')) return
    try {
      await fetch(`/api/environments/${id}`, { method: 'DELETE' })
      fetchEnvironments()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            环境变量
          </h1>
          <p className="text-muted-foreground mt-2">管理不同项目的测试运行环境</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger
            render={
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                新建环境
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建环境配置</DialogTitle>
              <DialogDescription>
                配置环境的基础 URL 及所属项目。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project">所属项目</Label>
                <Select onValueChange={(val) => setNewProjectId(val || '')} value={newProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">环境名称</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例如：测试环境 / UAT"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseUrl">基础 URL</Label>
                <Input
                  id="baseUrl"
                  value={newBaseUrl}
                  onChange={(e) => setNewBaseUrl(e.target.value)}
                  placeholder="https://api.test.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
              <Button onClick={handleCreate} disabled={isLoading || !newName || !newBaseUrl || !newProjectId}>
                {isLoading ? '创建中...' : '确定创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>环境名称</TableHead>
              <TableHead>所属项目</TableHead>
              <TableHead>基础 URL</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {environments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  暂无环境配置，请点击右上角新建。
                </TableCell>
              </TableRow>
            ) : (
              environments.map((env) => (
                <TableRow key={env.id}>
                  <TableCell className="font-medium">{env.name}</TableCell>
                  <TableCell>{env.project.name}</TableCell>
                  <TableCell className="font-mono text-xs">{env.baseUrl}</TableCell>
                  <TableCell>{new Date(env.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(env.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
