---
title: Agent Loop 简介
date: 2026-05-02 08:10:00
tags:
  - AI
  - Agent
  - Claude Code
categories:
  - AI
---

## 一、一个反直觉的事实

先说一个看起来有点反常识的事：**LLM 本身是无状态的**。

每次调用模型，本质上就是一次"文本补全"——你扔一段 prompt 进去，它根据这段 prompt 续写一段输出，然后整个过程结束。下一次再调用，模型对上一次的事一无所知。从机制上讲，它和 2020 年的 GPT-3 没有本质区别，都是一次性的补全器。

但 2024 年之后，我们看到的 Claude Code、Cursor Agent、各种 deep research 工具，明明可以连续工作几十分钟、调用几十个工具、修改几百个文件，看起来"自主"得不得了。

这两件事怎么对得上？

答案藏在外面那个 while 循环里。

> **Agent ≠ 模型**
> **Agent = 模型 + Loop + Tools + Context 管理**

模型本身没有变，变的是包在它外面的那层东西。这层东西现在常被称作 **harness**（脚手架），而 harness 里最核心的部件，就是 **Agent Loop**。

这篇文章想回答三个问题：

1. 这个 loop 长什么样？
2. 它为什么这样设计？
3. 它什么时候会失效？

---

## 二、最小可运行的 Agent Loop

把所有花哨的东西都剥掉，一个 Agent Loop 的本质大概是这样：

```python
messages = [{"role": "user", "content": user_input}]

while True:
    response = llm(messages, tools=available_tools)
    messages.append(response)

    if response.stop_reason != "tool_use":
        # 模型没要求调用工具，说明它认为任务结束了
        return response.text

    # 模型要求调用一个或多个工具
    for tool_call in response.tool_calls:
        result = execute(tool_call)
        messages.append({
            "role": "tool",
            "content": result
        })
    # 进入下一轮，让模型看到工具结果，决定下一步
```

就这么二十行。这就是 Claude Code、Cursor、几乎所有 coding agent 的核心。

拆解一下，里面只有四个动作：

1. **模型推理**：把当前 messages 丢给 LLM，让它产出下一步的 response
2. **工具调用判断**：如果 response 里有 tool_use，就执行；如果没有，循环结束
3. **工具执行**：在沙箱/真实环境里跑这个工具，拿到结果
4. **结果回灌 context**：把工具结果塞回 messages，进入下一轮

到这里，请允许我强调一个关键认知：

> **所谓"Agent 的自主性"，本质就是模型在每一轮看到更新后的 context，自己决定下一步。没有任何魔法。**

不是模型变得"会规划"了，是循环让它有机会**根据上一步的结果**，再做一次补全。它的"思考"只发生在每一次模型调用的那一瞬间，loop 只是一遍遍把它叫醒，告诉它"环境又变了，你再看看"。

理解了这一点，后面所有的工程设计，都只是这个最小循环的变体。

---

## 三、Loop 的关键设计决策

最小循环能跑，但不够用。一旦把它放到真实场景里，会立刻撞到一堆问题：循环什么时候停？context 越涨越长怎么办？工具调用错了怎么办？要不要并行？

围绕这些问题做的工程取舍，决定了一个 Agent 框架的性格。下面是五个最关键的决策维度。

### 1. 终止条件：什么时候跳出 loop

最朴素的写法是"模型不再要求调用工具就停"，但这在生产里远远不够。常见的多重终止条件：

- **模型主动 stop**：response 里没有 tool_use，正常出口
- **达到 max_iterations**：硬性步数上限（比如 50 步），防止失控
- **检测到循环**：连续几次调用相同工具+相同参数，强制中断
- **用户中断**：Ctrl+C、关闭对话窗口
- **预算耗尽**：token 数或时间超限

每个出口背后都是一次工程权衡：上限太小，复杂任务做不完；上限太大，一旦模型卡住就烧钱。

### 2. Context 增长策略：长任务下怎么办

工具结果一律塞回 context，会带来一个朴素但致命的问题——**context 是线性增长的**。

一个改 50 个文件的任务，可能要读 100 次文件，每次读取的内容都进 context。跑到一半，context 已经塞了几十万 token，模型注意力开始稀释，关键信息被淹没。

工程上有几种常见思路：

- **全量回灌**：最简单，短任务够用，长任务必崩
- **滑动窗口**：只保留最近 N 轮，老的丢掉，但可能丢关键信息
- **摘要压缩**：触发阈值后，让模型自己总结前面的内容，用摘要替换原文
- **分层压缩**：Claude Code 的 `/compact` 机制就属于这一类——保留最近上下文 + 历史摘要 + 关键信息（如已修改的文件列表）

这一项是目前差异最大的设计点。后面会看到 learn-claude-code 项目专门有一节叫 `s06_context_compact`，就是为了解决这件事。

### 3. 工具选择机制：模型怎么"选工具"

两种主流做法：

- **原生 function calling**：通过 API 把工具 schema 一并传给模型，模型在 response 里直接产出结构化的 tool_use 块。Claude、GPT、Gemini 都支持。优点是稳定，几乎不会出格式错误。
- **提示词约定格式**：在 system prompt 里告诉模型"想调用工具就输出 `<tool>...</tool>` 这样的 XML"，外层用正则解析。早期 ReAct 论文就是这么做的，胜在通用，任何模型都能用。

现在新项目基本都默认用 function calling，但提示词约定法在一些场景仍有价值——比如要让一个本地小模型当 agent，或者要做更细粒度的格式控制。

### 4. 错误处理：工具调用失败怎么办

工具会出错。文件不存在、API 超时、参数类型不对、权限不足……

两种处理思路，本质是**信任谁**：

- **塞回 context 让模型自我纠正**：把 error message 当作普通的 tool_result 回灌，相信模型能看懂错误并调整。优点是灵活，模型常常能从"file not found"反推出"我应该先 ls 一下"。
- **外层拦截**：harness 直接处理特定错误类型，比如重试、降级、报警。优点是可预测。

实践里通常是**混合策略**：致命错误外层拦截，业务错误丢给模型。这件事的判断需要工程经验。

### 5. 并行 vs. 串行：单 Agent 还是多 Agent

单 Agent 的极致是**一轮内并行调用多个工具**。Claude 现在原生支持一次返回多个 tool_use 块，harness 并行执行后一次性把所有结果回灌。这能显著降低延迟。

更复杂的是**多 Agent 协作**：主 agent 派发子任务给子 agent，子 agent 独立 loop，结束后回报。这里立刻冒出一个新问题——**路由**：主 agent 怎么知道哪个子 agent 适合这个任务？是基于 metadata 标签匹配，还是让主 agent 读子 agent 的描述自己判断？这两种思路的优劣，是另一篇文章的话题了。

---

## 四、从 50 行到 1000 行：一个 Agent 是怎么长出来的

讲完抽象的设计维度，看一个具体的项目——开源项目 [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code)。

这个项目的好处是：它把一个 nano 版 Claude Code 的演化拆成了 12 个递进的 Python 脚本，每一步只引入一个新机制。从 s01 到 s12，代码从大约 50 行长到 1000+ 行。

读它，相当于把上一节的设计决策**亲眼看一遍**怎么落到代码里。

下面挑几个最关键的节点：

### s01 Agent Loop：朴素的 while

```python
while True:
    response = model(messages, tools)
    if response.stop_reason != "tool_use":
        return response.text
    results = execute(response.tool_calls)
    messages.append(results)
```

这就是上一章伪代码的真实版本。50 行，能跑，能调用 bash 完成简单任务。**这是一切的起点**。

### s02 Tool Use：从一个工具到多个工具

引入 `read_file`、`write_file`、`bash`、`grep` 等多个工具。重点不在工具本身，而在 wire——怎么把工具 schema 注册给模型，怎么 dispatch 到真实函数。

到这里，agent 已经能完成"读文件、改文件、跑测试"这种基础编程任务了。

### s03 TodoWrite：对抗"目标漂移"的第一道防线

一个有意思的设计：让 agent 自己维护一个 todo list。

为什么？因为长任务里，模型很容易跑偏。任务一大，model 在第 30 轮已经忘了第 1 轮的目标是什么。TodoWrite 工具强制 agent 在开工前把任务拆成清单，每完成一项划掉一项。

这本质上是**用工具调用替代记忆**——不指望模型记住，而是把目标固化成 context 里随时可见的状态。Claude Code 现在就是这么做的，效果非常显著。

### s04 Subagent：什么时候该拆出去

主 agent 不是万能的。当一个子任务的 context 会污染主 agent 的判断（比如要读一大堆代码才能定位 bug），就该把它丢给子 agent。

子 agent 有自己独立的 loop、独立的 context，跑完只把结论返回给主 agent。这是**用 context 隔离换取主 loop 的清晰**。

### s06 Context Compact：长任务的生存策略

直接对应第三章讲的"context 增长策略"。当 messages 长度超过阈值，触发 compact：让模型把前面的对话总结成一段摘要，用摘要替换原始消息，保留最近几轮原文。

这是目前所有长任务 agent 的共同方案。**没有 compact，agent 就走不远**。

### s07–s12：再往后

任务系统、后台任务、多 agent 团队、worktree 隔离……每一层都是在同一个 loop 上叠加工程能力。但本质都没变：**还是那个 while 循环**。

---

读完这个项目，最值得记住的是它的核心宣言：

> **The model is the agent. The code is the harness.**
> **模型才是 Agent，代码只是脚手架。**

这句话听起来像废话，其实暗藏一个反直觉的判断——你写的那一千行 harness 代码，不是在让 Agent "更聪明"，只是在帮模型**别搞砸**。模型本身已经具备 Agent 能力，harness 的工作是给它工具、管好上下文、防止失控。

Harness 越薄，说明模型越强。

---

## 五、Loop 的边界与失效模式

Agent Loop 不是银弹。在生产里，它会以几种典型方式翻车：

**1. 上下文窗口爆炸**

最常见。长任务跑到一半，context 涨到几十万 token，模型注意力被稀释，开始重复读同一个文件、忽略关键约束。Compact 是缓解，但不是根治——压缩本身也会丢信息。

**2. 工具调用幻觉**

模型有时会编造不存在的工具，或者给真实工具传错误参数（比如发明了一个本不存在的 flag）。这件事在小模型上尤其严重。缓解办法是收紧 tool schema 的描述、用 function calling 而不是提示词约定，以及在 harness 里做参数校验。

**3. 死循环**

模型反复调用同一个工具拿同样的结果，不收敛。常见于"修一个 bug 但根本没想清楚"的场景：跑测试 → 失败 → 改一行 → 跑测试 → 失败 → 改回来。需要在 harness 里检测这种模式并强制中断。

**4. 目标漂移**

多轮之后忘了原始任务。前面提到的 TodoWrite 是一种缓解，更激进的做法是定期"自检"：让 agent 每隔 N 轮 reflect 一次，对照原始目标审视当前进展。

工程上常见的缓解组合是：**context 压缩 + 工具白名单 + step budget + 显式 reflection 节点**。每一项都不彻底，但叠在一起能撑很久。

---

## 六、Agent Loop 是临时方案，还是终极形态

最后留一个开放问题。

回看现在所有的 Agent 框架——Claude Code、Cursor、LangGraph、OpenClaw、learn-claude-code——本质都在围绕同一个 while 循环做工程优化。终止条件、context 压缩、子 agent、todo 管理……每一项都是因为**模型本身做不到，所以 harness 替它做**。

但模型还在变强。

Claude 已经支持 extended thinking——模型在一次调用里能做更长的内部推理。原生的 tool use 在每一代都更稳。multi-step 的 planning 能力肉眼可见地在涨。

那么一个不那么好回答的问题是：

> **当模型本身具备足够长的推理链和原生工具使用能力时，外部那个 while 循环还需要存在吗？**

也许某一天，你只需要一次 API 调用，模型在内部就完成了全部规划、工具调用、上下文管理。harness 被吸收进了模型本身。我们今天精心设计的这些 loop 控制机制，会变成一段历史。

也可能不会。也许 harness 永远存在——因为外部环境永远是 harness 的边界，模型再强，也需要一个东西替它和真实世界对接。

不知道。但这就是现在做 Agent 最有意思的地方：**你不知道自己写的这一千行 harness 代码，到底是产品的核心资产，还是即将过时的过渡方案**。

唯一确定的是，所有故事的开头，都还是那个最朴素的 while 循环。

---

*参考项目：[shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code)，一个把 Claude Code 拆成 12 个递进版本的开源教学项目。建议从 `s01_agent_loop.py` 开始读。*
