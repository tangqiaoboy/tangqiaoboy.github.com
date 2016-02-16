---
layout: post
title: "iOS开发工具-网络封包分析工具Charles"
date: 2013-12-11 14:03
comments: true
categories: iOS
---

## <font color='red'>Charles 中国特惠 </font>

{% img /images/charles-promo.png %}

Charles 正版[五折优惠活动](http://item.taobao.com/item.htm?&id=524230901640)（限时：2015 年 11 月 14 日 - 30 日），仅限中国区购买，[点击购买](http://item.taobao.com/item.htm?&id=524230901640)。在活动期结束后，价格将从 169 元上涨到 199 元。

手机 / 微信读者，复制以下内容，然后打开「淘宝客户端」即可看到商品：

>Charles 网络封包分析工具，使用￥Charles 特惠￥抢先预览（长按复制整段文案，打开手机淘宝即可进入活动内容）

## 更新

本部分的内容写于2013年12月，2015年11月有更新，更新版的文章见：[《Charles 从入门到精通》](/blog/2015/11/14/charles-introduction/)

##简介

{% img /images/charles-logo.png %}

本文为 InfoQ 中文站特供稿件，首发地址为：[文章链接](http://www.infoq.com/cn/articles/network-packet-analysis-tool-charles)。如需转载，请与 InfoQ 中文站联系。


[Charles](http://www.charlesproxy.com/) 是在 Mac 下常用的截取网络封包的工具，在做 iOS 开发时，我们为了调试与服务器端的网络通讯协议，常常需要截取网络封包来分析。Charles 通过将自己设置成系统的网络访问代理服务器，使得所有的网络访问请求都通过它来完成，从而实现了网络封包的截取和分析。

Charles 是收费软件，可以免费试用 30 天。试用期过后，未付费的用户仍然可以继续使用，但是每次使用时间不能超过 30 分钟，并且启动时将会有 10 秒种的延时。

因此，该付费方案对广大用户还是相当友好的，即使你长期不付费，也能使用完整的软件功能。只是当你需要长时间进行封包调试时，会因为 Charles 强制关闭而遇到影响。

Charles 主要的功能包括：

 1. 支持 SSL 代理。可以截取分析 [SSL](http://zh.wikipedia.org/wiki/%E5%AE%89%E5%85%A8%E5%A5%97%E6%8E%A5%E5%B1%82) 的请求。
 1. 支持流量控制。可以模拟慢速网络以及等待时间（latency）较长的请求。
 1. 支持 AJAX 调试。可以自动将 json 或 xml 数据格式化，方便查看。
 1. 支持 AMF 调试。可以将 Flash Remoting 或 Flex Remoting 信息格式化，方便查看。
 1. 支持重发网络请求，方便后端调试。
 1. 支持修改网络请求参数。
 1. 支持网络请求的截获并动态修改。
 1. 检查 HTML，CSS 和 RSS 内容是否符合 [W3C 标准](http://validator.w3.org/)。

<!-- more -->

##安装 Charles

去 Charles 的官方网站（<http://www.charlesproxy.com>）下载最新版的 Charles 安装包，是一个 dmg 后缀的文件。打开后将 Charles 拖到 Application 目录 下即完成安装。

##安装 SSL 证书
如果你需要截取分析 SSL 协议相关的内容。那么需要安装 Charles 的 CA 证书。具体步骤如下：

 1. 去 <http://www.charlesproxy.com/ssl.zip> 下载 CA 证书文件。
 2. 解压该 zip 文件后，双击其中的 .crt 文件，这时候在弹出的菜单中选择 “总是信任”，如下所示：{% img /images/charles-ca-1.png %}
 3. 从钥匙串访问中即可看到添加成功的证书。如下所示：
{% img /images/charles-ca-2.png %}
 
## 将 Charles 设置成系统代理

之前提到，Charles 是通过将自己设置成代理服务器来完成封包截取的，所以使用 Charles 的第一步是将其设置成系统的代理服务器。

启动 Charles 后，第一次 Charles 会请求你给它设置系统代理的权限。你可以输入登录密码授予 Charles 该权限。你也可以忽略该请求，然后在需要将 Charles 设置成系统代理时，选择菜单中的 "Proxy" -> "Mac OS X Proxy" 来将 Charles 设置成系统代理。如下所示：

{% img /images/charles-set-system-proxy.png %}

之后，你就可以看到源源不断的网络请求出现在 Charles 的界面中。

## Charles 主界面介绍

{% img /images/charles-home.jpg %}

Charles 主要提供 2 种查看封包的视图，分别名为 “Structure” 和 "Sequence"。 

 1. Structure 视图将网络请求按访问的域名分类。
 2. Sequence 视图将网络请求按访问的时间排序。

大家可以根据具体的需要在这两种视图之前来回切换。

对于某一个具体的网络请求，你可以查看其详细的请求内容和响应内容。如果响应内容是 JSON 格式的，那么 Charles 可以自动帮你将 JSON 内容格式化，方便你查看。

## 过滤网络请求

通常情况下，我们需要对网络请求进行过滤，只监控向指定目录服务器上发送的请求。对于这种需求，我们有 2 种办法。

 1. 在主界面的中部的 Filter 栏中填入需要过滤出来的关键字。例如我们的服务器的地址是：http://yuantiku.com , 那么只需要在 Filter 栏中填入 yuantiku 即可。
 
 2. 在 Charles 的菜单栏选择 "Proxy"->"Recording Settings"，然后选择 Include 栏，选择添加一个项目，然后填入需要监控的协议，主机地址，端口号。这样就可以只截取目标网站的封包了。如下图所示：

{% img /images/charles-filter-setting.jpg %}

通常情况下，我们使用方法 1 做一些临时性的封包过滤，使用方法 2 做一些经常性的封包过滤。

##截取 iPhone 上的网络封包

Charles 通常用来截取本地上的网络封包，但是当我们需要时，我们也可以用来截取其它设备上的网络请求。下面我就以 iPhone 为例，讲解如何进行相应操作。

####Charles 上的设置

要截取 iPhone 上的网络请求，我们首先需要将 Charles 的代理功能打开。在 Charles 的菜单栏上选择 “Proxy”->"Proxy Settings"，填入代理端口 8888，并且勾上 "Enable transparent HTTP proxying" 就完成了在 Charles 上的设置。如下图所示:

{% img /images/charles-proxy-setting.jpg %}

####iPhone 上的设置

首先我们需要获取 Charles 运行所在电脑的 IP 地址，打开 Terminal，输入`ifconfig en0`, 即可获得该电脑的 IP，如下图所示：

{% img /images/charles-ifconfig.jpg %}

在 iPhone 的 “设置”->“无线局域网 “中，可以看到当前连接的 wifi 名，通过点击右边的详情键，可以看到当前连接上的 wifi 的详细信息，包括 IP 地址，子网掩码等信息。在其最底部有 “HTTP 代理” 一项，我们将其切换成手动，然后填上 Charles 运行所在的电脑的 IP，以及端口号 8888，如下图所示：

{% img /images/charles-iphone-setting.jpg %}

设置好之后，我们打开 iPhone 上的任意需要网络通讯的程序，就可以看到 Charles 弹出 iPhone 请求连接的确认菜单（如下图所示），点击 “Allow” 即可完成设置。

{% img /images/charles-proxy-confirm.jpg %}

##截取 SSL 信息

Charles 默认并不截取 SSL 的信息，如果你想对截取某个网站上的所有 SSL 网络请求，可以在该请求上右击，选择 SSL proxy，如下图所示：

{% img /images/charles-ssl-add-host.jpg %}

这样，对于该 Host 的所有 SSL 请求可以被截取到了。

##模拟慢速网络

在做 iPhone 开发的时候，我们常常需要模拟慢速网络或者高延迟的网络，以测试在移动网络下，应用的表现是否正常。Charles 对此需求提供了很好的支持。

在 Charles 的菜单上，选择 "Proxy"->"Throttle Setting" 项，在之后弹出的对话框中，我们可以勾选上 “Enable Throttling”，并且可以设置 Throttle Preset 的类型。如下图所示：

{% img /images/charles-throttle-setting.jpg %}

如果我们只想模拟指定网站的慢速网络，可以再勾选上图中的 "Only for selected hosts" 项，然后在对话框的下半部分设置中增加指定的 hosts 项即可。

##修改网络请求内容

有些时候为了调试服务器的接口，我们需要反复尝试不同参数的网络请求。Charles 可以方便地提供网络请求的修改和重发功能。只需要在以往的网络请求上点击右键，选择 “Edit”，即可创建一个可编辑的网络请求。如下所示：

{% img /images/charles-edit.jpg %}

我们可以修改该请求的任何信息，包括 url 地址，端口，参数等，之后点击 “Execute” 即可发送该修改后的网络请求（如下图所示）。Charles 支持我们多次修改和发送该请求，这对于我们和服务器端调试接口非常方便。

{% img /images/charles-execute-request.jpg %}

##总结

通过 Charles 软件，我们可以很方便地在日常开发中，截取和调试网络请求内容，分析封包协议以及模拟慢速网络。用好 Charles 可以极大的方便我们对于带有网络请求的 App 的开发和调试。

参考链接：

 1. [Charles 主要的功能列表](http://www.charlesproxy.com/overview/about-charles/)
 1. [Charles 官网](http://www.charlesproxy.com/)