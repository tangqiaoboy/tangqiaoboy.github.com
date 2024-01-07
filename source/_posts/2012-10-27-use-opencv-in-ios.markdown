---
layout: post
title: "在MacOS和iOS系统中使用OpenCV"
date: 2012-10-27 20:43
comments: true
categories: iOS
---

## 前言

{% img /images/opencv.png %}

[OpenCV](http://opencv.org/about.html) 是一个开源的跨平台计算机视觉库，实现了图像处理和计算机视觉方面的很多通用算法。

最近试着在 MacOS 和 iOS 上使用 OpenCV，发现网上关于在 MacOS 和 iOS 上搭建 OpenCV 的资料很少。好不容易搜到些资料，却发现由于 OpenCV 和 Xcode 的版本更新，变得不再有用了。有些问题费了我很多时间，在此总结分享给大家，希望后来人少走些弯路。

可以预见到，随着 Xcode 和 OpenCV 的版本更新，本文可能不再有效了。

所以特此注明，文本介绍的搭建方法仅针对于 Xcode4.5.1 和 OpenCV 2.4.2 版本。

（2013-6-22）更新: 我在 Xcode4.6.2 和 OpenCV 2.4.5 版本的时候重新进行了一次环境搭建，以下内容做了相应调整，应该也是有效的。

<!-- more -->

## MacOS 系统中使用 OpenCV

###  在 Mac OS Lion 中安装 OpenCV

相信大部分 Mac 用户都安装了 brew 或 port，如果你没有装，那么首先安装一下 brew 吧。使用如下命令安装 brew:

``` bash
ruby -e "$(curl -fsSkL raw.github.com/mxcl/homebrew/go)"
```

在安装好 brew 后，只需要一条命令就可以安装 OpenCV 了：
``` bash
brew install opencv
```

通常情况下这样做就应该会安装成功，但我在公司和家里面的电脑尝试的时候，brew 都会报一些错误，我遇到的都是一些小问题，按照 brew 的提示信息，解决掉相应的问题即可。

安装成功后，你应该可以在 “/usr/local/include" 目录下找到名为 opencv 和 opencv2 的目录，这里面是 OpenCV 相关的头文件。你也可以在 “/usr/local/lib" 目录下找到许多以 libopencv_ 开头的 .dylib 文件，这些是 OpenCV 的链接库文件。

###  在 Mac OS Mountain Lion 中安装 OpenCV

按照 [该教程](http://tilomitra.com/opencv-on-mac-osx/)，先用 brew 安装 cmake.

去 [OpenCV 官网](http://opencv.org/) 下载 Linux/Mac 版的源码，将源码解压后，在控制台中切换到源码目录，执行如下操作：

``` bash
# make a separate directory for building
mkdir build
cd build
cmake -G "Unix Makefiles" ..

# Now, we can make OpenCV. Type the following in:
make -j8
sudo make install
```

上面的命令在执行时要注意，整个源码目录的路径不能带空格。否则编译会报错找不到一些文件。

安装成功后，你应该可以在 “/usr/local/include" 目录下找到名为 opencv 和 opencv2 的目录，这里面是 OpenCV 相关的头文件。你也可以在 “/usr/local/lib" 目录下找到许多以 libopencv_ 开头的 .dylib 文件，这些是 OpenCV 的链接库文件。

### 在 MacOS 系统中使用 OpenCV
接着我们可以试着在 Xcode 工程中使用 OpenCV。

新建一个 Cocoa Application 的工程。工程建好后，选中工程的 Target，在 Build Settings 一样，找到 “Header Search Paths" 这一个选项，将它的值改为 “/usr/local/include"。

同样还需要设置的还有 "Lib Search Paths" 这一项，将它的值改为 "/usr/local/lib/**", 如下所示：

{% img /images/use-opencv-in-mac-1.jpg %}

接着切换到 Build Phases 这个 tab，在 “Link Binary With Libraries" 中，选项 + 号，然后将弹出的文件选择对话框目录切换到 “/usr/local/lib" 目录下，选择你需要使用的 OpenCV 链接库（通常情况下，你至少会需要 core、highgui 和 imgproc 库)，如下图所示（截图中的 OpenCV 版本号可能和你的有差别，但应该不影响）：

{% img /images/use-opencv-in-mac-2.png %}

这里有一个技巧，因为 /usr 目录在对话框中默认不是可见的，可以按快捷键 command + shift + G，在弹出的 “前往文件夹 " 对话框中输入 /usr/local/lib ，即可跳转到目标文件夹。如下图所示：

{% img /images/use-opencv-in-mac-3.png %}

下一步是我自己试出来的，对于 Lion 操作系统，你需要在 Build Settings 中，将 “C++ Language Dialect” 设置成 C++11，将 “C++ Standard Library” 设置成 libstdc++ ，如下图所示。个人感觉是由于 Xcode 默认设置的 GNU++11、libc++ 与 OpenCV 库有一些兼容性问题，我在更改该设置前老是出现编译错误。后续版本在 Montain Lion 系统中解决了这个问题，不用进行这一步了。

{% img /images/use-opencv-in-mac-4.png %}

把上面的设置都做好后，就可以在需要的使用 OpenCV 库的地方，加上 opencv 的头文件引用即可：

``` objc
#import "opencv2/opencv.hpp"
```

注意，如果你的源文件扩展名是 .m 的，你还需要改成 .mm，这样编译器才知道你将会在该文件混合使用 C++ 语言和 Objective-C 语言。

OpenCV 处理图象需要的格式是 cv::Mat 类，而 MacOS 的图象格式默认是 NSImage，所以你需要知道如何在 cv::Mat 与 NSImage 之前相互转换。如下是一个 NSImage 的 Addition，你肯定会需要它的。该代码来自 stackoverflow 上的 [这个贴子](http://stackoverflow.com/questions/8563356/nsimage-to-cvmat-and-vice-versa)。

NSImage+OpenCV.h 文件：
``` objc
//
//  NSImage+OpenCV.h
//
//  Created by TangQiao on 12-10-26.
//

#import <Foundation/Foundation.h>
#import "opencv2/opencv.hpp"

@interface NSImage (OpenCV)

+(NSImage*)imageWithCVMat:(const cv::Mat&)cvMat;
-(id)initWithCVMat:(const cv::Mat&)cvMat;

@property(nonatomic, readonly) cv::Mat CVMat;
@property(nonatomic, readonly) cv::Mat CVGrayscaleMat;

@end

```

NSImage+OpenCV.mm 文件：
``` objc
//
//  NSImage+OpenCV.mm
//
//  Created by TangQiao on 12-10-26.
//

#import "NSImage+OpenCV.h"

static void ProviderReleaseDataNOP(void *info, const void *data, size_t size)
{
    return;
}


@implementation NSImage (OpenCV)

-(CGImageRef)CGImage
{
    CGContextRef bitmapCtx = CGBitmapContextCreate(NULL/*data - pass NULL to let CG allocate the memory*/,
                                                   [self size].width,
                                                   [self size].height,
                                                   8 /*bitsPerComponent*/,
                                                   0 /*bytesPerRow - CG will calculate it for you if it's allocating the data.  This might get padded out a bit for better alignment*/,
                                                   [[NSColorSpace genericRGBColorSpace] CGColorSpace],
                                                   kCGBitmapByteOrder32Host|kCGImageAlphaPremultipliedFirst);
    
    [NSGraphicsContext saveGraphicsState];
    [NSGraphicsContext setCurrentContext:[NSGraphicsContext graphicsContextWithGraphicsPort:bitmapCtx flipped:NO]];
    [self drawInRect:NSMakeRect(0,0, [self size].width, [self size].height) fromRect:NSZeroRect operation:NSCompositeCopy fraction:1.0];
    [NSGraphicsContext restoreGraphicsState];
    
    CGImageRef cgImage = CGBitmapContextCreateImage(bitmapCtx);
    CGContextRelease(bitmapCtx);
    
    return cgImage;
}


-(cv::Mat)CVMat
{
    CGImageRef imageRef = [self CGImage];
    CGColorSpaceRef colorSpace = CGImageGetColorSpace(imageRef);
    CGFloat cols = self.size.width;
    CGFloat rows = self.size.height;
    cv::Mat cvMat(rows, cols, CV_8UC4); // 8 bits per component, 4 channels
    
    CGContextRef contextRef = CGBitmapContextCreate(cvMat.data,                 // Pointer to backing data
                                                    cols,                      // Width of bitmap
                                                    rows,                     // Height of bitmap
                                                    8,                          // Bits per component
                                                    cvMat.step[0],              // Bytes per row
                                                    colorSpace,                 // Colorspace
                                                    kCGImageAlphaNoneSkipLast |
                                                    kCGBitmapByteOrderDefault); // Bitmap info flags
    
    CGContextDrawImage(contextRef, CGRectMake(0, 0, cols, rows), imageRef);
    CGContextRelease(contextRef);
    CGImageRelease(imageRef);
    return cvMat;
}

-(cv::Mat)CVGrayscaleMat
{
    CGImageRef imageRef = [self CGImage];
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceGray();
    CGFloat cols = self.size.width;
    CGFloat rows = self.size.height;
    cv::Mat cvMat = cv::Mat(rows, cols, CV_8UC1); // 8 bits per component, 1 channel
    CGContextRef contextRef = CGBitmapContextCreate(cvMat.data,                 // Pointer to backing data
                                                    cols,                      // Width of bitmap
                                                    rows,                     // Height of bitmap
                                                    8,                          // Bits per component
                                                    cvMat.step[0],              // Bytes per row
                                                    colorSpace,                 // Colorspace
                                                    kCGImageAlphaNone |
                                                    kCGBitmapByteOrderDefault); // Bitmap info flags
    
    CGContextDrawImage(contextRef, CGRectMake(0, 0, cols, rows), imageRef);
    CGContextRelease(contextRef);
    CGColorSpaceRelease(colorSpace);
    CGImageRelease(imageRef);
    return cvMat;
}

+ (NSImage *)imageWithCVMat:(const cv::Mat&)cvMat
{
    return [[[NSImage alloc] initWithCVMat:cvMat] autorelease];
}

- (id)initWithCVMat:(const cv::Mat&)cvMat
{
    NSData *data = [NSData dataWithBytes:cvMat.data length:cvMat.elemSize() * cvMat.total()];
    
    CGColorSpaceRef colorSpace;
    
    if (cvMat.elemSize() == 1)
    {
        colorSpace = CGColorSpaceCreateDeviceGray();
    }
    else
    {
        colorSpace = CGColorSpaceCreateDeviceRGB();
    }
    
    CGDataProviderRef provider = CGDataProviderCreateWithCFData((CFDataRef)data);
    
    CGImageRef imageRef = CGImageCreate(cvMat.cols,                                     // Width
                                        cvMat.rows,                                     // Height
                                        8,                                              // Bits per component
                                        8 * cvMat.elemSize(),                           // Bits per pixel
                                        cvMat.step[0],                                  // Bytes per row
                                        colorSpace,                                     // Colorspace
                                        kCGImageAlphaNone | kCGBitmapByteOrderDefault,  // Bitmap info flags
                                        provider,                                       // CGDataProviderRef
                                        NULL,                                           // Decode
                                        false,                                          // Should interpolate
                                        kCGRenderingIntentDefault);                     // Intent
    
    
    NSBitmapImageRep *bitmapRep = [[NSBitmapImageRep alloc] initWithCGImage:imageRef];
    NSImage *image = [[NSImage alloc] init];
    [image addRepresentation:bitmapRep];
    
    CGImageRelease(imageRef);
    CGDataProviderRelease(provider);
    CGColorSpaceRelease(colorSpace);
    
    return image;
}

@end

```

完成以上步骤后，恭喜你，你可以在源代码中自由地调用 OpenCV 的函数了。

## 在 iOS 系统中使用 OpenCV

### 下载或编译 opencv2.framework
接下来介绍如何在 iOS 程序中使用 OpenCV。在 iOS 上使用最新的 OpenCV 库比较简单，进入 [opencv 的官网](http://opencv.org/)，下载 build 好的名为 opencv2.framework 即可（[下载地址](http://sourceforge.net/projects/opencvlibrary/files/opencv-ios/2.4.3/opencv2.framework.zip/download?utm_expid=6384-3)）。

如果你比较喜欢折腾，也可以自行下载 opencv 的源码，在本地编译 opencv2.framework。[这里](http://docs.opencv.org/trunk/doc/tutorials/introduction/ios_install/ios_install.html#ios-installation) 有官方网站的教程，步骤非常简单，不过我照着它的教程尝试了一下失败了。感觉还是 Xcode 编译器与 OpenCV 代码的兼容性问题，所以就没有继续研究了。

### 在 iOS 程序中使用 OpenCV
新建一个 iOS 工程，将 opencv2.framework 直接拖动到工程中。然后，你需要在 Build Settings 中，将 “C++ Standard Library” 设置成 libstdc++。

因为 opencv 中的 MIN 宏和 UIKit 的 MIN 宏有冲突。所以需要在 .pch 文件中，先定义 opencv 的头文件，否则会有编译错误。将工程的 .pch 文件内容修改成如下所示：

``` objc
#import <Availability.h>

#ifdef __cplusplus
    #import <opencv2/opencv.hpp>
#endif

#ifdef __OBJC__
    #import <UIKit/UIKit.h>
    #import <Foundation/Foundation.h>
#endif
```

把上面的设置都做好后，就可以在需要的使用 OpenCV 库的地方，加上 opencv 的头文件引用即可：

``` objc
#import "opencv2/opencv.hpp"
```

还是那句话，如果你的源文件扩展名是 .m 的，你还需要改成 .mm，这样编译器才知道你将会在该文件中混合使用 C++ 语言和 Objective-C 语言。

同样，iOS 程序内部通常用 UIImage 表示图片，而 OpenCV 处理图象需要的格式是 cv::Mat，你会需要下面这个 Addition 来在 cv::Mat 和 UIImage 格式之间相互转换。该代码来自 [aptogo 的开源代码](https://github.com/aptogo/OpenCVForiPhone)，他的版权信息在源码头文件中。

UIImage+OpenCV.h 文件：
``` objc
//
//  UIImage+OpenCV.h
//  OpenCVClient
//
//  Created by Robin Summerhill on 02/09/2011.
//  Copyright 2011 Aptogo Limited. All rights reserved.
//
//  Permission is given to use this source code file without charge in any
//  project, commercial or otherwise, entirely at your risk, with the condition
//  that any redistribution (in part or whole) of source code must retain
//  this copyright and permission notice. Attribution in compiled projects is
//  appreciated but not required.
//

#import <UIKit/UIKit.h>

@interface UIImage (UIImage_OpenCV)

+(UIImage *)imageWithCVMat:(const cv::Mat&)cvMat;
-(id)initWithCVMat:(const cv::Mat&)cvMat;

@property(nonatomic, readonly) cv::Mat CVMat;
@property(nonatomic, readonly) cv::Mat CVGrayscaleMat;

@end

```

UIImage+OpenCV.mm 文件：
``` objc
//
//  UIImage+OpenCV.mm
//  OpenCVClient
//
//  Created by Robin Summerhill on 02/09/2011.
//  Copyright 2011 Aptogo Limited. All rights reserved.
//
//  Permission is given to use this source code file without charge in any
//  project, commercial or otherwise, entirely at your risk, with the condition
//  that any redistribution (in part or whole) of source code must retain
//  this copyright and permission notice. Attribution in compiled projects is
//  appreciated but not required.
//

#import "UIImage+OpenCV.h"

static void ProviderReleaseDataNOP(void *info, const void *data, size_t size)
{
    // Do not release memory
    return;
}



@implementation UIImage (UIImage_OpenCV)

-(cv::Mat)CVMat
{
    
    CGColorSpaceRef colorSpace = CGImageGetColorSpace(self.CGImage);
    CGFloat cols = self.size.width;
    CGFloat rows = self.size.height;
    
    cv::Mat cvMat(rows, cols, CV_8UC4); // 8 bits per component, 4 channels
    
    CGContextRef contextRef = CGBitmapContextCreate(cvMat.data,                 // Pointer to backing data
                                                    cols,                      // Width of bitmap
                                                    rows,                     // Height of bitmap
                                                    8,                          // Bits per component
                                                    cvMat.step[0],              // Bytes per row
                                                    colorSpace,                 // Colorspace
                                                    kCGImageAlphaNoneSkipLast |
                                                    kCGBitmapByteOrderDefault); // Bitmap info flags
    
    CGContextDrawImage(contextRef, CGRectMake(0, 0, cols, rows), self.CGImage);
    CGContextRelease(contextRef);
    
    return cvMat;
}

-(cv::Mat)CVGrayscaleMat
{
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceGray();
    CGFloat cols = self.size.width;
    CGFloat rows = self.size.height;
    
    cv::Mat cvMat = cv::Mat(rows, cols, CV_8UC1); // 8 bits per component, 1 channel
 
    CGContextRef contextRef = CGBitmapContextCreate(cvMat.data,                 // Pointer to backing data
                                                    cols,                      // Width of bitmap
                                                    rows,                     // Height of bitmap
                                                    8,                          // Bits per component
                                                    cvMat.step[0],              // Bytes per row
                                                    colorSpace,                 // Colorspace
                                                    kCGImageAlphaNone |
                                                    kCGBitmapByteOrderDefault); // Bitmap info flags
    
    CGContextDrawImage(contextRef, CGRectMake(0, 0, cols, rows), self.CGImage);
    CGContextRelease(contextRef);
    CGColorSpaceRelease(colorSpace);
    
    return cvMat;
}

+ (UIImage *)imageWithCVMat:(const cv::Mat&)cvMat
{
    return [[[UIImage alloc] initWithCVMat:cvMat] autorelease];
}

- (id)initWithCVMat:(const cv::Mat&)cvMat
{
    NSData *data = [NSData dataWithBytes:cvMat.data length:cvMat.elemSize() * cvMat.total()];
    
    CGColorSpaceRef colorSpace;
    
    if (cvMat.elemSize() == 1)
    {
        colorSpace = CGColorSpaceCreateDeviceGray();
    }
    else
    {
        colorSpace = CGColorSpaceCreateDeviceRGB();
    }
    
    CGDataProviderRef provider = CGDataProviderCreateWithCFData((CFDataRef)data);
    
    CGImageRef imageRef = CGImageCreate(cvMat.cols,                                     // Width
                                        cvMat.rows,                                     // Height
                                        8,                                              // Bits per component
                                        8 * cvMat.elemSize(),                           // Bits per pixel
                                        cvMat.step[0],                                  // Bytes per row
                                        colorSpace,                                     // Colorspace
                                        kCGImageAlphaNone | kCGBitmapByteOrderDefault,  // Bitmap info flags
                                        provider,                                       // CGDataProviderRef
                                        NULL,                                           // Decode
                                        false,                                          // Should interpolate
                                        kCGRenderingIntentDefault);                     // Intent   
    
    self = [self initWithCGImage:imageRef];
    CGImageRelease(imageRef);
    CGDataProviderRelease(provider);
    CGColorSpaceRelease(colorSpace);
    
    return self;
}

@end

```

## 总结

上面 2 个环境搭建好后，你就可以在 MacOS 上试验各种图象处理算法，然后很方便地移值到 iOS 上。

一直觉得，图象和声音是移动设备上的特点和优势。因为移动设备没有了可以快速输入的键盘，屏幕也不大，在移动设备上，声音，图象和视频应该是相比文字更方便让人输入的东西。移动端 APP 应该利用好这些特点，才能设计出更加体贴的功能。

而且，通常情况下做图象处理都比较好玩，记得以前在学校做了一个在 QQ 游戏大厅自动下中国象棋的程序，其后台使用了网上下载的一个带命令行接口的象棋 AI，然后我的代码主要做的事情就是识别象棋棋盘，然后将棋盘数据传给那个象棋 AI，接着获得它返回的策略后，模拟鼠标点击来移动棋子。当时不懂什么图象算法，直接把棋子先截取下来保存，然后识别的时候做完全匹配，非常弱的办法，但是效果非常好，做出来也很好玩。嗯，所以文章最后，我想说的是：have fun!




