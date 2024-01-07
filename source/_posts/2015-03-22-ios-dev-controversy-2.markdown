---
layout: post
title: "iOS 开发中的争议（二）"
date: 2015-03-22 11:06:31 +0800
comments: true
categories: iOS
---

{% img /images/controversy.jpg %}

打算分享一些有争议的话题，并且表达一下我的看法。这是该系列的第二篇。

在本文中，我想讨论的是：对于 UI 界面的编写工作，到底应该用 xib/storyboard 完成，还是用手写代码来完成？

本着 "使用过才有发言权" 原则，我介绍一下我的经历：

 * 最早在网易开发 " 有道云笔记 " 的时候，我们是使用 xib 来制作界面的。
 * 三前年创业编写 " 粉笔网 " 的时候，我也是使用 xib 来制作界面的。
 * 之后开发 " 猿题库 " 的时候，我尝试了一下使用 storyboard 来制作界面，但最后放弃了。之后我把大部分界面编写工作都改成由手写代码来完成。
 * 在去年开发 " 小猿搜题 " 的时候，由于时间紧，我又再一次使用了 storyboard，但是我现在计划将其用手写代码来重构一次。

## xib 使用调研情况

除了我本人的经历外，我也调研了一下我手机中装的所有的 App 的开发情况，我写了一个脚本，分析了我手机中一共 100 多个 App 包含的 xib 文件的个数。通常情况下一个 App 如果完全通过 xib/storyboard 来完成的话，那么编写包含的 xib 个数不应该少于 10 个（注：storyboard 在打包时会被拆解成多个它包含的 xib 文件）。

这个调研的最终结果，以及我分析用的脚本源码在 [这里](https://gist.github.com/tangqiaoboy/b149d03cfd0cd0c2f7a1)。我挑了一些比较有名的应用列在下面。（我另外也列出了它们包含的 js 的文件数量，这个可以反应出该应用对基于 UIWebView 的 Hybrid 编程的使用情况，不过与本次讨论主题无关。）

软件名字 | nib 文件数 | js 文件数
:----- | :-----: | -----:
Mailbox 2.3.3.ipa | 0  | 0
Twitter 6.0.1.ipa | 0  | 0
objcio 1.0.3.ipa | 0  | 0
播客 2.0.ipa | 0  | 0
知乎日报 2.5.ipa | 1  | 2
百度视频 6.2.2.ipa | 1  | 3
高德导航 9.2.ipa | 1  | 0
优酷 4.3.ipa | 2  | 3
网易云音乐 2.3.1.ipa | 2  | 0
滴滴打车 3.6.2.ipa | 3  | 0
网易新闻 416.ipa | 4  | 1
QQ 5.4.ipa | 9  | 2
猿题库 4.1.0.ipa | 9  | 0
京东 .ipa | 10  | 0
搜狐视频 4.6.3.ipa | 10  | 0
快的打车 3.7.ipa | 11  | 0
小猿搜题 1.4.0.ipa | 12  | 0
WeChat 6.1.1.ipa | 13  | 20
Evernote 7.6.5.ipa | 23  | 25
有道云笔记 4.3.1.ipa | 40  | 11
来往 4.3.2.ipa | 48  | 0
百度地图 7.6.1.ipa | 76  | 227
易到用车 6.2.2.ipa | 106  | 0
网易有道词典 5.2.2.ipa | 114  | 9
美图秀秀 3.5.0.ipa | 155  | 3
支付宝钱包 8.5.3.ipa | 158  | 7
手机淘宝 5.2.4.ipa | 188  | 0
易信 1.4.8.ipa | 292  | 12
大众点评 7.0.2.ipa | 1783  | 5
iMovie 211.ipa | 4323  | 1

以上这个表格说明了即使是比较著名的 App，在使用 xib/storyboard 上，也有很大的差异。举几个例子：

 * QQ、WeChat（微信）和易信同属于社交类应用，而且按理说，由于用户量和开发时间更长，QQ 和微信应该比易信更加复杂，但是从 xib 数量上，前者 xib 的数量都非常少。这说明，在 QQ 和微信中，很多界面肯定是通过手写代码来完成的。

 * 滴滴打车、快的打车和易到用车同属于叫车软件，按理说滴滴打车、快的打车同时包含叫出租车和叫专车功能，应该比易到用车功能更多，更复杂。但是前者 xib 的数量都非常少。这也说明，滴滴打车、快的打车的界面很多是通过手写代码来完成的。

另外，像 Mailbox、播客 (Podcast)、Twitter、objcio 这些 App 中 xib 的数量为 0，说明其完全是用手写代码来完成 UI 界面编写的。

当然，也有一些能看出来几乎是由 xib 构成的应用，例如大众点评、美图秀秀、网易有道词典。而苹果的 iMovie 使用了 4000 多个 xib，真让人不敢相信。我后来仔细看了一下，原来是因为 iMovie 做了国际化，每种语言大概有 120 个 xib，因为支持了将近 40 个语言，所以 xib 数量变成了 4000 多个。大众点评的每个 xib 也被切分成了 4 个，具体用处我还没研究，如下是一个示例：

```
./Payload/DPScope.app/WEDHotelShopInfoMainModule.nib
./Payload/DPScope.app/WEDHotelShopInfoMainModule.nib/objects-8.0+.nib
./Payload/DPScope.app/WEDHotelShopInfoMainModule.nib/objects.nib
./Payload/DPScope.app/WEDHotelShopInfoMainModule.nib/runtime.nib
```

## 讨论

就上面的调研我们就可以看出，其实大家对于是否应该使用 xib 做界面是有争议的。在实际案例中：

 * 既有像 Twitter，Mailbox，objcio 这样完全不使用 xib 做界面的情况。
 * 也有像 QQ、微信、滴滴打车、网易新闻、猿题库这样少量使用 xib 的情况。
 * 也有像支付宝、大众点评这样重度使用 xib 的情况。

那么我就从我的角度把用与不用 xib 的优缺点表达一下。

## 使用 xib 和 storyboard 的优点

 * 开发界面所见即所得，可以快速通过拖拽构造界面。
 * 你可以从 storyboard 中很方便地梳理出所有`View Controller`的界面间的调用关系。这一点对于新加入项目组的开发同事来说，比较友好。
 * 使用 Storyboard 可以使用`Table View Controller`的 Static Cell 功能。对于开发一些 Cell 不多，但每个 Cell 都不一样的列表类设置界面会比较方便。
 * 通过实现 `– (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender` 方法，每个 View Controller 的跳转逻辑都聚集在一处，这方便我们统一管理界面跳转和传递数据。
 * Storyboard 可以方便将一些常用功能模块化和复用。例如 WWDC2011 年介绍 Storyboard 的视频就将微博分享功能模块化成一个单独的 Storyboard。

## 使用 xib 和 storyboard 的缺点

 * xib 对版本管理是灾难。storyboard 实际上的多个 xib 的集合，所以更容易让多人编辑产生冲突。而虽然它们是 xml 格式，但是冲突解决起来还是不如代码那么容易。
 * 苹果对 xib, storyboard 的设计中带有当前电脑的操作系统版本和 Xcode 版本。所以如果两个协作的开发者电脑操作系统或 Xcode 有不一样的话，每次打开必定会修改这个文件。另外即使操作系统版本和 Xcode 版本一样，有些时候打开看也会造成一些自动的修改。
 * storyboard 带来的 segue 的概念对于开发来说并不省事，特别是在需要传递参数的时候。如果是用程序内部 trigger 一个 segue，那么需要在另一个回调的地方设置 dest view controller 的参数信息。
 * 我们发现 xib 中设置的颜色值并不精确，RGB 在真机 / 模拟器上常常会有 10 多像素的偏差。
 * xib 和 storyboard 对继承的支持并不友好。无法做界面的继承。
 * xib 和 storyboard 对搜索支持并不友好，无法方便地在 Xcode 中查找关键词（但是可以通过写 bash 命令来查找）。
 * storyboard 对组合支持得不太好，不允许在一个 xib 中附带多个子 view。
 * xib 和 storyboard 不太方便做界面的模块化管理，比如我们想统一修改界面中所有按钮的字体样式，那么在 xib 和 storyboard 只能一个一个手工修改，而如果是代码编写的，则只需要改一个工厂方法的实现即可。
 * 对于复杂的 App，storyboard 的性能会比较差。

## 关于手写 UI 界面的一些挑战

所以我更喜欢用代码编写 UI 界面，加上现在移动开发对于 App 要求的需求越来越强烈，很多复杂的交互效果需要在代码中编写，这种情况下 xib 能提供的帮助越来越有限。

但是 xib 提供的 “所见即所得” 这种优势还是巨大的，如果我们是手写界面，那么调试起来是非常痛苦的。在这一里，我给大家推荐购买 [Reveal](http://revealapp.com/) 这个界面调试工具，Reveal 可以在 App 运行时动态地修改界面元素的参数，这样我们就可以一次性在代码中把界面元素的字体、颜色、位置这些参数在 Reveal 调试好，避免多次重启运行来调试界面。我在我的 [《iOS 开发进阶》](http://item.jd.com/11598468.html) 书里，也花了一整章来介绍 Reveal 的使用。如下是书中的一个 Reveal 运行时截图：

 ![](http://tangqiao.b0.upaiyun.com/reveal/reveal-ui.jpg)

## 总结

其实，你完全不需要做一个 “艰难的决定”，你可以像 QQ 和微信那样，根据具体情况来选择性的使用 xib 和 storyboard。这里有我的一些建议：

 * 对于复杂的、动态生成的界面，建议使用手工编写界面。
 * 对于需要统一风格的按钮或UI控件，建议使用手工用代码来构造。方便之后的修改和复用。
 * 对于需要有继承或组合关系的 UIView 类或 UIViewController 类，建议用代码手工编写界面。
 * 对于那些简单的、静态的、非核心功能界面，可以考虑使用 xib 或 storyboard 来完成。

对于很多新手来说，他们接触到的都是使用 Interface Builder 来构造界面。希望本文让大家了解到 xib 和 storyboard 在开发中的争议，手写界面并不是一个小众的行为并且有很多好处，希望每一个人都能掌握它，并且在需要的时候根据具体情况来决定是否采用。

愿大家玩得开心～

