# 我们的岛

一个可直接在浏览器运行的 3D 浮岛生活游戏原型，依据《我们的岛 PRD》实现。

## 运行

需要 Node.js 24+（后端使用内置 SQLite）。

```sh
npm ci
npm run dev
```

打开终端显示的地址。正式构建：`npm run build`，本地预览产物：`npm run preview`。

## Agent 创作入口

进入 `/?view=studio`，用户只描述希望岛屿发生什么变化，由 Agent 返回整个生态场景。默认岛包含树林、溪流、瀑布和生命元素，无默认房子或房间。主流程没有家具选择、坐标输入或手动权限表单。

本机已登录 Codex 时可运行：

```sh
ISLAND_LOCAL_CODEX=1 npm run dev
```

该开关默认关闭，仅允许回环地址访问。可通过 `ISLAND_CODEX_BIN` 指定本地 Codex 可执行文件。适配器默认优先使用 ChatGPT 桌面自带的新版 Codex，使用只读沙箱、临时工作目录和 JSON Schema 输出。所有结果仍由后端校验，绑定个人岛和原版本；成功后原子保存，失败保留原场景。每个账号每天最多 10 次创作请求，全局一次执行一个。支持撤回最新版本。超时上限 5 分钟，断线任务 5.5 分钟后标记失败。

**联调状态：**已通过真实本机 Codex 生成：夜晚森林保留河流瀑布，新增萤火虫、蘑菇、草丛与兔子，共 53 个生态物件，无房屋。生成结果通过后端校验、原子保存及撤回验证，记录在 artifacts/agent-ecology-result.json。创作进程使用独立 provider 配置，关闭 WebSocket、直接使用 HTTPS；不修改用户全局 Codex 设置。执行上限 5 分钟，界面显示等待时长，刷新后恢复任务和描述。Claude Code 尚未接入成功。不会用关键词模板冒充模型结果。

关系、权限和旧室内工具保留在维护入口 `/?view=tools`，不再放在普通用户的创作流程中。旧房间数据不删除；缺少生态字段的旧岛会补充自然环境，保留原室内资产。

- [数据库与产品规则](server/DATA-MODEL.md)
- [给 Codex / Claude Code 的修改契约](server/AGENT-CONTRACT.md)
- `npm run test:server` 验证后端边界与事务。

当前是单机原型。上线不能直接暴露本机 Codex 会话，需要每用户独立 Agent 连接与真正的执行隔离。Namecheap 域名部署尚未完成。

## 虚空大陆主视图

默认入口现在是浅色云海、庭院群岛的世界视图。可旋转缩放、查看不同风格的示例岛屿，演示新用户点亮岛屿，进入自己的岛会前往 Agent 创作工作室；首页群岛本身仍为演示，每次刷新重置。

之前的庭院玩法保留在 `/?view=island`，庭院存档继续保留。

## 旧版庭院小游戏（仅 /?view=island）

- 旋转、缩放视角，探索程序化建模的浮岛、小屋、树林、木桥、云层、瀑布与星空。
- 点击漂浮星光收集资源，每束 10 星光，25 秒后重新出现。
- 六类物品的低代码布置，选择后点击空地放置，R 旋转，Esc 取消。撤回最后一件物品会返还费用。
- 完成心愿获得星光；最多扩建三次，价格依次为 100、180、260 星光。
- 晴天、细雨、雨后彩虹与昼夜切换。
- 三种 Web Audio 程序音景，可选音量，需点击开启声音。
- 根据物品、天气、音乐、昼夜计算五维品味向量的余弦相似度；相似度影响示例岛屿距离，可以拜访和返回。
- 保存 3D 场景 PNG 照片；进度保存在当前浏览器 localStorage。

## 旧版小游戏实现范围

本版是本地可玩原型。附近三名居民为明确标注的示例数据，没有账号系统、真实用户配对、服务端资产所有权、跨设备存档或多人实时同步。地皮限量只在本地游戏规则中成立。声音是合成音景，不是钢琴录音。布置通过低代码面板进行，未开放任意代码执行或室内编辑。

## 美术与技术

场景所有几何模型均为本项目原创程序化生成，无需外部模型或图片下载。原生 CSS 游戏界面，Phosphor 图标，Three.js 渲染与 OrbitControls 相机。

参考和依赖：

- [Three.js](https://github.com/mrdoob/three.js)：MIT；实际使用的渲染引擎与官方 OrbitControls。
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)：参考组件化场景组织方式，本项目使用原生 Three.js，未引入 React。
- [Drei](https://github.com/pmndrs/drei)：参考成熟的交互与场景辅助思路，未复制项目代码或素材。
- [Phosphor Icons](https://github.com/phosphor-icons/web)：MIT；游戏界面图标。
- [Vite](https://github.com/vitejs/vite)：MIT；开发与打包工具。

## 验证

`npm test` 使用 Playwright 验证 WebGL 渲染、控制台错误、天气存档、布置及退款、奖励防重复、扩岛余额、拜访、声音开关、照片导出和手机布局。测试默认使用 macOS 的本机 Chrome；其他环境请修改 `playwright.config.js` 的 `executablePath`，或安装 Playwright Chromium 后移除该配置。

截图位于 `artifacts/`。游戏操作提示支持鼠标与触屏；桌面体验最佳。

## 动态画面

首次进入与个人岛使用 Three.js 官方 EffectComposer、UnrealBloomPass 和 OutputPass；水面流光着色器、沿河水纹、瀑布水雾、岛底薄雾和微光轨迹为本项目实现，位于 src/atmosphere.js。镜头自动缓慢环绕，交互后停止。手机端降低后期分辨率，减少动态效果偏好会停止环境位移动画。没有引入 pmndrs/postprocessing 或 Water2，不应把查阅的库写成已集成依赖。
