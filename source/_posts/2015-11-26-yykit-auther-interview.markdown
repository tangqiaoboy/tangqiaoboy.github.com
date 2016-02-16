---
layout: post
title: "专访 YYKit 作者 ibireme: 开源大牛是怎样炼成的"
date: 2015-11-26 20:47:13 +0800
comments: true
categories: iOS
---

###版权说明

本文为InfoQ中文站特供稿件，首发地址为：[文章链接](http://www.infoq.com/cn/news/2015/11/ibireme-interview)。如需转载，请与InfoQ中文站联系。

### 前言

第一次听到 [ibireme](http://weibo.com/239801242) 这个名字，是看到他在 [微博上分享](http://weibo.com/2477831984/D2ujxj5Vx?type=comment#_rnd1448528368875) 了 [YYText](https://github.com/ibireme/YYText) 开源库。当时我第一眼见到 YYText 的功能示意 GIF 图时（下图所示），就被它丰富的功能吸引了。YYText 应该是我见到过的功能最强大的基于 CoreText 的排版框架了。

![YYText示意图](https://camo.githubusercontent.com/fb454f77c109e6ac671e8fdb3220ade92238715b/68747470733a2f2f7261772e6769746875622e636f6d2f69626972656d652f5959546578742f6d61737465722f417474726962757465732f59595465787420457874656e6465642f5959546578744174746163686d656e742e676966)

令人惊讶的是，YYText 虽然代码量很大（超过一万行），但它只是 ibireme 的作品之一。ibireme 利用业余时间完成了 [YYKit](https://github.com/ibireme/YYKit) 工具库，包括：

* [YYModel](https://github.com/ibireme/YYModel) — 高性能的 iOS JSON 模型框架。
* [YYCache](https://github.com/ibireme/YYCache) — 高性能的 iOS 缓存框架。
* [YYImage](https://github.com/ibireme/YYImage) — 功能强大的 iOS 图像框架。
* [YYWebImage](https://github.com/ibireme/YYWebImage) — 高性能的 iOS 异步图像加载框架。
* [YYText](https://github.com/ibireme/YYText) — 功能强大的 iOS 富文本框架。
* [YYKeyboardManager](https://github.com/ibireme/YYKeyboardManager) — iOS 键盘监听管理工具。
* [YYDispatchQueuePool](https://github.com/ibireme/YYDispatchQueuePool) — iOS 全局并发队列管理工具。
* [YYAsyncLayer](https://github.com/ibireme/YYAsyncLayer) — iOS 异步绘制与显示的工具。
* [YYCategories](https://github.com/ibireme/YYCategories) — 功能丰富的 Category 类型工具库。

我和一些朋友挑选了一些其中的组件代码阅读，大家都认为质量非常高，大家对它的评语是这样的：

> 打算自己撸一个 JSON 转 model 的，专门看了 YYModel 的代码，果然屌。
>
> YYKit 超级好用。 
>
> 对比一下，感觉自己一年都没写代码。
>
> 怎么会有如此完美的工程师？真想抽一周时间宅在家里把 YYKit 的源码重敲一遍。

之后我抽空学习了一下 ibireme 的博客（<http://blog.ibireme.com/>），上面有多篇介绍他对于 iOS 开发中各种问题的研究，例如他在开发 YYModel 时，[调研和评测](http://blog.ibireme.com/2015/10/23/ios_model_framework_benchmark/) 了包括 Mantle 和 MJExtension 在内的多款开源库。这种专业认真的做事态度让我非常佩服，也让我对 YYModel 的质量充满信心。

然后，我有幸得到了 ibireme 的 QQ 和微信号，所以和他交流了多次。这时我才知道 ibireme 是一个 90 后，在优酷从事 iOS 开发工作。而这些所有的开源库，都是他在业余时间完成的。

我想大家很可能对 ibireme 的学习和成长的经历感兴趣，而且 ibireme 的故事很可能会激励更多有激情的 iOS 开发新人，利用业余时间学习、Coding 和分享，最终让国内的 iOS 开发技术氛围更好。所以，我向 ibireme 发出了采访邀请，ibireme 欣然接受了。于是，让我们来一起揭开这位神秘人物的面纱吧。

### 采访

> 唐巧：你好 ibireme，能否先向读者简单介绍一下自己？

ibireme：大家好，我叫郭曜源，是一个 iOS 开发者，现居北京，就职于优酷土豆。喜欢代码，爱好设计与音乐。

> 唐巧：我发现 YYKit 是在这个月初上传到 github 上的，但是它的代码量非常大，能否介绍一下每个部分大概花了你多长时间？

ibireme：Category 等工具类大部分都是这一两年工作和业余时间攒下来的。文本和图片相关的那几个项目是今年年初开始写起的，陆陆续续写了半年多。YYModel 花的时间最少，只有大概两个周末。

> 唐巧：为什么选择一次性开源这么多代码，而不是一个一个开源呢？

ibireme：最初这些代码我都是写在一个工程里，代码量比较多，相互之间也有很多依赖。准备发布时，我觉得这样很不方便别人使用，这才按功能拆开成一个个小的组件，然后一起发布的。

> 唐巧：这些开源库在国内外都收到了大量的好评，这个有没有超出你的预期？

ibireme：发布前我有预期会收到不少关注，但是发布后收到的好评还是大大超出我的预料。最令我惊讶的是 Facebook 和 Uber 等国外的工程师也关注到这个项目，并且还以此向我发出了工作邀请，这让我非常激动。

> 唐巧：你对 YYKit 后续的发展上有什么计划吗？

ibireme：现在只是计划进行一些正常的维护工作，保证稳定性。未来如果有合适的东西，我也会尝试加到里面的，但应该不会有太大改变了。

> 唐巧：YYKit 是你的业余作品，我很好奇你是如何保证工作之余还有这么高产的？

ibireme：最近一年我工作不太忙，很少加班，空闲时间比较多。另外我比较宅，平时喜欢待在家里做一些喜欢的事情。说起来，应该是充足的时间加上个人兴趣让我完成了这些项目吧。

> 唐巧：你如何看待 Swift 语言，有没有计划过用 Swift 重写你的 YYKit？

ibireme：相对于 Objective-C 来说，我觉得 Swift 无疑是更优秀、更现代的语言。目前我对 Swift 研究并不多，工作中也没有用到，但未来我会把时间更多投入到 Swift 中去。YYKit 中不少东西更适合于 C/Objective-C，所以我没有计划用 Swift 重写整个项目。我可能会用 Swift 写一些新的东西，以充分发挥 Swift 的特性。

> 唐巧：你在 iOS 开发上是如何快速成长起来的？有没有什么心得可以分享给 iOS 开发新手？

ibireme：我接触 iOS 开发的时间很早，但是一直都是在工作之余靠着兴趣自学的。14 年我还在人人网时，部门内部有个新项目需要 iOS 开发，我才得以有机会在工作中使用 iOS 相关的技术。全职转为 iOS 开发后，我花费了大量的时间阅读和学习各种开源的代码、研究其中的实现原理、尝试自己实现相关技术、尝试在工作中使用，这使得我在 iOS 开发技术上进步很快。对于 iOS 开发来说，我觉得自学能力是很重要的。主动去研究一些优秀的开源项目、多在工作中实践和学习，这样就能逐步提升个人技术水平了。

> 唐巧：你觉得哪些开发者对你影响最大？

ibireme：可能平时我更喜欢看代码，对于开发者我倒是了解的不多吧。如果要选一位的话，我会选 Linus Torvalds。他的一句话我很喜欢："Talk is cheap, show me the code"。

> 唐巧：在技术领域，你对未来有什么学习规划吗？

ibireme：在 iOS 方面，我可能会针对 Swift、音频处理和合成等方面投入更多精力。另外我第一份工作是 Java 后台开发，工作时前后端、数据库相关的东西也都接触过，所以如果有时间的话我也会继续学习这些技术，即使不用在工作上，也能开拓眼界吧。

### 结束语

刚刚 ibireme 在介绍自己学习方法的时候，提到了两点我认为非常关键，一个就是大量地阅读优秀项目的源代码，另一个就是自己动手实践来尝试。

我在很久以前，分享过我认为 iOS 开发者可以提高自己能力的各种方法，见 [《iOS 开发如何提高》](http://blog.devtang.com/blog/2014/07/27/ios-levelup-tips/)，里面也提到阅读开源代码和多写代码。我感觉 ibireme 将这一点做到了极致，因此他在短短一年多的时间，就能够成长成为在业界有影响力的开源项目作者。

我们处在一个信息爆炸的时代，每一天都有大量的 iOS 开发文章出现，我们对这些文章如饥似渴，但是很多时候又浅尝辄止。像 ibireme 这样，专心阅读几个开源项目，然后自己动手真正实践，或许才是正确的学习方式。

希望 ibireme 的故事能够激励那些渴望成长成为牛人的 iOS 开发新人，也希望在中国能够出现更多像 YYKit 这样的优秀的开源项目，与大家共勉。

