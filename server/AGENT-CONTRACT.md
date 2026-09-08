# 岛屿 Agent 修改契约 v1

这是提供给用户自行连接的 Codex / Claude Code 的接口协议。应用默认不运行 Agent；显式开启 ISLAND_LOCAL_CODEX=1 后，本机回环请求可启动 Codex 生成受限生态场景，也不会收集 OpenAI / Anthropic API Key。模型密钥仍由用户的本地 Agent 管理；岛主在维护入口 /?view=tools 生成的是本应用的独立授权凭证。

## 连接方式

- 本地服务：`http://localhost:5173`
- 鉴权：`Authorization: Bearer <岛屿专用 Agent Key>`
- 所有请求体：`Content-Type: application/json`
- 岛屿 ID 与接口地址在工作室的 Agent 权限页可见。
- 初次调用 `GET /api/rules` 读取规则，再调用 `GET /api/islands/<islandId>` 获取当前场景和 revision。
- 不要把凭证写入岛屿场景、日志、公开仓库或其他用户可读内容。

## 修改示例

向 `PATCH /api/islands/<islandId>` 提交：

```json
{
  "revision": 0,
  "actions": [
    {
      "type": "object.upsert",
      "value": {
        "id": "reading-lamp-01",
        "kind": "lamp",
        "roomId": "room-main",
        "x": 1,
        "y": 0,
        "z": 1,
        "rotation": 0,
        "color": "cream"
      }
    }
  ]
}
```

使用实际读取到的 revision，遇到 409 必须重新读取并协调修改，不能盲目覆盖。整批操作在一个事务中全部成功或全部失败。

## 允许的操作

| 操作 | 参数 | 所需权限 |
|---|---|---|
| object.upsert | value 完整物件 | 按物件所在室内／室外判断；跨区域移动需同时授权两边 |
| object.remove | id | 物件所在区域的权限 |
| room.upsert | value: id, name, width, depth, height | interior:write |
| room.remove | id；必须先移除或迁出房内物件 | interior:write |
| environment.set | value 中仅允许 weather、time、music | scene:write |

室外物件使用 `roomId: null`。只能使用规则返回的物件类型与颜色，不能传脚本、URL、HTML、任意材质程序或所有权属性。每件家具独立存有坐标和旋转，室内房间宽深 2–12 米、高 2–6 米；家具中心需保留 0.6 米边界，室内高度需留 1 米。当前校验边界与数量，不提供精确碰撞检测。

每岛最多 8 个房间、200 件物品；每批最多 30 个操作，Agent 每日 UTC 最多 100 批成功修改。授权有效期 1–30 天，可随时撤销。只授予需要的区域。

## Agent 绝对不能做的事

不能签发新凭证、改变被发现设置、参与概率抽签、同意或拒绝合岛、解除关系、修改共同空间与所有权、操作他人个人岛。上述写入权限由后端强制执行，不依赖 Agent 自觉遵守。

当前是声明式受限创作。用户可以让本地 Agent 编写生成这些请求的代码；服务端不会执行任意 JavaScript、Python 或 shell。

## 自然语言创作

工作室通过 POST `/api/islands/:id/imagine` 提交 prompt，再轮询 GET `/api/creations/:id`。Agent 返回完整受限生态场景；后端检查所有权、原始 revision、物件白名单、数量与空间边界，验证成功后原子保存并撤销任务凭证。失败保留原岛。POST `/api/islands/:id/undo-creation` 可撤回最新成功变化。每人每天最多 10 次请求，每岛同时一个任务。

默认新岛包含森林和水系，rooms 为空。生态字段 ecosystem 限定 biome（woodland/meadow/wetland/alpine）和 season（spring/summer/autumn/winter）。不接受脚本、网址、所有权或关系修改。

## 2026-09 岛上生活接口更新

以下更新优先于前文的旧原型说明。

- 岛屿创作已支持隔离运行的 JavaScript SDK（`server/island-program.js`），服务端只验证及保存源码，不执行源码。Agent 返回 `source`、`summary`，并可通过 `sceneActions` JSON 字符串增加持久化房屋、房间、家具。用户自主编写的程序在 iframe/worker 中运行，经白名单渲染桥接。
- `island.asset({id,kind,position,rotation,scale})` 支持本地动物与家具库，具体种类读取程序指南。兔子、小鸟为手工程序模型。
- `room.upsert` 可包含 `houseId`，必须引用本岛室外 `house`，一房一屋。进入房屋后显示该房间的家具；游客没有装修权限。
- 家具修改与房间缩放检查家具占地、墙壁、其他家具和入口通道，整批失败不改变版本。此为旋转包围盒检查，不是物理引擎。
- `GET /api/avatar` 返回当前账号 `{revision,source}`。`PUT /api/avatar` 接受 `{revision,source}`，空字符串恢复初始形象。Agent 须单独授予 `avatar:write`，只能改凭证所属账号。岛主凭证也可调用；版本冲突为 409。
- 玩家程序仅支持网格等基础 SDK，禁用外部模型加载，最多 48 网格、6000 顶点，x/z 在 ±1 米，y 在 0–2.4 米。浏览器编辑器先进行运行验证再保存；移动、相机、碰撞仍由宿主控制。
- 示范页 `/?view=visit&demo=home` 的家具操作只存在于该页内存，不写入任何账号。
