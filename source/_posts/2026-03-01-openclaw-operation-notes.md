---
title: OpenClaw 学习笔记
date: 2026-03-01 22:45:25
tags:
---

今天尝试安装了一下 [OpenClaw](https://docs.openclaw.ai/)，记录一些要点。

## 1、执行安装脚本

`curl -fsSL https://openclaw.ai/install.sh | bash`

{% img /images/openclaw-1.jpg %}

## 2、申请 Telegram Bot

在 Telegram 上找 @BotFather 聊天，输入 `/newbot`，然后设置好昵称和帐号名，最终记录下 Bot 的 API Key。

{% img /images/openclaw-2.jpg %}

我本来还申请了飞书的 Bot，但是发现比 Telegram 麻烦很多，为了快速测试，就放弃了飞书。

## 3、申请大模型的 API Key

我申请的是 [OpenRouter](https://openrouter.ai/settings/keys) 上的 Key，这样方便切换模型做测试。这一步需要刷信用卡充值。

因为是测试，为了防止 OpenClaw 超用量，我充了 10 美元，并且设置了一天使用限额最多 5 美元。

{% img /images/openclaw-3.jpg %}

## 4、配置

第一步安装到最后就会自动执行 `openclaw onboard`，这是一个交互式配置程序，然后你就可以在程序中配置上面第 2 和第 3 步的 Key。

安装好的 OpenClaw 在 `~/.openclaw/` 下有一个叫 `openclaw.json`的文件。所有的交互配置都是在帮你更新这个文件。

所以，其实你也可以直接在这个文件中设置 Telegram 的配置信息，类似这样：

``` json
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "填写你申请的 BOT 的 KEY",
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } },
    },
  },
}
```

## 5、配对

用你的 Telegram 给 BOT 发一条信息，然后 OpenClaw 会回复你 `Pairing code`。在你的命令行中执行回复内容的最后一行代码，类似这样：
```bash
openclaw pairing approve telegram <pairing code>
```
，就完成了帐号的配对。

{% img /images/openclaw-4.jpg %}

这其实修改的是 `~/.openclaw/credentials/telegram-default-allowFrom.json` 文件。

所有的配置都在文件中，所以也很方便你随时查看、修改或备份。

## 6、控制面板

现在你就可以和 OpenClaw 用 Telegram 聊天了。你也可以打开网页版的控制面板，默认在 <http://127.0.0.1:18789/> 查看到相关的信息。

{% img /images/openclaw-5.jpg %}

## 7、其它的一些执令

 - 关闭 openclaw：`openclaw gateway stop`
 - 重启 openclaw：`openclaw gateway restart`
 - 检查：`openclaw doctor`

## 8、初步的使用感受

 - 定时执令应该会比较好用。比如帮你每天整理一些消息、新闻什么的。
 - 当作 ifttt 的高级版应该也会挺好，比如：
   - 当我 push 文章到 github 的时候，就帮我同步发布。
   - 当我给它发票的时候，就帮我提报销（或至少整理发票）。
 - 日常问答/编程/整理文件/写作 感觉都不太适合，还不如用对应的产品。
 - 如果不是程序员/产品经理，就别试用了，大量的命令行操作，还是太不适合小白了。
