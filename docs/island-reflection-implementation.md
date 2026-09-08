# 岛屿理解 Agent：PRD 落地说明

对应用户提供的 `PRD-岛屿心理分析Agent.md`，原 PRD 不做修改。

## 实际体验

保存构建引导后 → `/ ?view=reflection`（实际路径无空格）→ 七个片刻 → 真实本机 Codex 来信 → 确认 / 修正 → 写入记忆 → 回到岛上。用户可以跳过，创作页有永久入口。

七个片刻覆盖：空间想象、第一件物品、天气、时间、来访方式、边界、音乐。每步四张提示卡 + 自由输入。已有的动物、住所、地形构建保留，本轮理解采集放在其后；尚未合并成一个总共七步的构建流程。

文字逐句浮现，减弱动态效果设置下直接展示。每封信可展开原始回答，用户有「是我 / 不太对」与 16 类型自选入口，可以不选类型。PNG 分享由用户点击生成，不自动上传。记录可删除、撤销观察授权，完整画像、历史与日签可导出 JSON。

## 模型与事实分离

- 真实来信调用现有本机 Codex 登录：`ISLAND_LOCAL_CODEX=1`，可设置 `ISLAND_CODEX_BIN`。服务端限制并发两次，同一账号只能一个请求，45 秒超时。
- 未启用模型或调用失败时，展示明确标注的「选择整理」。不会以模板伪装成模型分析，不会无限加载。
- 模型只写有回答依据的文字，每段引用 evidence keys。输出结构、长度、引用键和明显不当推断有校验；这不是对所有语言错误的完美过滤，所以来信始终可查看依据及修正。
- `island_profile` 中心理测量维度、依恋类型、`mbti_predicted` 为 null；不能把 null 当成 0。MBTI 仅存用户自选，来源为 self_report。
- 确认文字与原始回答后进入长期记忆。用户自由修正时，既保存原稿也突出自己的修正，并把此前计算维度标为待重新确认，防止旧理解继续支配匹配。
- 下一次本机创作获得已确认的原始偏好和修正；外部 Agent 需显式 memory:read 才能在 coding-task 中获得该摘要。用户新要求优先。

## 为什么偏离 PRD 的自动心理定型

本轮未实现：通过雨夜推断内向或情绪稳定性、从家具推断依恋、自动 MBTI 分类、心理互补度定论、基于未登录天数推测情绪。这些联系没有在本产品人群上经过验证。

依据：
- Berkeley Personality Lab：BFI-2 是自我报告人格量表，不能用装饰偏好直接替代量表分数。https://www.ocf.berkeley.edu/~johnlab/bfi.html
- Myers & Briggs Foundation：结果需要用户核对 best-fit type。https://myersbriggs.org/my-mbti-personality-type/my-mbti-results/home.htm
- Lilienfeld, Wood & Garb (2000), The Scientific Status of Projective Techniques：投射测验的效度需逐项论证，不能泛化为任意意象都具有可靠心理含义。https://journals.sagepub.com/doi/abs/10.1111/1529-1006.002

此处将产品目标实现为「有依据、可纠正的自我表达与反馈」，不宣传为已验证的心理测试。若后续加入量表，需独立确认授权、中文版本、测量效度及明确的参与方式。

## 日签

服务器在持久化场景修改、Agent 创作完成、撤回、偏好保存和歌曲选择时比较快照。天气、时间、音乐变化，或指定物件数量显著变化才触发；UTC 每天最多一张。未开启观察或未确认理解时不记录日签。

包含 before/after 依据；收藏和用户回应字段落盘。前端支持查看、收藏、PNG 保存。文字是保守的事件模板，不是另一轮 LLM 心理推断。当前检测声明式物件和环境，不识别任意程序内部网格的语义。临时本地音频不上传，仅记录切换到本地歌单。

## 匹配

仅双方完成确认并开启画像匹配时使用。比较 space/weather/time/visitors/music 中能够确定的预设选择，至少三维；自定义表达不强行量化。边界、MBTI 和未测量心理维度不计入。

新世界分数 = 原生态/授权记忆分数 × 0.7 + 确认品味相似度 × 0.3。若条件不足则完整保留旧分数。概率依旧是游戏内每天相遇抽签概率，不是现实关系成功率。权重属于当前产品启发式，未经过相爱成功率验证。

API 只给本人返回完整画像与时间线。匹配接口必须涉及调用者，双方开放发现、未屏蔽且已授权；只返回共鸣数值与通用解读，不传原文。更正、撤销授权、屏蔽会立即影响后续计算。

## 持久化与 API

新增表：island_profiles（当前版本/回答/画像/来信/授权/快照）、island_profile_history（确认历史）、island_daily_cards（日签与收藏）、island_listening（歌曲选择）。已纳入完整 SQLite 备份。

- POST /api/island/analyze-onboarding：answers, revision, analysisConsent
- POST /api/island/confirm-mbti：revision, verdict, correction, mbti, matchingConsent
- POST /api/island/discard-draft：revision；保留此前确认历史
- GET /api/island/profile[/:userId]：仅本人
- GET /api/island/profile/export：完整本人画像与来信
- PUT /api/island/profile/settings：analysisConsent, matchingConsent
- DELETE /api/island/profile：删除画像、历史、日签与对应记忆
- POST /api/island/detect-change：读取服务器当前快照，不信任客户端伪造 diff
- GET /api/island/timeline[/:userId]：最近 100 张本人日签
- PUT /api/island/cards/:id：favorite, response
- GET / PUT /api/island/listening：track = chan-ming / original / local
- POST /api/island/match：userA, userB

客户端使用 revision；过期生成结果、过期确认返回 409，退出登录后到达的模型结果不保存。确认与记忆写入同一事务，日签与场景变更也在同一事务。未确认的来信不成为匹配证据。

## 验证

真实本机 Codex 完成一次来信生成；独立测试账号完成七步选择、修正、自选类型并确认。后端测试涵盖授权、跨账号访问、迟到模型结果、版本冲突、断开重启持久化、日签去重、收藏、撤销、匹配排除、真实切歌和取消草稿。

公开部署仍需可用的模型服务和持久数据库。当前运行依赖本机 Codex，未配置云模型接口。未来的准确度追踪可基于已保存的原始来信、确认/修正与历史版本开展，本轮没有上线群体指标面板。

## 参考技能的取舍（2026-09-07）
参考用户提供的 `/Users/ninghan/.cola/skills/island-psyche-analyst/SKILL.md`：采用原话依据、多个选择共同阅读、尊重个人与文化语境、温柔短段落和邀请纠正。模型每个描述段落必须引用已知回答键，服务器从原始回答构建 `observations`（`key` / `quote` / `basis: user_statement`），随镜像存储和导出；不接受模型编造的原话。

不采用意象到 MBTI、神经质、依恋或安全感的固定映射，也不把“两条证据”视为量表效度。用户自己的解释优先；未解释的意象可轻问，不能替用户回答。原话来源校验不等于语义真实性验证，生成内容仍须用户确认。现有日签继续依据真实场景变化记录，不将下雨、拆房或独处解释为心理状态变化。

### 以岛为输入（2026-09-08）
取消独立的七题理解流程。用户只完成建岛 Onboarding；保存后系统从服务端读取已保存的世界类型、水、光照、住处、动物、景观、自定义描述和最终 3D 场景，再自动生成“我理解的你”。旧问答画像在下一次打开时会以当前岛屿重新生成。

生成段落必须标注岛屿证据键，服务器再用已保存的原始设计重建引用，模型不能自造原话。它可以在多个设计信号共同出现时给出带“也许”的意义假设，但不允许从水、天气、房屋或动物直接推断创伤、疾病、ego 或相爱概率。结果先是草稿；用户只需确认或纠正，长期记忆以用户纠正为最高依据。关系匹配依然单独授权。

### 受约束画像与版本更新（2026-09-08）

当前用户入口使用独立的岛内信分析服务（`ISLAND_ANALYSIS_API_KEY` / `ISLAND_ANALYSIS_BASE_URL`），不把造岛 Agent 的文字当成心理分析。首次 onboarding 的创作程序原子保存后，服务器固定保存用户原始选择、原话与最终场景快照，再排队生成初次画像。没有分析服务时信件停在 `waiting_provider`；模型或校验失败时标记 `failed`，均不回滚岛屿。

报告中的主题、OCEAN 候选维度、依恋候选和控制需求都必须引用至少两条存在于快照中的 evidence id，否则服务端写入 `null`。MBTI 每一轴也必须有两条不同证据，完整四轴不足就保持 `null`；用户在 UI 中自选类型后以 `self_report` 覆盖后续展示与新报告里的模型猜测。

重大改动按服务端前后场景和持久化 action 判定：长期天气/昼夜偏好改变、房间或 house 的拆建、核心动物替换、池塘/河流/瀑布或生态水系改变、核心场景程序整体替换会触发新版本；单个花草、普通家具等装饰变化不触发完整画像。变化版本携带 `affectedDimensions`，服务端只接受这些维度的新值，其他维度直接保留上一版本及其证据。每一封信都是独立数据库行，因此历史不会被覆盖。

变化信只描述“我注意到”的可见变化，不诊断原因。输出中出现临床诊断会被拒绝；输入出现明确自伤/自杀信号时停止画像和 MBTI 推测，改为危机支持提示。
