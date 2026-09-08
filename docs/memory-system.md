# 账号记忆与关系计算

本实现参考 Tideline Memory 的分层思路，但没有复制其 Python 源码。Tideline 使用 [PolyForm Noncommercial 1.0.0](https://github.com/ennisaaaaaaaa-stack/tideline-memory/blob/main/LICENSE)，当前只作为非商业原型研究参考；商业发布前需要另行取得许可或继续使用本项目的独立实现。

本地研究仓库已下载到 [`/Users/ninghan/cola/coding/tideline-memory`](/Users/ninghan/cola/coding/tideline-memory)，固定参考提交为 `860064e5bc2ae02a49891df4eb3b8cb2e455ac93`。它保持为独立 Git 仓库，不被打包进“我们的岛”的产品代码或公开部署。

## 记忆结构

- `memory_context` 保存用户原始表达，只对本人账号开放。
- `memory_narratives` 保存可被 Agent 使用的结构化记忆：动作、背景、认知方向、标签、相关对象和原始上下文链接。
- 每条叙事记忆有重要性、情绪强度、复现性和未完成度四个 1–5 分权重；归一化公式为 `0.35 / 0.25 / 0.25 / 0.15`。
- `memory_amendments` 追加新的理解，不覆盖旧记忆。
- onboarding 选择、给 Agent 的创作描述、成功的岛屿变化、合岛与分开都会形成账号级记忆。
- 用户可以读取、补充和删除自己的记忆；Agent 只有单独获得 memory:read 授权后才能读取当前账号记忆。

## 关系计算

记忆参与匹配默认关闭。只有双方都开启 `matchingEnabled`，算法才会将各自最近 200 条记忆转换成八个主题权重：自然、水、夜晚、住所、生命、探索、创造和连接。

关系分数由岛屿生态相似度与记忆主题共鸣组成：

```text
compatibility = ecology × 0.65 + memoryResonance × 0.35
encounterProbability = 0.03 + 0.27 × compatibility³
```

如果任意一方没有授权记忆匹配，则只使用岛屿生态。对外结果只包含分数、参与计算的授权记忆数量和隐私说明，不返回原始记忆。

## API

- `GET /api/memory`：读取本人记忆与匹配设置。
- `POST /api/memory`：写入本人主动记录的记忆。
- `POST /api/memory/:id/amend`：追加对旧记忆的新理解。
- `DELETE /api/memory/:id`：删除本人记忆与对应原始上下文。
- `PUT /api/memory/settings`：开启或关闭记忆参与关系计算。
- `GET /api/world`：返回包含生态、记忆共鸣和相遇概率的候选岛屿。


## 持久化与记忆交换（2026-09 更新）

- 运行数据库固定在项目的 `data/islands.sqlite`；可用 `ISLAND_DATABASE` 明确覆盖。启动位置变化不会误建另一份数据库。WAL 事务保证成功保存的修改落盘。
- 账号、个人岛场景（含房屋、房间、家具与程序）、形象、偏好、创作记录、关系、共享物件、记忆原文与修订均存储于 SQLite。示例岛仍是临时体验，不属于账号。
- `GET /api/memory` 返回最近 200 条、总数、原文和修订。`POST /api/memory` 追加写入。Agent 需分别授权 `memory:read` / `memory:write`，默认创作凭证不包含这些权限。删除、导入导出和社交授权仍由本人控制。
- `GET /api/memory/export` 导出全部叙事记忆、原文及修订，格式 `our-island-memory`、版本 1。
- `POST /api/memory/import` 导入同一账号导出的文件，最多 10MB / 10000 条。追加而非覆盖，重复编号跳过，整批事务回滚。不会改变关系匹配授权、岛屿或其他人的数据。
- 创作页「我的记忆」内提供导入、导出及原文查看入口。
- `node scripts/backup-database.js` 使用 SQLite 在线备份接口生成完整数据库快照，包含全部账号与关系，不只是记忆。备份位于 `data/backups/`，完成后执行完整性检查。数据目录不进入 Git。
- 当前为本机持久化，未设置定时备份或云端同步。正式部署需把整个数据库放在服务器持久卷并配置备份策略，不能靠静态 GitHub Pages 保存这些数据。
