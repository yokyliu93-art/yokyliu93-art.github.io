# 岛上生活：本地实现

按用户要求停止使用 Build 3D Game Rooms 工作流，直接维护 Three.js 代码。

- 保留原有圆润树冠、松树和岩石。
- 小屋外立面、室内、唱片机、书架、默认玩家、兔子和小鸟为程序建模。
- 其他动物与部分家具使用本地 GLB；出处与许可证见 public/models/credits.html。
- 着陆后支持跟随、第一人称、俯瞰，进入房屋、摆放家具及播放用户提供的《蝉鸣》。
- 形象代码按账号保存，Agent 需要 avatar:write；室内修改需要 interior:write。

预览：/?view=visit&demo=home；动物图鉴：/?view=animals。
示例房间不会写入账号。原始唱片机概念图保存在 images/record-player-v1.png。
