---
layout: post
title: "从 Facebook 看移动开发的发展"
date: 2014-04-16 20:37:59 +0800
comments: true
categories: iOS
---

{% img /images/facebook-logo.jpg %}

## 从 Facebook 谈起

Facebook 最近绝对是互联网界的新闻明星。它首先是进行了大手笔的收购：2014 年 2 月，Facebook 以 160 亿美元现金加股票，以及 30 亿美元受限制股票福利的方式 [收购移动 IM 应用 WhatsApp](http://tech.ifeng.com/internet/special/fb-whatsapp/content-1/detail_2014_02/21/34032969_0.shtml)，总收购成本 190 亿美元。然后是继续发布了新产品：2014 年 2 月，Facebook 发布了一个新的移动端新闻阅读应用 [Paper](https://www.facebook.com/paper)。最后，Facebook 最近还将自己使用的大量工具开源，包括开源了 Paper 的加载效果 [Shimmer](https://github.com/facebook/Shimmer)，LLDB 的增强工具 [chisel](https://github.com/facebook/chisel)，以及 Key-Value Observing 工具 [KVOController](https://github.com/facebook/KVOController)，如果说这些开源工具让程序员如获至宝的话，那么 Facebook 将 Paper 的交互设计工具 [Origami](http://facebook.github.io/origami/) 免费开放，则是对广大设计师的福音，极大地方便了移动交互设计工作的开展。

2014 年对于 Facebook 来说也是一个值得纪念的日子。因为从 2004 年 2 月 4 日 Facebook 产品上线到现在，Facebook 刚刚走过 10 个年头。10 年前，Facebook 的创始人扎克伯格才 19 岁，是哈佛大学的一名学生。转眼间 10 年后，Facebook 已经成长为全球最大的社交网络，月活跃用户达到 12 亿，市值约 1200 亿美元。

业界内大多讨论的话题都围绕在 Facebook 收购 WhatsApp 这件事情上，而作为一个移动开发者，我更加看重 Facebook 发布 Paper 这件事情。因为 Paper 并不是一个简单的应用，它有着非常优秀的交互效果，并且在产品设计和技术上都使用了许多前沿的技术，那就让我们看看，Paper 的开发到底有何不同之处？

## 交互设计

我们首先从产品设计上看 Paper 的不同之处。Paper 虽然只是一个新闻客户端，但从大家对 Paper 的评价上，我们发现优秀的交互再一次成为大家关注的焦点。回想那些成功的应用，大多都有着令人心动的交互效果，例如：Tweetie 的下拉刷新，现在基本上成为 iPhone 上内容刷新的标准。Path 跳出来的红心让人心动，很多朋友甚至会没事点那个红心，欣赏那流畅的按钮散开效果。还有 Mailbox，用流畅的手势操作，将邮件管理与任务管理完美结合起来。

国外成功的优秀应用也在影响着国内。交互设计不同于平面设计，不能简单地用 Photoshop 展现，而交互设计对于移动应用的成功又异常关键，所以需要花费不少时间来设计，因此产品经理很难兼顾地做交互设计。所以，在国内的一线互联网公司里，交互设计师这个职位慢慢成了移动应用的标配。但是在大部分的非一线互联网公司里面，移动开发的设计仍然停留在由产品经理简单潦草的完成阶段。所以，Facebook 这次 Paper 的成功发布，再一次给移动开发的从业者指出了交互设计的重要性。

回顾中国互联网产业的发展我们可以发现，产品经理（Product Manager）这个职位也是最近五、六年才成为互联网公司的标配的，想必在不远的将来，除着交互设计越来越重要，移动交互设计师也会成为每一个互联网公司重要的必备职位。

另一方面，由于工具的欠缺，大量的交互设计师的工作效率非常低下，他们为了做出一个新颖的效果常常需要花费大量精力。这次 Facebook 免费开放出基于苹果 Quartz Composer 的增强工具集 [Origami](http://facebook.github.io/origami/)，使得交互设计工作得到更好的辅助。而且在 Facebook 的带动下，[jQC 1.0](http://qcdesigners.com/index.php/forums/topic/100/it-s-finally-here-j-qc-1-0-a-u/) 也出现了。jQC 是一个与 Facebook 之前开源的 Origami 兼容的工具，提供了 15 个新的 Patch 来提高 Quartz Composer 的功能。

不过另一方面，该工具仍然需要设计师具备一定的基础编码能力，所以对于广大设计师来说，交互设计工具 Origami 对设计师带来的既是机会，同时也是挑战。

## 移动开发技术

随着 iOS 依赖管理工具 Cocoapods 和大量第三方开源库成熟起来，业界积累了大量的优秀开源项目。这次 Facebook 开发 Paper 使用了 [将近 100 个第三方开源库](http://blog.rpplusplus.me/blog/2014/02/11/facebook-paper-used-3rd/)，极大地减化了自己的应用开发任务。相信随着移动开发的发展，移动开发的生态圈会越来越成熟，基础的开源组件也将将越来越丰富，广大开发者都将从中受益。

另一方面，Facebook 的工程师在 [Quora 上反馈](http://www.quora.com/What-exactly-did-Jason-Prado-mean-when-he-said-Xcode-cannot-handle-our-scale/answer/Scott-Goodson-1) 说 Paper 在 Xcode 下打开需要 40 多秒钟，编译一次需要 30 分钟。这反映出大量的开源库的使用也给 iOS 集成编译环境 Xcode 提出了新的挑战，相信苹果会花大力气解决 Xcode 的性能问题。

## 总结

Facebook 发布的 Paper 让我看到了移动开发领域的快速发展，大量新的工具和开源技术给了设计师和程序员机会和挑战，相信在移动互联网快速发展的浪潮中，会涌现出越来越多优秀的移动应用。谁会是未来移动互联网的霸主？让我们拭目以待。


## 版权说明

本文已发表在《程序员》杂志 2014 年 4 月刊上，链接为：<http://www.csdn.net/article/2014-04-16/2819341>
