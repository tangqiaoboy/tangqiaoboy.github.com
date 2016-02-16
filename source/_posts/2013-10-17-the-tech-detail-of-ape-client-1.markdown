---
layout: post
title: "猿题库iOS客户端的技术细节（一）：使用多target来构建大量相似App"
date: 2013-10-17 00:43
comments: true
categories: iOS
---

##前言

本人今年主要在负责猿题库 iOS 客户端的开发，本文旨在通过分享猿题库 iOS 客户端开发过程中的技术细节，达到总结和交流的目的。

这是本技术分享系列文章的第一篇。本文涉及的技术细节是：采用多 Target 编译方案来实现多个相似 App 的开发，以保证我们能够快速地推出多个相似课程的客户端。

<!-- more -->

### 问题描述

今年春节后，我们对外发布了应用 [“猿题库-公务员考试行测”](http://yuantiku.com/m?courseSet=xingce)，接着我们就开始一个个发布猿题库系列课程应用。到现在半年多过去了，我们一共对外发布了 8 款应用（如下图所示）。

{% img /images/ape-arch-1.jpg %}

这些课程，随了 [" 猿题库-公务员考试申论 "](http://yuantiku.com/m?courseSet=shenlun) 和其它课程不一样之外，另外 7 个课程都有着相似，但是又不完全相同的功能和界面。

这些应用的相同点包括：

 1. 基本相同的注册和登录以及首页逻辑和界面（只是背景图片不一样而已）。
 2. 相同的做题逻辑和界面。
 3. 基本相同的答题报告显示界面。
 4. 基本相同的能力评估报告界面。

不同点主要包括：

 1. 应用图标，启动画面，应用启动后的首页都不一样。
 2. 有些课程（例如公务员考试和高考）是有目标考试的概念，不同的目标考试大纲是不一样的。拿高考来举例，北京的高考和上海的高考，就有着完全不一样的考试大纲。高考的文科和理科，又有着完全不同的考试科目。
 3. 有些课程会有一些自定义的界面，例如高考的应用可以设置昵称，有些课程的真题练习中是有推荐真题模块的，而有些课程又没有。
 4. 有些课程有扫描答题卡功能，有些课程有考前冲刺功能，有些课程有大题专项查看功能，而有些课程又没有上述功能。另外还有一些微小细节，但是解决方法和类似，所以就不一一展开说明。

### 技术解决方案

我们的技术解决方案主要说来分 4 步：

 1. 通过抽取子项目，构建可复用的大模块。
 2. 通过多 Target 编译的方式，不同课程的在编译时，采用不同的资源文件和源文件。
 3. 在第 2 步的基础上，在项目中创建配置用的 Config 类，然后在不同 Target 各自的配置文件中设置不同的 Config 值。实现课程的差异化界面。
 4. 从不同的 xib 中加载界面。

#### 抽取子项目

我们首先做的是抽取子项目，从 [“猿题库司法考试客户端 "](http://yuantiku.com/m?courseSet=sikao) 开始，我们将可以重用的模块一一抽取出来，以 git submodule 的形式组织到项目中。这个抽取过程在开发完猿题库司法考试客户端之后，基本成型了。我们抽取的 submodule 主要分为 4 部分：

 1. UI Common，涉及可复用的登录界面，注册界面，付费界面，NPS 界面，意见反馈界面，关于界面，扫描答题卡界面。另外，我们将一些可复用的 UI 风格控件也抽取成了相应的静态工厂方法，用于生成统一风格的按钮、背景以及状态栏等。
 2. Core Common，涉及可复用的底层模块。包括网络请求模块，自己封装的 Core Text 渲染引擎，缓存模块，一些静态 util 方法等。
 3. Lib Common，所有第三方的开源库依赖，有部分代码根据我们的需求做了修改和定制。
 4. Scan Common, 答题卡扫描识别算法模块，实现核心的扫描算法。

以上只是粗粒度划分，这些模块化的子项目可能在以后被重用，例如 Core Common 完全就可以复用在任何其它项目中。

#### 构造多个编译 Target

抽取完子项目以后，我们采用多 target 的方式，将不同课程中的同名资源文件打包进各自的 Target 中，最后所有课程在一个工程项目中，如下图所示：

{% img /images/ape-targets.jpg %}

先简单介绍一下 Xcode 中 target 的概念，苹果在文档中写道：

{% blockquote %}

Targets that define the products to build. A target organizes the files and instructions needed to build a product into a sequence of build actions that can be taken.”

{% endblockquote %}

在 Xcode 的一个项目中，可以允许建立多个编译的 target，每个 target 代表着最终编译出来的一个 App 文件，在每个 target 中，可以添加不同的编译源文件和资源文件。最终，通过我们在不同 target 之间，修改其 `Copy Bundle Resources` 和 `Compile Sources` 配置，使课程之间的差异性得到实现。我们具体的配置方案如下：

 1. 我们的每个课程的资源文件都具有相同的文件名，例如首页背景都叫 HomeBackgroundBg.png ，由于每个课程背景不一样，所以我们在工程中，每一个课程 target 下，通过修改`Copy Bundle Resources`，使其都配置有不同的（但是同名） HomeBackgroundBg.png 。这样的好处是，在代码逻辑层面，我们可以完全不用处理课程间资源文件的差异性问题。资源文件的差异性都是通过配置文件来保证的。

 2. 对于文案一类的差别，我们通过修改`Compile Sources`，使不同的课程有着不同的文案定义文件。通过这样，我们使不同课程有了不同的文案。另外包括后台网络接口的差异性问题，统计项的差异性问题，也都是这样处理的。

#### Config 类

最后，我们使用 Config 类来完成交互和页面 UI 组件差异性问题。拿能力评估报告页面来说，不同的课程的页面都有一些差异。我们在公共层的代码中将这些逻辑全部实现，具体的 UI 在呈现时，通过读取相关的 Config 类来决定具体如何展示。这样，我们只需要在第 2 步提供的各个课程的差异性源文件中，完成 Config 类的配置即可。

#### 从不同的 xib 中加载界面

有些时候，我们仅仅需要的是 UI 界面排列方式不一样，其它交互逻辑完全一样。对于这种需求，我们尝试同一个 view 对应有多个 xib，然后通过上一步的 Config 类的信息，来加载不同的 xib 界面。这样所有的差异性都在不同的 xib 中解决了，对 controller 层可以完全透明。

下图是我们报告页面的 xib 界面，分为：高考课程、有目标考试的课程、没有目标考试的课程三种。由于这 3 个界面的后台逻辑和交互逻辑都一样，我们通过 3 个 xib 来实现它们之间差异性的部分。

{% img /images/ape-xibs.jpg %}

以下是 view 加载对应的 xib 的代码逻辑：

``` objc

+ (IPadAbilityReportHeaderView *)loadFromNib:(IPadAbilityReportHeaderViewType)type {
    NSString *nibFileName;
    switch (type) {
        case IPadAbilityReportHeaderViewTypeWithQuiz:
            nibFileName = @"IPadAbilityReportHeaderViewWithQuiz";
            break;
        case IPadAbilityReportHeaderViewTypeWithoutQuiz:
            nibFileName = @"IPadAbilityReportHeaderViewWithoutQuiz";
            break;
        case IPadAbilityReportHeaderViewTypeGaokao:
            nibFileName = @"IPadAbilityReportHeaderViewInGaokao";
            break;
        default:
            break;
    }
    NSArray *nibArray = [[NSBundle mainBundle] loadNibNamed:nibFileName owner:nil options:nil];
    if (nibArray.count > 0) {
        return [nibArray lastObject];
    } else {
        return nil;
    }
}

```

##总结

通过多 target 编译方案，我们可以很方便的实现多个相似 App 的开发，以保证我们能够快速地推出多个相似课程的客户端。同时，由于在一个工程中，我们也可以方便地测试新的代码逻辑在各个课程下是否正常。

该方案可以用来解决 “维护大量逻辑相似但是又有细微不同的应用” 的需求，希望本文能给业界同行一些帮助。






