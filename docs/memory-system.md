# 账号记忆与关系计算

本实现参考 Tideline Memory 的分层思路，但没有复制其 Python 源码。Tideline 使用 [PolyForm Noncommercial 1.0.0](https://github.com/ennisaaaaaaaa-stack/tideline-memory/blob/main/LICENSE)，当前只作为非商业原型研究参考；商业发布前需要另行取得许可或继续使用本项目的独立实现。

## 记忆结构

- `memory_context` 保存用户原始表达，只对本人账号开放。
- `memory_narratives` 保存可被 Agent 使用的结构化记忆：动作、背景、认知方向、标签、相关对象和原始上下文链接。
- 每条叙事记忆有重要性、情绪强度、复现性和未完成度四个 1–5 分权重；归一化公式为 `0.35 / 0.25 / 0.25 / 0.15`。
- `memory_amendments` 追加新的理解，不覆盖旧记忆。
- onboarding 选择、给 Agent 的创作描述、成功的岛屿变化、合岛与分开都会形成账号级记忆。
- 用户可以读取、补充和删除自己的记忆；Agent 凭证不能直接读取记忆库。

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

