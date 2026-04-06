---
title: 利用 AI Agent, 将域名从 Godaddy 迁移到 Cloudflare
date: 2026-04-06 14:22:59
tags:
---

## 背景和问题

我有一个老的域名：devtang.com，上面利用 GitHub Pages 搭了我的 [博客](https://blog.devtang.com/)。这个域名注册很多年了，一直在 Godaddy 上续费，并且用 DNSPod (后来被阿里收购) 做解析。

我一直想迁移到 Cloudflare，但是域名转移的操作很繁琐，所以一直没有下决心推进。

这次，我想试试用 Claude Cowork 功能帮我做这个事儿。整个流程下来，感觉还挺顺畅的，所以给大家分享一下。

我觉得 AI 时代这些工作的工作流都有变化，所以说分享这样的工作流，有助于大家建立这种基于 AI Agent 的工作模式迁移。

## 操作流程

在使用前需要先安装好 [Claude in Chrome](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) 插件，然后执行如下操作：


1、我首先打开 Godaddy 和 Cloudflare 官网，登录上去。然后打开 Claude in Chrome 的浏览器面板。输入如下提示词：

```
我要将域名 devtang.com 从 godaddy 转移到 cloudflare，帮我继续转移。
```
Claude 给出了如下的操作步骤，点击 Approve Plan。

{% img /images/cowork-1.jpg %}

2、Claude 开始在 Godaddy 和 Cloudflare 上操作，有两次它停下来了，需要我给它发邮箱里面的授权码。于是我打开邮箱把授权码发给它。

3、操作继续，在操作过程中，我可以随意切换 Tab 看它的操作过程，也可以看它的 thinking 的过程。它其实每一步都是通过截图确认操作，也会中间停留 3-5 秒（可能是为了防止被误别成机器人）。

因为它也会停留，所以我有时候会帮它直接点击了，让操作更快一点。这也丝毫不会影响后续的工作，因为它每一步都会截图确认。

最后我看到了操作确认信息，告诉我转移成功。

{% img /images/cowork-2.jpg %}   

## 迁移 GitHub Pages 到 Cloudflare Pages

Cloudflare Pages 支持无限流量，并且全球有多处结点，速度比 GitHub Pages 快。我把域名迁移过去之后，又进一步使用 Cloudflare 的 Pages 功能，将博客重新部署到了 Cloudflare 上。

具体步骤如下：

 - 在 <https://dash.cloudflare.com/>，选择 "Build"->"Compute"->"Workers & Pages"，进入 Workers & Pages 页面。
 - 选择页面上的 “Create Application” 按钮
 - 在新的页面，点击最底部的小字：`Looking to deploy Pages? Get started`。这个字特别不起眼，如下图：

{% img /images/cf-1.jpg %}

 - 在页面上配置相关信息，我配置的内容如下：
   - 选择 "Import an existing Git repository"，选择你在 GitHub 上的博客仓库。
   - Production branch: `source` 分支。
   - Framework preset: `None`
   - Build command：`npx hexo generate`
   - Build output directory: `public`
   - 环境变量：
     - `NODE_VERSION` 设置为 24
     - `NPM_VERSION` 设置为 11

以上设置好就可以测试了，测试遇到问题的话，把 error log 复制发给 claude，claude 会告诉你怎么改。

配置完之后，它默认的域名是 <https://tangqiaoboy.pages.dev>, 你可以用刚刚迁移好的域名给它设置一个新的域名，像我就设置成了 <https://www.devtang.com/>。如下图：

{% img /images/cf-2.jpg %}

利用这个 Pages 可以干很多事情，比如我看到一个人就拿它发布了一个 [巴菲特致股东的信](https://buffett-letters-eir.pages.dev/) 网站。不需要买服务器，也不需要买域名，也不用担心流量不够。

## 小结

 - 借助 Claude Cowork, 我们可以把复杂的工作流程全部交给 AI。
 - 在 Claude in Chrome 工作的时候，我们也可以随时接管网页操作，帮他把中间的步骤给衔接上。
 - 操作过程中如果一直没有推进，可以查看 claude thinking 的过程，可以发现一些问题，帮他解决。
 - Cloudflare Pages 提供无限流量，推荐大家部署过去。

