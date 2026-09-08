# 「我们的岛」人际关系算法 v2

日期：2026-09-08  
状态：独立计算引擎已实现，尚未接入线上社交界面

## 1. 核心原则

系统不再先读故事、判断两人「有关系」，再补一个分数。

完整顺序是：

```text
岛屿原始选择与行为
→ 参数化
→ 证据加权
→ 两人向量计算
→ 放进总体人群校正
→ 满足稀疏门槛才建立共鸣边
```

系统区分三种边：

- `same_person`：同一个人的不同账号或不同岛，不进入社交匹配。
- `resonance`：公式计算出的共鸣边。
- `declared_relation`：伴侣、朋友、家人等双方确认的现实关系边。

现实关系和共鸣分不混算。两个伴侣可以没有高共鸣分；两个陌生人也可以共享很强的审美参数。

## 2. 参数向量

每个人是一组 `[-1, 1]` 的连续参数。缺少证据时不填 `0`，直接留空。

| 参数 | -1 | +1 |
|---|---|---|
| water_affinity | 排斥水 | 以水为世界中心 |
| light_preference | 长夜 | 白天 |
| shelter_need | 无房、开放空间 | 明确居所 |
| fantasy_orientation | 现实具象 | 强幻想 |
| nature_orientation | 人造空间 | 自然生态 |
| world_mobility | 扎根静止 | 旅行、漂浮 |
| environmental_motion | 静态 | 流动、持续变化 |
| structure_need | 自发生长 | 强结构规划 |
| social_openness | 独处 | 欢迎来访 |
| boundary_selectivity | 无门槛 | 强筛选和审核 |
| caregiving_drive | 接受或中性 | 给予、照料 |
| pair_bond_focus | 世界中心 | 特定的人中心 |
| autonomy_need | 融合 | 保持个人空间 |
| symbolic_expression | 字面表达 | 象征表达 |
| domesticity | 荒野 | 日常家庭生活 |
| change_appetite | 保持原样 | 持续修改 |

模型只能负责把自由文本提取成这些参数，并返回原句证据。模型不能输出「你们很合适」。最终关系只由公式决定。

## 3. 单人参数如何生成

每条证据包含：

```json
{
  "parameter": "shelter_need",
  "value": -1,
  "source": "onboarding",
  "evidenceId": "home-choice",
  "cluster": "onboarding-1",
  "independence": 1,
  "freshness": 1
}
```

来源系数：

| 来源 | r |
|---|---:|
| 用户确认 | 1.00 |
| 用户自由描述 | 0.90 |
| 多次真实改岛 | 0.85 |
| Onboarding | 0.75 |
| 自定义场景 | 0.60 |
| 生成场景 | 0.25 |
| 模型推断 | 0.20 |
| 系统默认模板 | 0.05 |

证据权重：

```text
wₑ = r_source × independence × freshness
```

同一创作任务生成的场景、摘要和记忆共用一个 `cluster`，只保留权重最高的一条，防止一句话被系统复制三遍后变成三份证据。

参数值：

```text
xᵢₖ = Σ(wₑ × valueₑ) / Σwₑ
```

参数内部一致性：

```text
varianceᵢₖ = Σ[wₑ × (valueₑ - xᵢₖ)²] / Σwₑ
consistencyᵢₖ = clamp(1 - varianceᵢₖ, 0, 1)
```

参数可信度：

```text
cᵢₖ = clamp(Σwₑ / 1.35, 0, 1)
      × (0.55 + 0.45 × consistencyᵢₖ)
```

一条选择可以形成参数，但可信度有限；来自不同时间、不同动作的独立证据会提高可信度；相互冲突的选择会降低一致性。

## 4. 两人共鸣公式

参数相似度：

```text
agreementₖ(i,j) = 1 - |xᵢₖ - xⱼₖ| / 2
```

两人完全相同为 `1`，完全相反为 `0`。

为了避免「所有人都有森林，所以所有人都有关系」，每个参数根据当前人群计算信息量：

```text
prevalenceₖ = 全体有效配对在参数 k 上的平均 agreement
informationₖ = max(0.12, 1 - prevalenceₖ)
```

人人都相似的参数接近最低权重；少数人才共享的参数权重更高。

配对参数权重：

```text
qₖ = baseWeightₖ
     × informationₖ
     × √(cᵢₖ × cⱼₖ)
```

最终共鸣分：

```text
Resonance(i,j) = 100 × Σ[qₖ × agreementₖ(i,j)] / Σqₖ
```

配对可信度：

```text
coverage = Σ[baseWeightₖ × √(cᵢₖ × cⱼₖ)] / Σ全部参数基础权重
confidence = √coverage × (1 - e^(-m/5))
```

`m` 是双方都有有效证据的参数数量。

## 5. 什么时候建立共鸣边

高分本身不够。当前原型必须同时满足：

```text
Resonance ≥ 75
confidence ≥ 0.35
高信息量同向参数 ≥ 3
两人互为当前候选中的最高分
person_id 不同
```

数据量扩大后，「互为最高分」调整为「互相进入前 5%」，并用全体配对的百分位替代固定 75 分。

所以数学上可能有相似度，社交图上仍然没有边。图必须稀疏。

## 6. 四个真实账号实算

输入来自四座真实岛的 Onboarding、自由描述与连续改岛记录；系统默认森林物件没有作为主要证据。

| 配对 | 共鸣分 | 可信度 | 高信息同向参数 | 是否成边 |
|---|---:|---:|---:|---|
| Little E × Yoky Liu | **99** | 0.532 | 7 | **是** |
| Little E × Yoky | 37 | 0.464 | 1 | 否 |
| Little E × Vincent | 29 | 0.559 | 0 | 否 |
| Yoky Liu × Yoky | 不计算 | — | — | 同一人 |
| Yoky Liu × Vincent | 28 | 0.468 | 0 | 否 |
| Yoky × Vincent | 60 | 0.458 | 2 | 否 |

最终社交图只有一条算法共鸣边：

```text
Little E ═════ Yoky Liu
```

Yoky Liu 与 Yoky 归为同一个 `person_id`，两座岛保存为同一个人的不同状态。

Vincent 的「需要 Yoky」形成一条单方声明：

```text
Vincent ─ ─ → Yoky
partner / one_sided / strength 0.35
```

Yoky确认后，它变成双方现实关系边，强度为 `1.0`。这条边不依赖60分的共鸣结果。

## 7. 为什么 Little E 与 Yoky Liu 得到99分

公式共同比较到10个参数，其中7个属于高信息量同向参数：

- 水亲和度
- 光照节律
- 居所需求
- 幻想倾向
- 环境流动性
- 象征表达
- 非家庭化空间

两人都选择天降瀑布、环岛水系、昼夜均衡、不要房子、独角兽和持续改造。自然倾向因四人普遍偏高，被总体分布自动降权。

99表示两座岛在**已有可比较参数**上高度接近，不表示两个人有99%的概率成为朋友。可信度只有0.532，因为来访方式、互惠、冲突处理和现实互动仍缺数据。

## 8. 关系网络后续如何变准

每次真实行为产生新参数证据：

- 接受或拒绝来访：更新 `social_openness`、`boundary_selectivity`
- 是否回应对方：更新关系边的互惠率
- 共同空间如何分配：更新 `autonomy_need`、`structure_need`
- 送出、保留或退回物品：更新照料和边界行为
- 用户点击「这点很像 / 这不准确」：只校准这一对人的参数，不篡改个人画像

共鸣边随参数变化重新计算。现实关系边只由双方声明和真实互动改变。

## 9. 已实现文件

- 计算引擎：`server/social-graph.js`
- 测试：`server/social-graph.test.js`
- 四人参数化脚本：`scripts/social-resonance-audit.js`
- 完整计算结果：`docs/social-resonance-audit-2026-09-08.json`

当前测试：4/4 通过。

旧的 `ecology × 0.65 + memory × 0.35` 尚未从线上接口移除。v2 先作为独立引擎验证，下一步接入数据库参数表、关系快照和社交图接口。
