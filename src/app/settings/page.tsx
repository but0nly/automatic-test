'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">系统设置</h1>
      
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>基础配置</CardTitle>
            <CardDescription>配置平台全局参数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">平台名称</Label>
              <Input id="platformName" defaultValue="AutoTest Platform" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportEmail">报告通知邮箱</Label>
              <Input id="reportEmail" placeholder="admin@example.com" />
            </div>
            <Button>保存更改</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>执行引擎</CardTitle>
            <CardDescription>自动化执行相关配置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">全局超时时间 (ms)</Label>
              <Input id="timeout" type="number" defaultValue="30000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concurrency">并行任务上限</Label>
              <Input id="concurrency" type="number" defaultValue="5" />
            </div>
            <Button variant="outline">重置默认</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
