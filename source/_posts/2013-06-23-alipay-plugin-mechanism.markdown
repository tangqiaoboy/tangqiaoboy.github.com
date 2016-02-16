---
layout: post
title: "分析支付宝客户端的插件机制"
date: 2013-06-23 12:39
comments: true
categories: iOS
---

{% img /images/alipay-plugin-1.jpg %}

## 前言

因为开了 iOSDevTips 的微信公共账号，老收到各种 iOS 开发的问题，前两天收到一个问题的内容是：

>请问像支付宝钱包那样可以在应用里安装自己的应用，是已经在应用里写了逻辑，还是可以向应用里发送代码 ?

我觉得这个问题挺有意思的，估计大家都感兴趣，所以今天就抽空研究了一下，将支付宝客户端的插件机制具体实现方式介绍给大家。

先介绍一下该插件机制，如上图所示，支付宝客户端在安装后，对于像 “彩票”、“爱心捐赠” 这类功能，需要再点击安装一次，然后才可以使用。有些时候该插件功能进行了升级，需要点击升级才可以继续使用。插件的方式有利于软件动态增加新的功能或升级功能，而不用再一次向 AppStore 提交审核。另外，由于用户不需要的插件可以不用安装，也缩小了应用本身的体积大小，节省了下载流量。

<!-- more -->

## 分析过程

### 截取网络请求

分析第一步，截取网络请求。截取网络请求可以查看当用户点击 “彩票” 进行安装的时候，客户端到底做了什么事情。使用 Charles 的代理设置功能，启动一个 http 代理，然后在 iPhone 上设置连接此代理，则可以看到，当点击 “彩票” 插件时，客户端下载了一个名为 10000011.amr 的文件。如下图所示：

{% img /images/alipay-plugin-2.jpg %}

###  下载插件文件

尝试用 wget 将文件下载下来，发现其没有验证 cookie，下载成功，命令如下：

``` bash
wget http://download.alipay.com/mobilecsprod/alipay.mobile/20130601021432806/xlarge/10000011.amr
```

amr 本意表示是一个音频文件，明显不对，尝试将其后缀名改成 zip，成功将其解压。用 itools 连接上支付宝的客户端，同样能看到客户端将其下载后，也是解压到 document 目录下的。解压后的内容与应用内新增加的内容一致，如图所示：

{% img /images/alipay-plugin-3.jpg %}

### 分析文件内容

大概浏览了一下解压后的文件，主要包括 html、css 和 js 文件。可见支付宝的插件机器是通过 UIWebView 来展示内容的方式来实现的，那为什么要先下载安装这些内容而不通过 UIWebView 实时下载 html 呢？这主要应该是为了节省相应的流量。我看了一下，10000011.amr 文件整个有将近 1M 大小，如果不通过插件机制预先下载，则只能依赖系统对于 UIWebView 的缓存来节省流量，这相对来说没有前者靠谱。

另外，使用基于 UIWebView 的方式来展示插件，也有利于代码的复用。因为这些逻辑都是用 js 来写的，可以同样应用于 Android 平台，在 Config.js 文件中，明显可以看到对于各类平台的判断逻辑。如下图所示：

{% img /images/alipay-plugin-4.jpg %}

另外，/www/demo/index-alipay-native.html 文件即该插件的首页，用浏览器打开就可以看到和手机端一样的内容。如下载图所示（左半边是手机上的应用截图，右半边是浏览器打开该 html 文件的截图）：

{% img /images/alipay-plugin-5.jpg %}

### 插件的网络通讯

接下来感兴趣的是该插件是如何完成和支付宝后台的网络通讯的。可以想到有两种可能的方式：

 1. 直接和支付宝后台通讯
 2. 和 Native 端通讯，然后 Native 端和服务器通讯。

要验证这个需要读该插件的 js 源代码，整个 js 源码逻辑还是比较干净的，主要用了玉伯写的 [seajs](http://seajs.org/docs/) 做模块化加载，[backbone.js](http://backbonejs.org/) 是一个前端的 MVC 框架，[zepto.js](http://zeptojs.com/) 是一个更适合于移动端使用的 "JQuery"。

大概扫了一下，感觉更可能是用的方法一：直接和支付宝后台通讯 , 因为 Config.js 中都明确将网络通讯的地址写下来了。另一个证据是，利用下面的脚本扫描整个 js 源码，只能在 backbone 中搜到对于 iframe 的使用。而在 iOS 开发中，如果 js 端和 native 端要通讯，是需要用到 iframe 的，详细原理可以参见我的另一篇文章 [《关于 UIWebView 和 PhoneGap 的总结》](http://blog.devtang.com/blog/2012/03/24/talk-about-uiwebview-and-phonegap/)。不过我不能完全确认，因为我还没有找到相应控制页面切换和跳转的 js 代码，如果你找到了，麻烦告诉我。

``` bash
find . -type f -name "*.js" | xargs grep "iframe"
```

### 交易的安全

用 Charles 可以截取到，当有网络交易时，应用会另外启动一个 https 的安全链接，完成整个交易过程的加密。如下图所示：

{% img /images/alipay-plugin-6.jpg %}

## 总结

支付宝的插件机制整体上就是通过 html 和 javascript 方式实现的，主要的好处是：

 1. 跨平台 (可以同时用在 iOS 和 Android 客户端）
 2. 省流量（不需要的插件不用下载，插件本地缓存长期存在不会过期，自己管理插件更新逻辑）
 3. 更新方便（不用每次提交 AppStore 审核）

坏处如果非要说有的话，就是用 javascript 写 iOS 界面，无法提供非常炫的 UI 交互以及利用到 iOS 的所有平台特性。不过象支付宝这种工具类应用，也不需要很复杂的 UI 交互效果。

另外教大家一个小技巧，如果你不确定某个页面是不是 UIWebView 做的，直接在那个页面长按，如果弹出 " 拷贝，定义，学习 " 这种菜单，那就是确定无疑是 UIWebView 的界面了。如下图所示：

{% img /images/ios-menu-2.jpg %}

## 相关工具

欢迎关注我的技术微博 [@ 唐巧 _boy](http://weibo.com/tangqiaoboy) 和微信公共账号 [iOSDevTips](http://chuansong.me/account/iosDevTips) ，每天收获一些关于 iOS 开发的学习资料和技巧心得。

我在研究时使用了 [Charles](http://www.charlesproxy.com/) 来截获支付宝客户端的网络请求，用 [iTools](http://itools.hk/) 来查看支付宝客户端的本地内容。如果你想自行验证本文内容，请先下载上述工具。在此就不额外介绍它们的使用了。

## 后记（2013-7-7）

 1. 在完成上文后，Allen 在他的博客上先后分享了两篇更深入分析的文章 [《浅析支付宝钱包插件》](http://imallen.com/blog/2013/06/26/inside-alipay-plugin.html) 和 [《再谈支付宝钱包插件和说好的 Demo》](http://imallen.com/blog/2013/07/06/about-alipay-plugin-and-phonegap.html)。 这两篇文章都比本文深入得多，值得大家阅读。

 2. 写完上文，居然收到了来自支付宝卫朴（花名）的工作邀请。不过我现在创业正在努力当中，所以我拒绝了邀请。看来这也是一种找工作的办法啊，比投简历管用，呵呵。

 3. 从一些朋友那儿了解到，支付宝因为本文而会在以后的版本中加强安全性，至少不会像现在这样，所有逻辑都在写在 javascript 中，并且还带有注释，这也是我希望看到的结果。愿支付宝越做越好。

