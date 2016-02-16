---
layout: post
title: "那些被遗漏的Objective-C保留字"
date: 2013-04-29 20:22
comments: true
categories: iOS
---

{% img /images/forget.jpeg %}

今天翻到很久以前自己在网易博客上写的 [这篇文章](http://tangqiaoboy.blog.163.com/blog/static/116114258201110133108545/)，惊奇地发现自己都忘记了里面的一些内容。所以我又重新学习了一下，然后改了改内容，挪到这里。

## 前言

[Steffen Itterheim](http://www.amazon.cn/s?ie=UTF8&search-alias=books&field-author=Steffen%20Itterheim) 是 [《Learn Iphone and Ipad Cocos2d Game Development》](http://www.amazon.cn/Learn-Iphone-and-Ipad-Cocos2d-Game-Development-The-Leading-Framework-for-Building-2D-Graphical-and-Interactive-Applications-Itterheim-Steffen/dp/1430233036/ref=sr_1_1?ie=UTF8&qid=1321168092&sr=8-1) 作者。cocos2d 和 cocos2d-x 现在已成为著名的游戏开发引擎。在 AppStore 上有超过 100 个游戏是基于 Cocos2D。

Steffen Itterheim 在 [他的博客](http://www.learn-cocos2d.com/2011/10/complete-list-objectivec-20-compiler-directives) 中总结了 Objective-C 2.0 所有的编译器保留字，并且对这些保留字做了介绍和使用示例。这些保留字如下：

<pre>
@class
@defs
@protocol @required @optional @end
@interface @public @package @protected @private @property @end
@implementation @synthesize @dynamic @end
@throw @try @catch @finally
@synchronized @autoreleasepool
@selector @encode
@compatibility_alias
@”string”
</pre>

我把这些保留字过了一遍，发现很少用到的有 @dynamic @defs @encode @compatibility_alis，所以就给大家介绍一下这几个关键字吧。

<!-- more -->

## @dynamic
@dynamic 是相对于 @synthesize 的，它们用样用于修饰 @property，用于生成对应的的 getter 和 setter 方法。但是 @ dynamic 表示这个成员变量的 getter 和 setter 方法并不是直接由编译器生成，而是手工生成或者运行时生成。

示例如下：

``` objc
@implementation ClassName
@synthesize aProperty, bProperty;
@synthesize cProperty=instanceVariableName;
@dynamic anotherProperty;

// method implementations
@end
```

## @defs
@defs 用于返回一个 Objective-C 类的 struct 结构，这个 struct 与原 Objective-C 类具有相同的内存布局。就象你所知的那样，Objective-C 类可以理解成由基本的 C struct 加上额外的方法构成。

示例代码如下：

``` objc
struct { @defs( NSObject) }
```

你可能会想，什么情况下才会需要使用这个关键字。答案是涉及非常底层的操作或优化的时候才会用到。像如这篇讨论 [Objective-C 如何做缓存优化](http://www.mulle-kybernetik.com/artikel/Optimization/opti-3-imp-deluxe.html) 的文章中，就用到了该关键字。

## @encode
@encode 是用于表示一个类型的字符串，对此，苹果有专门的 [介绍文档](http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html)

示例如下：

``` objc
-(void) aMethod
{
    char *enc1 = @encode(int);                 // enc1 = "i"
    char *enc2 = @encode(id);                  // enc2 = "@"
    char *enc3 = @encode(@selector(aMethod));  // enc3 = ":"

    // practical example:
    CGRect rect = CGRectMake(0, 0, 100, 100);
    NSValue *v = [NSValue value:&rect withObjCType:@encode(CGRect)];
}
```

## @compatibility_alis 

@compatibility_alis 是用于给一个类设置一个别名。这样就不用重构以前的类文件就可以用新的名字来替代原有名字。

示例如下：

``` objc
@compatibility_alias AliasClassName ExistingClassName
```

## @autoreleasepool

@autoreleasepool 是用于 ARC 下代替 NSAutoreleasePool 的保留字，我把它写在这里，是想告诉那些以为 ARC 慢的同学，在苹果的 [这篇官方文档](http://developer.apple.com/library/ios/#releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html) 中有提到， @autoreleasepool 比 NSAutoreleasePool 快 6 倍。当然，文档中也提到，ARC 下不止 Autorelease Pool 的实现变快了，retain 和 release 也快很多。如果你还没有在工程中使用 ARC，推荐看看我的 [《是否应该使用 ARC》](http://blog.devtang.com/blog/2013/03/27/should-we-use-arc/)。

## Cheat Sheet

有一个热心者根据他的博文，制作了一张 [《Objective-C 2.0 保留字速查表》](http://maniacdev.com/cheatsheetobjccd.pdf)，对于新手来说，把这张速查表打印出来，对于熟悉现在的保留字还是很有用的，它的下载地址是：<http://maniacdev.com/cheatsheetobjccd.pdf>

五一节到了，祝大家节日快乐！

