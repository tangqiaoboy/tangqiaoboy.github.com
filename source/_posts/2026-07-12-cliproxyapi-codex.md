---
title: 用 CLIProxyAPI 把 Codex 变成一个 OpenAI 兼容的 API 服务
date: 2026-07-12 22:05:00
categories: tech
---

> 平台：macOS（Apple Silicon / Homebrew）· 版本：CLIProxyAPI 7.2.65

如果你手上有 ChatGPT/Codex 的订阅账号，却想在自己的脚本、IDE 插件或第三方工具里以「标准 OpenAI API」的方式调用它，[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 就是干这件事的。它能把 **Gemini CLI、Codex、Claude Code、Qwen Code** 这类基于 OAuth 登录的 CLI 工具，统一包装成一个本地的、OpenAI 兼容的 HTTP 服务。

本文记录一次真实的安装与配置过程：从 `brew install` 到登录 Codex，再到起服务、验证，最后还踩了一个 **Surge 代理拦截本地请求** 的坑。

---

## 一、安装

```bash
brew install cliproxyapi
```

安装完成后，几个关键路径值得记一下（Apple Silicon 下的默认位置）：

| 项目 | 路径 |
|------|------|
| 可执行文件 | `/opt/homebrew/bin/cliproxyapi` |
| 配置文件 | `/opt/homebrew/etc/cliproxyapi.conf` |
| 认证目录（存放 OAuth token） | `~/.cli-proxy-api` |
| 默认监听端口 | `8317` |

看一下它支持哪些登录方式：

```bash
cliproxyapi --help
```

输出里能看到一堆 `-xxx-login` 选项，我们关心的是这两个：

```
-codex-login          Login to Codex using OAuth
-codex-device-login   Login to Codex using device code flow
```

---

## 二、登录 Codex

这是整个流程的核心。直接运行：

```bash
cliproxyapi -codex-login
```

它会：

1. 自动读取默认配置 `/opt/homebrew/etc/cliproxyapi.conf`，把 token 存到 `~/.cli-proxy-api`；
2. 自动打开浏览器，跳转到 OpenAI/ChatGPT 的 OAuth 授权页（**回调端口是 1455**，确保没被占用）；
3. 你用 **拥有 ChatGPT 付费订阅（Plus/Pro/Team）的账号** 登录并授权；
4. 授权成功后，token 落盘到认证目录。

登录成功后，你会在认证目录里看到一个以账号命名的 JSON 文件：

```bash
$ ls -la ~/.cli-proxy-api
-rw-r--r--  1 you  staff  4152  codex-你的账号@xxx.com-pro.json
```

> **没有图形界面 / 远程服务器？** 改用设备码流程或禁止自动开浏览器：
>
> ```bash
> cliproxyapi -codex-device-login     # 设备码，在别的设备打开链接授权
> cliproxyapi -codex-login -no-browser # 不自动开浏览器，自己复制链接
> ```

---

## 三、配置访问密钥

打开配置文件 `/opt/homebrew/etc/cliproxyapi.conf`，默认的 `api-keys` 是一组占位符：

```yaml
api-keys:
  - "your-api-key-1"
  - "your-api-key-2"
  - "your-api-key-3"
```

这是**客户端调用你这个代理时要携带的密钥**（Bearer Token），和上面的 Codex 登录是两码事。建议换成你自己的一个强随机值。生成一个：

```bash
echo "sk-$(openssl rand -hex 24)"
```

然后把配置改成（只保留你需要的即可）：

```yaml
api-keys:
  - "sk-你生成的随机字符串"
```

配置文件里其它值得留意的字段：

```yaml
port: 8317                      # 监听端口
auth-dir: "~/.cli-proxy-api"    # OAuth token 存放目录
proxy-url: ""                   # 上游代理，需要时填 socks5:// / http://
debug: false                    # 排障时可开
```

---

## 四、启动服务

用 Homebrew 的 services 管理，后台常驻 + 开机自启：

```bash
brew services start cliproxyapi
```

确认状态和端口：

```bash
brew services list | grep cliproxy      # 应显示 started
lsof -iTCP:8317 -sTCP:LISTEN            # 应看到 cliproxyapi 在 LISTEN
```

> 如果只想临时前台运行、方便看日志，直接跑 `cliproxyapi` 即可。

---

## 五、验证

服务地址是 `http://127.0.0.1:8317/v1`，接口是 **OpenAI 兼容格式**。

### 1. 列出模型

```bash
KEY="sk-你的密钥"
curl http://127.0.0.1:8317/v1/models \
  -H "Authorization: Bearer $KEY"
```

能返回一批模型（Codex 账号可用的 `gpt-5.x` 系列，如 `gpt-5.5`、`gpt-5.4`、`gpt-5.4-mini`、`gpt-5.3-codex-spark`、`codex-auto-review` 等）就说明 token 生效了。

### 2. 发一次真实对话（端到端验证）

```bash
curl http://127.0.0.1:8317/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [{"role": "user", "content": "reply with exactly: ok"}]
  }'
```

拿到类似下面的响应（`content: "ok"`、`usage` 有计费），就彻底打通了：

```json
{
  "model": "gpt-5.5",
  "choices": [{"message": {"role": "assistant", "content": "ok"}, "finish_reason": "stop"}],
  "usage": {"prompt_tokens": 307, "completion_tokens": 15, "total_tokens": 322}
}
```

---

## 六、踩坑：Surge（或其它系统代理）会拦截本地请求

第一次 `curl` 验证时，我拿到的不是 JSON，而是一个 **Surge 的错误页**：

```html
<h1>Connection Closed</h1>
访问的 URL 不可用: http://localhost:8317/v1/models
Policy: Reality  ·  错误描述：Read stream EOF
```

原因：系统里开着 **Surge**，`curl` 默认走了系统代理，发往 `localhost:8317` 的请求被 Surge 拦下并试图代理，结果失败。

**临时绕过**（命令行直连本地）：

```bash
curl --noproxy '*' http://127.0.0.1:8317/v1/models -H "Authorization: Bearer $KEY"
```

**长期解决**（在 Surge 配置里让本地环回直连）——把这条规则放在 `[Rule]` 的**靠前**位置：

```
[Rule]
IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
```

几点说明：

- `127.0.0.0/8` 是整个环回段（IANA 保留），全部直连安全，涵盖 `127.0.0.1`；
- `no-resolve` 表示匹配这条规则时**不做 DNS 解析**，只对 IP 字面量请求生效——正好对应我们用 `127.0.0.1` 直连的场景，还能避免为域名请求触发多余解析；
- Surge 自上而下、首个命中生效，所以要放前面。

> ⚠️ 注意：因为加了 `no-resolve`，这条规则**不匹配 `localhost` 这个主机名**。如果你习惯用 `http://localhost:8317`，再补一条：
>
> ```
> DOMAIN,localhost,DIRECT
> ```

改完重载 Surge 配置后，`curl` 就不用再加 `--noproxy '*'` 了。

---

## 七、WebUI 管理面板（可选）

除了改 YAML + 敲命令，CLIProxyAPI 还**内置了一个 WebUI 管理面板**（CLI Proxy API Management Center，简称 CPAMC）。它由服务从 GitHub 自动下载并托管，不用单独安装。

- **访问地址**：`http://127.0.0.1:8317/management.html`

不过它**默认是关闭的**：配置里的 `remote-management.secret-key` 为空时，整个管理 API（`/v0/management/*`）会返回 **404**——面板页面能打开，但里面所有操作都用不了。这也是安全默认值。

### 启用三步

**1. 设置管理密钥**（配置文件 `remote-management` 段）：

```yaml
remote-management:
  allow-remote: false        # 只允许本机访问，保持 false 最安全
  secret-key: "生成一个强随机串" # 启动时会自动哈希
```

生成一个密钥：

```bash
echo "mk-$(openssl rand -hex 24)"
```

**2. 重启服务：**

```bash
brew services restart cliproxyapi
```

**3. 打开面板并用这个 key 登录：**

```
http://127.0.0.1:8317/management.html
```

启用后可以验证一下：管理 API 会从 `404`（禁用）变成 `401`（启用并强制鉴权），带上 key 则返回 `200`：

```bash
SK="你的管理密钥"
# 两种鉴权头都支持
curl --noproxy '*' -H "Authorization: Bearer $SK" \
  http://127.0.0.1:8317/v0/management/config
curl --noproxy '*' -H "X-Management-Key: $SK" \
  http://127.0.0.1:8317/v0/management/config
```

### 面板能做什么

管理 OAuth 账号（登录 / 登出 / 多账号池）、增删 API key、编辑配置、查看模型与请求状态等——基本就是把前面手动改 YAML、跑命令的事图形化了。

> ⚠️ **两个坑要注意**
>
> 1. **明文密钥保存好**：服务启动时会把配置里的 `secret-key` 自动改写成 bcrypt 哈希（`$2a$10$...`），之后配置文件里就看不到明文了。**明文只有你自己留存的那份**，弄丢就得重设一个再重启。
> 2. **访问前确认 Surge 规则生效**：浏览器打开 `127.0.0.1:8317` 同样会被 Surge 拦，先确保上一节那条 `IP-CIDR,127.0.0.0/8,DIRECT,no-resolve` 已生效。
>
> 安全上 `allow-remote` 保持 `false`（仅本机）。真要跨机访问，务必配 TLS + 强 key，别把账号管理接口裸暴露到网络上。

---

## 八、接入客户端

由于是 OpenAI 兼容接口，绝大多数支持自定义 `base_url` 的工具都能直接接：

```bash
export OPENAI_API_KEY="sk-你的密钥"
export OPENAI_BASE_URL="http://127.0.0.1:8317/v1"
```

Python SDK 示例：

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-你的密钥",
    base_url="http://127.0.0.1:8317/v1",
)

resp = client.chat.completions.create(
    model="gpt-5.5",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

---

## 九、常用管理命令

```bash
brew services restart cliproxyapi   # 改配置后重启生效
brew services stop cliproxyapi      # 停止服务
cliproxyapi -codex-login            # 重新登录 / 换账号
cliproxyapi --help                  # 查看所有登录方式与参数
```

---

## 小结

整套流程其实很短：

1. `brew install cliproxyapi`
2. `cliproxyapi -codex-login` 登录 Codex
3. 改配置里的 `api-keys`
4. `brew services start cliproxyapi` 起服务
5. `curl` 验证

唯一容易卡住的地方，是本机开着 Surge 这类代理时，本地请求会被拦——一条 `IP-CIDR,127.0.0.0/8,DIRECT,no-resolve` 规则即可解决。之后，你就有了一个本地的、OpenAI 兼容的 Codex 网关，可以接到任何认 `base_url` 的工具里。

如果不想一直跟 YAML 打交道，别忘了还有内置的 **WebUI 管理面板**（`http://127.0.0.1:8317/management.html`）——设个 `secret-key` 重启就能用，账号、密钥、配置都能图形化管理。
