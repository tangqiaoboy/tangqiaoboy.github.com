---
layout: post
title: "使用Crashlytics来保存应用崩溃信息"
date: 2013-07-24 20:56
comments: true
categories: iOS
---

{% img /images/crashlytics-logo.jpg %}

本文首发于 InfoQ，版权归 InfoQ 所有，转载请保留 [原文链接](http://www.infoq.com/cn/articles/crashlytics-crash-statistics-tools)。

## 简介

[Crashlytic](http://try.crashlytics.com/) 成立于 2011 年，是专门为移动应用开者发提供的保存和分析应用崩溃信息的工具。Crashlytics 的使用者包括：支付工具 Paypal, 点评应用 Yelp, 照片分享应用 Path, 团购应用 GroupOn 等移动应用。

2013 年 1 月，Crashlytics[被 Twitter 收购](http://www.crashlytics.com/blog/crashlytics-is-joining-forces-with-twitter/)，成为又一个成功的创业产品。被收购之后，由于没有了创业公司的不稳定因素，我们更有理由使用它来分析应用崩溃信息。

<!-- more -->

使用 Crashlytics 的好处有：

1、Crashlytics 不会漏掉任何应用崩溃信息。拿我的应用举例来说，在 iTunes Connect 的后台查看不到任何崩溃信息。但是用户确实会通过微博或者客服电话反馈应用崩溃的情况。而这些在 Crashlytics 中都可以统计到。如下截图分别显示了我的某应用在苹果 iTunes Connect 后台和 Crashlytics 中的差别：

{% img /images/crashlytics-vs-itunes-1.jpg %}
{% img /images/crashlytics-vs-itunes-2.jpg %}

2、Crashlytics 可以象 Bug 管理工具那样，管理这些崩溃日志。例如：Crashlytics 会根据每种类型的 Crash 的出现频率以及影响的用户量来自动设置优先级。对于每种类型的 Crash，Crashlytics 除了会像一般的工具提供 Call Stack 外，还会显示更多相关的有助于诊断的信息例如设备是否越狱，当时的内存量，当时的 iOS 版本等。对于修复掉的 Crash 日志，可以在 Crashlytics 的后台将其关掉。下图所示的是一个我的早期应用的崩溃记录，在我修复后，我将其更新为已修复状态。


{% img /images/crashlytics-close-issue.jpg %}

3、Crashlytics 可以每天和每周将崩溃信息汇总发到你的邮箱，所有信息一目了然。

下面我就给大家介绍如何使用 Crashlytics。

## 使用介绍

### 申请帐号

Crashlytics 的服务是免费提供的，但是并不能直接注册使用，需要先申请，打开 [Crashlytic 的官网](http://try.crashlytics.com/) ，输入自己的邮箱申请使用。如下图所示：

{% img /images/crashlytics-1.jpg %}

提交完邮箱之后，你的申请会放在 Crashlytics 的申请队列中，网页跳转到如下界面。在这个界面的右侧，你可以提供更多有效信息来让 Crashlytics 优先处理你的申请，建议大家都填上更多自己的信息。

{% img /images/crashlytics-2.jpg %}

如果顺利，通常 1-2 天左右，你就会收到 Crashlytics 发来的申请通过邮件，如下图所示，通过邮件链接跳转到注册界面，填写密码即可完成注册。

{% img /images/crashlytics-3.jpg %}

### 设置工程

在使用 Crashlytics 前需要对原有的 XCode 工程进行配置，在这一点上，Crashlytics 做得比其它任何我见过的 SDK 提供商都体贴。因为 Crashlytics 专门做了一个 Mac 端的 App 来帮助你进行配置，所以，在配置前你先需要去 [这里](https://www.crashlytics.com/downloads/xcode) 下载该应用。

应用下载后，运行该应用并登录帐号。然后选择应用中的 "New App" 按钮，然后选择自己要增加 Crashlytics 的工程，然后 Crashlytics 的应用会提示你为工程增加一个 Run Script，如果你不知道如何添加，这里有一个 [帮助的文档](http://www.runscriptbuildphase.com/?utm_source=desktopapp&utm_medium=setup&utm_campaign=mac)。添加好之后的工程截图如下所示

{% img /images/crashlytics-4.jpg %}

接着，Crashlytics 的本地应用会提示你将 Crashlytics 相关的 framework 拖到工程中。如下所示：

{% img /images/crashlytics-5.jpg %}

按照提示做完之后，就到了最后一步了，在`AppDelegate`的`didFinishLaunchingWithOptions`方法中加入如下代码：

``` objc
#import <Crashlytics/Crashlytics.h>

- (BOOL)application:(UIApplication *)application 
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
   [Crashlytics startWithAPIKey:@"your identify code"];
}
```

之后，运行一下程序，Crashlytics 就会检测到你设置成功。如果你感兴趣，可以自己手工触发一个崩溃记录，看 Crashlytics 能否帮你收集到。使用如下代码即可

``` objc
[[Crashlytics sharedInstance] crash];
```

如果你想测试一个 Exception 导致的崩溃，可以使用如下代码：

``` objc
[NSObject doesNotRecognizeSelector];
[arrayWithOnlyTwoElements objectAtIndex:3];
```

应用对外发布后，就可以在 Crashlytics 后台查看和修改相关的记录。另外，Crashlytics 还支持将数据导入到其它项目管理工具（例如 Redmine 或 Jira）如下所示，配置都非常简单。

{% img /images/crashlytics-6.jpg %}

## 实现原理和使用体会

### 实现原理
在原理上，Crashlytics 的通过以下 2 步完成崩溃日志的上传和分析：

 1. 提供应用 SDK，你需要在应用启动时调用其 SDK 来设置你的应用。SDK 会集成到你的应用中，完成 Crash 信息的收集和上传。
 2. 修改工程的编译配置，加入一段代码，在你每次工程编译完成后，上传该工程对应的 dSYM 文件。研究过手工分析 Crash 日志的同学应该知道，只有通过该文件，才能将 Crash 日志还原成可读的 Call Stack 信息。
 
### 使用体会

为了更加方便开发者设置相应的工程，Crashlytics 提供了 mac 端的应用程序，帮助你检测相关工程是否正确设置并且提供相应的帮助信息。后来我还发现，该程序还会自动帮你升级 Crashlytics 的 SDK 文件。虽然这一点很体贴，但是我个人觉得还是不太友好。因为毕竟修改 SDK 会影响应用编译后的内部逻辑，在没有任何通知的情况下升级，我都无法确定 Crashlytics 有没有干坏事。不过国外的服务，特别是象 Twitter 这种相对较大知名度公司提供的服务要有节操得多，所以在这一点上我还是比较放心的。

使用 Crashlytics 可以让你摆脱管理应用崩溃记录的烦恼。并且帮助你找出应用的一些重大隐藏性 Bug。例如我之前写的一个应用就过一个缓存过期的问题，只有当缓存过期时才会触发这个 Bug，这样的问题在测试人员那边很难触发，因为他们不可能了解你的应用内部实现细节。通过 Crashlytics，使我清楚了解到应用 Crash 的数量和位置，结合自己的开发经验，就很容易找到问题所在了。

值得一提的是，Crashlytics 本身的 [官方文档](http://support.crashlytics.com/knowledgebase/topics/14721-crashlytics-sdk-for-ios) 也非常健全，如果你在使用中遇到任何问题，也可以上去查看详细的文档。

愿 Crashlytics 能让大家的应用都更加健壮～

