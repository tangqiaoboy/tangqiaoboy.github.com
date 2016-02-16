---
layout: post
title: "被误解的 MVC 和被神化的 MVVM"
date: 2015-11-02 22:06:39 +0800
comments: true
categories: iOS
---

# 被误解的 MVC

## MVC 的历史

[MVC](http://baike.baidu.com/view/5432454.htm)，全称是 Model View Controller，是模型 (model)－视图 (view)－控制器 (controller) 的缩写。它表示的是一种常见的客户端软件开发框架。

MVC 的概念最早出现在二十世纪八十年代的 [施乐帕克](http://baike.baidu.com/view/616837.htm) 实验室中（对，就是那个发明图形用户界面和鼠标的实验室），当时施乐帕克为 Smalltalk 发明了这种软件设计模式。

现在，MVC 已经成为主流的客户端编程框架，在 iOS 开发中，系统为我们实现好了公共的视图类：UIView，和控制器类：UIViewController。大多数时候，我们都需要继承这些类来实现我们的程序逻辑，因此，我们几乎逃避不开 MVC 这种设计模式。

但是，几十年过去了，我们对于 MVC 这种设计模式真的用得好吗？其实不是的，MVC 这种分层方式虽然清楚，但是如果使用不当，很可能让大量代码都集中在 Controller 之中，让 MVC 模式变成了 Massive View Controller 模式。

## Controller 的臃肿问题何解？

很多人试图解决 MVC 这种架构下 Controller 比较臃肿的问题。我还记得半年前 InfoQ 搞了一次[移动座谈会](http://www.infoq.com/cn/news/2015/04/symposium-web-mvc)，当时 [BeeFramework](https://github.com/gavinkwoe/BeeFramework) 和 [Samurai-Native](https://github.com/hackers-painters/samurai-native) 的作者 [老郭](http://weibo.com/gavinkwoe) 问了我一句话：「什么样的内容才应该放到 Controller 中？」。但是当时因为时间不够，我没能展开我的观点，这次正好在这里好好谈谈我对于这个问题的想法。

我们来看看 MVC 这种架构的特点。其实设计模式很多时候是为了 `Don't repeat yourself` 原则来做的，该原则要求能够复用的代码要尽量复用，来保证重用。在 MVC 这种设计模式中，我们发现 View 和 Model 都是符合这种原则的。

对于 View 来说，你如果抽象得好，那么一个 App 的动画效果可以很方便地移植到别的 App 上，而 Github 上也有很多 UI 控件，这些控件都是在 View 层做了很好的封装设计，使得它能够方便地开源给大家复用。

对于 Model 来说，它其实是用来存储业务的数据的，如果做得好，它也可以方便地复用。比如我当时在做有道云笔记 iPad 版的时候，我们就直接和 iOS 版复用了所有的 Model 层的代码。在创业做猿题库客户端时，iOS 和 iPad 版的 Model 层代码再次被复用上了。当然，因为和业务本身的数据意义相关，Model 层的复用大多数是在一个产品内部，不太可能像 View 层那样开源给社区。

说完 View 和 Model 了，那我们想想 Controller，Controller 有多少可以复用的？我们写完了一个 Controller 之后，可以很方便地复用它吗？结论是：非常难复用。在某些场景下，我们可能可以用 `addSubViewController` 之类的方式复用 Controller，但它的复用场景还是非常非常少的。

如果我们能够意识到 Controller 里面的代码不便于复用，我们就能知道什么代码应该写在 Controller 里面了，那就是那些不能复用的代码。在我看来，Controller 里面就只应该存放这些不能复用的代码，这些代码包括：

 * 在初始化时，构造相应的 View 和 Model。
 * 监听 Model 层的事件，将 Model 层的数据传递到 View 层。
 * 监听 View 层的事件，并且将 View 层的事件转发到 Model 层。

如果 Controller 只有以上的这些代码，那么它的逻辑将非常简单，而且也会非常短。

但是，我们却很难做到这一点，因为还是有很多逻辑我们不知道写在哪里，于是就都写到了 Controller 中了，那我们接下来就看看其它逻辑应该写在哪里。

## 如何对 ViewController 瘦身？

[objc.io](https://www.objc.io/) 是一个非常有名的 iOS 开发博客，它上面的第一课 [《Lighter View Controllers》](https://www.objc.io/issues/1-view-controllers/lighter-view-controllers/) 上就讲了很多这样的技巧，我们先总结一下它里面的观点：

 * 将 UITableView 的 Data Source 分离到另外一个类中。
 * 将数据获取和转换的逻辑分别到另外一个类中。
 * 将拼装控件的逻辑，分离到另外一个类中。

你想明白了吗？其实 MVC 虽然只有三层，但是它并没有限制你只能有三层。所以，我们可以将 Controller 里面过于臃肿的逻辑抽取出来，形成新的可复用模块或架构层次。

我个人对于逻辑的抽取，有以下总结。

### 将网络请求抽象到单独的类中

新手写代码，直接就在 Controller 里面用 AFNetworking 发一个请求，请求的完数据直接就传递给 View。入门一些的同学，知道把这些请求代码移到另外一个静态类里面。但是我觉得还不够，所以我建议将每一个网络请求直接封装成类。

把每一个网络请求封装成对象其实是使用了设计模式中的 Command 模式，它有以下好处：

 * 将网络请求与具体的第三方库依赖隔离，方便以后更换底层的网络库。实际上我们公司的 iOS 客户端最初是基于 [ASIHttpRequest](http://allseeing-i.com/ASIHTTPRequest/) 的，我们只花了两天，就很轻松地切换到了 [AFNetworking](https://github.com/AFNetworking/AFNetworking)。
 * 方便在基类中处理公共逻辑，例如猿题库的数据版本号信息就统一在基类中处理。
 * 方便在基类中处理缓存逻辑，以及其它一些公共逻辑。
 * 方便做对象的持久化。

大家如果感兴趣，可以看我们公司开源的 iOS 网络库：[YTKNetwork](https://github.com/yuantiku/YTKNetwork)。它在这种思考的指导下，不但将 Controller 中的代码瘦身，而且进一步演化和加强，现在它还支持诸如复杂网络请求管理，断点续传，插件机制，JSON 合法性检查等功能。

这部分代码从 Controller 中剥离出来后，不但简化了 Controller 中的逻辑，也达到了网络层的代码复用的效果。

### 将界面的拼装抽象到专门的类中

新手写代码，喜欢在 Controller 中把一个个 UILabel ，UIButton，UITextField 往 `self.view` 上用 `addSubView` 方法放。我建议大家可以用两种办法把这些代码从 Controller 中剥离。

方法一：构造专门的 UIView 的子类，来负责这些控件的拼装。这是最彻底和优雅的方式，不过稍微麻烦一些的是，你需要把这些控件的事件回调先接管，再都一一暴露回 Controller。

方法二：用一个静态的 Util 类，帮助你做 UIView 的拼装工作。这种方式稍微做得不太彻底，但是比较简单。

对于一些能复用的 UI 控件，我建议用方法一。如果项目工程比较复杂，我也建议用方法一。如果项目太紧，另外相关项目的代码量也不多，可以尝试方法二。

### 构造 ViewModel

谁说 MVC 就不能用 ViewModel 的？MVVM 的优点我们一样可以借鉴。具体做法就是将 ViewController 给 View 传递数据这个过程，抽象成构造 ViewModel 的过程。

这样抽象之后，View 只接受 ViewModel，而 Controller 只需要传递 ViewModel 这么一行代码。而另外构造 ViewModel 的过程，我们就可以移动到另外的类中了。

在具体实践中，我建议大家专门创建构造 ViewModel 工厂类，参见 [工厂模式](http://baike.baidu.com/view/1306799.htm)。另外，也可以专门将数据存取都抽将到一个 Service 层，由这层来提供 ViewModel 的获取。

### 专门构造存储类

刚刚说到 ViewModel 的构造可以抽奖到一个 Service 层。与此相应的，数据的存储也应该由专门的对象来做。在小猿搜题项目中，我们由一个叫 UserAgent 的类，专门来处理本地数据的存取。

数据存取放在专门的类中，就可以针对存取做额外的事情了。比如：

 * 对一些热点数据增加缓存
 * 处理数据迁移相关的逻辑

如果要做得更细，可以把存储引擎再抽象出一层。这样你就可以方便地切换存储的底层，例如从 sqlite 切换到 key-value 的存储引擎等。

### 小结 

通过代码的抽取，我们可以将原本的 MVC 设计模式中的 ViewController 进一步拆分，构造出 网络请求层、ViewModel 层、Service 层、Storage 层等其它类，来配合 Controller 工作，从而使 Controller 更加简单，我们的 App 更容易维护。

另外，不知道大家注意到没，其实 Controller 层是非常难于测试的，如果我们能够将 Controller 瘦身，就可以更方便地写 Unit Test 来测试各种与界面的无关的逻辑。移动端自动化测试框架都不太成熟，但是将 Controller 的代码抽取出来，是有助于我们做测试工作的。

希望本文能帮助大家掌握正确使用 MVC 的姿势，在下一节里，我将分享一下我对 MVVM 的看法。

# 被神化的 MVVM

## MVVM 的历史

[MVVM](https://en.wikipedia.org/wiki/Model_View_ViewModel) 是 Model-View-ViewModel 的简写。

相对于 MVC 的历史来说，MVVM 是一个相当新的架构，MVVM 最早于 2005 年被微软的 WPF 和 Silverlight 的架构师 John Gossman 提出，并且应用在微软的软件开发中。当时 MVC 已经被提出了 20 多年了，可见两者出现的年代差别有多大。

MVVM 在使用当中，通常还会利用双向绑定技术，使得 Model 变化时，ViewModel 会自动更新，而 ViewModel 变化时，View 也会自动变化。所以，MVVM 模式有些时候又被称作：[model-view-binder](https://en.wikipedia.org/wiki/Model_View_ViewModel) 模式。

具体在 iOS 中，可以使用 KVO 或 Notification 技术达到这种效果。

## MVVM 的神化

在使用中，我发现大家对于 MVVM 以及 MVVM 衍生出来的框架（比如 [ReactiveCocoa](https://github.com/ReactiveCocoa/ReactiveCocoa)）有一种「敬畏」感。这种「敬畏」感某种程度上就像对神一样，这主要表现在我没有听到大家对于 MVVM 的任何批评。

我感觉原因首先是 MVVM 并没有很大程度上普及，大家对于新技术一般都不熟，进而不敢妄加评论。另外，ReactiveCocoa 本身上手的复杂性，也让很多人感觉到这种技术很高深难懂，进而加重了大家对它的「敬畏」。

## MVVM 的作用和问题

MVVM 在实际使用中，确实能够使得 Model 层和 View 层解耦，但是如果你需要实现 MVVM 中的双向绑定的话，那么通常就需要引入更多复杂的框架来实现了。

对此，MVVM 的作者 John Gossman 的 [批评](http://blogs.msdn.com/b/johngossman/archive/2006/03/04/543695.aspx) 应该是最为中肯的。John Gossman 对 MVVM 的批评主要有两点：

第一点：数据绑定使得 Bug 很难被调试。你看到界面异常了，有可能是你 View 的代码有 Bug，也可能是 Model 的代码有问题。数据绑定使得一个位置的 Bug 被快速传递到别的位置，要定位原始出问题的地方就变得不那么容易了。

第二点：对于过大的项目，数据绑定需要花费更多的内存。

某种意义上来说，我认为就是数据绑定使得 MVVM 变得复杂和难用了。但是，这个缺点同时也被很多人认为是优点。

## ReactiveCocoa

函数式编程（Functional Programming）和响应式编程（React Programming）也是当前很火的两个概念，它们的结合可以很方便地实现数据的绑定。于是，在 iOS 编程中，ReactiveCocoa 横空出世了，它的概念都非常 新，包括：

 * 函数式编程（Functional Programming），函数也变成一等公民了，可以拥有和对象同样的功能，例如当成参数传递，当作返回值等。看看 Swift 语言带来的众多函数式编程的特性，就你知道这多 Cool 了。
 * 响应式编程（React Programming），原来我们基于事件（Event）的处理方式都弱了，现在是基于输入（在 ReactiveCocoa 里叫 Signal）的处理方式。输入还可以通过函数式编程进行各种 Combine 或 Filter，尽显各种灵活的处理。
 * 无状态（Stateless），状态是函数的魔鬼，无状态使得函数能更好地测试。
 * 不可修改（Immutable），数据都是不可修改的，使得软件逻辑简单，也可以更好地测试。

哇，所有这些都太 Cool 了。当我看到的时候，我都鸡冻了！

## 我们应该客观评价 MVVM 和 ReactiveCocoa

但是但是，我突然想到，我好象只需要一个 ViewModel 而已，我完全可以简单地做一个 ViewModel 的工厂类或 Service 类就可以了，为什么要引入这么多框架？现有的 MVC 真的有那么大的问题吗？

直到现在，ReactiveCocoa 在国内外还都是在小众领域，没有被大量接受成为主流的编程框架。不只是在 iOS 语言，在别的语言中，例如 Java 中的 RxJava 也同样没有成为主流。

我在这里，不是想说 ReactiveCocoa 不好，也不是想说 MVVM 不好，而是想让大家都能够有一个客观的认识。ReactiveCocoa 和 MVVM 不应该被神化，它是一种新颖的编程框架，能够解决旧有编程框架的一些问题，但是也会带来一些新问题，仅此而已。如果不能使好的驾驭 ReactiveCocoa，同样会造成 Controller 代码过于复杂，代码逻辑不易维护的问题。

## 总结

有一些人总是追赶着技术，有什么新技术不管三七二十一立马就用，结果被各种坑。

又有一些人，总是担心新技术带来的技术风险，不愿意学习。结果现在还有人在用 MRC 手动管理引用计数。

而我想说，我们需要保持的是一个拥抱变化的心，以及理性分析的态度。在新技术的面前，不盲从，也不守旧，一切的决策都应该建立在认真分析的基础上，这样才能应对技术的变化。

# 版权说明

本文为InfoQ中文站特供稿件，首发地址为：[文章链接](http://www.infoq.com/cn/articles/rethinking-mvc-mvvm)。如需转载，请与InfoQ中文站联系。

