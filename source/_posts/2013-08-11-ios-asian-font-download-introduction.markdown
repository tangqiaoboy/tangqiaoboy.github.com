---
layout: post
title: "动态下载苹果提供的多种中文字体"
date: 2013-08-11 16:00
comments: true
categories: iOS
---

{% img /images/wawati-sample.jpg %}

## 引言

在今年 WWDC 的内容公开之前，大家都以为 iOS 系统里面只有一种中文字体。为了达到更好的字体效果，有些应用在自己的应用资源包中加入了字体文件。但自己打包字体文件比较麻烦，原因在于：

1、字体文件通常比较大，10M - 20M 是一个常见的字体库的大小。大部分的非游戏的 app 体积都集中在 10M 以内，因为字体文件的加入而造成应用体积翻倍让人感觉有些不值。如果只是很少量的按钮字体需要设置，可以用一些工具把使用到的汉字字体编码从字体库中抽取出来，以节省体积。但如果是一些变化的内容需要自定义的字体，那就只有打包整个字体库了。

2、中文的字体通常都是有版权的。在应用中加入特殊中文字体还需要处理相应的版权问题。对于一些小公司或个人开发者来说，这是一笔不小的开销。

以上两点造成 App Store 里面使用特殊中文字库的 iOS 应用较少。现在通常只有阅读类的应用才会使用特殊中文字库。

但其实从 iOS6 开始，苹果就支持动态下载中文字体到系统中。只是苹果一直没有公开相应的 API。最终，相应的 API 在今年的 WWDC 大会上公开，接下来就让我们来一起了解这个功能。

<!-- more -->

## 功能介绍

使用动态下载中文字体的 API 可以动态地向 iOS 系统中添加字体文件，这些字体文件都是下载到系统的目录中（目录是`/private/var/mobile/Library/Assets/com_apple_MobileAsset_Font/`），所以并不会造成应用体积的增加。并且，由于字体文件是 iOS 系统提供的，也免去了字体使用版权的问题。虽然第一次下载相关的中文字体需要一些网络开销和下载时间，但是这些字体文件下载后可以在所有应用间共享，所以可以遇见到，随着该 API 使用的普及，大部分应用都不需要提示用户下载字体，因为很可能这些字体在之前就被其它应用下载下来了。

## 字体列表

在 [这个链接](http://support.apple.com/kb/HT5484?viewlocale=zh_CN) 中，苹果列出了提供动态下载和使用中文字体文件列表。不过，由于下载的时候需要使用的名字是 PostScript 名称，所以如果你真正要动态下载相应的字体的话，还需要使用 Mac 内自带的应用 “字体册 “来获得相应字体的 PostScript 名称。如下显示了从” 字体册 “中获取《兰亭黑-简 特黑》字体的 PostScript 名称的截图：

{% img /images/font-postscript-name.jpg %}

## API 介绍

苹果提供的动态下载代码的 [Demo 工程](http://developer.apple.com/library/ios/#samplecode/DownloadFont/Listings/DownloadFont_ViewController_m.html
) 链接在这里。将此 Demo 工程下载下来，即可学习相应 API 的使用。下面我对该工程中相应 API 做简单的介绍。

假如我们现在要下载娃娃体字体，它的 PostScript 名称为`DFWaWaSC-W5`。具体的步骤如下：

1、我们先判断该字体是否已经被下载下来了，代码如下：

``` objc

- (BOOL)isFontDownloaded:(NSString *)fontName {
    UIFont* aFont = [UIFont fontWithName:fontName size:12.0];
    if (aFont && ([aFont.fontName compare:fontName] == NSOrderedSame 
               || [aFont.familyName compare:fontName] == NSOrderedSame)) {
        return YES;
    } else {
        return NO;
    }
}

```

2、如果该字体下载过了，则可以直接使用。否则我们需要先准备下载字体 API 需要的一些参数，如下所示：

``` objc

// 用字体的 PostScript 名字创建一个 Dictionary
NSMutableDictionary *attrs = [NSMutableDictionary dictionaryWithObjectsAndKeys:fontName, kCTFontNameAttribute, nil];

// 创建一个字体描述对象 CTFontDescriptorRef
CTFontDescriptorRef desc = CTFontDescriptorCreateWithAttributes((__bridge CFDictionaryRef)attrs);

// 将字体描述对象放到一个 NSMutableArray 中
NSMutableArray *descs = [NSMutableArray arrayWithCapacity:0];
[descs addObject:(__bridge id)desc];
CFRelease(desc);

```

3、准备好上面的`descs`变量后，则可以进行字体的下载了，代码如下：

``` objc

__block BOOL errorDuringDownload = NO;

CTFontDescriptorMatchFontDescriptorsWithProgressHandler( (__bridge CFArrayRef)descs, NULL,  ^(CTFontDescriptorMatchingState state, CFDictionaryRef progressParameter) {
    
    double progressValue = [[(__bridge NSDictionary *)progressParameter objectForKey:(id)kCTFontDescriptorMatchingPercentage] doubleValue];
    
    if (state == kCTFontDescriptorMatchingDidBegin) {
        NSLog(@" 字体已经匹配 ");
    } else if (state == kCTFontDescriptorMatchingDidFinish) {    
        if (!errorDuringDownload) {
            NSLog(@" 字体 %@ 下载完成 ", fontName);
        }
    } else if (state == kCTFontDescriptorMatchingWillBeginDownloading) {
        NSLog(@" 字体开始下载 ");
    } else if (state == kCTFontDescriptorMatchingDidFinishDownloading) {
        NSLog(@" 字体下载完成 ");
        dispatch_async( dispatch_get_main_queue(), ^ {
            // 可以在这里修改 UI 控件的字体
        });
    } else if (state == kCTFontDescriptorMatchingDownloading) {
        NSLog(@" 下载进度 %.0f%% ", progressValue);
    } else if (state == kCTFontDescriptorMatchingDidFailWithError) {
        NSError *error = [(__bridge NSDictionary *)progressParameter objectForKey:(id)kCTFontDescriptorMatchingError];
        if (error != nil) {
            _errorMessage = [error description];
        } else {
            _errorMessage = @"ERROR MESSAGE IS NOT AVAILABLE!";
        }
        // 设置标志
        errorDuringDownload = YES;
        NSLog(@" 下载错误: %@", _errorMessage);
    }
    
    return (BOOL)YES;
});

```

通常需要在下载完字体后开始使用字体，一般是将相应代码放到 kCTFontDescriptorMatchingDidFinish 那个条件中做，可以象苹果官网的示例代码上那样，用 GCD 来改 UI 的逻辑，也可以发 Notification 来通知相应的 Controller。

以下是通过以上示例代码下载下来的娃娃体字体截图：

{% img /images/wawati-sample.jpg %}

## iOS 版本限制

以上代码只能运行在 iOS6 以上的系统，但当前还有不少用户是 iOS5 的系统。不过，随着苹果在 WWDC2013 中推出 iOS7 的 beta 版，很多人都期待着使用 iOS7。从历史数据上看，苹果 iOS 新版本推出后，通常 3 个月内就可以达到 50% 以上的使用比例。所以，可以遇见到在今年年底，iOS5 的用户将所剩无几。如果我们打算在年底只支持 iOS6 以上的系统，那么就可以通过上面介绍的方法使用大量中文字体来美化你的应用。

愿新的 API 能让大家的应用更加美观，have fun!
