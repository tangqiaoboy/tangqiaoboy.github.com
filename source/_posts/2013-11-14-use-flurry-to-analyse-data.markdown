---
layout: post
title: "使用Flurry来统计和分析用户行为"
date: 2013-11-14 13:51
comments: true
categories: iOS
---

## 2015年11月更新

由于 Flurry 的后台在中国访问实在太慢，另外 Flurry 对中国区的 IP 类型判断不太准确（3G和Wifi无法准确区分），所以我现在不再推荐大家使用 Flurry 了。

不用 Flurry 之后，我们现在使用的是腾讯的 MTA 来做统计。

## 简介

{% img /images/flurry-logo.png %}

本文为InfoQ中文站特供稿件，首发地址为：[文章链接](http://www.infoq.com/cn/articles/use-flurry-to-statistics-and-analysis-user-behavior)。如需转载，请与InfoQ中文站联系。

[Flurry](http://www.flurry.com/)是一家专门为移动应用提供数据统计和分析的公司。他们的数据统计分析SDK支持的平台包括iPhone, iPad, Android, Windows Phone, Java ME和BlackBerry。使用Flurry服务的公司包括eBay、Yahoo、Hulu和Skype等超过11万家公司，涉及的应用超过36万个。

利用Flurry提供的分析平台，我们可以很容易地自动统计出应用的使用情况，例如：

 1. 每天（每周或每月）登录用户数，应用使用次数
 2. 每天（每周或每月）新用户数，活跃用户数
 3. 用户的所在地、年龄、性别的分布情况

Flurry也可以自动统计出移动设备的分类情况，例如：

 1. 使用3G，Wifi的会话比例
 2. 使用iOS系统各版本(例如iOS6.0, iOS7.0等)的比例
 3. 使用iOS各种设备（例如iPhone4, iPhone5等)的比例

除了上面介绍的自动统计项目，Flurry SDK也提供了统计用的相关API，便于我们针对自己产品的特点，做针对性的统计。例如统计应用中某个按钮的按下次数，或者网络请求的平均响应时间等。

<!-- more -->

## Flurry的基本使用

### 注册和下载对应SDK

使用Flurry前，需要先到官方网站<http://www.flurry.com/>注册账号。然后登录到Flurry后台，依次选择 `"Applications" -> “Add a New Application"` ，增加一个需要统计分析的应用。如下图所示：

{% img /images/flurry-create-app-1.png %}

然后，在接下来的界面之后根据你的应用类型，选择iPhone或iPad应用。如下图所示：

{% img /images/flurry-create-app-2.png %}

接着，填入应用的名字和分类（名字仅用作在Flurry后台和自己的其它应用区分，不需要和应用的真实名字相同），之后点击"Create App"，如下所示：

{% img /images/flurry-create-app-3.png %}

到此，我们就成功在后台创建了一个新的应用统计和分析项目。点击下图中的"Download"，可以下载需要集成在应用中的SDK。而下图中的提示2中的Key：`X28BBKTNZ9H3VYTBDBG3`则是我们在集成时用于标识自己应用的ID。

{% img /images/flurry-create-app-4.png %}


### 集成SDK

我们将下载后的SDK解压，可以看到文件列表如下。列表中对我们最重要的文件是Flurry目录下的`flurry.h`文件和`libFlurry_4.3.0.a`文件。这2个文件需要复制到Xcode的工程中去。

而`ProjectApiKey.txt`文件中记录了我们之前创建的应用ID，在在代码中调用SDK初使化时需要使用。

{% img /images/flurry-sdk-files.png %}

接着我们打开Xcode工程，将之前下载解压的Flurry目录拖动添加到工程中，同时在工程的.pch文件中加上 `#import "Flurry.h"`，如下图所示：

{% img /images/flurry-setup-in-xcode.png %}

接着我们在`Link Binary With Libraries`中加入如下2个依赖的framework: 
 
 * Security.framework
 * SystemConfiguration.framework。

{% img /images/flurry-link-library.png %}

接着我们打开 `AppDelegate.m`，在`- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions`方法中，加入代码`[Flurry startSession:@"X28BBKTNZ9H3VYTBDBG3"];`，如下图所示：

{% img /images/flurry-set-api-key.png %}

这样，就完成了Flurry最简单的集成。通过以上短短几步，Flurry就可以帮我们完成应用的基本使用数据的统计和分析。

### 自定义统计项

Flurry提供了`logEvent`函数，用于实现自定义的统计项。默认情况下，该函数接受一个参数，用于表示当前统计项的名字。

例如我们的界面中有2个按钮，我们想统计它们各自被用户的点击次数，则可以如下代码实现。在该代码中，我们定义了2个自定义的统计项，名字分别为`First Button Pressed`和`Second Button Pressed`。

``` objc
- (IBAction)firstButtonPressed:(id)sender {
    [Flurry logEvent:@"First Button Pressed"];
}


- (IBAction)secondButtonPressed:(id)sender {
    [Flurry logEvent:@"Second Button Pressed"];
}

```

`logEvent`函数也支持添加各种参数，用于做更加精细的统计，例如，我们想在统计用户在同一个页面，点击时不同按钮的次数分布，看哪些按钮更加常用，则统计代码可以如下实现：

``` objc
- (IBAction)firstButtonPressed:(id)sender {
    [Flurry logEvent:@"Button Pressed"
      withParameters:@{@"target": @"first"}];
}


- (IBAction)secondButtonPressed:(id)sender {
    [Flurry logEvent:@"Button Pressed"
      withParameters:@{@"target": @"second"}];
}
```


`logEvent`函数也支持统计时间，常常用来统计某个复杂的网络操作的耗时或者用户对于某些界面的响应时间。例如，我们想统计用户停留在某个提示界面的时间，则可以用如下代码完成：

``` objc
//
//  FirstViewController.m
//  FlurryUsageSample
//
//  Created by TangQiao on 13-10-25.
//  Copyright (c) 2013年 TangQiao. All rights reserved.
//

#import "FirstViewController.h"

#define FLURRY_EVENT_KEY @"First View Controller"

@implementation FirstViewController

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    // 开始统计时间
    [Flurry logEvent:FLURRY_EVENT_KEY timed:YES];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    // 结束统计时间
    [Flurry endTimedEvent:FLURRY_EVENT_KEY withParameters:nil];
}

@end


```

### 查看统计结果

完成上面的自定义统计的代码后，待应用发布后，我们就可以从后台的`Events`栏中看到相应的统计结果了。如下图所示：

{% img /images/flurry-view-events.png %}

### 统计Crashlog

Flurry从4.2.3开始，支持应用的Crashlog统计。只需要在`AppDelegate.m`文件中，在调用`startSession`方法之前，调用`setCrashReportingEnabled:YES`即可：

```
[Flurry setCrashReportingEnabled:YES];
[Flurry startSession:@"YOUR_API_KEY"];
``` 

这里注意，<font color='red'>一定要在startSession之前调用setCrashReportingEnabled，否则将无法记录Crashlog信息！切记！！</font>

之后你就可以从后台管理界面的`Errors`项中，获得应用的Crashlog信息。

## 和其它统计分析平台的对比

和著名的统计工具[Google Analytics](http://www.google.com/analytics/)相比，Flurry的优点是：

 1. Flurry专门针对移动端做了许多优化，例如统计流量就小很多。
 2. Flurry没有被墙的问题。
 
Flurry缺点是:
 
 1. Google Analytics的统计功能相对更强大一些。
 2. Google Analytics可以和网页版的统计数据做整合。

和国内的分析平台[友盟](http://www.umeng.com/)相比，Flurry的优点是：

 1. 使用Flurry的应用相对更多。根据Flurry和友盟的官方数据，有超过36万应用使用Flurry<sup>[1](http://www.flurry.com/big-data.html) </sup>，有超过18万应用使用友盟<sup>[2](http://www.umeng.com/analytics)</sup>。
 2. Flurry是国外的公司，保持独立和专注，数据安全性更高；友盟现在已经[被阿里收购](http://tech.163.com/13/0426/16/8TDB6H1N00094MOK.html)，当用户的应用涉及领域和阿里有类似或重合的时候，那么该统计数据有潜在的安全性问题。

Flurry的缺点是：

 1. 友盟因为是中国公司，所以对国内开发者非常友善，相关的文档或界面都是中文的。而Flurry并不提供中文的后台管理界面或相关文档。
 2. Flurry的服务器在国外，在响应速度上应该相对比友盟慢一些。但在测试中，Flurry服务器都保证了500ms左右的响应时间，还是比较好的。


## 总结

本文介绍了Flurry的基本功能以及如何做自定义的统计，最后与业界其它同类工具做了对比。我也将相关示例代码整理到github上，地址是：<https://github.com/tangqiaoboy/FlurryUsageSample>，愿本文能帮助你更加方便地做应用的统计和分析工作。





