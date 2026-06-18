---
title: 更换搬瓦工 VPS IP
date: 2026-06-07 22:27:55
tags:
---

## 概述

本文简述如何判断当前 IP 被屏蔽，以及如何更换 IP。

## 搬瓦工官方 KiwiVM 黑名单检测工具

搬瓦工自己提供了一个IP黑名单检测接口，这是最权威的判断方式。

使用步骤：

 - 登录搬瓦工账号，进入"My Services"，找到对应的VPS实例，点击"KiwiVM Control Panel"打开控制面板。
 - 在浏览器地址栏，将当前URL末尾的 main.php 替换为 `main-exec.php?mode=blacklistcheck`，回车。
 - 点击"Test Main IP"按钮，等待检测。
 - 如果结果显示 "IP BLOCKED"，说明IP已在黑名单中，被封无疑；如果显示正常，说明IP目前可用。

如下图：

{% img /images/bwg-1.jpg %}

## 更换 IP

目前的价格是每次约 8 美元，方法如下：
 - 通过 <https://bandwagonhost.com/ipchange.php> 页面申请，
 - 申请发出后，去 <https://bandwagonhost.com/billing> 支付。
 - 付款后 24 小时内完成更换(实测下来 10 分钟左右就生效了)。

## 公众号 IP 白名单配置

操作路径为：「[微信开发者平台](https://developers.weixin.qq.com/) - 扫码登录 - 我的业务 - 公众号」，点击后即可进入到公众号的管理页面。

{% img /images/bwg-2.jpg %}

## 其它

<!--
 - 用 VLESS + REALITY 保 IP 平安
 - 如果你用的 surge，因为 surge 不支持 vless，可以用 sing-box 作转发
 - Android 上可以用 v2rayNG 来连 vless 协议
   - 相关的客户端https://www.wahoovpn.com/en/blog/top-5-vless-clients
 - 如果 VPS 上帐号多，可以考虑安装 3x-ui: https://github.com/MHSanaei/3x-ui
-->
