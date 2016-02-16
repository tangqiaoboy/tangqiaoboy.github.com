---
layout: post
title: "谈ObjC对象的两段构造模式"
date: 2013-01-13 10:15
comments: true
categories: iOS
---

## 前言

Objective-c 语言在申请对象的时，需要使用两段构造 ([Two Stage Creation](http://volonbolon.net/post/634999801/two-stage-creation-in-cocoa)) 的模式。一个对象的创建，需要先调用 alloc 方法或 allocWithZone 方法，再调用 init 方法或 initWithSomething 方法。如下是一个 NSString 对象的创建示例：

``` objc
NSString * str = [[NSString alloc] initWithString:@"http://blog.devtang.com"];
```

由于该语言的对象创建方法和大多数其它语言（如 C、C++、Java、JavaScript）都不一样，所以引起了我的好奇。是什么原因促使 Objective-C 做了这种设计，而又是什么原因促使大多数其它语言都采用 "new" 方法来一次性创建对象呢？

在看了 [《Cocoa Design Patterns》](http://www.amazon.com/Cocoa-Design-Patterns-Erik-Buck/dp/0321535022) 一书（顺便吐槽一下该书中文版翻译质量不高，建议看英文版），并且做了一些调研之后，我将总结分享给大家，欢迎大家讨论。

<!-- more -->

## 对象的创建

我们先来看看在对象的创建过程中，alloc 和 init 到底做了哪些事情。

###  alloc 方法
根据苹果的 [官方文档](https://developer.apple.com/library/mac/#documentation/cocoa/conceptual/CocoaFundamentals/CocoaObjects/CocoaObjects.html#//apple_ref/doc/uid/TP40002974-CH4-SW54)。当对象创建时，cocoa 会从应用程序的虚拟地址空间上为该对象分配足够的内存。cocoa 会遍历该对象所有的成员变量，通过成员变量的类型来计算所需占用的内存。

当我们通过 alloc 或 allocWithZone 方法创建对象时，cocoa 会返回一个未” 初使化 “过的对象。在这个过程中，cocoa 除了上面提到的申请了一块足够大的内存外，还做了以下 3 件事：

 1. 将该新对象的引用计数 (Retain Count) 设置成 1。
 2. 将该新对象的 isa 成员变量指向它的类对象。
 3. 将该新对象的所有其它成员变量的值设置成零。（根据成员变量类型，零有可能是指 nil 或 Nil 或 0.0）

isa 成员变量是在 [NSObject](https://developer.apple.com/library/mac/#documentation/cocoa/Reference/Foundation/Classes/NSObject_Class/Reference/Reference.html#//apple_ref/occ/cl/NSObject) 中定义的，所以保证 Cocoa 的所有对象都带有此成员变量。借助该变量可以实现 Cocoa 对象在运行时的自省 (Introspection) 功能。

### init 方法

大部分情况下，我们都不希望所有成员变量都是零，所以 init 方法会做真正的初使化工作，让对象的成员变量的值符合我们程序逻辑中的初始化状态。例如，NSMutableString 可能就会额外再申请一块字符数组，用于动态修改字符串。

init 还有一个需要注意的问题。某些情况下，init 会造成 alloc 的原本空间不够用，而第二次分配内存空间。所以下面的写法是错的：

``` objc
NSString * s = [NSString alloc];
[s init]; // 这儿 init 返回的地址可能会变。s 原本的指针地址可能是无效的地址。
```

为此，苹果引入了一个编程规范，让大家写的时候将 alloc 和 init 写在一行。所以上面的代码正确的写法是

``` objc
NSString * s = [[NSString alloc] init];
```

### new

在后来，苹果也引入了类方法：new。但是由于历史原因，init 方法是实例方法而非类方法，所以作为类方法的 new，只能简单地等价于 alloc + init，不能指定 init 的参数，所以用处不大。苹果在设计上也禁止多次调用 init 方法，例如如下代码会抛出 NSInvalidArgumentException。

``` objc
NSString * str = [NSString new];
str = [str initWithString:@"Bar"];
```

## 为什么这么设计

说回来文章开始时提出来问题，为什么苹果要这么设计而其它语言不这么设计？

上面提到，alloc 其实不只干了申请内存的事情，还做了：
 1. 内存管理的事情，设置 Retain Count。
 2. 运行时自省的功能，设置 isa 变量。
 3. 非逻辑性的初使化功能，设置所有成员变量为零。

简单看来，根据设计模式的 Single Responsibility 的设计原则，苹果觉得 alloc 和 init 是做的 2 件不同的事情，把这两件事情分开放在 2 个函数中，对于程序员更加清楚明了。更详细查阅文档后，我觉得这是由于历史原因，让苹果觉得 alloc 方法过于复杂，在历史上，alloc 不仅仅是分配内存，还可以详细的指定该内存所在的内存分区（用 NSZone 表示）。这就是下面要提到的 allocWithZone 方法。

在 [《Cocoa Design Patterns》](http://www.amazon.com/Cocoa-Design-Patterns-Erik-Buck/dp/0321535022) 一书也提到，早期苹果是建议程序员使用 allocWithZone 来管理内存分配的，每个 NSZone 表示一块内存分区，allowWithZone 方法可以允许对象从指定分区分配内存。了解到这段历史后，也不难理解苹果这么设计的原因了。因为在这种情况下，alloc 要处理的情况复杂，和 init 放到一起不合适。

而对于大多数出生在 90 年代的语言来说 (例如 Java,JavaScript,C#)，由于内存具体的分配方案都不需要程序员操心了，所以就不需要单独为内存分配实现一个 alloc 方法了。

## 后记

### allocWithZone 被废弃
自从 Mac OS X 10.5 上引入了垃圾回收机制后，苹果就不建议程序员使用 allocWithZone 了，事实上，cocoa 框架也会忽略 allocWithZone 指定的分区。苹果在文档中也 [提到](https://developer.apple.com/library/mac/#documentation/cocoa/Reference/Foundation/Classes/NSObject_Class/Reference/Reference.html#//apple_ref/occ/clm/NSObject/allocWithZone:)，allocWithZone 仅仅是一个历史遗留设计了。下图是苹果的文档截图：

{% img /images/allocWithZone.png  %}

## Objective-C 的历史

Objective-C 是一门非常老的语言。如果你查阅文档，你会发现它和 C++ 出生在同一时代（两种语言的发行年份都是 [1983 年](http://en.wikipedia.org/wiki/Stepstone)），都是作为 C 语言的面向对象的接班人被推出。当然，最终 C++ 胜出。由于历史久远，Objective-C 也无法有太多优秀的语言做参考，所以，有很多历史遗留的设计。在 2007 年苹果公司发布了 Obj-C 2.0, 对其进行了大量改进。

在最近几年的 WWDC 大会上，每年苹果都会对 Objective-C 和其对应的 LLVM 编译器进行改进，例如 WWDC2011 推出的 ARC，WWDC2012 推出的 Object Literals 等。所以现在使用 Objective-C 做开发已经非常舒服了。期待苹果给开发者带来更多惊喜。

