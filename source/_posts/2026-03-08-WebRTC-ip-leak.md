---
title: WebRTC IP 泄露问题
date: 2026-03-08 22:37:28
tags:
---

很多人以为，只要开了 **梯子**，自己的真实 IP 就完全隐藏了。

但实际上，在很多浏览器里，你的 **真实 IP 仍然可能被网站看到**。

原因可能是：**WebRTC。**

---

## 什么是 WebRTC

WebRTC 是浏览器里的一个实时通信技术，用于：

- 视频会议  
- 语音聊天  
- P2P 文件传输  

为了建立点对点连接，浏览器会主动检测你的网络信息，例如：

- 公网 IP  
- 局域网 IP  
- NAT 网络结构  

问题在于：

**WebRTC 的网络请求有时候不会走代理，而是直接从本地网络发出。**

这就导致一个情况：

即使你开启了 **梯子**，网站仍然可能获取到你的 **真实 IP 地址**。

---

## 如何检测自己是否泄露 IP

可以打开这个网站检测：

<https://browserleaks.com/webrtc>

如果页面出现类似提示：

- WebRTC exposes your Local IP  
- WebRTC IP doesn't match your Remote IP  

说明你的浏览器 **存在 WebRTC IP 泄露**。

{% img /images/webrtc-0.jpg %}

---

## 最简单的解决方案

解决方法其实非常简单：  
**限制 WebRTC 只通过代理连接。**

在 Chrome / Edge 浏览器里安装官方插件：

**WebRTC Network Limiter**

安装地址：

https://chrome.google.com/webstore/detail/webrtc-network-limiter/npeicpdbkakmehahjeeohfdhnlpdklia

安装之后：

让 **WebRTC 流量也走代理**，从而避免真实 IP 泄露。设置方法见下图：

{% img /images/webrtc.jpg %}

---

## 一句话总结

很多人开了 **梯子**，但 **WebRTC 仍然可能泄露真实 IP**。

最简单的解决办法就是：

**安装 WebRTC Network Limiter，让所有 WebRTC 流量走代理。**

这样你的浏览器隐私保护才算真正完整。

## 其它

除了 WebRTC 外，IPv6 也可能是泄露点，检测链接是：<https://browserleaks.com/ip>，解决方案是开启 IPv6 相关的代理。
