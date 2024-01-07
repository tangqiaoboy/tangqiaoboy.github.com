---
layout: post
title: "iOS5中UIViewController的新方法"
date: 2012-02-06 21:19
comments: true
categories: iOS
---

### 前言

在苹果的 WWDC2011 大会视频的
[《Session 101 - What's New in Cocoa》](https://developer.apple.com/videos/wwdc/2011/?id=101) 和
[《Session 102 - Implementing UIViewController Containment》](https://developer.apple.com/videos/wwdc/2011/?id=102) 中介绍了苹果在 iOS5 中给 UIViewController 新增加的 5 方法以及一个属性:

``` objc
// 方法
addChildViewController: 
removeFromParentViewController:
transitionFromViewController:toViewController:duration:options:animations:completion: 
willMoveToParentViewController: 
didMoveToParentViewController:
// 属性
@property(nonatomic,readonly) NSArray *childViewControllers
```

<!--more-->

### 原来的问题

这些新增的方法和属性用于改进我们的编程方式。那么让我们先看看以前的对于 UIViewController 的使用有什么潜在的问题，认清问题，我们才能理解苹果改变的意义。

在以前，一个 UIViewController 的 View 可能有很多小的子 view。这些子 view 很多时候被盖在最后，我们在最外层 ViewController 的 viewDidLoad 方法中，用 addSubview 增加了大量的子 view。这些子 view 大多数不会一直处于界面上，只是在某些情况下才会出现，例如登陆失败的提示 view，上传附件成功的提示 view，网络失败的提示 view 等。但是虽然这些 view 很少出现，但是我们却常常一直把它们放在内存中。另外，当收到内存警告时，我们只能自己手工把这些 view 从 super view 中去掉。

### 改变

苹果新的 API 增加了 addChildViewController 方法，并且希望我们在使用 addSubview 时，同时调用 [self addChildViewController:child] 方法将 sub view 对应的 viewController 也加到当前 ViewController 的管理中。对于那些当前暂时不需要显示的 subview，只通过 addChildViewController 把 subViewController 加进去。需要显示时再调用 transitionFromViewController:toViewController:duration:options:animations:completion 方法。

另外，当收到系统的 Memory Warning 的时候，系统也会自动把当前没有显示的 subview unload 掉，以节省内存。

### 参考资料

关于这个，[这儿](http://wangjun.easymorse.com/?p=1630) 有一篇不错的文章介绍了一段 sample 代码用于演示新 API 的使用 .

我也将其代码稍加修改，增加了 view load, unload, appear, disappear 的事件 Log，以及收到 Memory Warning 时的 Log。代码放在了 github 上，地址是 [这里](https://github.com/tangqiaoboy/iOS5ViewCtrlerSample)，感兴趣的同学可以自己下载下来看看源码。

可以看到，这些 view 在没有使用时，是不会被 load 的，并且当有 Memory Warning 时，当前没有显示的 view 自动被 unload 掉了。所以新的方法确实能有效地节省内存，也能方便地处理内存不足时的资源回收。运行 Log 如下：

```
[7397:f803] -[FirstViewController willMoveToParentViewController:]
[7397:f803] -[SecondViewController willMoveToParentViewController:]
[7397:f803] -[ThirdViewController willMoveToParentViewController:]
[7397:f803] -[ThirdViewController viewDidLoad]
[7397:f803] -[ThirdViewController viewWillAppear:]
[7397:f803] -[ThirdViewController viewDidAppear:]
[7397:f803] 生日提醒
[7397:f803] -[SecondViewController viewDidLoad]
[7397:f803] -[ThirdViewController viewWillDisappear:]
[7397:f803] -[SecondViewController viewWillAppear:]
[7397:f803] -[SecondViewController viewDidAppear:]
[7397:f803] -[ThirdViewController viewDidDisappear:]
[7397:f803] 留言及回复
[7397:f803] -[FirstViewController viewDidLoad]
[7397:f803] -[SecondViewController viewWillDisappear:]
[7397:f803] -[FirstViewController viewWillAppear:]
[7397:f803] -[FirstViewController viewDidAppear:]
[7397:f803] -[SecondViewController viewDidDisappear:]
[7397:f803] Received memory warning.
[7397:f803] -[SecondViewController viewDidUnload]
[7397:f803] -[ThirdViewController viewDidUnload]
```








