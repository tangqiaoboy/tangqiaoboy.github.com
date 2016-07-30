---
title: 理解 iOS 的内存管理
categories: iOS
date: 2016-07-30 08:43:42
tags:
---


## 远古时代的故事

那些经历过手工管理内存（MRC）时代的人们，一定对 iOS 开发中的内存管理记忆犹新。那个时候大约是 2010 年，国内 iOS 开发刚刚兴起，tinyfool 大叔的大名已经如雷贯耳，而我还是一个默默无闻的刚毕业的小子。那个时候的 iOS 开发过程是这样的：

> 我们先写好一段 iOS 的代码，然后屏住呼吸，开始运行它，不出所料，它崩溃了。在 MRC 时代，即使是最牛逼的 iOS 开发者，也不能保证一次性就写出完美的内存管理代码。于是，我们开始一步一步调试，试着打印出每个怀疑对象的引用计数（Retain Count），然后，我们小心翼翼地插入合理的 `retain` 和 `release` 代码。经过一次又一次的应用崩溃和调试，终于有一次，应用能够正常运行了！于是我们长舒一口气，露出久违的微笑。

是的，这就是那个年代的 iOS 开发者，通常情况下，我们在开发完一个功能后，需要再花好几个小时，才能把引用计数管理好。

苹果在 2011 年的时候，在 WWDC 大会上提出了自动的引用计数（ARC）。ARC 背后的原理是依赖编译器的静态分析能力，通过在编译时找出合理的插入引用计数管理代码，从而彻底解放程序员。

在 ARC 刚刚出来的时候，业界对此黑科技充满了怀疑和观望，加上现有的 MRC 代码要做迁移本来也需要额外的成本，所以 ARC 并没有被很快接受。直到 2013 年左右，苹果认为 ARC 技术足够成熟，直接将 macOS（当时叫 OS X）上的垃圾回收机制废弃，从而使得 ARC 迅速被接受。

2014 年的 WWDC 大会上，苹果推出了 Swift 语言，而该语言仍然使用 ARC 技术，作为其[内存管理方式](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/AutomaticReferenceCounting.html)。

为什么我要提这段历史呢？就是因为现在的 iOS 开发者实在太舒服了，大部分时候，他们根本都不用关心程序的内存管理行为。但是，**虽然 ARC 帮我们解决了引用计数的大部分问题，一些年轻的 iOS 开发者仍然会做不好内存管理工作**。他们甚至不能理解常见的循环引用问题，而这些问题会导致内存泄漏，最终使得应用运行缓慢或者被系统终止进程。

所以，我们每一个 iOS 开发者，需要理解引用计数这种内存管理方式，只有这样，才能处理好内存管理相关的问题。

## 什么是引用计数

引用计数（Reference Count）是一个简单而有效的管理对象生命周期的方式。当我们创建一个新对象的时候，它的引用计数为 1，当有一个新的指针指向这个对象时，我们将其引用计数加 1，当某个指针不再指向这个对象是，我们将其引用计数减 1，当对象的引用计数变为 0 时，说明这个对象不再被任何指针指向了，这个时候我们就可以将对象销毁，回收内存。由于引用计数简单有效，除了 Objective-C 和 Swift 语言外，微软的 COM（Component Object Model ）、C++11（C++11 提供了基于引用计数的智能指针 share_prt）等语言也提供了基于引用计数的内存管理方式。

{% img /images/memory-ref-count.png %}

为了更形象一些，我们再来看一段 Objective-C 的代码。新建一个工程，因为现在默认的工程都开启了自动的引用计数 ARC（Automatic Reference Count)，我们先修改工程设置，给 AppDelegate.m 加上 `-fno-objc-arc` 的编译参数（如下图所示），这个参数可以启用手工管理引用计数的模式。

{% img /images/memory-fno-objc-arc.png %}

然后，我们在中输入如下代码，可以通过 Log 看到相应的引用计数的变化。

``` objc
- (BOOL)application:(UIApplication *)application 
       didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    NSObject *object = [[NSObject alloc] init];
    NSLog(@"Reference Count = %u", [object retainCount]);
    NSObject *another = [object retain];
    NSLog(@"Reference Count = %u", [object retainCount]);
    [another release];
    NSLog(@"Reference Count = %u", [object retainCount]);
    [object release];
    // 到这里时，object 的内存被释放了
    return YES;
}
```

运行结果：

```
Reference Count = 1
Reference Count = 2
Reference Count = 1
```

对 Linux 文件系统比较了解的同学可能发现，引用计数的这种管理方式类似于文件系统里面的硬链接。在 Linux 文件系统中，我们用 `ln` 命令可以创建一个硬链接（相当于我们这里的 retain)，当删除一个文件时（相当于我们这里的 release)，系统调用会检查文件的 link count 值，如果大于 1，则不会回收文件所占用的磁盘区域。直到最后一次删除前，系统发现 link count 值为 1，则系统才会执行直正的删除操作，把文件所占用的磁盘区域标记成未用。

## 我们为什么需要引用计数

从上面那个简单的例子中，我们还看不出来引用计数真正的用处。因为该对象的生命期只是在一个函数内，所以在真实的应用场景下，我们在函数内使用一个临时的对象，通常是不需要修改它的引用计数的，只需要在函数返回前将该对象销毁即可。

引用计数真正派上用场的场景是在面向对象的程序设计架构中，用于对象之间传递和共享数据。我们举一个具体的例子：

假如对象 A 生成了一个对象 M，需要调用对象 B 的某一个方法，将对象 M 作为参数传递过去。在没有引用计数的情况下，一般内存管理的原则是 “谁申请谁释放”，那么对象 A 就需要在对象 B 不再需要对象 M 的时候，将对象 M 销毁。但对象 B 可能只是临时用一下对象 M，也可能觉得对象 M 很重要，将它设置成自己的一个成员变量，那这种情况下，什么时候销毁对象 M 就成了一个难题。

{% img /images/memory-talk-1.png %}

对于这种情况，有一个暴力的做法，就是对象 A 在调用完对象 B 之后，马上就销毁参数对象 M，然后对象 B 需要将参数另外复制一份，生成另一个对象 M2，然后自己管理对象 M2 的生命期。但是这种做法有一个很大的问题，就是它带来了更多的内存申请、复制、释放的工作。本来一个可以复用的对象，因为不方便管理它的生命期，就简单的把它销毁，又重新构造一份一样的，实在太影响性能。如下图所示：

{% img /images/memory-talk-2.png %}

我们另外还有一种办法，就是对象 A 在构造完对象 M 之后，始终不销毁对象 M，由对象 B 来完成对象 M 的销毁工作。如果对象 B 需要长时间使用对象 M，它就不销毁它，如果只是临时用一下，则可以用完后马上销毁。这种做法看似很好地解决了对象复制的问题，但是它强烈依赖于 AB 两个对象的配合，代码维护者需要明确地记住这种编程约定。而且，由于对象 M 的申请是在对象 A 中，释放在对象 B 中，使得它的内存管理代码分散在不同对象中，管理起来也非常费劲。如果这个时候情况再复杂一些，例如对象 B 需要再向对象 C 传递对象 M，那么这个对象在对象 C 中又不能让对象 C 管理。所以这种方式带来的复杂性更大，更不可取。

{% img /images/memory-talk-3.png %}

所以引用计数很好的解决了这个问题，在参数 M 的传递过程中，哪些对象需要长时间使用这个对象，就把它的引用计数加 1，使用完了之后再把引用计数减 1。所有对象都遵守这个规则的话，对象的生命期管理就可以完全交给引用计数了。我们也可以很方便地享受到共享对象带来的好处。

## 不要向已经释放的对象发送消息

有些同学想测试当对象释放时，其 `retainCount` 是否变成了 0，他们的试验代码如下：


``` objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    NSObject *object = [[NSObject alloc] init];
    NSLog(@"Reference Count = %u", [object retainCount]);
    [object release];
    NSLog(@"Reference Count = %u", [object retainCount]);
    return YES;
}

```

但是，如果你真的这么实验，你得到的输出结果可能是以下这样：

```
Reference Count = 1
Reference Count = 1
```

我们注意到，最后一次输出，引用计数并没有变成 0。这是为什么呢？因为该对象的内存已经被回收，而我们向一个已经被回收的对象发了一个 retainCount 消息，所以它的输出结果应该是不确定的，如果该对象所占的内存被复用了，那么就有可能造成程序异常崩溃。

那为什么在这个对象被回收之后，这个不确定的值是 1 而不是 0 呢？这是因为当最后一次执行 release 时，系统知道马上就要回收内存了，就没有必要再将 retainCount 减 1 了，因为不管减不减 1，该对象都肯定会被回收，而对象被回收后，它的所有的内存区域，包括 retainCount 值也变得没有意义。不将这个值从 1 变成 0，可以减少一次内存的写操作，加速对象的回收。

拿我们之前提到的 Linux 文件系统举列，Linux 文件系统下删除一个文件，也不是真正的将文件的磁盘区域进行抹除操作，而只是删除该文件的索引节点号。这也和引用计数的内存回收方式类似，即回收时只做标记，并不抹除相关的数据。

## ARC 下的内存管理问题

ARC 能够解决 iOS 开发中 90% 的内存管理问题，但是另外还有 10% 内存管理，是需要开发者自己处理的，这主要就是与底层 Core Foundation 对象交互的那部分，底层的 Core Foundation 对象由于不在 ARC 的管理下，所以需要自己维护这些对象的引用计数。

对于 ARC 盲目依赖的 iOS 新人们，由于不知道引用计数，他们的问题主要体现在：

 1. 过度使用 block 之后，无法解决循环引用问题。
 1. 遇到底层 Core Foundation 对象，需要自己手工管理它们的引用计数时，显得一筹莫展。

### 循环引用（Reference Cycle）问题

引用计数这种管理内存的方式虽然很简单，但是有一个比较大的瑕疵，即它不能很好的解决循环引用问题。如下图所示：对象 A 和对象 B，相互引用了对方作为自己的成员变量，只有当自己销毁时，才会将成员变量的引用计数减 1。因为对象 A 的销毁依赖于对象 B 销毁，而对象 B 的销毁与依赖于对象 A 的销毁，这样就造成了我们称之为循环引用（Reference Cycle）的问题，这两个对象即使在外界已经没有任何指针能够访问到它们了，它们也无法被释放。

{% img /images/memory-cycle-1.png %}

不止两对象存在循环引用问题，多个对象依次持有对方，形式一个环状，也可以造成循环引用问题，而且在真实编程环境中，环越大就越难被发现。下图是 4 个对象形成的循环引用问题。

{% img /images/memory-cycle-2.png %}

解决循环引用问题主要有两个办法，第一个办法是我明确知道这里会存在循环引用，在合理的位置主动断开环中的一个引用，使得对象得以回收。如下图所示：

{% img /images/memory-cycle-3.png %}

主动断开循环引用这种方式常见于各种与 block 相关的代码逻辑中。例如在我开源的 [YTKNetwork](https://github.com/yuantiku/YTKNetwork) 网络库中，网络请求的回调 block 是被持有的，但是如果这个 block 中又存在对于 View Controller 的引用，就很容易产生从循环引用，因为：

 * Controller 持有了网络请求对象
 * 网络请求对象持有了回调的 block
 * 回调的 block 里面使用了 `self`，所以持有了 Controller

解决办法就是，在网络请求结束后，网络请求对象执行完 block 之后，主动释放对于 block 的持有，以便打破循环引用。相关的代码见：

```
// https://github.com/yuantiku/YTKNetwork/blob/master/YTKNetwork/YTKBaseRequest.m
// 第 147 行：
- (void)clearCompletionBlock {
    // 主动释放掉对于 block 的引用
    self.successCompletionBlock = nil;
    self.failureCompletionBlock = nil;
}
```

不过，主动断开循环引用这种操作依赖于程序员自己手工显式地控制，相当于回到了以前 “谁申请谁释放” 的内存管理年代，它依赖于程序员自己有能力发现循环引用并且知道在什么时机断开循环引用回收内存（这通常与具体的业务逻辑相关），所以这种解决方法并不常用，更常见的办法是使用弱引用 (weak reference) 的办法。

弱引用虽然持有对象，但是并不增加引用计数，这样就避免了循环引用的产生。在 iOS 开发中，弱引用通常在 delegate 模式中使用。举个例子来说，两个 ViewController A 和 B，ViewController A 需要弹出 ViewController B，让用户输入一些内容，当用户输入完成后，ViewController B 需要将内容返回给 ViewController A。这个时候，View Controller 的 delegate 成员变量通常是一个弱引用，以避免两个 ViewController 相互引用对方造成循环引用问题，如下所示：

{% img /images/memory-cycle-4.png %}

### 使用 Xcode 检测循环引用

Xcode 的 Instruments 工具集可以很方便的检测循环引用。为了测试效果，我们在一个测试用的 ViewController 中填入以下代码，该代码中的 `firstArray` 和 `secondArray` 相互引用了对方，构成了循环引用。

```
- (void)viewDidLoad
{
    [super viewDidLoad];
    NSMutableArray *firstArray = [NSMutableArray array];
    NSMutableArray *secondArray = [NSMutableArray array];
    [firstArray addObject:secondArray];
    [secondArray addObject:firstArray];
}

```

在 Xcode 的菜单栏选择：Product -> Profile，然后选择 “Leaks”，再点击右下角的”Profile” 按钮开始检测。如下图

{% img /images/memory-instruments-1.png %}

这个时候 iOS 模拟器会运行起来，我们在模拟器里进行一些界面的切换操作。稍等几秒钟，就可以看到 Instruments 检测到了我们的这次循环引用。Instruments 中会用一条红色的条来表示一次内存泄漏的产生。如下图所示：

{% img /images/memory-instruments-2.png %}

我们可以切换到 Leaks 这栏，点击”Cycles & Roots”，就可以看到以图形方式显示出来的循环引用。这样我们就可以非常方便地找到循环引用的对象了。

{% img /images/memory-instruments-3.png %}

### Core Foundation 对象的内存管理

下面我们就来简单介绍一下对底层 Core Foundation 对象的内存管理。底层的 Core Foundation 对象，在创建时大多以 XxxCreateWithXxx 这样的方式创建，例如：

```
// 创建一个 CFStringRef 对象
CFStringRef str= CFStringCreateWithCString(kCFAllocatorDefault, “hello world", kCFStringEncodingUTF8);

// 创建一个 CTFontRef 对象
CTFontRef fontRef = CTFontCreateWithName((CFStringRef)@"ArialMT", fontSize, NULL);

```

对于这些对象的引用计数的修改，要相应的使用 `CFRetain` 和 `CFRelease` 方法。如下所示：

```

// 创建一个 CTFontRef 对象
CTFontRef fontRef = CTFontCreateWithName((CFStringRef)@"ArialMT", fontSize, NULL);

// 引用计数加 1
CFRetain(fontRef);
// 引用计数减 1
CFRelease(fontRef);

```

对于 `CFRetain` 和 `CFRelease` 两个方法，读者可以直观地认为，这与 Objective-C 对象的 `retain` 和 `release` 方法等价。

所以对于底层 Core Foundation 对象，我们只需要延续以前手工管理引用计数的办法即可。

除此之外，还有另外一个问题需要解决。在 ARC 下，我们有时需要将一个 Core Foundation 对象转换成一个 Objective-C 对象，这个时候我们需要告诉编译器，转换过程中的引用计数需要做如何的调整。这就引入了`bridge`相关的关键字，以下是这些关键字的说明：

* `__bridge`: 只做类型转换，不修改相关对象的引用计数，原来的 Core Foundation 对象在不用时，需要调用 CFRelease 方法。
* `__bridge_retained`：类型转换后，将相关对象的引用计数加 1，原来的 Core Foundation 对象在不用时，需要调用 CFRelease 方法。
* `__bridge_transfer`：类型转换后，将该对象的引用计数交给 ARC 管理，Core Foundation 对象在不用时，不再需要调用 CFRelease 方法。

我们根据具体的业务逻辑，合理使用上面的 3 种转换关键字，就可以解决 Core Foundation 对象与 Objective-C 对象相对转换的问题了。

## 总结

在 ARC 的帮助下，iOS 开发者的内存管理工作已经被大大减轻，但是我们仍然需要理解引用计数这种内存管理方式的优点和常见问题，特别要注意解决循环引用问题。对于循环引用问题有两种主要的解决办法，一是主动断开循环引用，二是使用弱引用的方式避免循环引用。对于 Core Foundation 对象，由于不在 ARC 管理之下，我们仍然需要延续以前手工管理引用计数的办法。

在调试内存问题时，Instruments 工具可以很好地对我们进行辅助，善用 Instruments 可以节省我们大量的调试时间。

愿每一个 iOS 开发者都可以掌握 iOS 的内存管理技能。
