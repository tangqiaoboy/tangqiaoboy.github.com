---
layout: post
title: "iOS开发工具篇-AppStore统计工具"
date: 2013-06-16 12:26
comments: true
categories: iOS
---

本文首发于 InfoQ，本文版权归 InfoQ 所有，转载请保留 [原文链接](http://www.infoq.com/cn/articles/appstore-statistical-tool)。

## 前言

随着 iOS 开发的流行，针对 iOS 开发涉及的方方面面，早有一些公司提供了专门的解决方案或工具。这些解决方案或工具包括：用户行为统计工具（友盟，Flurry，Google Analytics 等),  App Store 销售分析工具（例如 App annie)， App crash 收集工具（例如 Crashlytics)，App 测试发布工具（Test Flight）, App Push 服务等。

这些解决方案或工具节省了 iOS 开发者大量的开发时间，但是由于相关介绍文章的缺乏，许多开发者都在重复着自己一次又一次重新造轮子。所以我希望，将我自己使用和调研的相关的第三方服务使用经验，整理成一系列文章，以便广大开发者能够省去大量的重复性工作。

今天介绍 AppStore 统计工具：App Annie 和苹果的命令行统计工具。

<!-- more -->

## App Annie 介绍

{% img /images/app-annie-homepage.jpg %}

苹果官方的 iTunes Connect 提供的销售数据统计功能比较弱，例如只能保存最近 30 天的详细销售数据，界面丑陋，
无法查看 App 的排名历史变化情况等。

[AppAnnie](http://www.appannie.com/) 是一个专门为开发者提供的，针对 AppStore 相关数据的统计分析工具。
该工具可以统计 App 在 AppStore 的下载量，排名变化，销售收入情况以及用户评价等信息。

### 原理
AppAnnie 实现的原理是：通过你配置的管理账号，向 itunes connect 请求获得你的 App 的相关数据，包括每日下载量，用户的评分数据，以及销售数据。

### 注册 Sales 类型的账号

使用 AppAnnie，首先需要在苹果官方的 itunes connect 中配置一个 Sales 类型的账号。
因为默认的开发者账号是 Admin 级的权限，该权限是非常高的，可以修改 App 的价格或者直接下架商品。
如果将这个账号直接配置在 AppAnnie 中，虽然不影响其获得相关数据，但是有一定的账号安全风险。

配置该账号的详细步骤如下：

1、登录 itunes connect，选择 Manager Users

{% img /images/itunes-connect-add-user-1.jpg %}

2、选择 iTunes Connect User

{% img /images/itunes-connect-add-user-2.jpg %}

3、点击 Add new User

{% img /images/itunes-connect-add-user-3.jpg %}

4、填写新用户的相关信息

{% img /images/itunes-connect-add-user-4.jpg %}

5、勾选用户类型为 Sales

{% img /images/itunes-connect-add-user-5.jpg %}

6、选择 Notifications 为 All Notifications。点击图中所指的位置即可全选。

{% img /images/itunes-connect-add-user-6.jpg %}

7、之后，邮箱中会收到 iTunes Connect 发来的激活邮件。
点击邮件中的激活链接，即可进入到账号注册界面，之后注册账号即可激活。如果该邮箱已经注册过 Apple Id，则会进入到登录界面，登录后即可激活。

{% img /images/itunes-connect-add-user-7.jpg %}


## 注册 App Annie 账号及配置

打开 App Annie 的官方网站:<http://www.appannie.com/>，
注册步骤和一般网站的步骤一样，我就不介绍了，注册完成之后的配置步骤如下：

1、在设置页面中增加 iTunes Connect 账号

{% img /images/app-annie-1.jpg %}

2、填写你的之前在 iTunes Connect 中增加的 Sales 类型的账号及密码

{% img /images/app-annie-2.jpg %}

3、在 User Setting 中勾选上接收每日 Report

{% img /images/app-annie-3.jpg %}

4、这样，每天就可以收到 AppAnnie 发来的相关统计邮件了。如下是一封粉笔网的销售报告邮件截图：

{% img /images/app-annie-4.jpg %}


## 官方的命令行工具

如果你觉得将自己的销售数据交给第三方统计服务商，有一些不太安全。可以考虑使用苹果官方提供的 Autoingestion.class 工具来获得每天的销售数据，然后存到本地的数据库中。

该工具的下载地址是 [这里](http://www.apple.com/itunesnews/docs/Autoingestion.class.zip)，
苹果对于该用户的帮助文档在 [这里](http://www.apple.com/itunesnews/docs/AppStoreReportingInstructions.pdf)。

下面介绍一下这个工具的使用，将 Autoingestion.class 下载下来后，切换到 class 文件所在目录，执行如下命令，即可获得对应的统计数据：

```
java Autoingestion <帐号名> <密码> <vendorId> <报告类型> <时间类型> <报告子类型> <时间>
```

其中 vendor Id 在 iTunes Connect 的如下图所示位置获得，是一个数字 8 开头的序列。

{% img /images/itunes-connect-vendor-id.jpg %}

<报告类型> 可选的值是：Sales 或 Newsstand

<时间类型> 可选的值是：Daily, Weekly, Monthly 或 Yearly

<报告子类型> 可选的值是：Summary, Detailed 或 Opt-In

<时间> 以如下的格式给出：YYYYMMDD

以下是一个示例，它将获得 2013 年 5 月 8 日的日销售摘要数据。

```
java Autoingestion username@fenbi.com password 85587619 Sales Daily Summary 20130508
```

我试用了一下该工具，觉得还是太糙了一些，仅仅能够将销售数据备份下来，如果要做 AppAnnie 那样的统计报表，还需要写不少代码。而且，该工具并不象 App Annie 那样，还提供应用在 App Store 的排名变化情况。虽然可以自己再做抓取，但也是需要工作量的。

## 其它类似 App Annie 的服务

类似 App Annie 这样的服务还有：[AppFigures](http://appfigures.com)。我试用过之后，发现它不如 App Annie 功能强大。不过作为一个替代方案，也一并介绍给大家。

在 Github 上也有一些开源的 [统计工具](https://github.com/alexvollmer/itunes-connect)，感兴趣的朋友也可以尝试一下。这些工具基本上也就是对苹果的命令行工具的增强，例如增加了将数据导入到数据库中等功能。

## 功能对比

App Annie 和苹果本身提供的命令行工具虽然都能统计 App Store 的数据，但是二者功能相差悬殊。苹果的命令行工具仅仅能提供销售数据的按日、周、月、年等方式的统计和备份。而 App Annie 除了以更加良好的界面和交互提供这些功能外，还能跟踪 App 的排名变化，以及 App 在苹果的各种榜单中所处位置的情况。

建议大家都可以尝试使用 App Annie 或 AppFigures 这类统计工具，帮助你方便地查看 App 的销售和排名情况。
