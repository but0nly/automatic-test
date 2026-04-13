'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Info, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
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

export default function TestReportsPage() {
  const [runs, setRuns] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')

  const fetchRuns = async (projectId?: string) => {
    let url = '/api/test-runs'
    if (projectId && projectId !== 'all') {
      url += `?projectId=${projectId}`
    }
    const res = await fetch(url)
    const data = await res.json()
    setRuns(data)
  }

  const fetchProjects = async () => {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data)
  }

  useEffect(() => {
    fetchRuns()
    fetchProjects()
    // Poll for status updates
    const timer = setInterval(() => fetchRuns(selectedProjectId), 5000)
    return () => clearInterval(timer)
  }, [selectedProjectId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />
      case 'RUNNING': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            测试报告
          </h1>
          <p className="text-muted-foreground mt-2">查看历史执行记录及详细结果</p>
        </div>
        <Select onValueChange={(val) => { const v = val || 'all'; setSelectedProjectId(v); fetchRuns(v) }} value={selectedProjectId}>
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
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>执行ID</TableHead>
              <TableHead>测试计划</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-center">用例结果</TableHead>
              <TableHead>开始时间</TableHead>
              <TableHead className="text-right">详情</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-mono text-xs">{run.id.substring(0, 8)}...</TableCell>
                <TableCell className="font-medium">{run.suite?.name || '未知计划'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(run.status)}
                    <span className="text-xs">{run.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{run._count.results}</TableCell>
                <TableCell className="text-xs">{new Date(run.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/test-reports/${run.id}`}>
                    <Button variant="ghost" size="icon"><Info className="h-4 w-4" /></Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
