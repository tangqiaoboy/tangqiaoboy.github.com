---
title: 在 Github 中通过创建 issue 来唤醒 claude 工作
date: 2026-04-26 19:55:42
tags: AI
---

## 前置条件

- 你是目标 repo 的 **admin**
- 已有 Anthropic API Key（或 AWS Bedrock 凭证）
  - 申请 Anthropic API Key 可以使用 `claude setup-token` 命令，得到一个 sk 开头的 key

---

## 方式一：安装官方 Claude App（最快）

1. 打开 <https://github.com/apps/claude>，点击 **Install**
2. 选择你要授权的 repo（建议只勾选需要的 repo，不要 All repositories）
3. 确认安装

安装完成后跳到下面的「配置 Secrets 和 Workflow」章节。

---

## 方式二：创建自定义 GitHub App（完全掌控权限）

适用场景：组织策略不允许装第三方 App、需要更严格的权限控制、使用 AWS Bedrock / Vertex AI。

### A）快速创建（推荐）

1. 从 <https://github.com/anthropics/claude-code-action/blob/main/docs/create-app.html> 右键「另存为」下载 `create-app.html`
2. 用浏览器打开这个文件
   - **个人账号**：点击「Create App for Personal Account」
   - **组织账号**：输入组织名称，点击「Create App for Organization」
3. GitHub 会展示 App 配置预览 → 确认名称 → 点击 **Create GitHub App**
4. 创建后自动跳转到 App 设置页，往下滚到 **Private keys** → 点 **Generate a private key** → 下载 `.pem` 文件（妥善保管）
5. 跳到下面的「安装 App 到 Repo」步骤

### B）手动创建

1. 打开 <https://github.com/settings/apps>（个人）或组织的 Settings → Developer settings → GitHub Apps
2. 点 **New GitHub App**，配置以下权限：

| 权限类别 | 权限项 | 级别 |
|---------|--------|------|
| Repository permissions | Contents | Read & Write |
| Repository permissions | Issues | Read & Write |
| Repository permissions | Pull requests | Read & Write |
| Account permissions | 无 | — |

3. 「Where can this GitHub App be installed?」选 **Only on this account**
4. 点 **Create GitHub App**
5. 创建完成后，滚到 **Private keys** → **Generate a private key** → 下载 `.pem` 文件

### 安装 App 到 Repo

1. 进入你刚创建的 App 设置页
2. 左侧菜单点 **Install App**
3. 选择要安装的 repo，确认

---

## 配置 Secrets 和 Workflow

### 第一步：添加 Repository Secrets

进入 repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 名称 | 值 |
|-------------|-----|
| `ANTHROPIC_API_KEY` | 你的 Anthropic API Key（`sk-ant-` 开头） |
| `CLAUDE_CODE_OAUTH_TOKEN`（可选，替代上一条） | 用 `claude setup-token` 生成的 OAuth Token |
| `APP_ID`（自定义 App 才需要） | App 设置页里的 App ID |
| `APP_PRIVATE_KEY`（自定义 App 才需要） | `.pem` 文件的完整内容 |

> ⚠️ 绝对不要把 API Key 写在代码里，只通过 Secrets 引用。
> `ANTHROPIC_API_KEY` 和 `CLAUDE_CODE_OAUTH_TOKEN` 二选一即可，下面示例以 API Key 为主，OAuth 用法是把 `anthropic_api_key:` 换成 `claude_code_oauth_token:`。

### 第二步：创建 Workflow 文件

在 repo 中创建 `.github/workflows/claude.yml`：

**如果用官方 Claude App：**

```yaml
name: Claude Assistant
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  pull_request_review:
    types: [submitted]
  issues:
    types: [opened, assigned]

# 仓库级权限：按需最小化——只读场景可把三个 write 都改成 read
permissions:
  contents: write
  pull-requests: write
  issues: write
  # 用 CLAUDE_CODE_OAUTH_TOKEN 时必加，OAuth 流程要用 OIDC token 去换；
  # 用 ANTHROPIC_API_KEY 时可省。
  id-token: write
  # 让 Claude 能读 CI run 日志（"我 PR 的 CI 挂了帮我看看"）
  actions: read

jobs:
  claude-response:
    # 双重门槛：
    #   1. actor 必须是仓库主人本人——防外部用户触发
    #   2. 触发载体里必须出现 @claude——没有则直接 skip，连 runner 都不起，省 Action 额度
    # 注意：include_comments_by_actor 只过滤"评论"，不一定覆盖 issue body /
    # PR description / review body，所以第 1 条的 actor 校验是必须的纵深防御。
    if: |
      github.actor == '你的用户名' && (
        (github.event_name == 'issue_comment'               && contains(github.event.comment.body, '@claude')) ||
        (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
        (github.event_name == 'pull_request_review'         && contains(github.event.review.body,  '@claude')) ||
        (github.event_name == 'issues'                      && (contains(github.event.issue.body,  '@claude')
                                                             || contains(github.event.issue.title, '@claude')))
      )
    runs-on: ubuntu-latest
    steps:
      # claude-code-action 需要 .git 目录才能创建分支去提 PR
      - uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # 第三道门：评论场景也只接受白名单
          include_comments_by_actor: "你的用户名"
          # 工具权限：纵深防御——Bash 不再裸开，按命令前缀逐条白名单。
          # 只读场景可把所有 Bash(...) 和 Edit/Write 删掉。
          claude_args: |
            --max-turns 30
            --allowedTools "WebFetch,WebSearch,Edit,Write,Read,Glob,Grep,TodoWrite,Bash(git:*),Bash(gh:*),Bash(npm:*),Bash(pnpm:*),Bash(yarn:*),Bash(npx:*),Bash(node:*),Bash(curl:*),Bash(jq:*),Bash(rg:*),Bash(fd:*)"
```

**如果用自定义 GitHub App：**

```yaml
name: Claude with Custom App
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  pull_request_review:
    types: [submitted]
  issues:
    types: [opened, assigned]

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write  # 用 OAuth Token 时必加
  actions: read    # 让 Claude 能看 CI run 日志

jobs:
  claude-response:
    if: |
      github.actor == '你的用户名' && (
        (github.event_name == 'issue_comment'               && contains(github.event.comment.body, '@claude')) ||
        (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
        (github.event_name == 'pull_request_review'         && contains(github.event.review.body,  '@claude')) ||
        (github.event_name == 'issues'                      && (contains(github.event.issue.body,  '@claude')
                                                             || contains(github.event.issue.title, '@claude')))
      )
    runs-on: ubuntu-latest
    steps:
      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@v1
        with:
          app-id: ${{ secrets.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          github_token: ${{ steps.app-token.outputs.token }}
          include_comments_by_actor: "你的用户名"
          claude_args: |
            --max-turns 30
            --allowedTools "WebFetch,WebSearch,Edit,Write,Read,Glob,Grep,TodoWrite,Bash(git:*),Bash(gh:*),Bash(npm:*),Bash(pnpm:*),Bash(yarn:*),Bash(npx:*),Bash(node:*),Bash(curl:*),Bash(jq:*),Bash(rg:*),Bash(fd:*)"
```

---

## Public Repo 安全清单

- [x] `if` 用 **actor 白名单**（`github.actor == '你的用户名'`），不要只用"排除 bot"的黑名单
- [x] `if` 再叠一层 `contains(<事件正文>, '@claude')` 判断——没有触发词直接 skip，省 Action 额度也避免被误触
- [x] `include_comments_by_actor` 同步设置用户白名单（注意：它只过滤评论，不一定覆盖 issue body / PR description，所以上面两条 `if` 校验是必须的纵深防御）
- [x] 顶层 `permissions:` 块按需最小化授权——只读场景 contents/pull-requests/issues 都给 `read` 即可；要提 PR 才给 `write`
- [x] `claude_args` 里 `Bash` **不要裸开**——用 `Bash(git:*),Bash(gh:*),...` 这种命令前缀白名单收紧
- [x] `allowed_bots` 保持默认空值（不要设 `*`）
- [x] `show_full_output` 保持默认 false
- [x] API Key / OAuth Token 只通过 `${{ secrets.XXX }}` 引用，不硬编码
- [x] 定期轮换 API Key
- [x] 意识到一旦 actor 校验被绕过，攻击者拿到的就是 workflow `permissions` 里授予的全部能力——所以前两条最关键

---

## 验证

配置完成后，在 issue 里评论 `@claude 你好`，如果一切正常，Claude 会在几秒内回复。

参考文档：<https://github.com/anthropics/claude-code-action>


