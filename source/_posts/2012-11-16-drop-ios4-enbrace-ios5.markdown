---
layout: post
title: "放弃iOS4，拥抱iOS5"
date: 2012-11-16 20:47
comments: true
categories: iOS
---

{% img /images/ios5.jpg %}

##前言
苹果在2011年的WWDC大会上发布了iOS5，不过考虑到要支持iOS4.x的系统，大多数App都无法使用iOS5的新特性。现在将近1年半过去了，从我们自己的App后台的统计数据、一些第三方的统计数据和一些业界的朋友告知我的数据都显示，iOS4.x的系统所占比例已经小于5%了，并且还在持续下降。所以，我们有必要放弃对iOS4.x的支持，全面拥抱iOS5。

只支持iOS5.0以上版本使得我们可以使用iOS5带来的诸多新特性，有些新特性可以极大地方便我们的开发，我将这些新特性列举如下。

<!-- more -->

##Storyboard

Storyboard（故事板）是XCode4和iOS5提供的一个用于控制View Controller之间跳转关系的新概念。你可以把它理解成以前一堆Nib文件的集合。在这个集合里面，每个Nib文件被称作scene（场景），scene之间的跳转关系被称作segue。segue代表着传统的界面间切换的方式，通常是Push方式和Modal方式，当然，你也可以自定义自己的Segue。如下示例图是一个Storyboard的界面：

{% img /images/enbrace-ios5-1.png %}

使用Storyboard的好处有以下几点：

 1. 你可以从storyboard中很方便地梳理出所有View Controller的界面间的调用关系。比如上面那个storyboard示例图，我们就可以很清楚地了解到4个View Controller相互之间是怎么调用的。而这在以前，这些调用关系，都是隐藏在每个View Controller的代码中的，你需要一点一点读代码，才可以将整个调用逻辑整理清楚。
 2. 使用Storyboard可以使用Table View Controller的Static Cell功能。简单来说，对于象设置页面等固定内容的TableView，可以直接在Storyboard中通过拖拽就可以设置其界面了，而不是象以前那样需要写一堆table view的delegate和data source回调函数。
 3. 通过实现 - (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender 方法，每个View Controller的跳转逻辑都聚集在一处，这方便我们统一管理界面跳转和传递数据，这相当于多了一个编程约定。
 4. Storyboard可以方便将一些常用功能模块化和复用。例如WWDC2011年介绍Storyboard的视频就将微博分享功能模块化成一个单独的Storyboard。我在开发App时，也将例如通过第三方注册登录模块做成一个单独的Storyboard，便于以后复用。

另外，在iOS6中，storyboard又新增了如exit segue, container view等新功能，这些功能都非常体贴，我们向新的技术方案迁移可以在未来更加方便地使用iOS和XCode的新特性，方便我们的开发。

当然，Storyboard也有它的问题。比如，如果2个人同时编译storyboard，在版本管理中出现冲突时会比较麻烦。虽然storyboard是XML格式的，但是里面的信息有些时候还是不太清晰，当冲突发生时，合并冲突可能会比较麻烦。解决办法是，将Storyboard按功能拆分，每个人尽量负责一个单独的Storyboard，如果实在需要2个人都修改它，避免同时修改。

##ARC

因为ARC是在编译期做的，所以虽然是与iOS5.0同时推出的Objective-C特性，但是其实ARC是支持iOS4的。只是在iOS4中，不能使用ARC的weak关键字。

由于不需要支持iOS4，我们可以将原本的 __unsafe_unretained 关键字换成weak。这样当这个弱引用对象被回收时，weak指针会被智能地设置成nil，防止“野指针”的产生。

很多人说ARC有这样那样的问题，其实他们是没有真正用好ARC。我在开发粉笔网iPhone客户端时，由于使用了ARC，花三个月开发完的应用，用instruments检测后，没有发现任何内存泄漏问题。这在没有使用ARC的工程中是不可想象的。苹果在推出ARC两年后，今年正式将ARC引入到Mac OS操作系统的SDK中，并且正式将原有的GC deprecated掉，这也说明了ARC技术方案已经是非常成熟的了。

##UIKit

UIKit在iOS5进行了大量更新。除了新增了如UIStepper控件外，也为以前的控件增加了更多的定制接口。我们可以方便地定义UINavigationBar, UITabBar, UIToolBar等常用控件。

苹果在iOS5中给UIViewController新增加的5方法以及一个属性。关于这个新特性我在[这篇文章](http://blog.devtang.com/blog/2012/02/06/new-methods-in-uiviewcontroller-of-ios5/)中详细介绍过。新增的方法主要解决的是让 view的load/unLoad/appear/disappear的相关回调可以传递到子view controller中。

##CoreImage

苹果从iOS5开始，引入了新的图象类CIImage。CIImage相比以前的UIImage类，更加适合于图象处理和图象分析。

在图象处理方法，苹果内置了CIFilter类，方便开发者对图形进行各种各样的特效处理，在iOS5中，苹果提供了48种Filter，而在iOS6中，内置的Filter达到了93种。可以使用如下代码，查询到当前系统中提供的Filter列表：

``` objc
- (void)logAllFilters {
    NSArray * properties = [CIFilter filterNamesInCategory:kCICategoryBuiltIn];
    NSLog(@"%@", properties);
    for (NSString * filterName in properties) {
        CIFilter * fltr = [CIFilter filterWithName:filterName];
        NSLog(@"%@", [fltr attributes]);
    }
}
```

这些内置的Filter在分类上，包括：

 1. 颜色效果类。例如黄昏效果，曝光度调整等。
 2. 组合效果类。把2张图片按各种规则混合成一张图。
 3. 几何变形类。例如把照片倾斜或者翻转。
 4. 重复效果类。如平铺，折叠，镜象等。
 5. 失真扭曲类。如把图片中心做成漩涡效果等。
 6. 模糊和锐化类。
 7. Stylize效果。
 8. Halftone效果。

以上所有效果可以叠加作用在一起，最终你可以创造出自己的图片处理效果。最终你可以通过CIContext，将处理过的CIImage转换成UIImage输出。有了Core Image，你可以方便地开发图象处理相关的应用，而不用关心图象处理算法的细节。

## NSJSONSerialization
在我的[《不要使用SBJSON(json-framework)》](http://blog.devtang.com/blog/2012/05/05/do-not-use-sbjson/) 一文中，我提到了关于JSON解析库的性能测试。测试结果表明，苹果从iOS5开始提供的 [NSJSONSerialization](http://developer.apple.com/library/ios/#documentation/Foundation/Reference/NSJSONSerialization_Class/Reference/Reference.html#//apple_ref/doc/uid/TP40010946) 类有着最好的性能表现。所以，从iOS5以后，你可以扔掉那些第三方JSON解析库了。

## ViewController切换
iOS提供了如下新的接口来切换ViewController，而以前的presentModalViewController和dismissModalViewControllerAnimated被Deprecated掉了。

``` objc
// 新的接口
- (void)presentViewController:(UIViewController *)viewControllerToPresent animated: (BOOL)flag completion:(void (^)(void))completion;
- (void)dismissViewControllerAnimated: (BOOL)flag completion: (void (^)(void))completion;

// 被Deprecated的接口
- (void)presentModalViewController:(UIViewController *)modalViewController animated:(BOOL)animated;
- (void)dismissModalViewControllerAnimated:(BOOL)animated;
```

新接口的差别是提供了一个completion参数，允许你传入一个block，来定义该操作结束时的回调。使用新的函数后，可以方便同时Dismiss或Present多个View Controller，也可以方便做多个UI效果之间的衔接。

##其它
GameKit, Core Data, NewsstandKit, GLKit在iOS5中都有更新。可惜我都没有具体使用过，所以不便做更多介绍。

Have fun!
