---
layout: post
title: "iOS 开发中的争议（一）"
date: 2015-03-15 20:53:41 +0800
comments: true
categories: iOS
---

{% img /images/controversy.jpg %}

打算分享一些有争议的话题，并且表达一下我的看法。这是该系列的第一篇，我想讨论的是：类的成员变量应该如何定义？

在 Objective-C 的语言的早期，类的私有成员变量是只能定义在 .h 的头文件里面的。像如下这样：

```
@interface ViewController : UIViewController {
    @private
    NSInteger _value;
}
```

之后，苹果改进了 Objective-C，允许在 .m 里面添加一个特殊的匿名 Category，即没有名字的 Category，来实现增加类的成员变量。像如下这样：

```
@interface ViewController ()

@property (nonatomic) NSInteger value;

@end
```

这样的好处是，这些变量在头文件中被彻底隐藏起来了，不用暴露给使用者。

接着，在 2013 年的 WWDC 中，苹果进一步改进了 Objective-C，允许在 .m 的 
`@implementation` 中直接添加类的私有成员变量。像如下这样：

```
@implementation ViewController {
    NSInteger _value;
}
```

于是，大家对于如何定义私有的成员变量上就产生的分歧。许多人喜欢用匿名的 Category 的方式来定义私有成员变量。但是，我个人更推荐在 `@implementation` 中直接添加类的私有成员变量。下面我做一些解释。

### 历史原因

首先早期的 iOS 程序员一定知道，在 2011 年 ARC 被推出之前，Objective-C 是需要手工地管理引用计数的。而对类的所有私有成员使用 `self.property` 的形式，就可以使编译器为我们自动生成管理引用计数的代码。在 2012 年前，这个 feature 还需要使用 `@synthesize` 关键字来启用的。于是，苹果通过在代码规范中推荐和强调使用 `self.property` 的编程习惯，来让大家避免在内存管理中遇到问题。而在 ARC 时代，这个编程习惯带来的优势不再存在了，因为编译器会自动为我们管理引用计数，我们只需要关心不要造成循环引用问题就行了。

## 省心省事

刚刚说到，在类中完全使用 `_property` 的方式来访问私有成员变量，是不会有内存管理上的问题的。但是使用 `self.property` 的方式来访问私有变量是不是也是一样不会有内存管理上的问题呢？确实也是，但是有一点需要注意：我们最好不要在 init 和 dealloc 中使用 `self.property` 的方式来访问成员变量，这一点是写在苹果的官方文档里的，我在以前的文章里也介绍过。(见：[《不要在init和dealloc函数中使用accessor》](http://blog.devtang.com/blog/2011/08/10/do-not-use-accessor-in-init-and-dealloc-method/)）

所以，如果你用 `self.property` 来访问私有成员变量。那么你需要注意，在 init 和 dealloc 中不使用这种方式。这其实对程序员来说是一个负担，你需要不停提醒自己有没有犯错。如果你使用完全的 `_property` 的方式来访问私有成员变量，就不用想这一类问题了。

## 关于隐藏

大家知道，`self.property` 其实是调用了类的 `[self property]` 方法，所以这其实是有一层方法调用的隐藏，很多时候，我们需要延迟初使化一个类成员的时候，就会把这个成员的初使化方法写在这个 `[self property]` 方法的实现中。

那么问题来了，当你在阅读别人代码时，看到 `self.property` 的时候，你会想：这里会不会有一些隐藏的函数实现？于是你需要跳转到其方法实现中去查找。但是在实际开发中，大部分的 property 其实是使用编译器自动生成的 Getter 和 Setter 方法，于是你会找不到实现，这个时候，你才知道：“哦，原来这段代码并没有做自定义的成员初使化工作”。

这种默认的隐藏在代码中多了，会影响代码的阅读和维护。其实大部分的类成员变量都需要在类初使化方法中赋值，大部分的 UIViewController 的成员变量，都需要在 `viewDidLoad` 方法中赋值。那既然这样，不如直接在相应的方法中用一个名为 `setupProperty` 方法直接进行初使化。这样的好处是，代码的可读性更好了，`self.property` 只有需要延迟初使化的情况下才被使用。

关于这个还有一个小故事，我之前 Review 过一个同事的 iOS 端代码，那个同事喜欢把 table view 的数据另外封装成一个类，而我觉得这些数据其实就是一个数组，没必要进行这一层封装，最终我们争论了比较久。我的观点是，一切隐藏都是对代码复杂性的增加，除非它带来了好处，例如达到了代码复用，提高了代码的可维护性等，否则，没有好处的封装只会给代码阅读理解带来成本。就我现在的经历中，大部分的 table view 的数据都可以放在一个数组中，没必要把这个数组封装起来，另外提供一套操作这个数组数据的方法。

## 简短的代码更易读

`_property` 的写法比 `self.property` 更短，也更简单。我认为这样写出来的代码更方便阅读。

## 执行速度更快，IPA体积更小

我之前从来没想到过这两者之间的速度和应用体积会有很大差别。不过一个同行（来自国外著名的社交网络公司）告诉我，他们公司发现二者还是有不小的差距，如果你们的应用需要做一些深度优化，可以考虑一下把 `self.property` 换成 `_property`。但我觉得，大部分应用都应该是不需要做这种深度优化的。

## KVO 和 KVC

是的，如果用 `_property` 这种写法，就不能使用 KVO 和 KVC 了。但是我得反问一下，在一个类的内部，KVO 自己的私有成员变量算是一个好设计吗？我们讲类要"高内聚，低耦合"，KVO 是为了实现观察者模式，让对象之间相互解耦的。如果把 KVO 用在类的内部，KVO 自己的私有成员，我认为其实这不是一个很好的设计。

## Computed Properties

在 Swift 中，引入了 [Computed Properties](https://developer.apple.com/library/prerelease/ios/documentation/Swift/Conceptual/Swift_Programming_Language/Properties.html#//apple_ref/doc/uid/TP40014097-CH14-ID259) 的概念，其实这在 Objective-C 中也有，只是没有专门给它名字。如果一个 property 我们提供了对应的 `setter` 和 `getter`，并且没有直接使用其对应的 _property 变量，那么这个 property 就是所谓的 Computed Properties。

是的，在类的内部如果直接使用 `_property` 形式，也无法使用 Computed Properties 了，但我认为这影响不大。其实 Computed Properties 也就是一层对数据存取的封装，我们另外实现两个函数，分别对应数据的 `setter` 和 `getter` 功能，就可以达到同样的效果。

## 循环引用问题

微博上的[@王_晓磊](http://weibo.com/n/%E7%8E%8B_%E6%99%93%E7%A3%8A?from=feed&loc=at)在评论中提到：直接用私有变量有个需要特别注意的地方，在 block 里直接写 `_property` 相当于 `self->_property`，虽然没写 self，但是暗含了对 self 的retain，容易造成循环引用。要记得用 weakSelf/strongSelf 大法。

这一点确实是被很多人忽视的，所以我也一并写在这里，感谢他的补充。

## 写在最后

其实我上面提到的这些问题都是小问题，影响不大。但是代码风格的统一却是大问题。所以不管你们项目中使用的是 `self.property` 风格还是 `_property` 风格，问题都不大，但是如果你们同时使用这两种风格，那么就非常不好了。

希望我的这篇文章能让大家了解到在这方面的争论，也希望大家能够在这一点上，在公司内部达成统一。

