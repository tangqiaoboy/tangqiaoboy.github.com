---
layout: post
title: "ReactiveCocoa 讨论会"
date: 2016-01-03 15:22:13 +0800
comments: true
categories: iOS
---

## 前言

[ReactiveCocoa](https://github.com/ReactiveCocoa/ReactiveCocoa)（其简称为 RAC）是由 [Github](https://github.com/blog/1107-reactivecocoa-for-a-better-world) 开源的一个应用于 iOS 和 OS X 开发的新框架。RAC 具有函数式编程和响应式编程的特性。它主要吸取了 .Net 的 [Reactive Extensions](http://msdn.microsoft.com/en-us/data/gg577609) 的设计和实现。

但是，相对于传统的 MVC 架构，ReactiveCocoa 的函数式编程方式的学习曲线陡峭，业界也没有丰富的图书资料，这使得大家对这种技术望而却步。这次，我邀请了一些行业内关注和使用 ReactiveCocoa 的内行，进行了一次关于 RAC 的讨论会，会上大家主要聊了 RAC 在使用中的各种问题，我们希望这次讨论会能够让重新全面审视这个开发框架。

## 讨论成员

本次讨论会邀请到的讨论者来自美团，百度，蘑菇街等公司。讨论前为了先相互认识，我让大家自我介绍了一下，并且顺便简单介绍各自所在的团队人数以及使用 RAC 的时长，以下是大家的自我介绍：

 * 臧成威，来自美团，团队基本都在使用 RAC，从 14 年初开始使用 RAC。在美团搞过 RAC 的几期培训，有丰富的经验。

 * 李忠 (limboy)，来自蘑菇街。李忠的博客（<http://limboy.me/>）上有很多介绍 RAC 的高质量文章。（这次讨论会李忠当时有事没有参加，事后对相关问题留言表达了自己的看法）

 * 唐晓轩 (txx)，来自礼物说，团队四个人，目前 “只有” 礼物说这一款产品。从年初开始使用 RAC，到现在正在安利 Android  团队使用 RXJava。

 * 孙源 (sunnyxx)，来自百度，从 13 年年底开始接触 RAC，当时边学边用 RAC 写了一个完整的项目，那时候还没现在这么火（当时 Limboy 的文章看了好几遍），后来在项目中在一个完整模块中尝试使用过，因为大家对函数响应式编程了解程度差别很大，导致代码几乎无法维护，随后重构。现在也有时用到，但都用于某个特定的功能的便捷实现上，无 MVVM，基本不会跨类使用。

 * 雷纯锋，来自广州支点网络科技股份有限公司，团队三个人使用 RAC ，从 12 年 6 月份开始使用 RAC ，公司项目一直使用的是 RAC。项目中一直也是用的 MVVM + RAC 的结构，另外我也有在维护一个 MVVM + RAC 的开源项目，叫 MVVMReactiveCocoa。

 * 汤圣罡 (lexurs)，来自新味，2 个 iOS。RAC 经验两年。目前在用 Overcoat+Mantle+ReactiveCocoa 实现的网络层，某些逻辑多的页面也喜欢用 RAC 实现。因为想全部改成 Swift，正在投靠 RxSwift 和 PromiseKit 的过程中。

 * 李雄略 (听榆大叔)，来自网家缘科技，分 2 个产品，每个产品 2 个 iOS 开发，从 14 年 3 月份开始使用 RAC，已在 3 个项目中使用 RAC。

 * 蓝晨钰 (lancy)，来自猿题库，没有在公司项目使用过 RAC。个人喜欢 RAC，私底下写过 RAC 的小项目，读过 RAC 源码，但对 RAC 在大型项目中和团队合作中持谨慎态度，猿题库的架构是类 MVVM 架构，但没有引入 RAC。

 * 唐巧（就是本文作者），来自猿题库，团队分 3 个产品，每个产品约 4 个 iOS 开发，没有在公司正式使用过 RAC，自己私下写过几百行 RAC 的代码，对于 RAC 是比较保守的一个人。

好了，以下就是我们具体讨论的一些问题。

### 讨论：如何在团队内推广并用「正确的姿势」使用 RAC？

大家提到在使用 RAC 的时候，出现的一些问题，例如：
 
 * 不是太精通 RAC 的同学往往写出来的非常难以维护
 * 不知道新队友的 RAC 培养路径，Functional Programming -> MVVM -> ....

对于难以维护的问题，臧成威的意见是：

> 这个美团这边的解决方案主要是 review，review 可以保证项目中所有人的范式是相同的，大家对于不同的写法都会有充分的讨论，而我们的新手主要是参考旧代码的风格写出新代码，所以并没有发生难以维护这一现象。
>
> 但是前提是需要有很熟悉的人来带领，团队中熟悉 RAC 的人员基数得以保证。而且美团的 RAC 使用还是逐步放量的，从一开始的 UI 层使用，到底层逻辑层的使用，最后才到了 MVVM 的粘合层使用，这样避免了泛滥。
>
> 总结来说，对于 RAC 这样厚重的库，引入的时候的 review 是必要的，否则可控性太差，最后就难以收场了。

总结起来就是：1、review + 有熟练的人带；2、逐步放开使用。

对于人才的培养，臧成威的意见是：

>RAC 的培养，从我这边三期的培训来看，课程的安排是这样的六节： 1. FRP 的思想概要 2. RAC 的 operations 介绍 3. 冷信号与热信号解惑 4. 生命周期指南 5. disposable 和多线程 6. 实战分享
>
> 其中先建立 FRP 的思想，虽然看起来是最远的，但是确实是后续使用和教学的基础。
>
> 一起培训大概有 30-50 人来听，课程一种持续三周，每周 2 节课、课程过后的 2 周，就可以发现代码中的 rac 使用明显提升
>
> 另外补充一点，关于新手学习，最不建议的就是在不了解 FRP 原理和一些基础概念的情况下，盲目的看源代码。我见过太多的同学，花费了很多的时间通览源码，但是根本没有用途。因为从思想到源代码是经历了很多雕琢的。里面有太多的 bugfix，太多的折中。
>
> 所以你看的时候，抛开了本质，一味的查看边界的处理，最后大都觉得痛苦，难用，难以掌握收场。
>
> 唐巧：RAC 确实和其它的开源库性质上差别比较大，思想方面需要学习的比较多。
>
> 是的，关键是思想。所以，一定要先从 “道” 上建立思想，然后从 “术” 上掌握使用，最后才是通览源码，掌握其原理。
>
> 第一节是道的课程，第二节是术的课程。这两节下来就知道能干什么了。

雷纯锋意见也与臧成威一致。

唐晓轩介绍了一下他自己的学习过程：

> 我是反着做的，先把 rac 当作 blocks kit 用 之后 看 racstream 的各种 operations，知道 rac 有哪些运算 其次 看 rac 的 uikit 扩展都是怎么实现的 最后才是函数式思维。

我顺着臧成威的回答，问了一下通常使用 RAC 的规范是什么，臧成威回答道：

> 大家可以参考这样的一条规范来做，首先通过 RACSignal#return RACSignal#createSignal 这类的创建一个 OOP 世界到 FRP 世界的一个转换，从而得到一个 Signal。
>
> 之后 signal 在不接触 OOP 的情况下进行数据的各类变换，注意 FP 的引用透明和变量不可变特性。
>
> 最后用 RAC 宏、RACSignal#subscribe、NSObject+liftSelect 这些操作把 FRP 的世界带回到 OOP 的世界里。

臧成威还很体贴地画了一个示意图，非常给力：

{% img /images/fpr_oop_pattern.jpg %}


### 讨论：大公司的大型 (臃肿) App 是否适合使用 RAC？

由于第一个话题臧成威贡献最多内容，加上美团是大家所知道的使用 RAC 最多的大型 App，所以这个话题还是由臧成威首先回答，以下是他的发言。

> 越大型的 app，说明内部的逻辑越复杂。而 RAC 从某几方面可以简化逻辑，使得代码从书写到执行都可以较为简化的完成功能
>
> 我大概总结了几个适用的场景。RAC 总结来说就是：数据随着时间而产生，所以能想到的三点比较适合用 RAC：
>
> 一、UI 操作，连续的动作与动画部分，例如某些控件跟随滚动。
>
> 二、网络库，因为数据是在一定时间后才返回回来，不是立刻就返回的。
>
> 三、刷新的业务逻辑，当触发点是多种的时候，业务往往会变得很复杂，用 delegate、notification、observe 混用，难以统一。这时用 RAC 可以保证上层的高度一致性，从而简化逻辑上分层。
>
> 只要有通知的业务逻辑，RAC 都方便有效化解。
>
> 雷纯锋：概括的说，应该就是统一所有异步事件吧。
>
> 不适用的场景，与时间无关的，需要积极求解的计算，例如视图的单次渲染。

接着发言的是百度的孙源：

> 我这是百度知道，体量比较小，可以随便玩。
>
> 我们现在就用它做点小功能，举个例子吧，聊天页面那个键盘弹出时 input bar 跟随滚动的功能，原来写需要接通知、写回调，现在在一个函数里面用 RAC 就比较方便。
>
> 像这种小功能，主要是方便开发，让 “干一个事儿的代码写在一个地方”。
>

雷纯锋说他们的使用还是比较多：

> 基本上异步的事件能用 RAC 的都用的 RAC。
>
> 不过代理方法用 RAC 的比较少，比如 UITableView 的代理方法一般都是直接写了。
>
> 用 RACSubject + RACComand 来简化和统一应用的错误处理逻辑，这个算比较经典的吧。
>
> 臧成威说：UI 交互上的点确实好多，比如下拉刷新、上拉导航条变透明。
>
> 实时响应用户的输入，控制按钮的可用性，这点用 RAC 来实现非常简单。

李雄略说：

> 我们主要用来处理界面上的数据显示，以及 UI 的交互操作上，不会用来写代理。

对于这个话题，似乎大家的答案还是比较一致，即：大型 App 是适合使用 RAC 的。


### 讨论：都说调试 RAC 很痛苦，是否有一些调试技巧和经验分享？

臧成威说：

> 的确很痛苦，跟断点有的时候计算堆栈都要等几分钟。
>
> 关于调试，RAC 源码下有 instruments 的两个插件，方便大家使用。
>
>signalEvents 这个可以看到流动的信号的发出情况，对于时序的问题可以比较好的解决。
>
>diposable 可以检查信号的 disposable 是否正常

{% img /images/rac-instrument.jpg %}

小伙伴们看了纷纷惊叹，表示以前没有用过这个神器。

雷纯锋接着分享：

> 我的理解是一般给信号一个名字，然后通过下面的打印方法来进行调试。

```
/// Logs all events that the receiver sends.
- (RACSignal *)logAll;

/// Logs each `next` that the receiver sends.
- (RACSignal *)logNext;

/// Logs any error that the receiver sends.
- (RACSignal *)logError;

/// Logs any `completed` event that the receiver sends.
- (RACSignal *)logCompleted;
```

李雄略说：

> 我是用 log 方法来做的：

```
DExecute(({
    setenv("RAC_DEBUG_SIGNAL_NAMES", "RAC_DEBUG_SIGNAL_NAMES", 0);
    [signalUserGeo setNameWithFormat:@"signalUserGeo"];
    signalUserGeo = [signalUserGeo logAll];
}));
```

李忠的补充：

> 调试的话，如果是性能调试，主要是经验 +Instruments，经验类似于：少用 RACCommand、RACSequence 这样的，Instruments 可以用它的 Time Profile 来看。
>
> 如果是 Bug 调试，主要还是靠 Log，配合一些 Xcode 插件，比如 MCLog(可以很方便地过滤日志)，如果要还原堆栈的话，就加一个断点。

接下来大家讨论起来：
>
> 臧成威：其实 instruments 也差不多，只是第一，不需要提前调用 logAll 这些；第二，可以利用 instruments 的筛选功能，不会看 log 看到眼花。
>
> 雷纯锋：实际调试起来好用吗？
>
> 臧成威：好用的，还可以看到发出 value 的堆栈。
>
> 雷纯锋：使用 instruments 来调试的频率大吗？或者说在什么情况下会去用 instruments 调试呢？
>
> 臧成威：一般调查问题的时候就它来查。比如某个信号接不到输出。
>
> 臧成威：或者输出的值里面有错误的，但是是经过 merge、zip 等好多操作混合出来的，不知道源头是神马。
>
> 雷纯锋：也就是说一般是在有问题，然后分析不出来的时候，才使用吗？
>
> 臧成威：是的，一般是调查问题的时候用的，不是开发的时候用的，因为打开是比较慢的。
>
> 李雄略：为了方便，我们保证一个 RACSignal 只会给订阅者 send 一种类型的 value，所以就手动给 signal 加了部分泛型支持：
>
> @interface RACSignal<__covariant ObjectType> : RACStream
>
> RACSignal<NSString *> *signal = ...
>
> 孙源：用泛型，然后 map 之后呢
>
> 李雄略：map 无法支持
>
> 臧成威：RAC3 里面就有不错的泛型推导，但是是基于 swift 的。
>
> 臧成威：这个我也想过，但是语言不支持，基本上是搞不定的
>
> 孙源：调试这块也就是 log name 了。作者 guide 里面也是这么弄，用 Instrument 已经是高级技巧。
>
> 臧成威：加 log 比较不好的就是容易眼花，还有不好还原当时的堆栈。
>
> 孙源：我一般遇到问题，都是看代码脑补一遍过程，函数式就好在这里，基本上看着对了结果就没错。脑回路逻辑推导。
>
> 臧成威：是的，推导很有道理。我觉得 sunnyxx 说的是王道，所以培训，给大家建立思维很重要。
>
> 雷纯锋：恩，分析清楚整个运算过程是很重要的

### 讨论：RAC 相比 RxSwift 和 PromiseKit 有哪些优缺点 ?

臧成威继续分享：

>RAC vs RxSwift 的情况是这样：
>
> 从支持度来说，RAC 对 Cocoa 的支持更好。但是从标准性、性能来讲 RxSwift 更胜一筹。
>
> 因为毕竟是 Rx 团队的亲生项目。还有，OC 只有 RAC 支持，RxSwift 搞不定。
>
> 雷纯锋：需要在 Obj-C 下和 Swift 下，分别来比较吧？那 Obj-C 下，用 RAC 应该是没有疑问的了吧，那在 Swift 下呢？
>
>Swift 场景下，由于 OC 做好的 bridge，所以 RAC3swift，仍然有不错的整合性。例如 notification、observer 这些。但是 RxSwift 与框架无关，所以这些功能需要自己补了。
>
> 但是 RxSwift 比较标准，和 RxJS、RxJava 所有定义统一，所以迁移过来很容易。但 RxJS 和 RxJava 的原始用户比较少，这点不大明显。
>
> 这是 Rx 和 RAC 的对比。
>
>RAC3 swift 版有个特性，就是热信号传导，这点 RxSwift 没有。对于特定的场景来说，热信号传导更好。
>
>PromiseKit 是一种异步库，思想和 FRP 不一样。
>
>PromiseKit 应该和 js 的 promise 库差不多的意思吧，这个我是靠猜的。


### 讨论：RAC 在工程中使用范围的界限，往往一处 RAC 就会引起和他相关模块的 RAC 化，如何确定界限呢？

臧成威：这个我觉得有点危言耸听了吧，对上对下是可以有效包装，逐步放量的。

臧成威：默认作为一种上下模块的通信协议，也不是很危险的事，所以我觉得没有太大的风险。上层拿到一个 RACSignal 就当做一个 BlockKit 的回调方式就可以。这样可以有效控制代码。

雷纯锋：这个我觉得要看模块之间用什么来通信吧。

李忠：这个我觉得还是跟使用场景有关。如果只是简单的对外暴露一个 property，外部直接 KVO 即可，甚至不用关心 RAC。但如果在一些比较复杂的场景使用 RAC 的话，很难做到对上层透明，除非内部的封装做得足够彻底。

李忠：比如网络请求，返回一个 `RACSignal`，然后外部 `subscribeNext` 之后，想要取消怎么办？这时只能保存一个 `RACDisposable` 变量，然后在适当的时机调用 `dispose` 方法；或者要等待 2 个请求一起完成，再做一些事情（当然可以通过 semaphore / dispatch_group 来做，但这样就丢了 RAC 的特性）等等。

李忠：所以还是要在项目初期就想清楚，如果团队成员对 RAC 都比较熟悉，那自然最好。如果其他人不太了解，甚至抵触，这时就要避免在复杂的场景下使用。

### 讨论：有什么学习 RAC 好的资料吗？

臧成威：李忠的博客不错：<http://limboy.me/>

唐巧：之前雷纯峰特别推荐美团的几篇博客：<http://tech.meituan.com/tag/ReactiveCocoa>

李忠：coursera 上有一门课是讲 Reactive Programming 的 ( <https://www.coursera.org/course/reactive> ) ，也会讲到 Functional Programming。

雷纯锋：我写的这篇是范围比较广一点。<http://blog.leichunfeng.com/blog/2015/12/25/reactivecocoa-v2-dot-5-yuan-ma-jie-xi-zhi-jia-gou-zong-lan/> 《ReactiveCocoa v2.5 源码解析之架构总览》

另外要关于 Monad 的也有一篇，<http://blog.leichunfeng.com/blog/2015/11/08/functor-applicative-and-monad/> 《Functor、Applicative 和 Monad》

雷纯锋：raywenderlich 上的文章：
<http://www.raywenderlich.com/62699/reactivecocoa-tutorial-pt1>、
<http://www.raywenderlich.com/62796/reactivecocoa-tutorial-pt2>、
<http://www.raywenderlich.com/74106/mvvm-tutorial-with-reactivecocoa-part-1>、
<http://www.raywenderlich.com/74131/mvvm-tutorial-with-reactivecocoa-part-2>。

唐巧：我之前看过一本 《Functional Reactive Programming on iOS》，不过还是不够深入。

臧成威：话说，看懂 Haskell，理解 RAC 就不是难事了。

雷纯锋：是的，所以如果要理解 RAC 的思想的话，Haskell 可以学一下。<http://learnyouahaskell.com/>


### RACSequence 的性能问题

讨论到最后大家还涉及到了 RACSequence 的性能问题。记录如下：

> 臧成威：了解了概念后，看源码就很爽了，是 OC 语言的典范。
>
> 臧成威：不过看了 RACSequence 的实现，性能是无法使用的。
>
> 雷纯锋：无法使用？你们不用 RACSequence 吗？
>
> 臧成威：是的，Sequence 的性能很差。
>
> 臧成威：由于 OC 没有引用透明和尾递归优化。
>
> 雷纯锋：你们没有过吗？
>
> 臧成威：你试试 100 个长度的数组进行遍历排序，然后再变回来就明白了。
>
> 臧成威：现在都去掉了。
>
> 雷纯锋：它主要是用来实现懒计算吧。
>
> 雷纯锋：方便集合的转换吧，常规的遍历也不会使用它吧？
>
> 臧成威：就是说集合转换的性能太差了。
>
> 雷纯锋：恩，以后留意一下

## 总结

本次分享内容的主要贡献来自美团的臧成威同学，从美团的实践中我们也能看到，在有充足经验的人指导下，RAC 不但可以应用于大型项目，也可以工作得很舒服。

最后感谢参加这次讨论会的臧成威、李忠、唐晓轩、孙源、雷纯锋、汤圣罡、李雄略、蓝晨钰，希望他们的分享对大家有所帮助。


