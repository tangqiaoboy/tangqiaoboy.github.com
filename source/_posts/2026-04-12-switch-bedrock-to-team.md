---
title: Claude Code 从 AWS Bedrock 切换到 Team 订阅指南
date: 2026-04-12 22:44:49
tags: ai
---

## 背景

Claude Code 支持多种认证方式，包括 AWS Bedrock、Google Vertex AI、Anthropic API Key 和 Claude 订阅（Pro/Max/Team/Enterprise）。当你从 Bedrock 切换到 Team 订阅时，需要清除 Bedrock 的配置，否则 Claude Code 会一直走 Bedrock 通道。

## 核心问题

使用 Bedrock 认证时，`/login` 和 `/logout` 命令是**被禁用的**（官方设计如此）。因此你无法在 Bedrock 模式下直接切换登录方式。

Bedrock 配置的来源有两种：
1. **环境变量** — 通过 `export` 或写在 `~/.zshrc` / `~/.bashrc` 中
2. **settings.json** — 写在 `~/.claude/settings.json` 的 `env` 字段中

很多用户（尤其是通过 setup wizard 配置的）的 Bedrock 设置是写在 `settings.json` 里的，单纯 `unset` 环境变量并不能解决问题。

## 切换步骤

### 第一步：检查 Bedrock 配置来源

```bash
# 检查环境变量
env | grep -i -E "claude_code_use|anthropic|bedrock|aws"

# 检查 settings.json
cat ~/.claude/settings.json
```

如果在 `settings.json` 中看到类似以下内容，说明 Bedrock 配置在这里：

```json
{
  "env": {
    "CLAUDE_CODE_USE_BEDROCK": "1",
    "AWS_REGION": "us-west-2",
    "ANTHROPIC_MODEL": "arn:aws:bedrock:...",
    "CLAUDE_CODE_AWS_PROFILE": "default"
  }
}
```

### 第二步：清除 Bedrock 配置

**如果配置在 settings.json 中**，编辑 `~/.claude/settings.json`，删除 `env` 中所有 Bedrock 相关的键值对：

- `CLAUDE_CODE_USE_BEDROCK`
- `AWS_REGION`
- `ANTHROPIC_MODEL`
- `CLAUDE_CODE_AWS_PROFILE`
- `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS`（Bedrock 专用）
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`（Bedrock 专用）

保留你仍需要的配置（如代理、权限设置等）。清理后的文件示例：

```json
{
  "env": {
    "HTTP_PROXY": "http://your-proxy:8118",
    "HTTPS_PROXY": "http://your-proxy:8118"
  },
  "permissions": {
    "allow": [
      "Bash(*)"
    ],
    "defaultMode": "dontAsk"
  }
}
```

**如果配置在环境变量中**，清除相关变量：

```bash
unset CLAUDE_CODE_USE_BEDROCK
unset ANTHROPIC_MODEL
unset ANTHROPIC_API_KEY
unset AWS_REGION
unset CLAUDE_CODE_AWS_PROFILE
```

同时检查并清理 shell 配置文件：

```bash
grep -r "CLAUDE_CODE_USE_BEDROCK\|ANTHROPIC_MODEL\|ANTHROPIC_API_KEY" \
  ~/.zshrc ~/.bashrc ~/.zprofile ~/.bash_profile 2>/dev/null
```

### 第三步：重新启动 Claude Code

```bash
claude
```

此时应该会弹出登录方式选择界面，选择 **「Claude account with subscription」**，然后在浏览器中授权你的 Team 计划。

### 第四步：确认切换成功

启动后，欢迎界面底部应显示类似：

```
Sonnet 4.6 · Claude Pro（或 Team）
```

而不是之前的 `arn:aws:bedrock:...`。

也可以在交互界面中输入 `/status` 确认当前认证方式。

### 第五步：切换模型（可选）

如果需要使用 Opus 模型，在交互界面中输入：

```bash
/model
```

用方向键选择 Opus 即可。

## 认证优先级

Claude Code 的认证优先级从高到低为：

1. 云提供商凭据（`CLAUDE_CODE_USE_BEDROCK` / `CLAUDE_CODE_USE_VERTEX` / `CLAUDE_CODE_USE_FOUNDRY`）
2. `ANTHROPIC_AUTH_TOKEN` 环境变量
3. `ANTHROPIC_API_KEY` 环境变量
4. `apiKeyHelper` 脚本
5. 订阅 OAuth 凭据（`/login`）

只要高优先级的认证方式存在，低优先级的就不会生效。所以必须彻底清除 Bedrock 配置，订阅认证才能生效。

## 注意事项

- **代理地址**：Bedrock 用的代理可能无法访问 `api.anthropic.com`，切换后可能需要更换代理或去掉代理配置。
- **Premium 席位**：Team 计划需要 Premium 席位才能使用 Claude Code，确认管理员已分配。
- **用量共享**：Team 计划的用量限额在 Claude 网页端和 Claude Code 之间是共享的。
- **Memory 延续**：`CLAUDE.md` 等本地文件不受认证方式影响，切换后照常保留。对话历史不会跨会话保存，这点两种方式一样。
