---
layout: post
title: "粉笔网iPhone端使用的第三方开源库"
date: 2012-10-09 15:30
comments: true
categories: iOS
---

##前言

最近有朋友问我粉笔网iPhone端使用了哪些第三方的开源库。我在这儿整理了一下，分享给大家。

{% img /images/fenbi_libs.png %}

<!-- more -->

### ASIHttpRequest
[ASIHttpRequest](http://allseeing-i.com/ASIHTTPRequest/) 是一个被广泛使用的第三方网络访问开源库。用于提供更加友好的网络访问接口。相信很多搞iOS开发的朋友都用过它。
ASIHttpRequest 的主要使用文档可以[参考这里](http://allseeing-i.com/ASIHTTPRequest/How-to-use)。

另外，由于ASIHTTPRequest的作者已经公开说明不再维护这个开源项目，并且该项目已经一年多没有更新了，所以我一直在寻找替代的开源库。不过现在暂时还没有找到更好的。

### RegexKit
[RegexKit](http://regexkit.sourceforge.net/)是一个正则表达式工具类。提供强大的正则表达式匹配和替换功能。我们主要使用它来对类似微博的正文替换工作。例如将 @某某 换成带链接的，将图片的URL换成img标签等。

同时，开源库MGTemplateEngine也依赖于此库。附上[RegexKit4.0的官方文档教程](http://regexkit.sourceforge.net/Documentation/index.html)。

### MGTemplateEngine
[MGTemplateEngine](http://svn.cocoasourcecode.com/MGTemplateEngine)是一个模版引擎。我们主要使用它来生成单条微博页的内容。我们的单条微博页打算用UIWebView来显示，所以内容需要用模版渲染成HTML格式。MGTemplateEngine的模版语言比较象：Smarty, FreeMarker 和 Django的模版语言。

MGTemplateEngine的作者官方博客在[这里](http://mattgemmell.com/2008/05/20/mgtemplateengine-templates-with-cocoa/)。

我们在使用时，对此开源库的Filter类进行了修改，主要增加了3个自定义的filter，用于提供我们的格式化时间，转义html和过滤空头象的用户的方式。

### JSONKit
[JSONKit](https://github.com/johnezang/JSONKit)是一个比较高效的JSON解析库。我之前比较过各大JSON解析库的性能（[文章在此](http://blog.devtang.com/blog/2012/05/05/do-not-use-sbjson/)），JSONKit算是非常不错的，大概的使用示例如下：

``` objc
#import "JSONKit.h"

NSString *path = [[NSBundle mainBundle] pathForResource:@"data" ofType:@"json"];
NSData *content = [NSData dataWithContentsOfFile:path];
NSDictionary *kitData = [content objectFromJSONData];
NSString *kitString = [kitData JSONString];
```


### GTMNSString
[GTMNSString](https://code.google.com/p/google-toolbox-for-mac/)主要用于转义HTML中的特殊字符。以防止XSS攻击。

### FMDB
[FMDB](https://github.com/ccgus/fmdb)是一个sqlite数据库封装类，需要加入 libsqlite3.dylib 依赖以及引入 sqlite3.h 头文件即可。在使用上非常简单。如下是一个例子：

``` objc
NSString * docsdir = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
NSString * dbpath = [docsdir stringByAppendingPathComponent:@"user.sqlite"];
FMDatabase * db = [FMDatabase databaseWithPath:dbpath];
[db open];
FMResultSet * rs = [db executeQuery:@"select * from People"];
while ([rs next]) {
    NSLog(@"%@ %@",
    [rs stringForColumn:@"firstname"],
    [rs stringForColumn:@"lastname"]);
}
[db close];
```

### BBCustomBackButtonViewController

[BBCustomBackButtonViewController](https://github.com/typeoneerror/BBCustomBackButtonViewController) 是用于在ios4上提供自定义的NavigationBar按钮的开源库。使用上异常简单，只需要让自己的ViewController继承它就可以了。

我对BBCustomBackButtonViewController进行了修改，主要是改动它的自定义的按钮的样式，使其和我们的风格一致。

### MTStatusBarOverlay 

[MTStatusBarOverlay](https://github.com/myell0w/MTStatusBarOverlay ) 是一个在iphone的顶部status bar显示消息的开源库。示例代码如下：

``` objc
+ (void)showCompletedTextOnStatusBar:(NSString *)text {
    NSString * message = [NSString stringWithFormat:@"%@成功", text];
    MTStatusBarOverlay *overlay = [MTStatusBarOverlay sharedInstance];
    overlay.animation = MTStatusBarOverlayAnimationFallDown;
    overlay.detailViewMode = MTDetailViewModeHistory;
    [overlay postImmediateFinishMessage:message duration:2.0 animated:YES];
    overlay.progress = 1.0;
}
```

但是stackoverflow上说，有项目因为这个审核被拒，但是新浪微博明显采用了此UI方案，所以我们还是大胆用了这个库。后来，我们也顺利通过了审核。

### MBProgressHUD

[MBProgressHUD](https://github.com/jdg/MBProgressHUD) 是一个用于显示灰色的加载进度或结果的类。与系统自带的UIAlertView相比，MBProgressHUD由于背影是黑色的，所以视觉上不是那么强烈。我们主要用它来显示一些加载中的提示，以及一些自已会消失的操作结果（例如网络失败等）。

### NSStringWrapper
因为自己有多年Java开发的经历，我还是不太习惯Objective-C连基本的字符串操作都要查文档，而我自己又记不住老长的方法名，所以我把Objective-C的字符串基本操作都封装成了Java风格的方法调用。这部分是很早前拿周末时间在家里写的，所以是开源的，[源代码地址](https://github.com/tangqiaoboy/xcode_tool/tree/master/NSStringWrappeer)。

### EGOTableViewPullRefresh

[EGOTableViewPullRefresh](https://github.com/enormego/EGOTableViewPullRefresh) 一个开源的下拉刷新组件。我对它进行了改进，增加了强制刷新功能。

### LoadMoreTableFooterView

[LoadMoreTableFooterView](https://github.com/sishen/LoadMoreTableFooterView) 一个开源的上拉加载更多的组件。我做了少量修改，以便让它支持iPhone5的分辨率。

### zepto.js
[zepto](http://zeptojs.com/)是一个类似JQuery的javascript开源库，用于实现css选择器和一些dom操作。它的api几乎和JQuery完全一样，优点是体积小巧。

### ejs

[ejs](http://embeddedjs.com/getting_started.html)一个js端的模版库。我们主要用于渲染一些UIWebview中异步加载的内容。例如笔记的评论，问题的答案。

##总结
希望上面的开源库能对你有用。最后分享一张粉笔网全站用到的所有开源项目的图片。

{% img /images/opensource.jpg %}


