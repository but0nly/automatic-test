'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Terminal, Play, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface ApiTestCase {
  id: string
  name: string
  method: string
  url: string
  projectId: string
  project: Project
  createdAt: string
}

export default function ApiTestCasesPage() {
  const [cases, setCases] = useState<ApiTestCase[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')

  const fetchCases = async (projectId?: string) => {
    let url = '/api/api-test-cases'
    if (projectId && projectId !== 'all') {
      url += `?projectId=${projectId}`
    }
    const res = await fetch(url)
    const data = await res.json()
    setCases(data)
  }

  const fetchProjects = async () => {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data)
  }

  useEffect(() => {
    fetchCases()
    fetchProjects()
  }, [])

  const handleProjectChange = (id: string) => {
    setSelectedProjectId(id)
    fetchCases(id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个接口用例吗？')) return
    try {
      await fetch(`/api/api-test-cases/${id}`, { method: 'DELETE' })
      fetchCases(selectedProjectId)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Terminal className="h-8 w-8" />
            接口自动化
          </h1>
          <p className="text-muted-foreground mt-2">管理并执行您的接口测试用例</p>
        </div>
        <div className="flex items-center gap-4">
          <Select onValueChange={(v) => handleProjectChange(v || 'all')} value={selectedProjectId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="筛选项目" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有项目</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/api-test/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新建用例
            </Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用例名称</TableHead>
              <TableHead>项目</TableHead>
              <TableHead>方法</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  暂无接口用例，请点击右上角新建。
                </TableCell>
              </TableRow>
            ) : (
              cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.project.name}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold",
                      c.method === 'GET' ? "bg-blue-100 text-blue-700" :
                      c.method === 'POST' ? "bg-green-100 text-green-700" :
                      "bg-orange-100 text-orange-700"
                    )}>
                      {c.method}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-xs">{c.url}</TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Link href={`/api-test/${c.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
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
