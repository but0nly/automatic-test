'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function TestReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [run, setRun] = useState<any>(null)

  const fetchDetails = async () => {
    const res = await fetch(`/api/test-runs/${resolvedParams.id}`)
    const data = await res.json()
    setRun(data)
  }

  useEffect(() => {
    fetchDetails()
    if (run?.status === 'RUNNING' || run?.status === 'PENDING') {
      const timer = setInterval(fetchDetails, 3000)
      return () => clearInterval(timer)
    }
  }, [resolvedParams.id, run?.status])

  if (!run) return <div className="p-8">加载中...</div>

  const successCount = run.results.filter((r: any) => r.status === 'SUCCESS').length
  const failCount = run.results.length - successCount

  return (
    <div className="p-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">测试报告详情</h1>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold uppercase",
          run.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
          run.status === 'FAILED' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
        )}>
          {run.status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">项目</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold">{run.suite?.project?.name}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">测试计划</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold">{run.suite?.name}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">成功 / 失败</CardTitle></CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              <span className="text-green-600">{successCount}</span> / <span className="text-red-600">{failCount}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground uppercase">总耗时</CardTitle></CardHeader>
          <CardContent>
            <p className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {run.endTime ? `${Math.round((new Date(run.endTime).getTime() - new Date(run.startTime || run.createdAt).getTime()) / 1000)}s` : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>用例执行详情</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>类型</TableHead>
                <TableHead>用例名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>错误信息</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {run.results.map((result: any) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 uppercase font-bold text-gray-500">
                      {result.apiTestCase ? 'API' : 'UI'}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {result.apiTestCase?.name || result.uiTestCase?.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {result.status === 'SUCCESS' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                       result.status === 'FAILURE' ? <XCircle className="h-4 w-4 text-red-500" /> : 
                       <AlertCircle className="h-4 w-4 text-orange-500" />}
                      <span className={cn(
                        "text-xs font-bold",
                        result.status === 'SUCCESS' ? "text-green-700" : "text-red-700"
                      )}>{result.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{result.duration}ms</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-red-600">
                    {result.errorMessage || '-'}
                  </TableCell>
                </TableRow>
              ))}
              {run.results.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">暂无执行结果</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
