---
title: 被中国黑客玩坏的苹果
date: 2016-07-16 09:25:21
categories: iOS
---

最近从几个做 iOS 开发的小伙伴那儿听说了几个发垃圾邮件的黑科技，利用的都是苹果的一些小「漏洞」，实在是让人觉得中国人的「创新」能力太强，分享给大家。

## 方法一

{% img /images/hack-way-1.jpg %}

详细的办法在上面的这个截图中解释了，简单来说就是将自己的帐号名改成广告信息，然后不停修改自己的安全邮箱，于是这些含有自己的帐号名（其实就是广告）的邮件就通过苹果的服务器发送出来了。各大邮箱厂家确实是不敢贸然屏蔽苹果的邮件的，所以垃圾邮件被顺利发送出去。

我有一个小伙伴就收到了这样一封垃圾邮件：

{% img /images/hack-way-2.jpg %}


苹果在发现这个漏洞被利用后，简单把用户昵称在邮件中不再显示了，不过可以看得出来改动非常匆忙：

{% img /images/hack-way-3.jpg %}


## 方法二

在方法一被苹果封堵后，前两天，梁杰发现了一个新的垃圾邮件发送行为。这次利用的是苹果的共享日历的功能。黑客利用将广告以日历日程的形式共享给大家，以便获得展示广告的能力。

{% img /images/hack-way-4.jpg %}

{% img /images/hack-way-5.jpg %}


## 背后的利益

<del> 由于对岛国大片的热爱，</del> 我还真研究了一下这个垃圾邮件所描述的网址。这个网址打开后跳到一个看起来有各种诱人视频的播放列表中，然后弹出了如下 [付款说明](http://www.avv06.com/movie/play_480.html)：

{% img /images/hack-way-6.jpg %}

这个页面明显是一个骗人的假页面，因为上面描述的是：「付款之后刷新页面，尽享奇妙之旅」。我理解「奇妙之旅」应该就是可以播放视频吧。但是，这个付款的二维码是一个微信支付的二维码，所以，所有用户看到的二维码是一样的。

这就带来一个问题：假如有一个用户付款完，这个时候有两个用户同时按刷新，服务器端根本就无法知道是哪个用户付的款。所以，这根本就是一个诈骗的网站。

这个诈骗网站同时考虑了警察的心理，假如有人受骗报警，诈骗 18.8 元这种事情，对于警察叔叔来说，根本就达不到立案标准。如果警察叔叔要立案，他需要收集到上千个受害人的信息。另外，中国的办案还涉及管辖权，如果这个网站不在北京，那么北京的警察叔叔还需要找网站所在地的警察联合配合，这种事情想想都头大。于是，这个网站到现在还是能够正常打开（已经安全存在快一个月了）。

但是这如果不是一个诈骗网站，而是一个黄色网站，那么性质就完全不一样了。黄赌毒是警方重点的打击对象，警方跨辖区合作起来更有动力。相对诈骗网站来说，黄色网站的站长也会有更大的压力，而且就 18.8 这点钱，估计连站长的流量费都挣不回来。

## 木马的传播

除以上面这种骗 18.8 的诈骗网站外，还有一种黑客行为是传播木马。通常的形式是要求你下载一款专用的视频播放器，用于看岛国大片。这类视频播放器通常都含有木马。

对于 Android 来说，视频播放器在安装时会要求大量系统级权限，然后在你不经意的时候，发一条扣费短信。注意，这种扣费短信通常只有 1 毛钱，对于这种报案，你可以想像一下警察叔叔的心理阴影面积了，他可能得收集上万个报案人的信息，才能达到立案的涉案金额，进而合并立案。在黑客界，这种扣费行为被称为最安全的挣钱方式，因为现有的法律使得警方的办案成本非常高。

对于 iOS 来说，视频播放器通常使用企业证书安装。有些小白用户或许觉得我的 iPhone 没有越狱，安装这类 App 没有风险，那么你就 too young too native 了。企业证书的安装的 App 不经苹果审核，黑客可以随意利用私有 API 进行各种信息的窃取。这里我就不教大家太多了，简单说一个过时的技巧吧：在 iOS 9 以前，企业证书的包可以覆盖同名的在 AppStore 上下载的 App。所以黑客可以利用一些小弹窗提示：「你的微信有新版本，是否更新」，从而把你的微信覆盖成它的修改后的版本。之后黑客可以做的事情就太多了。

## 写在最后

安全的故事和事故每天都在上演，我们大家都得小心。
