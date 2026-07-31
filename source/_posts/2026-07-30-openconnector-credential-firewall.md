---
title: OpenConnector：给 AI Agent 加上一道凭据防火墙
date: 2026-07-30 21:30:00
---

过去，我们使用 AI，主要是在对话框里问问题。现在，AI Agent 开始读取邮件、管理日历、查询 Notion、处理 GitHub Issue，甚至操作企业内部系统。

这时，一个绕不开的问题出现了：**怎样把外部账号交给 Agent，又不把账号的钥匙直接交给大模型？**

最简单的做法，是把 API Key、OAuth Token 或邮箱授权信息写进 Agent 的配置文件。但这等于把所有钥匙放进同一个抽屉。一旦配置文件被读取、日志意外记录了 Token，或者 Agent 遭遇提示词注入，风险就可能从“回答错了”升级为“真的操作了你的账号”。

[OpenConnector](https://github.com/oomol-lab/open-connector) 想解决的，就是这层连接与授权问题。

{% img /images/openconnector-banner.png %}

## OpenConnector 是什么？

OpenConnector 是一个面向 AI Agent 的开源 Connector Gateway，也可以理解为一个位于 Agent 和外部应用之间的统一连接网关。

它目前提供包含 **近 1,000 个 Provider、10,000 多个预置 Action** 的共享目录，覆盖 Gmail、GitHub、Notion、Slack、Google Calendar、Google Drive、Airtable、Supabase 等常见服务。

用户只需要连接一次账号，之后 OpenClaw、其他支持 MCP 的 Agent，或者普通应用程序，都可以通过统一接口发现和调用这些能力。

它的基本结构可以概括为：

```text
OpenClaw / AI Agent
        │
        │  MCP、SDK、HTTP
        ▼
   OpenConnector
        ├── 凭据与 OAuth 边界
        ├── Action 与权限策略
        ├── 脱敏日志
        └── Gmail、GitHub、Notion 等外部服务
```

真正的 OAuth Token、API Key 和自定义凭据保留在 OpenConnector 的运行环境里。Agent 通常只能看到：

- 已连接账号的安全标签；
- 可调用的 Action；
- Action 的输入与输出 Schema；
- 所需 Scope 和权限；
- 本次调用的执行结果。

也就是说，Agent 获得的是“调用某项能力的权限”，而不是外部账号的原始钥匙。

## 它解决了传统 Agent 接入的三个麻烦

### 一、避免把原始凭据直接交给 Agent

如果直接把 GitHub PAT 或 Gmail OAuth Token 写入 OpenClaw 配置，Agent 进程往往具备读取这些信息的可能性。

使用 OpenConnector 后，OpenClaw 只需要持有一个受限的 Runtime Token。真正的 Provider 凭据由网关在执行 Action 时注入，原始 Token 不需要进入模型上下文。

这种设计不能消除所有安全风险，但至少缩小了凭据泄露的范围，也让权限可以独立撤销和轮换。

### 二、统一不同服务的授权与调用方式

不同 SaaS 的鉴权方式非常分散：

- 有些使用 API Key；
- 有些使用 OAuth2；
- 有些需要自定义凭据字段；
- 有些服务不需要鉴权；
- 不同 OAuth Provider 的 Scope 和刷新逻辑也不相同。

OpenConnector 把这些差异收敛到了同一套 Provider、Connection 和 Action 模型中。Agent 可以先搜索 Action、查看调用说明，再选择账号连接并执行。

{% img /images/openconnector-providers.jpg %}

从控制台可以看到，Google Sheets、Gmail、Slack、GitHub、Notion、Jira、Dropbox、Outlook 等服务都被放进了同一个连接目录。对于需要同时接入多个工作软件的 Agent，这种统一管理会比逐个维护 MCP Server 和 Token 清晰很多。

### 三、增加可观察性和策略控制

OpenConnector 不只是一个 Token 仓库，还提供了：

- Runtime Token；
- Action 允许和禁止策略；
- Provider Scope 展示；
- Connection Identity；
- 脱敏运行日志；
- 调用失败和趋势统计；
- 临时文件中转；
- OpenAPI 与 MCP Metadata。

{% img /images/openconnector-overview.jpg %}

这意味着，当 Agent 调用了某个外部服务时，管理员能够追踪它使用了哪个 Action、是否成功，以及近期是否出现异常调用。

## 为什么它特别适合 OpenClaw？

OpenClaw 的价值，在于让 Agent 从聊天走向真实行动。但能力越强，凭据越容易成为风险集中点。

OpenConnector 原生提供 MCP Endpoint：

```text
http://localhost:3000/mcp
```

新版 OpenClaw 可以登记 Streamable HTTP MCP Server，因此可以直接把 OpenConnector 暴露的工具加载进 Agent。OpenConnector 的 MCP 主要提供以下发现与执行能力：

- `list_apps`
- `list_connections`
- `search_actions`
- `get_action_guide`
- `execute_action`

这种设计还有一个附带好处：OpenClaw 不必一次把成千上万个 Action 的完整 Schema 全部塞进上下文，而是先搜索，再按需读取 Action Guide，最后执行。

一个典型的 OpenClaw 配置可以写成：

```bash
openclaw mcp set openconnector '{
  "url": "http://openconnector:3000/mcp",
  "transport": "streamable-http",
  "headers": {
    "Authorization": "Bearer ${OPENCONNECTOR_RUNTIME_TOKEN}"
  }
}'

openclaw mcp doctor openconnector --probe
```

其中，Runtime Token 最好通过环境变量注入，而不是直接把明文写进配置文件。

## 四种使用路径

OpenConnector 提供了几种不同的部署选择。

| 方式 | 适合谁 | 主要特点 |
| --- | --- | --- |
| 本地自托管 | 个人开发者、小团队 | Docker 或 Node.js 运行，使用 SQLite 保存状态 |
| Fly.io 自托管 | 希望减少服务器运维的团队 | Docker Runtime、持久化 Volume、TLS 和健康检查 |
| Cloudflare 部署 | 希望使用轻量 Serverless 架构的团队 | Workers 运行服务，D1 保存状态，R2 中转文件 |
| OOMOL 托管 | 希望快速完成 OAuth 授权的团队 | 官方维护 OAuth App，用户可直接授权 |

这里有一个很现实的取舍：

- **自托管**能更好地掌控凭据，但需要自己申请和配置各个平台的 OAuth App；
- **OOMOL 托管**更方便，但凭据会进入第三方托管的运行环境，企业使用前需要完成供应商和合规评估。

## 几分钟跑起来

项目已经提供预构建 Docker 镜像。最简单的启动方式是：

```bash
docker compose up
```

然后打开：

```text
http://localhost:3000
http://localhost:3000/docs
```

也可以先调用一个不需要鉴权的 Hacker News Action，确认 Runtime 工作正常：

```bash
curl -s -X POST \
  http://localhost:3000/v1/actions/hackernews.get_top_stories \
  -H 'content-type: application/json' \
  -d '{"input":{}}'
```

如果要连接 GitHub，可以使用 Personal Access Token；如果要连接 Gmail 等 OAuth Provider，则需要在自托管环境中配置自己申请的 OAuth Client。

## 需要特别注意：它不是“绝对安全保险箱”

OpenConnector 的宣传重点是“Agent 看不到原始凭据”，这个方向是成立的，但不能把它理解成：只要部署了 OpenConnector，Agent 就不会做出危险操作。

至少还要注意三点。

### Runtime Token 本身也是一种能力凭证

如果一个 Runtime Token 可以执行“发送邮件”“删除文件”“修改仓库权限”等 Action，那么拿到这个 Token 的人虽然看不到 Gmail 或 GitHub 的原始凭据，仍然可以通过网关完成这些操作。

因此，关键不是只隐藏 Token，而是给 Runtime Token 配置尽可能小的 Action 白名单。

### 它不能自动消除提示词注入

恶意邮件或网页仍可能诱导 Agent 调用合法工具完成危险动作。OpenConnector 负责鉴权和执行边界，不负责判断 Agent 的意图一定正确。

发送、删除、转账、发布和权限修改等高风险操作，仍应增加人工确认。

### 同一主机、同一用户不等于真正隔离

如果 OpenClaw 可以读取 OpenConnector 的环境变量、SQLite 数据库、加密密钥或管理接口，那么凭据边界仍可能被绕过。

更稳妥的做法是：

- 使用独立容器、系统用户或虚拟机；
- 不向 OpenClaw 挂载 OpenConnector 的数据卷；
- 设置独立的管理 Token 和 Runtime Token；
- 开启凭据加密；
- 禁止不需要的 Provider Proxy；
- 固定正式版本，不在生产环境直接跟随 `latest`。

## 谁最值得尝试？

OpenConnector 比较适合以下用户：

- 使用 OpenClaw，并希望同时接入 Gmail、GitHub、Notion、Slack 等多个服务；
- 正在开发需要用户授权第三方账号的 Agent 产品；
- 希望统一管理 OAuth、API Key、Scope、Action Policy 和运行日志；
- 希望先使用托管 Connector 快速验证，再逐步迁移到自托管环境。

如果只需要连接一个服务，直接使用该服务的官方 MCP Server，通常更简单，攻击面也更小。

但当接入对象逐渐增加，OpenConnector 的价值会越来越明显：它把“每个 Agent 各自保存一堆 Token”，变成了“一套独立、可审查、可限制的连接基础设施”。

## 结语

AI Agent 的能力上限，很大程度上取决于它能连接多少真实工具；而 Agent 能否被放心使用，又取决于这些连接是否可控。

OpenConnector 给出的思路很清晰：

> Connect Once. Use Everywhere.

连接一次，统一复用；凭据留在网关内，Agent 只获得完成任务所需的能力。

它仍是一个快速发展的年轻项目，不能代替最小权限、沙箱隔离和人工审批。但对于 OpenClaw 这类需要频繁调用外部服务的 Agent，OpenConnector 已经提供了一条比“直接把所有 Token 塞给 Agent”更合理的路径。

## 参考资料

- [OpenConnector 项目主页](https://github.com/oomol-lab/open-connector)
- [OpenConnector 中文 README](https://github.com/oomol-lab/open-connector/blob/main/docs/README.zh-CN.md)
- [Runtime API 与 MCP](https://github.com/oomol-lab/open-connector/blob/main/docs/runtime-api.md)
- [凭据与本地存储](https://github.com/oomol-lab/open-connector/blob/main/docs/credentials.md)
- [配置与权限策略](https://github.com/oomol-lab/open-connector/blob/main/docs/configuration.md)
- [OpenClaw MCP 文档](https://docs.openclaw.ai/cli/mcp)

> 本文界面图片来自 OpenConnector 官方 GitHub 仓库，相关商标和产品名称归各自权利人所有。
