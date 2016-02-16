---
layout: post
title: "不要使用SBJSON(json-framework)"
date: 2012-05-05 09:35
comments: true
categories: iOS
---

不知道为什么，在iOS开发中，有很多人使用 [SBJSON](https://github.com/stig/json-framework) （又被称作json-framework)来做JSON解析库。我想这是因为SBJSON是最早在iOS上出现的JSON解析库。但是随着iOS开发的流行，越来越多优秀的JSON解析库也涌现出来, SBJSON和它们相比，性能上有很大的差距。

<!-- more -->

现在iOS行业内主要流行的JSON解析库有：
[NSJSONSerialization](http://developer.apple.com/library/ios/#documentation/Foundation/Reference/NSJSONSerialization_Class/Reference/Reference.html#//apple_ref/doc/uid/TP40010946)、
[Apple JSON]( http://samsoff.es/posts/parsing-json-with-the-iphones-private-json-framework)、
[TouchJSON](http://github.com/schwa/TouchJSON)、
[SBJSON](http://github.com/stig/json-framework)、
[YAJL](http://github.com/gabriel/yajl-objc)、
[JSONKit](http://github.com/johnezang/JSONKit)

行业内许多同行都对这些库进行过benchmark测试。我在网上搜到的测试文章包括：

 * <https://github.com/samsoffes/json-benchmarks>
 * <http://blog.csdn.net/arthurchenjs/article/details/7009995>
 * <http://blog.csdn.net/ccat/article/details/7207871>
 * <http://omegadelta.net/2011/11/04/json-framework-now-sbjson-is-evil/>
 * <http://stackoverflow.com/questions/2256625/comparison-of-json-parser-for-objective-c-json-framework-yajl-touchjson-etc>

下图是我从[ArthurChenJS](http://my.csdn.net/ArthurChenJS)的[博客文章](http://blog.csdn.net/arthurchenjs/article/details/7009995)中截取的一张benchmark测试结果图(横条越短，解析速度越快)：

{% img /images/json_benchmark.gif %}

从这些文章中可以看到，SBJSON在多数测试中都处于倒数的第一或倒数第二的位置。所以说，SBJSON实际上在性能这一点上讲，确实是非常“SB”的，实在不值得大家留念。赶快把你的JSON解析库换成其它的吧！

那么应该换成哪个呢？
如果你的app只支持iOS 5.0以上系统，那么直接用苹果官方提供的JSON库：[NSJSONSerialization](http://developer.apple.com/library/ios/#documentation/Foundation/Reference/NSJSONSerialization_Class/Reference/Reference.html#//apple_ref/doc/uid/TP40010946)
库即可。
如果你的app要支持iOS 5.0以下的系统，那么我个人推荐JSONKit，不过JSONKit本身做了很多内存上的优化，所以不支持ARC，你在使用时可以对其加上 -fno-objc-arc 的编译标志即可，设置这个编译标志的详细步骤可以见[这篇文章](http://stackoverflow.com/questions/6308425/ios-5-best-practice-release-retain)。

JSONKit的使用也非常方便，在使用上只需要把SBJSON的JSONValue方法换成objectFromJSONData，JSONRepresentation方法换成JSONString即可。附上一段使用示例：

``` objc
#import "JSONKit.h"

NSString *path = [[NSBundle mainBundle] pathForResource:@"data" ofType:@"json"];
NSData *content = [NSData dataWithContentsOfFile:path];
NSDictionary *kitData = [content objectFromJSONData];
NSString *kitString = [kitData JSONString];
```

祝大家玩得开心。
