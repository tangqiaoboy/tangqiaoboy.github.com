---
layout: post
title: "斯坦福大学 iOS 开发公开课总结"
date: 2012-02-05 12:58
comments: true
categories: iOS
---

### 前言

iPhone 开发相关的教程中最有名的，当数斯坦福大学发布的 "iPhone 开发公开课 " 了。此公开课在以前叫做《iPhone 开发教程》，今年由于平板电脑的流行，所以也加入了 ipad 开发相关的课程。在 [网易公开课](http://v.163.com/special/opencourse/iPhonekaifa.html) 上，有 [该教程](http://v.163.com/special/opencourse/iPhonekaifa.html) 的 2010 年录象，并且前面 15 集带中文字幕文件，非常适合初学者学习。

<!--more-->

在这里顺便说一下，网易公开课上的 28 集其实并不需要全部看完。真正的课程只有前面 12 集。后面的课程都是请一些业界的名人讲他们成功的 app 以及学生的作品展示，可看可不看。所以大家不要被 28 集这么多吓到。

由于近一年来 iOS5 以及 xcode4 的发布，苹果对原有的开发环境 xcode 以及开发语言 Objective-C 都有改进，所以原有的教程中很多内容不再适用了。例如新的 xcode4 将 Interface Builder 集成到 xcode 中，整个 IDE 布局和快捷键完全大变样，又比如苹果为 Objective-c 引用了 ARC 和 Storyboard，这些都使得 app 的编程方式大为不同。

值得高兴的是，斯坦福大学最近更新了该公开课的 2011 年秋季录象，免费下载地址是：<http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewPodcast?id=480479762>，不过现在该公开课还没有翻译，只能看英文原版了。新的课程相比以前要短了许多，一共只有 9 课。我大概快速看了一遍，总结一些心得给大家。

### iOS 的 MVC 模式

MVC 模式算是客户端类程序使用的设计模式的标配了。iOS 对于 Model, View 和 Controller 之间的相互调用有它自己的规范和约定，在公开课的 [第一课](http://itunes.apple.com/itunes-u/ipad-iPhone-application-development/id480479762#) 中，就介绍了应该如何将 MVC 模式应用在 iOS 开发中。主要的内容就体现在如下这张图中 (图片来自该公开课第一课的 [配套 pdf](http://itunes.apple.com/itunes-u/ipad-iPhone-application-development/id480479762#) 的第 37 页)：

{% img /images/ios_mvc.jpg %}

我下面详细介绍一下这幅图的意思。

* 首先图中绿色的箭头表示直接引用。直接引用直观来说，就是说需要包含引用类的申明头文件和类的实例变量。可以看到，只有 Controller 中，有对 Model 和 View 的直接引用。其中对 View 的直接引用体现为 IBOutlet。

* 然后我们看 View 是怎么向 Controller 通讯的。对于这个，iOS 中有 3 种常见的模式:
   1. 设置 View 对应的 Action Target。如设置 UIButton 的 Touch up inside 的 Action Target。
   1. 设置 View 的 delegate，如 UIAlertViewDelegate, UIActionSheetDelegate 等。
   1. 设置 View 的 data source, 如 UITableViewDataSource。
  通过这 3 种模式，View 达到了既能向 Controller 通讯，又不需要知道具体的 Controller 是谁是目的，这样就和 Controller 解耦了。

* 最后我们看 Model。Model 在图上有一个信号塔类似的图形，旁边写着 Notification & KVO。这表明 Model 主要是通过 Notification 和 KVO 来和 Controller 通讯的。关于 Notification，我写了一个模版代码片段如下:（关于代码片段的管理，推荐大家看我写的另一篇文章：[使用 Github 来管理 xcode4 中的代码片段](http://blog.devtang.com/blog/2012/02/04/use-git-to-manage-code-snippets/)

``` objc
// 监听通知
[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(<#methodName#>) name:kLoginNotification object:nil];
// 取消监听
[[NSNotificationCenter defaultCenter] removeObserver:self];
// 发送通知
NSDictionary * userInfo = [NSDictionary dictionaryWithObject:[NSNumber numberWithInt:200] forKey:@"code"];
[[NSNotificationCenter defaultCenter] postNotificationName:<#notification_name#> object:self userInfo:userInfo];
```

所以，对于初学者，要正确地使用 MVC 模式还是挺难的，回想我们以前做公司某产品 iPhone 版的时候，就有一些 Model 层直接依赖了 Controller 层，比如 Model 层更新数据失败了，直接调用 Controller 层显示出一个失败的提示界面。这样层次划分不清，造成我们做 ipad 版的时候很痛苦。最后我们做了代码重构，把 Model 的相应改变都用 Notification 来完成，使得在做 ipad 版开发时轻松了很多。


### Convention About synthesize

“Convention over configuration"（约定高于配置）成就了 Ruby On Rails，而 iOS 也有很多编程的约定。这些约定单独看没有什么好处，约定的最大好处就是，如果大家都遵守它，那么代码风格会趋于一致，你会很方便地读懂或修改别人的代码。

我们可以从第一课 PPT 的第 50 页看到如下的代码：

{% img /images/synthesize_convention.jpg %}

从图中可以看到，该课程推荐大家在使用 synthesize 关键字时，为 property 设置一个下划线前缀。我也看过一些 iPhone 的开源项目，比如 facebook 开源的 [three20](https://github.com/facebook/three20/) ，它是遵守了这样的约定的。

其它的约定还包括：

* 以 new, copy, alloc 开头的方法，都应当由调用者来 release，而其它方法，都返回一个 autorelease 对象。
* 通常 iPhone 顶部的 bar 应该用 UINavigation 控件，而底部的 bar 应该用 UIToolbar 控件。
* 所有的 UI 操作都应该在主线程 (UI 线程) 进行。这个似乎不是约定，但是好多同学不知道，也写在这儿吧。


### UIView

刚开始对界面之间的跳转很不理解，后来发现其实很简单，就是一层一层叠起来的 View。从 View A 上点击一个按钮跳转到 View B，其实就是把 View B“盖” 在 View A 上面而已。
而 “盖” 的方式有好多种，通常的方法有 2 种：

 一 . 用 UINavigationController 把 View B push 进来。
``` objc
[self.navigationController pushViewController:nextView animated:YES]; 
```

 二 . 用 presentModalViewController 方法把 View B 盖在上面。

``` objc
[self presentModalViewController:nextView animated:YES];
```

除此之外，其实还有一种山寨方法，即把 View A 和 View B 都用 addSubView 加到 AppDelegate 类的 self.window 上。然后就可以调用 bringSubviewToFront 把 View B 显示出来了，如下所示：
``` objc
// AppDelegate.m 类
[self.window addSubview:viewB];
[self.window addSubview:viewA];
// 在需要时调用
[self.window bringSubviewToFront:viewB];
```

上面说的是界面之间的跳转。对于一个界面内，其控件的布局其实也是一个一个叠起来的，之所以说叠，是指如果 2 个控件如果有重叠部分，那么处于上面的那个控件会盖住下面的。

### Nib File

Nib 文件实际上内部格式是 XML，而它本身并不编译成任何二进制代码。所以你如果用 iFile 之类的软件在 iPhone 上查看一些安装好的软件的目录，可以看到很多的以 nib 结尾的文件，这些就是该软件的界面文件。虽然这些 XML 经过了一些压缩转换，但是我们还是可以看到一些信息，例如它使用了哪些系统控件等。

Nib 文件刚开始给我的感觉很神秘，后来发现它其实就是用于可视化的编辑 View 类用的。其中的 File's Owner 一栏，用于表示这个 View 对应的 Controller 类。通常情况下，Controller 类会有一个名为 view 的变量，指向这个 view 的实例，我们也可以建立多个 IBOutlet 变量，指向这个 view 上的控件，以便做一些界面上的控制。

在 Interface Builder 上还有一个好处，是可以方便的将 View 的事件与 Controller 的 IBAction 绑定。只需要按住 Ctrl 键，从控件往 File's Owner 一栏拖拽，即可看到可以绑定的方法列表。其实这些只是简化了我们的工作，如果完全抛开 Interface Builder，我们一样可以完成这些工作。我所知道业界的一些 iOS 开发部门，为了多人协作更加方便，更是强制不允许使用 Interface Builder，一切界面工作都在代码中完成。如果你用文本编辑器打开 Nib 文件看过，就能理解这样做是有道理的。因为如果 2 个同时编辑一个界面文件，那么冲突的可能性是 100%，而且，从 svn 结出的冲突信息上看，你根本无法修正它。下面的代码演示了如何不用 Interface Builder 来添加控件以及绑定 UI 事件。

``` objc
// SampleViewController.m 的 viewDidLoad 方法片段
// 添加 Table View 控件
UITableView * tableView = [[UITableView alloc] initWithFrame:CGRectMake(0, 0, 320, 400)];
[self.view addSubview:tableView];
tableView.delegate = self;
[tableView release];
// 添加 Button 控件
self.button = [[[UIButton alloc] initWithFrame:CGRectMake(0, 0, 200, 100)] autorelease];
[self.view addSubview:self.button];
// 绑定事件
[self.button addTarget:self action:@selector(buttonPressed) forControlEvents:(UIControlEventTouchUpInside)];
```

### 总结

总体来讲，学习 iOS 开发还是比较容易的。我大概花了一个月时间学习 iPhone 开发，就可以边做边学了。

苹果的设计对于开发者来说是非常友好的，很多时候使用相应的控件就行了，都不用操心底层细节。不象 Android 开发，一会儿要考虑不同手机分辨率不一样了，一会儿又要考虑有些不是触摸屏了，一会儿又发现某款手机的 cpu 内存太弱了跑不起来，需要优化程序。另外，Objective-C 相对于 C++ 语言来说，要简单优雅得多，而且更加强大，所以做 iOS 的开发者很省心。

要说到不爽的地方，就是 iOS 开发相关的中文资料实在是太少了。要学习它，基本上需要查看苹果的官方英文文档以及 WWDC 大会视频，还有去 [stackoverflow](http://www.stackoverflow.com) 上问问题。这对于英文不太好的同学这可能是一个障碍。不过反过来，习惯之后，通过这个锻炼了自己的英文水平，倒也是一大收获。
