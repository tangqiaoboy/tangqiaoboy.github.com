---
layout: post
title: "再见，viewDidUnload方法"
date: 2013-05-18 17:37
comments: true
categories: iOS
---

### 前言

我在去年的一篇文章 [《iOS5 中 UIViewController 的新方法》](/2012/02/06/new-methods-in-uiviewcontroller-of-ios5/) 中介绍了 iOS5 引入的关于 ViewController 的新方法。但是现在如果运行该文章中的 Sample 代码的话，你会发现 Log 中不会再出现 viewDidUnload 方法被调用的记录。这是因为在 iOS6 中，viewDidUnload 回调方法被 Deprecated 掉了。查看苹果的文档，可以看到如下的说明。

{% img /images/viewdidunload-1.jpg %}

那么，原本在 viewDidUnload 中的代码应该怎么处理？在 iOS6 中，又应该怎么处理内存警告？带着这些问题，我查找了一些资料，在此分享给大家。

<!-- more -->

### 分析

在 iOS4 和 iOS5 系统中，当内存不足，应用收到 Memory warning 时，系统会自动调用当前没在界面上的 ViewController 的 viewDidUnload 方法。
通常情况下，这些未显示在界面上的 ViewController 是 UINavigationController Push 栈中未在栈顶的 ViewController，以及 UITabBarViewController 中未显示的子 ViewController。这些 View Controller 都会在 Memory Warning 事件发生时，被系统自动调用 viewDidUnload 方法。

在 iOS6 中，由于 viewDidUnload 事件在 iOS6 下任何情况都不会被触发，所以苹果在文档中建议，应该将回收内存的相关操作移到另一个回调函数：didReceiveMemoryWarning 中。但是如果你仅仅是把以前写到 viewDidUnload 函数中的代码移动到 didReceiveMemoryWarning 函数中，那么你就错了。以下是一个 <font color=red> 错误的示例代码 </font> ：

``` objc

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    if([self isViewLoaded] && ![[self view] window]) {
        [self setView:nil];
    }
}

```


[这篇文章](http://thejoeconwayblog.wordpress.com/2012/10/04/view-controller-lifecycle-in-ios-6/) 解释了 iOS6 不推荐你将 view 置为 nil 的原因（链接打开需要翻墙）, 翻译过来如下：

 1. UIView 有一个 CALayer 的成员变量，CALayer 是具体用于将自己画到屏幕上的。如下图所示：

    {% img /images/viewdidunload-2.jpg %}

 2. CALayer 是一个 bitmap 图象的容器类，当 UIView 调用自身的 drawRect 时，CALayer 才会创建这个 bitmap 图象类。

 3. 具体占内存的其实是一个 bitmap 图象类，CALayer 只占 48bytes, UIView 只占 96bytes。而一个 iPad 的全屏 UIView 的 bitmap 类会占到 12M 的大小！

 4. 在 iOS6 时，当系统发出 MemoryWarning 时，系统会自动回收 bitmap 类。但是不回收 UIView 和 CALayer 类。这样即回收了大部分内存，又能在需要 bitmap 类时，通过调用 UIView 的 drawRect: 方法重建。

### 内存优化

另外文章中还提到苹果的操作系统对此做的一个内存优化技巧，解释如下：

 1. 当一段内存被分配时，它会被标记成 “In use“, 以防止被重复使用。当内存被释放时，这段内存会被标记成 "Not in use"，这样，在有新的内存申请时，这块内存就可能被分配给其它变量。

 2. CALayer 包括的具体的 bitmap 内容的私有成员变量类型为 [CABackingStore](http://blog.spacemanlabs.com/2011/08/calayer-internals-contents/)， 当收到 MemroyWarning 时，
CABackingStore 类型的内存区会被标记成 volatile 类型（这里的 volatile 和 C 以及 Java 语言的 volatile 不是一个意思），volatile 表示，这块内存可能被再次被原变量重用。

这样，有了上面的优化后，当收到 Memoy Warning 时，虽然所有的 CALayer 所包含的 bitmap 内存都被标记成 volatile 了，但是只要这块内存没有再次被复用，那么当需要重建 bitmap 内存时，
它就可以直接被复用，而避免了再次调用 UIView 的 drawRect: 方法。

### 总结

所以，简单来说，对于 iOS6，你不需要做任何以前 viewDidUnload 的事情，更不需要把以前 viewDidUnload 的代码移动到 didReceiveMemoryWarning 方法中。

引用 WWDC 2012 中的一段话来给 viewDidUnload 说再见：

{% blockquote %}

The method viewWillUnload and viewDidUnload. We're not going to call them anymore. I mean, there's kind of a cost-benifit equation and analysis that we went through. In the early days, there was a real performance need for us to ensure that on memory warnings we unloaded views. There was all kinds of graphics and backing stores and so forth that would also get unloaded. We now unload those independently of the view, so it isn't that big of a deal for us for those to be unloaded, and there were so many bugs where there would be pointers into。

{% endblockquote %}

### 参考链接
 * [View Controller Lifecycle in iOS 6](http://thejoeconwayblog.wordpress.com/2012/10/04/view-controller-lifecycle-in-ios-6/)
 * [CALayer Internals: Contents](http://blog.spacemanlabs.com/2011/08/calayer-internals-contents/)

