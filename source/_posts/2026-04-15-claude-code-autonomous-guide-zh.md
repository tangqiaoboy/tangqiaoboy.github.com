---
title: 让 Claude Code 在你睡觉时持续运行：完整实战指南
date: 2026-04-15 13:44:00
tags:
  - Claude Code
  - AI Coding
  - Agent
  - 自动化
categories:
  - AI
  - 开发工具
---

**Claude Code 可以通过 `-p` 标志、权限绕过、循环模式和终端持久化的组合，实现数小时甚至整夜的无人值守运行。** 开发者社区已经形成了一套可靠的操作手册：容器化运行环境、使用 "Ralph Wiggum" 循环模式、安装四个关键 Hook 防止卡死、保持 CLAUDE.md 精简。有开发者记录了 **27 小时连续自主会话完成 84 个任务**；另一位在睡觉时让 Claude 构建了一个 15,000 行的游戏。但社区也反馈，大约 25% 的过夜产出会被丢弃，而且如果没有适当的防护措施，Claude 曾在至少一位开发者的机器上执行过 `rm -rf /`。以下是你今晚就能用上的完整设置方案。

---

## 一、消除人工干预的三种模式

Claude Code 提供三个级别的自主运行模式，每个级别都在安全性和速度之间做取舍。理解它们是所有过夜方案的基础。

**模式 1：`-p`（print/pipe）标志 —— 所有自动化的核心。** 这是非交互式运行模式。接收 prompt，执行到完成，输出到 stdout，然后退出。无需 TTY，512MB 内存的服务器也能跑。

```bash
claude -p "查找并修复 auth.py 中的 bug" --allowedTools "Read,Edit,Bash"
```

**模式 2：`--permission-mode auto` —— 更安全的折中方案。** 2026 年初推出，使用 Sonnet 4.6 分类器自动批准安全操作，同时阻止高风险操作。分类器分两阶段运作：快速判定（8.5% 误报率），对标记项目进行思维链推理（0.4% 误报率）。如果连续 3 次操作被拒绝或单次会话累计 20 次被拒，系统会升级到人工介入——或者在 headless 模式下直接终止。

```bash
claude --permission-mode auto -p "重构认证模块"
```

**模式 3：`--dangerously-skip-permissions` —— 完全绕过权限。** 所有操作无需确认直接执行。Anthropic 自己的安全研究员 Nicholas Carlini 也使用这个模式，但有一个关键前提：*"在容器里跑，不要在你的真实机器上。"* 一项调查发现 **32% 的开发者**使用这个标志时遭遇了意外的文件修改，**9% 报告了数据丢失**。

```bash
# 仅限 Docker/VM —— 绝对不要在宿主机上运行
claude --dangerously-skip-permissions -p "构建这个功能"
```

**推荐的过夜运行方式**是将 `-p` 与细粒度工具白名单 `--allowedTools` 结合使用，允许特定命令而非授予全面访问权限：

```bash
claude -p "修复所有 lint 错误并运行测试" \
 --allowedTools "Read" "Edit" "Bash(npm run lint:*)" "Bash(npm test)" "Bash(git *)" \
 --max-turns 50 \
 --max-budget-usd 10.00
```

`--max-turns` 和 `--max-budget-usd` 是无人值守会话的必备成本控制手段。没有它们，一个失控的循环可以在几分钟内烧光你的 API 预算。

---

## 二、Ralph Wiggum 循环：开发者的实际过夜方案

最经过实战验证的长时间自主工作模式是 **Ralph Wiggum 循环**——以《辛普森一家》中的角色命名，现已成为 Anthropic 官方插件。概念非常简单：一个 bash while 循环持续向 Claude 喂相同的 prompt。每次迭代中，Claude 查看当前文件状态和 git 历史，选择下一个未完成的任务，实现它，然后提交。

```bash
while true; do
 claude --dangerously-skip-permissions \
 -p "$(cat PROMPT.md)" 
 sleep 1
done
```

那位记录了 **27 小时会话** 的开发者使用了这个模式，配合一个详细的 prompt 文件，包含架构说明、目标、约束条件和明确的"完成"标准。他的核心发现：*"一句话 prompt 在一两个小时后就没劲了。27 小时的会话能持续下去，是因为 prompt 文件有足够多的上下文。"*

**Prompt 文件比循环本身更重要。** 一个有效的过夜 PROMPT.md 示例：

```markdown
# 任务：测试并加固认证系统

## 上下文
- 后端：Express + TypeScript，位于 src/api/
- 数据库：PostgreSQL，schema 在 prisma/schema.prisma
- 认证流程：JWT 中间件在 src/middleware/auth.ts

## 目标
- 查看 docs/plan.md，选择下一个未完成的任务
- 实现它，包含完善的错误处理
- 运行测试，修复失败，确认没有回归
- 做通用修复，不要打临时补丁
- 每完成一个任务后用描述性消息提交

## 成功标准
- 每次修改后所有测试通过
- 不会引入之前修复的回归
- 当 plan.md 中所有任务完成后输出 DONE
```

社区有几个工具扩展了这个基础循环。**Ralph CLI** 增加了速率限制（100次调用/小时）、熔断器、会话过期（默认24小时）和实时监控仪表板。**Nonstop** 增加了飞行前风险评估和阻塞决策框架——走之前输入 `/nonstop` 即可。**Continuous-claude** 自动化完整 PR 生命周期：创建分支、推送、创建 PR、等待 CI、合并。

---

## 三、防止过夜灾难的四个 Hook

开发者 yurukusa 记录了 **108 小时无人值守运行**，识别出七类过夜事故——包括 Claude 执行 `rm -rf ./src/`、进入无限错误循环、直接推送到 main 分支，以及产生每小时 8 美元的 API 费用。解决方案：**四个关键 Hook**，共同预防最常见的故障模式。

10 秒快速安装：

```bash
npx cc-safe-setup
```

**Hook 1：No-Ask-Human** 阻止 `AskUserQuestion` 工具调用，强制 Claude 自主做出决定，而不是坐在那里等几小时等人回复。这个 Hook 决定了 Claude 是整夜工作还是在晚上 11:15 卡住。在你坐在电脑前时，用 `CC_ALLOW_QUESTIONS=1` 覆盖。

**Hook 2：Context Monitor** 将工具调用次数作为上下文使用量的代理指标，在四个阈值（剩余 40%、25%、20%、15%）发出分级警告。在临界水平时，配套的空闲推送脚本会自动向终端注入 `/compact` 命令——两个进程，**共 472 行代码，零人工干预**。

**Hook 3：Syntax Check** 在任何文件编辑后立即运行 `python -m py_compile`、`node --check` 或 `bash -n`，在错误级联成 50 次调试之前就捕获它们。

**Hook 4：Decision Warn** 在执行前标记破坏性命令（`rm -rf`、`git reset --hard`、`DROP TABLE`、`git push --force`）。通过 `CC_PROTECT_BRANCHES="main:master:production"` 配置受保护分支。

在 `.claude/settings.json` 中配置：

```json
{
 "permissions": {
 "allow": ["Bash(npm run lint:*)", "WebSearch", "Read"],
 "deny": ["Read(.env)", "Bash(rm -rf *)", "Bash(git push * main)"]
 }
}
```

---

## 四、tmux 设置与保持机器不休眠

Claude Code 的交互模式需要 TTY —— 不能用 `nohup` 或将其作为 systemd 服务运行（大约 15-20 秒后会因 stdin 错误崩溃）。**tmux 是会话持久化的必备工具**。

```bash
# 启动命名会话
tmux new -s claude-work

# 在其中启动 Claude
claude --permission-mode auto

# 分离（Claude 继续运行）：Ctrl+B，然后按 D

# 从任何地方重新连接（SSH、手机 Termius 等）
tmux attach -t claude-work

# 不连接就查看进度
tmux capture-pane -t claude-work -p -S -50
```

对于真正的 7×24 运行，社区推荐 **VPS + Tailscale + tmux** 方案：便宜的 VPS（Hetzner、Vultr、DigitalOcean）提供永不关机的算力，Tailscale 提供私有网络，mosh 在不稳定网络上保持连接持久性。给 Claude 一个任务，分离，合上笔记本，明天再回来。

macOS 防止休眠：

```bash
# 绑定到 Claude 进程
caffeinate -i -w $(pgrep -f claude) &

# 或者在接通电源时全局禁用休眠
sudo pmset -c sleep 0
```

管理多个并行会话方面，**Amux** 是一个约 12,000 行的 Python 文件，提供 Web 仪表板、手机 PWA 监控、自愈看门狗（自动重启崩溃会话）、按会话 token 追踪和 git 冲突检测。**Codeman** 提供类似的 Web UI，带 xterm.js 终端，支持最多 20 个并行会话。

一个强大的过夜 agent tmux 配置：

```bash
#!/bin/bash
tmux new-session -d -s claude-dev
tmux rename-window -t claude-dev:0 'Claude'
tmux new-window -t claude-dev:1 -n 'Tests'
tmux new-window -t claude-dev:2 -n 'Logs'
tmux send-keys -t claude-dev:0 'claude --permission-mode auto' Enter
tmux send-keys -t claude-dev:1 'npm run test:watch' Enter
tmux send-keys -t claude-dev:2 'tail -f logs/app.log' Enter
tmux attach-session -t claude-dev
```

---

## 五、CLAUDE.md 与长时间运行的上下文管理

过夜失败的最大原因是**上下文窗口耗尽**。Claude Code 的上下文窗口大约 200K token，使用率超过 **70%** 时性能开始下降。自动压缩在接近阈值时触发，但会丢失信息——仅保留 20-30% 的细节。有开发者报告 Claude 压缩后遗忘了所有内容，重新开始同一个任务，浪费了三个小时。

解决方案是**检查点/交接模式**，能够在上下文重置后存活：

```markdown
# 在 CLAUDE.md 中
当上下文变大时，将当前状态写入 tasks/mission.md。
包括：已完成的、下一步的、被阻塞的、未解决的问题。
错误处理：最多重试 3 次。如果没有进展，记录到
pending_for_human.md 然后转到下一个任务。
压缩前，务必保存完整的已修改文件列表。
```

将 CLAUDE.md **控制在 200 行以内**——每个词在每个会话中都消耗 token。从 800 行切换到 100 行的开发者达成社区共识：更短的配置实际上表现更好，因为 Claude 不会忽略被噪音淹没的指令。使用"仅在不可逆时才提问"规则，将提问频率降低约 80%：

```markdown
# 自主运行的决策规则
- 技术方案不确定 → 选择传统方案
- 两种可行实现 → 选择更简单的那个
- 尝试 3 次后仍有错误 → 记录到 blocked.md，切换任务
- 需求模糊 → 应用最合理的理解，记录假设
- 永远不要提问。做出最佳判断然后继续。
```

CLAUDE.md 文件是分层的：`~/.claude/CLAUDE.md`（全局）、`./CLAUDE.md`（项目级，git 追踪）、`.claude/CLAUDE.local.md`（个人覆盖，gitignore）。自主运行时，全局文件保持最小，把运行特定指令放在项目文件中。

关键 token 节省技巧：在里程碑后主动使用 `/compact`，而非等待自动压缩；对独立任务使用子 agent（每个有自己的上下文窗口）；不相关的工作启动新会话；积极使用 `.claudeignore` 排除无关文件。

---

## 六、过夜运行的速率限制处理

速率限制作为**三个独立的、重叠的约束**运作：每分钟请求数、每分钟输入 token 数、每分钟输出 token 数。一个可见的命令在内部可能产生 8-12 个 API 调用（lint、修复、测试、修复循环）。15 次迭代后，单个请求可能发送 **20 万+ 输入 token**。

过夜运行速率限制生存策略：

**在非高峰时段运行。** Anthropic 确认工作日太平洋时间早 5 点到 11 点限制更严格。过夜运行和周末会话完全避开高峰期限流——恰好就是你在睡觉的时候。

**利用 Ralph 循环的内置重试。** 运行 while 循环时，速率限制错误只会导致当前迭代失败，但循环不在乎——它在速率限制窗口重置后的下一次迭代中重试。有开发者警告：*"不要在 API/按用量计费模式下运行——重试会烧光你的预算。"*

**运行中切换模型。** Sonnet 能处理 60-70% 的常规任务，每 token 成本比 Opus 低约 1.7 倍。过夜工作设置 `--model sonnet`，将 Opus 留给复杂推理。也可以设置 `--fallback-model sonnet`，让 Claude 在主模型过载时自动降级。

**Token 消耗的真实数据**：20 条消息会话消耗约 **105,000 token**；30 条消息会话跳到 **232,000 token**。大约 **98.5% 的 token** 花在重新读取对话历史——只有 1.5% 用于实际输出。这就是为什么全新会话和积极压缩如此重要。

成本估算：持续运行 Sonnet 大约 **$10.42/小时**。基于 cron 每 15 分钟运行一次的 agent，预计约 **$48/天**。使用 `--max-budget-usd` 作为硬上限。

---

## 七、CI/CD 流水线与 Cron 任务集成

对于计划性的自动化工作，Claude Code 可直接与 CI/CD 系统集成。官方 GitHub Action 是 `anthropics/claude-code-action@v1`：

```yaml
name: Claude Code Review
on:
 pull_request:
 types: [opened, synchronize]
jobs:
 review:
 runs-on: ubuntu-latest
 steps:
 - uses: actions/checkout@v4
 with:
 fetch-depth: 0
 - uses: anthropics/claude-code-action@v1
 with:
 anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
 prompt: "审查这个 PR 的安全和代码质量问题。"
 claude_args: "--max-turns 5 --model claude-sonnet-4-6"
```

对于基于 cron 的自主 agent，**Boucle 模式**通过 `state.md` 文件在运行之间维持状态：

```bash
#!/bin/bash
# run-agent.sh —— 由 cron 调用
STATE="$HOME/agent/state.md"
LOG="$HOME/agent/logs/$(date +%Y-%m-%d_%H-%M-%S).log"

claude -p "你是一个自主 agent。读取你的状态，决定做什么，
然后用你学到的内容更新 state.md。
$(cat $STATE)" \
 --allowedTools Read,Write,Edit,Bash \
 --max-turns 20 \
 --max-budget-usd 1.00 \
 --bare 2>&1 | tee "$LOG"
```

```bash
# crontab -e
0 * * * * /path/to/run-agent.sh
```

200 次迭代后的关键教训：**state.md 必须保持在 4KB 以下**（它会被注入每个 prompt），使用结构化键值对而非散文，并添加文件锁防止重叠运行。每次迭代后 git commit——git log 就是你最好的调试工具。

CI 环境使用 `--bare` 模式（跳过 hook、MCP 服务器、OAuth 和 CLAUDE.md 加载，最快最可复现的执行方式）和 `--permission-mode dontAsk`（拒绝所有未显式允许的操作——自动化环境中最安全的模式）。

---

## 八、已知陷阱与可能出错的地方

社区已广泛记录了以下故障模式：

| 故障模式 | 后果 | 预防方法 |
|---|---|---|
| **破坏性命令** | Claude 运行 `rm -rf`、`git reset --hard` 或覆盖生产数据 | PreToolUse hook 阻止危险命令；Docker 配合 `--network none` |
| **无限错误循环** | 修复 → 测试 → 同样错误 → 修复 → 重复 20+ 次 | CLAUDE.md 规则："最多重试 3 次，然后记录到 blocked.md 继续下一个" |
| **压缩后上下文丢失** | Claude 遗忘一切，重新开始同一任务 | 压缩前将状态写入 mission.md；使用 Ralph 循环获得全新上下文迭代 |
| **权限提示阻塞** | 会话无限期挂起等待人工输入 | No-Ask-Human hook；`--dangerously-skip-permissions`；`--permission-mode auto` |
| **直接推送到 main** | 未测试的代码部署到生产环境 | 分支保护规则；PreToolUse hook 阻止 `git push` 到受保护分支 |
| **API 成本失控** | 子 agent 进入循环调用外部 API（$8/小时） | `--max-budget-usd`；速率限制 hook；熔断器 |
| **OAuth token 过期** | 中途打断自主工作流 | 所有自动化使用 `ANTHROPIC_API_KEY` 环境变量而非 OAuth |
| **订阅 ToS 违规** | 用 Pro/Max 订阅（非 API key）的 headless 模式可能违反消费者条款 | 自动化/脚本使用务必用 `ANTHROPIC_API_KEY` |

**最重要的单一安全措施**是容器化。多位经验丰富的开发者独立推荐使用带网络隔离的 Docker：

```bash
docker run -it --rm \
 -v $(pwd):/workspace -w /workspace \
 --network none \
 -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
 claude-code:latest --dangerously-skip-permissions -p "$(cat PROMPT.md)"
```

正如一位开发者所说：*"用 `--dangerously-skip-permissions` 运行 Claude Code 就像不做防护措施。所以用个套... 我是说容器。"*

---

## 九、今晚的快速启动清单

15 分钟设置过夜自主运行：

1. **创建 git 检查点**：`git add -A && git commit -m "pre-autonomous checkpoint"`
2. **安装四个关键 Hook**：`npx cc-safe-setup`
3. **编写 PROMPT.md**，包含架构上下文、任务列表、成功标准，以及每完成一个任务就提交的指令
4. **启动 tmux 会话**：`tmux new -s overnight`
5. **防止休眠**（macOS）：`caffeinate -s &`
6. **启动循环**：

```bash
while true; do
 claude -p "$(cat PROMPT.md)" \
 --allowedTools "Read" "Edit" "Bash(npm run *)" "Bash(git *)" \
 --max-turns 30 \
 --max-budget-usd 5.00 \
 --permission-mode acceptEdits
 sleep 2
done
```

7. **分离 tmux**：`Ctrl+B`，然后按 `D`
8. **去睡觉**

早上起来：`tmux attach -t overnight`，然后查看 git log（`git log --oneline`）看 Claude 完成了什么。预计保留大约 75% 的产出，丢弃 25%。这很正常——正如一位开发者说的，*"不是完美，甚至不是最终版，但是在前进。"*

## 十、总结

先用 plan 模式，把 `PRD.md` 和 `TODO.md` 生成好。

 - 安装 cc-safe-setup
``` bash
npx cc-safe-setup
```
 - 安装 format-claude-stream
``` bash
npm install -g @khanacademy/format-claude-stream
```

 - 编写项目的 `CLAUDE.md`
``` md
 - 当上下文变大时，将当前状态写入 tasks/mission.md。包括：已完成的、下一步的、被阻塞的、未解决的问题。
 - 错误处理：最多重试 3 次。如果没有进展，记录到 pending_for_human.md 然后转到下一个任务。
 - 压缩前，务必保存完整的已修改文件列表。
```

 - 编写 `PROMPT.md`
``` md
## 目标
 - 查看 TODO.md，选择一个未完成的任务执行
 - 执行的代码必须包含测试用例并测试通过
 - 每做完一个任务，及时提交 Git，并在 TODO.md 标记为已完成
 - 当所有任务都完成后，在 TODO.md 中顶部注明：“全部任务已完成”

## 要求
 - 技术方案不确定 → 选择传统方案
 - 两种可行实现 → 选择更简单的那个
 - 需求模糊 → 应用最合理的理解，记录假设
 - 永远不要提问，做出最佳判断然后继续

## 环境（如有）
# - CLOUDFLARE API 在 key.md 中
```

 - 编写 key.md
``` bash
CLOUDFLARE_API_TOKEN=xxx
CLOUDFLARE_ACCOUNT_ID=xxx
```

 - 编写 nostop.sh
``` bash
mkdir -p logs
while true; do
  claude -p "$(cat PROMPT.md)" \
  --dangerously-skip-permissions --model opus \
  --output-format stream-json --verbose \
  tee "logs/$(date +%Y%m%d_%H%M%S).jsonl" \
  | format-claude-stream
  sleep 60
done
```




