---
layout: post
title: "StoryBoard--看上去很美"
date: 2012-12-15 10:21
comments: true
categories: iOS
---

## 介绍
StoryBoard 是苹果在 2011 年的 WWDC Session 309《Introducing Interface Builder Storyboarding》中介绍的 Interface Builder 的新功能。其基本想法是将原本的 xib 进行升级，引入一个容器用于管理多个 xib 文件，并且这个容器可以通过拖拽设置 xib 之间的界面跳转。而这个容器就是被苹果称做的 StoryBoard。下图是一个 Storyboard 的截图。

{% img /images/enbrace-ios5-1.png %}

<!-- more -->

##优点

总体上来说，Storyboard 有以下好处：

 1. 你可以从 storyboard 中很方便地梳理出所有 View Controller 的界面间的调用关系。这一点对于新加入项目组的开发同事来说，比较友好。
 2. 使用 Storyboard 可以使用 Table View Controller 的 Static Cell 功能。对于开发一些 Cell 不多，但每个 Cell 都不一样的列表类设置界面会比较方便。
 3. 通过实现 - (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender 方法，每个 View Controller 的跳转逻辑都聚集在一处，这方便我们统一管理界面跳转和传递数据。
 4. Storyboard 可以方便将一些常用功能模块化和复用。例如 WWDC2011 年介绍 Storyboard 的视频就将微博分享功能模块化成一个单独的 Storyboard。我在开发 App 时，也将例如通过第三方注册登录模块做成一个单独的 Storyboard，便于以后复用。

##缺点

我在新项目使用 Storyboard 时，却发现它只是看上去很美，真正用起来，却有很多问题，我发现的问题有：

 1. 首先它和 xib 一样，对版本管理是灾难。因为是它实际上的多个 xib 的集合，所以更容易让多人编辑产生冲突。苹果对 storyboard 的设计也不好，基本上你只要打开，什么都不做，这个文件就会被更改，所以冲突几乎是不可避免的---除非你不打开，实在不小心打开看了，需要在提交前回退成服务器上的版本。
 2. Storyboard 提供的 Static cell 特性只适合于 UITableViewController 的子类。我很多时候的用法是一个 TableView 嵌套在另一个 UIView 中，static cell 就不能用了。
 3. segue 的概念对于开发来说并不省事，如果是用程序内部 trigger 一个 segue，那么需要在另一个回调的地方设置 dest view controller 的参数信息。

##总结

我仔细比较权衡了一下优缺点，最主要的问题是我的版本管理在多人协作开发时将陷入灾难，而这是完全不能接受的。而最主要的好处就是，你可以在一个类似白板的地方 “一揽众山小 “一样了解所有界面之间的切换关系，但这个有那么重要吗？我自已其实很清楚跳转逻辑，这个只是对新同事了解项目代码时有帮助，那我花一点时间直接给他讲讲画画不就搞定的吗？为了这点好处而让版本管理无法使用，是完全不能接受的。

所以最终我决定放弃使用 StoryBoard 了，这个 “看上去很美” 的功能有着不可接受的缺陷。现在看来，它仅适用于做一些 Demo 的开发。苹果一直没有处理好这类可视化界面设计功能的版本管理，象 xib 文件，虽然是 xml 格式的，但如果多人编辑了，合并起来也会很麻烦。所以业界好多同行都不用 xib, 直接用纯代码来写界面，虽然稍慢一点儿，但是工程很干净，也基本没有了多人协作的版本冲突问题。

##2013-10-6 更新

苹果在 WWDC2013 之后发布了 Xcode5，storyboard 和 xib 的内部实现进行了大量修改，使得其格式更加简单和易读，最终的效果是在版本冲突时，合并冲突变得可能。所以，现在我对于 storyboard 和 xib 不再象以前那么排斥了。








