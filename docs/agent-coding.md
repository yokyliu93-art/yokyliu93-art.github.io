# 岛屿编程（本地原型）

用户在连接面板选择本机 Codex 或自己的外部 Agent，在创作框发送描述。

- 本机模式：Codex 返回完整 JavaScript 源码和摘要，沿用已有模型登录；不是固定物件 JSON。
- 外部模式：用户把面板中的授权说明交给自己的 Codex / Claude Code。它使用自己的模型配置，每 5 秒读取 coding-task，编写 island.js，并 PUT program。浏览器轮询任务完成状态，自动运行提交的源码。localhost 只支持同机 Agent。
- 源码保存在 SQLite 的 scene.program 中，随岛屿版本保存；创作撤回可恢复旧源码。

接口：GET /api/rules 的 programSDK 是当前编程契约。GET /api/islands/:id/coding-task 获取 task、scene 和 sdk；PUT /api/islands/:id/program 使用 {jobId,source,summary} 提交。需要当前岛屿 scene:write 授权。任务版本冲突时不能覆盖，撤销/过期的授权不能提交。任务最多保留 30 分钟，本机生成最多 5 分钟。

运行：用户源码在无同源权限的 iframe 内的 Web Worker 中执行。CSP 禁止网络和外部资源，主页面只接收经过边界和数量检查的网格、变换指令；源码不能取得主页面 DOM、访问凭证或 Three.js 对象。单次执行超时会终止 worker。支持自定义顶点几何、逐帧动画和网格点击，程序临时状态在刷新后重置。

校验边界：服务器只编译检查语法，不执行不可信代码。代码存储成功不等于运行验证成功；浏览器加载时检查输出，错误会停止自定义层并显示原因，原有生态保留。当前并非可运行任意 npm 项目、多人服务器逻辑或无限资源的生产沙箱。真实生产隔离还需要独立运行域、资源配额和上线前预览审批机制。

验证：server/service.test.js 覆盖权限、源码校验、版本冲突和撤回；tests/program.spec.js 覆盖提交/持久化/运行、动画、点击、网络与存储隔离、死循环与越界停止。tests/studio.spec.js 覆盖连接面板、授权撤销、等待状态和移动端。
