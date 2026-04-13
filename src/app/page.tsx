export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">欢迎使用自动化测试平台</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-2">项目概览</h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-2">已创建的项目数量</p>
        </div>
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-2">测试用例</h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-2">总计接口与UI用例</p>
        </div>
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold mb-2">今日运行</h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-2">今日已完成的测试任务</p>
        </div>
      </div>
    </div>
  )
}
