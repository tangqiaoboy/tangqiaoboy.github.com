---
layout: post
title: "Charles 从入门到精通"
date: 2015-11-14 12:00:47 +0800
comments: true
categories: iOS
---

## 目录及更新说明

更新记录：

 * 2013 年 12 月，第一版。
 * 2015 年 11 月，增加 Rewrite 相关介绍。
 * 2016 年 8 月，增加 Charles 4 的介绍，反向代理功能和设置外部代理，并且介绍了如何解决与翻墙软件的冲突。

本文的内容主要包括：
 
 * Charles 的简介
 * 如何安装 Charles
 * 将 Charles 设置成系统代理
 * Charles 主界面介绍
 * 过滤网络请求
 * 截取 iPhone 上的网络封包
 * 截取 Https 通讯信息
 * 模拟慢速网络
 * 修改网络请求内容
 * 给服务器做压力测试
 * 修改服务器返回内容
 * 反向代理
 * 设置外部代理，解决与翻墙软件的冲突
 * 总结


## Charles 限时优惠

Charles 4 正版限时优惠优惠活动（限时：2016 年 8 月 8 日 - 15 日），优惠 30 元，[点击领取优惠券](https://taoquan.taobao.com/coupon/unify_apply.htm?sellerId=881336826&activityId=8764822622de490a82ccc6383abce406)。

<!--
淘口令：Charles 新版发布，使用￥Charles￥限时特惠购买正版（长按复制整段文案，打开手机淘宝即可进入活动内容）
-->

## 简介

{% img /images/charles-logo.png %}

[Charles](http://www.charlesproxy.com/) 是在 Mac 下常用的网络封包截取工具，在做
移动开发时，我们为了调试与服务器端的网络通讯协议，常常需要截取网络封包来分析。

Charles 通过将自己设置成系统的网络访问代理服务器，使得所有的网络访问请求都通过它来完成，从而实现了网络封包的截取和分析。

除了在做移动开发中调试端口外，Charles 也可以用于分析第三方应用的通讯协议。配合 Charles 的 SSL 功能，Charles 还可以分析 Https 协议。

Charles 是收费软件，可以免费试用 30 天。试用期过后，未付费的用户仍然可以继续使用，但是每次使用时间不能超过 30 分钟，并且启动时将会有 10 秒种的延时。因此，该付费方案对广大用户还是相当友好的，即使你长期不付费，也能使用完整的软件功能。只是当你需要长时间进行封包调试时，会因为 Charles 强制关闭而遇到影响。

Charles 主要的功能包括：

 1. 截取 Http 和 Https 网络封包。
 1. 支持重发网络请求，方便后端调试。
 1. 支持修改网络请求参数。
 1. 支持网络请求的截获并动态修改。
 1. 支持模拟慢速网络。

Charles 4 新增的主要功能包括：

 1. 支持 Http 2。
 1. 支持 IPv6。

## 安装 Charles

去 Charles 的官方网站（<http://www.charlesproxy.com>）下载最新版的 Charles 安装包，是一个 dmg 后缀的文件。打开后将 Charles 拖到 Application 目录下即完成安装。

## 将 Charles 设置成系统代理

之前提到，Charles 是通过将自己设置成代理服务器来完成封包截取的，所以使用 Charles 的第一步是将其设置成系统的代理服务器。

启动 Charles 后，第一次 Charles 会请求你给它设置系统代理的权限。你可以输入登录密码授予 Charles 该权限。你也可以忽略该请求，然后在需要将 Charles 设置成系统代理时，选择菜单中的 "Proxy" -> "Mac OS X Proxy" 来将 Charles 设置成系统代理。如下所示：

{% img /images/charles-pro-3.png %}

之后，你就可以看到源源不断的网络请求出现在 Charles 的界面中。

需要注意的是，Chrome 和 Firefox 浏览器默认并不使用系统的代理服务器设置，而 Charles 是通过将自己设置成代理服务器来完成封包截取的，所以在默认情况下无法截取 Chrome 和 Firefox 浏览器的网络通讯内容。如果你需要截取的话，在 Chrome 中设置成使用系统的代理服务器设置即可，或者直接将代理服务器设置成 `127.0.0.1:8888` 也可达到相同效果。

## Charles 主界面介绍

{% img /images/charles-pro-4.png %}

Charles 主要提供两种查看封包的视图，分别名为 "Structure" 和 "Sequence"。 

 1. Structure 视图将网络请求按访问的域名分类。
 2. Sequence 视图将网络请求按访问的时间排序。

大家可以根据具体的需要在这两种视图之前来回切换。请求多了有些时候会看不过来，Charles 提供了一个简单的 Filter 功能，可以输入关键字来快速筛选出 URL 中带指定关键字的网络请求。

对于某一个具体的网络请求，你可以查看其详细的请求内容和响应内容。如果请求内容是 POST 的表单，Charles 会自动帮你将表单进行分项显示。如果响应内容是 JSON 格式的，那么 Charles 可以自动帮你将 JSON 内容格式化，方便你查看。如果响应内容是图片，那么 Charles 可以显示出图片的预览。

## 过滤网络请求

通常情况下，我们需要对网络请求进行过滤，只监控向指定目录服务器上发送的请求。对于这种需求，以下几种办法：

方法一：在主界面的中部的 Filter 栏中填入需要过滤出来的关键字。例如我们的服务器的地址是：`http://yuantiku.com` , 那么只需要在 Filter 栏中填入 yuantiku 即可。
 
方法二：在 Charles 的菜单栏选择 "Proxy"->"Recording Settings"，然后选择 Include 栏，选择添加一个项目，然后填入需要监控的协议，主机地址，端口号。这样就可以只截取目标网站的封包了。如下图所示：

{% img /images/charles-filter-setting.jpg %}

通常情况下，我们使用方法一做一些临时性的封包过滤，使用方法二做一些经常性的封包过滤。

方法三：在想过滤的网络请求上右击，选择 "Focus"，之后在 Filter 一栏勾选上 Focussed 一项，如下图所示：

{% img /images/charles-focus.png %}

这种方式可以临时性的，快速地过滤出一些没有通过关键字的一类网络请求。

## 截取 iPhone 上的网络封包

Charles 通常用来截取本地上的网络封包，但是当我们需要时，我们也可以用来截取其它设备上的网络请求。下面我就以 iPhone 为例，讲解如何进行相应操作。

### Charles 上的设置

要截取 iPhone 上的网络请求，我们首先需要将 Charles 的代理功能打开。在 Charles 的菜单栏上选择 "Proxy"->"Proxy Settings"，填入代理端口 8888，并且勾上 "Enable transparent HTTP proxying" 就完成了在 Charles 上的设置。如下图所示:

{% img /images/charles-proxy-setting.jpg %}

### iPhone 上的设置

首先我们需要获取 Charles 运行所在电脑的 IP 地址，Charles 的顶部菜单的 "Help"->"Local IP Address"，即可在弹出的对话框中看到 IP 地址，如下图所示：

{% img /images/charles-local-ip.png %}

在 iPhone 的 " 设置 "->" 无线局域网 " 中，可以看到当前连接的 wifi 名，通过点击右边的详情键，可以看到当前连接上的 wifi 的详细信息，包括 IP 地址，子网掩码等信息。在其最底部有「HTTP 代理」一项，我们将其切换成手动，然后填上 Charles 运行所在的电脑的 IP，以及端口号 8888，如下图所示：

{% img /images/charles-iphone-setting.jpg %}

设置好之后，我们打开 iPhone 上的任意需要网络通讯的程序，就可以看到 Charles 弹出 iPhone 请求连接的确认菜单（如下图所示），点击 "Allow" 即可完成设置。

{% img /images/charles-proxy-confirm.jpg %}

## 截取 Https 通讯信息

### 安装证书

如果你需要截取分析 Https 协议相关的内容。那么需要安装 Charles 的 CA 证书。具体步骤如下。

首先我们需要在 Mac 电脑上安装证书。点击 Charles 的顶部菜单，选择 "Help" -> "SSL Proxying" -> "Install Charles Root Certificate"，然后输入系统的帐号密码，即可在 KeyChain 看到添加好的证书。如下图所示：

{% img /images/charles-pro-1.png %}

需要注意的是，即使是安装完证书之后，Charles 默认也并不截取 Https 网络通讯的信息，如果你想对截取某个网站上的所有 Https 网络请求，可以在该请求上右击，选择 SSL proxy，如下图所示：

{% img /images/charles-ssl-add-host.jpg %}

这样，对于该 Host 的所有 SSL 请求可以被截取到了。

### 截取移动设备中的 Https 通讯信息

如果我们需要在 iOS 或 Android 机器上截取 Https 协议的通讯内容，还需要在手机上安装相应的证书。点击 Charles 的顶部菜单，选择 "Help" -> "SSL Proxying" -> "Install Charles Root Certificate on a Mobile Device or Remote Browser"，然后就可以看到 Charles 弹出的简单的安装教程。如下图所示：

{% img /images/charles-pro-2.png %}

按照我们之前说的教程，在设备上设置好 Charles 为代理后，在手机浏览器中访问地址：<http://charlesproxy.com/getssl>，即可打开证书安装的界面，安装完证书后，就可以截取手机上的 Https 通讯内容了。不过同样需要注意，默认情况下 Charles 并不做截取，你还需要在要截取的网络请求上右击，选择 SSL proxy 菜单项。

## 模拟慢速网络

在做移动开发的时候，我们常常需要模拟慢速网络或者高延迟的网络，以测试在移动网络下，应用的表现是否正常。Charles 对此需求提供了很好的支持。

在 Charles 的菜单上，选择 "Proxy"->"Throttle Setting" 项，在之后弹出的对话框中，我们可以勾选上 "Enable Throttling"，并且可以设置 Throttle Preset 的类型。如下图所示：

{% img /images/charles-throttle-setting.jpg %}

如果我们只想模拟指定网站的慢速网络，可以再勾选上图中的 "Only for selected hosts" 项，然后在对话框的下半部分设置中增加指定的 hosts 项即可。

## 修改网络请求内容

有些时候为了调试服务器的接口，我们需要反复尝试不同参数的网络请求。Charles 可以方便地提供网络请求的修改和重发功能。只需要在以往的网络请求上点击右键，选择 "Edit"，即可创建一个可编辑的网络请求。如下所示：

{% img /images/charles-edit.png %}

我们可以修改该请求的任何信息，包括 URL 地址、端口、参数等，之后点击 "Execute" 即可发送该修改后的网络请求（如下图所示）。Charles 支持我们多次修改和发送该请求，这对于我们和服务器端调试接口非常方便，如下图所示：

{% img /images/charles-execute.png %}

## 给服务器做压力测试

我们可以使用 Charles 的 Repeat 功能来简单地测试服务器的并发处理能力，方法如下。

我们在想打压的网络请求上（POST 或 GET 请求均可）右击，然后选择 「Repeat Advanced」菜单项，如下所示：

{% img /images/charles-repeat-1.png %}

接着我们就可以在弹出的对话框中，选择打压的并发线程数以及打压次数，确定之后，即可开始打压。

{% img /images/charles-repeat-2.png %}

悄悄说一句，一些写得很弱的投票网站，也可以用这个办法来快速投票。当然，我也拿 Charles 的 Repeat 功能给一些诈骗的钓鱼网站喂了不少垃圾数据，上次不小心还把一个钓鱼网站的数据库打挂了，嗯，请叫我雷锋。

## 修改服务器返回内容

有些时候我们想让服务器返回一些指定的内容，方便我们调试一些特殊情况。例如列表页面为空的情况，数据异常的情况，部分耗时的网络请求超时的情况等。如果没有 Charles，要服务器配合构造相应的数据显得会比较麻烦。这个时候，使用 Charles 相关的功能就可以满足我们的需求。

根据具体的需求，Charles 提供了 Map 功能、 Rewrite 功能以及 Breakpoints 功能，都可以达到修改服务器返回内容的目的。这三者在功能上的差异是：

 1. Map 功能适合长期地将某一些请求重定向到另一个网络地址或本地文件。
 2. Rewrite 功能适合对网络请求进行一些正则替换。
 3. Breakpoints 功能适合做一些临时性的修改。

### Map 功能

Charles 的 Map 功能分 Map Remote 和 Map Local 两种，顾名思义，Map Remote 是将指定的网络请求重定向到另一个网址请求地址，Map Local 是将指定的网络请求重定向到本地文件。

在 Charles 的菜单中，选择 "Tools"->"Map Remote" 或 "Map Local" 即可进入到相应功能的设置页面。

{% img /images/charles-map.png %}


对于 Map Remote 功能，我们需要分别填写网络重定向的源地址和目的地址，对于不需要限制的条件，可以留空。下图是一个示例，我将所有 `ytk1.yuanku.ws`（测试服务器）的请求重定向到了 `www.yuantiku.com`（线上服务器）。

{% img /images/charles-map-remote.png %}

对于 Map Local 功能，我们需要填写的重定向的源地址和本地的目标文件。对于有一些复杂的网络请求结果，我们可以先使用 Charles 提供的 "Save Response…" 功能，将请求结果保存到本地（如下图所示），然后稍加修改，成为我们的目标映射文件。

{% img /images/charles-save-response.png %}


下图是一个示例，我将一个指定的网络请求通过 Map Local 功能映射到了本地的一个经过修改的文件中。

{% img /images/charles-map-local.png %}

Map Local 在使用的时候，有一个潜在的问题，就是其返回的 Http Response Header 与正常的请求并不一样。这个时候如果客户端校验了 Http Response Header 中的部分内容，就会使得该功能失效。解决办法是同时使用 Map Local 以下面提到的 Rewrite 功能，将相关的 Http 头 Rewrite 成我们希望的内容。


### Rewrite 功能

Rewrite 功能功能适合对某一类网络请求进行一些正则替换，以达到修改结果的目的。

例如，我们的客户端有一个 API 请求是获得用户昵称，而我当前的昵称是 "tangqiaoboy"，如下所示：

{% img /images/charles-rewrite-1.jpeg %}

我们想试着直接修改网络返回值，将 tangqiaoboy 换成成 iosboy。于是我们启用 Rewrite 功能，然后设置如下的规则：

{% img /images/charles-rewrite-2.png %}

完成设置之后，我们就可以从 Charles 中看到，之后的 API 获得的昵称被自动 Rewrite 成了 iosboy，如下图所示：

{% img /images/charles-rewrite-3.png %}

### Breakpoints 功能

上面提供的 Rewrite 功能最适合做批量和长期的替换，但是很多时候，我们只是想临时修改一次网络请求结果，这个时候，使用 Rewrite 功能虽然也可以达到目的，但是过于麻烦，对于临时性的修改，我们最好使用 Breakpoints 功能。

Breakpoints 功能类似我们在 Xcode 中设置的断点一样，当指定的网络请求发生时，Charles 会截获该请求，这个时候，我们可以在 Charles 中临时修改网络请求的返回内容。

下图是我们临时修改获取用户信息的 API，将用户的昵称进行了更改，修改完成后点击 "Execute" 则可以让网络请求继续进行。

{% img /images/charles-breakpoint.png %}

需要注意的是，使用 Breakpoints 功能将网络请求截获并修改过程中，整个网络请求的计时并不会暂停，所以长时间的暂停可能导致客户端的请求超时。

## 反向代理

Charles 的反向代理功能允许我们将本地的端口映射到远程的另一个端口上。例如，在下图中，我将本机的 61234 端口映射到了远程（www.yuantiku.com）的80端口上了。这样，当我访问本地的 61234 端口时，实际返回的内容会由 www.yuantiku.com 的 80 端口提供。

{% img /images/charles-reverse-proxy.jpg %}

## 设置外部代理，解决与翻墙软件的冲突

Charles 的原理是把自己设置成系统的代理服务器，但是在中国，由于工作需要，我们常常需要使用 Google 搜索，所以大部分程序员都有自己的翻墙软件，而这些软件的基本原理，也是把自己设置成系统的代理服务器，来做到透明的翻墙。

为了使得两者能够和平共处，我们可以在 Charles 的 `External Proxy Settings` 中，设置翻墙的代理端口以及相关信息。同时，我们也要关闭相关翻墙软件的自动设置，使其不主动修改系统代理，避免 Charles 失效。

## 总结

通过 Charles 软件，我们可以很方便地在日常开发中，截取和调试网络请求内容，分析封包协议以及模拟慢速网络。用好 Charles 可以极大的方便我们对于带有网络请求的 App 的开发和调试。

愿本文帮助大家成为 Charles 的专家，祝大家玩得开心～

