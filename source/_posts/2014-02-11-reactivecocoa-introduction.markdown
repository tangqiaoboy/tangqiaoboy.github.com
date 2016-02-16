---
layout: post
title: "ReactiveCocoa - iOS开发的新框架"
date: 2014-02-11 18:47
comments: true
categories: iOS
---

本文为 InfoQ 中文站特供稿件，首发地址为：[文章链接](http://www.infoq.com/cn/articles/reactivecocoa-ios-new-develop-framework)。如需转载，请与 InfoQ 中文站联系。

##什么是 ReactiveCocoa 

[ReactiveCocoa](https://github.com/ReactiveCocoa/ReactiveCocoa)（其简称为 RAC）是由 [Github](https://github.com/blog/1107-reactivecocoa-for-a-better-world) 开源的一个应用于 iOS 和 OS X 开发的新框架。RAC 具有函数式编程和响应式编程的特性。它主要吸取了 .Net 的 [Reactive Extensions](http://msdn.microsoft.com/en-us/data/gg577609) 的设计和实现。


##ReactiveCocoa 试图解决什么问题

经过一段时间的研究，我认为 ReactiveCocoa 试图解决以下 3 个问题：

 1. 传统 iOS 开发过程中，状态以及状态之间依赖过多的问题
 2. 传统 MVC 架构的问题：Controller 比较复杂，可测试性差
 3. 提供统一的消息传递机制

<!-- more -->

###传统 iOS 开发过程中，状态以及状态之间依赖过多的问题

我们在开发 iOS 应用时，一个界面元素的状态很可能受多个其它界面元素或后台状态的影响。

例如，在用户帐户的登录界面，通常会有 2 个输入框（分别输入帐号和密码）和一个登录按钮。如果我们要加入一个限制条件：当用户输入完帐号和密码，并且登录的网络请求还未发出时，确定按钮才可以点击。通常情况下，我们需要监听这两个输入框的状态变化以及登录的网络请求状态，然后修改另一个控件的`enabled`状态。

传统的写法如下（该示例代码修改自 [ReactiveCocoa 官网](https://github.com/ReactiveCocoa/ReactiveCocoa) ） ：

``` objc

static void *ObservationContext = &ObservationContext;

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [LoginManager.sharedManager addObserver:self
                                 forKeyPath:@"loggingIn"
                                    options:NSKeyValueObservingOptionInitial
                                    context:&ObservationContext];
    [self.usernameTextField addTarget:self action:@selector(updateLogInButton)
                     forControlEvents:UIControlEventEditingChanged];
    [self.passwordTextField addTarget:self action:@selector(updateLogInButton)
                     forControlEvents:UIControlEventEditingChanged];
}

- (void)updateLogInButton {
    BOOL textFieldsNonEmpty = self.usernameTextField.text.length > 0 && self.passwordTextField.text.length > 0;
    BOOL readyToLogIn = !LoginManager.sharedManager.isLoggingIn && !self.loggedIn;
    self.logInButton.enabled = textFieldsNonEmpty && readyToLogIn;
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object
                        change:(NSDictionary *)change context:(void *)context {
    if (context == ObservationContext) {
        [self updateLogInButton];
    } else {
        [super observeValueForKeyPath:keyPath ofObject:object
                               change:change context:context];
    }
}
 
```


RAC 通过引入信号（Signal）的概念，来代替传统 iOS 开发中对于控件状态变化检查的代理（delegate）模式或 target-action 模式。因为 RAC 的信号是可以组合（combine）的，所以可以轻松地构造出另一个新的信号出来，然后将按钮的`enabled`状态与新的信号绑定。如下所示：


``` objc

RAC(self.logInButton, enabled) = [RACSignal
    combineLatest:@[
        self.usernameTextField.rac_textSignal,
        self.passwordTextField.rac_textSignal,
        RACObserve(LoginManager.sharedManager, loggingIn),
        RACObserve(self, loggedIn)
    ] reduce:^(NSString *username, NSString *password, NSNumber *loggingIn, NSNumber *loggedIn) {
        return @(username.length > 0 && password.length > 0 && !loggingIn.boolValue && !loggedIn.boolValue);
    }];

```

可以看到，在引入 RAC 之后，以前散落在`action-target`或 KVO 的回调函数中的判断逻辑被统一到了一起，从而使得登录按钮的`enabled`状态被更加清晰地表达了出来。

除了组合（combine）之外，RAC 的信号还支持链式（chaining）和过滤（filter)，以方便将信号进行进一步处理。

###试图解决 MVC 框架的问题

对于传统的 [Model-View-Controller](http://zh.wikipedia.org/zh-cn/MVC) 的框架，Controller 很容易变得比较庞大和复杂。由于 Controller 承担了 Model 和 View 之间的桥梁作用，所以 Controller 常常与对应的 View 和 Model 的耦合度非常高，这同时也造成对其做单元测试非常不容易，对 iOS 工程的单元测试大多都只在一些工具类或与界面无关的逻辑类中进行。

RAC 的信号机制很容易将某一个 Model 变量的变化与界面关联，所以非常容易应用 [Model-View-ViewModel](http://en.wikipedia.org/wiki/Model_View_ViewModel) 框架。通过引入 ViewModel 层，然后用 RAC 将 ViewModel 与 View 关联，View 层的变化可以直接响应 ViewModel 层的变化，这使得 Controller 变得更加简单，由于 View 不再与 Model 绑定，也增加了 View 的可重用性。

因为引入了 ViewModel 层，所以单元测试可以在 ViewModel 层进行，iOS 工程的可测试性也大大增强了。InfoQ 也曾撰文介绍过 MVVM：[《MVVM 启示录》](http://www.infoq.com/cn/articles/mvvm-revelation/) 。


###统一消息传递机制

iOS 开发中有着各种消息传递机制，包括 KVO、Notification、delegation、block 以及 target-action 方式。各种消息传递机制使得开发者在做具体选择时感到困惑，例如在 objc.io 上就有 [专门撰文](http://www.objc.io/issue-7/communication-patterns.html)（[破船的翻译](http://beyondvincent.com/blog/2013/12/14/124-communication-patterns/) ），介绍各种消息传递机制之间的差异性。

RAC 将传统的 UI 控件事件进行了封装，使得以上各种消息传递机制都可以用 RAC 来完成。示例代码如下：

``` objc

// KVO
[RACObserve(self, username) subscribeNext:^(id x) {
    NSLog(@" 成员变量 username 被修改成了：%@", x);
}];

// target-action
self.button.rac_command = [[RACCommand alloc] initWithSignalBlock:^RACSignal *(id input) {
    NSLog(@" 按钮被点击 ");
    return [RACSignal empty];
}];

// Notification
[[[NSNotificationCenter defaultCenter] 
    rac_addObserverForName:UIKeyboardDidChangeFrameNotification         
                    object:nil] 
    subscribeNext:^(id x) {
        NSLog(@" 键盘 Frame 改变 ");
    }
];

// Delegate
[[self rac_signalForSelector:@selector(viewWillAppear:)] subscribeNext:^(id x) {
    debugLog(@"viewWillAppear 方法被调用 %@", x);
}];

```

RAC 的`RACSignal` 类也提供了`createSignal`方法来让用户创建自定义的信号，如下代码创建了一个下载指定网站内容的信号。

``` objc

-(RACSignal *)urlResults {
    return [RACSignal createSignal:^RACDisposable *(id<RACSubscriber> subscriber) {
        NSError *error;
        NSString *result = [NSString stringWithContentsOfURL:[NSURL URLWithString:@"http://www.devtang.com"]
                                                    encoding:NSUTF8StringEncoding
                                                       error:&error];
        NSLog(@"download");
        if (!result) {
            [subscriber sendError:error];
        } else {
            [subscriber sendNext:result];
            [subscriber sendCompleted];
        }
        return [RACDisposable disposableWithBlock:^{
            NSLog(@"clean up");
        }];
    }];

}

```

##如何使用 ReactiveCocoa

ReactiveCocoa 可以在 iOS 和 OS X 的应用开发中使用，对于 iOS 开发者，可以将 [RAC 源码](https://github.com/ReactiveCocoa/ReactiveCocoa.git) 下载编译后，使用编译好的`libReactiveCocoa-iOS.a`文件。


开发者也可以用 [CocoaPods](http://cocoapods.org/) 来设置目标工程对 ReactiveCocoa 的依赖，只需要编辑 Podfile 文件，增加如下内容即可：

```
pod 'ReactiveCocoa'

```

##ReactiveCocoa 的特点

RAC 在应用中大量使用了 block，由于 Objective-C 语言的内存管理是基于 [引用计数](http://zh.wikipedia.org/zh-cn/%E5%BC%95%E7%94%A8%E8%AE%A1%E6%95%B0) 的，为了避免循环引用问题，在 block 中如果要引用 self，需要使用`@weakify(self)`和`@strongify(self)`来避免强引用。另外，在使用时应该注意 block 的嵌套层数，不恰当的滥用多层嵌套 block 可能给程序的可维护性带来灾难。

RAC 的编程方式和传统的 MVC 方式差异巨大，所以需要较长的学习时间。并且，业界内对于 RAC 并没有广泛应用，这造成可供参考的项目和教程比较欠缺。
另外，RAC 项目本身也还在快速演进当中，1.x 版本和 2.x 版本 API 改动了许多，3.0 版本也正在快速开发中，对它的使用也需要考虑后期的升级维护问题。

作为一个 iOS 开发领域的新开源框架，ReactiveCocoa 带来了函数式编程和响应式编程的思想，值得大家关注并且学习。

##一些学习资源

###博客 & 教程

 * <http://spin.atomicobject.com/2014/02/03/objective-c-delegate-pattern/>
 * <http://blog.bignerdranch.com/4549-data-driven-ios-development-reactivecocoa/>
 * <http://en.wikipedia.org/wiki/Functional_reactive_programming>
 * <http://www.teehanlax.com/blog/reactivecocoa/>
 * <http://www.teehanlax.com/blog/getting-started-with-reactivecocoa/>
 * <http://nshipster.com/reactivecocoa/>
 * <http://cocoasamurai.blogspot.com/2013/03/basic-mvvm-with-reactivecocoa.html>
 * <http://iiiyu.com/2013/09/11/learning-ios-notes-twenty-eight/>
 * <https://speakerdeck.com/andrewsardone/reactivecocoa-at-mobidevday-2013>
 * <http://msdn.microsoft.com/en-us/library/hh848246.aspx>
 * <http://www.itiger.me/?p=38>
 * <http://blog.leezhong.com/ios/2013/12/27/reactivecocoa-2.html>
 * <https://github.com/ReactiveCocoa/ReactiveCocoa/blob/master/Documentation/FrameworkOverview.md>
 * <http://www.haskell.org/haskellwiki/Functional_Reactive_Programming>
 * <http://blog.zhaojie.me/2009/09/functional-reactive-programming-for-csharp.html>


###代码

 * <https://github.com/Machx/MVVM-IOS-Example>
 * <https://github.com/ReactiveCocoa/RACiOSDemo>


###书籍
 * <https://leanpub.com/iosfrp>

###视频
 * <http://vimeo.com/65637501>



