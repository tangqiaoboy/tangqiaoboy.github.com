---
layout: post
title: "在iOS中使用ZXing库"
date: 2012-12-23 17:03
comments: true
categories: iOS
---

{% img /images/zxing-icon.png %}

##前言

[ZXing](https://code.google.com/p/zxing/)([Github镜像地址](https://github.com/zxing/zxing))是一个开源的条码生成和扫描库（开源协议为[Apache2.0](http://www.apache.org/licenses/LICENSE-2.0))。它不但支持众多的条码格式，而且有各种语言的实现版本，它支持的语言包括：Java, C++, C#, Objective-C, ActionScript和Ruby。

我上周在iOS项目开发中使用了ZXing的扫描二维码功能。在此总结一下如何将ZXing集成到已有的iOS工程中，分享给大家。

<!-- more -->

##集成步骤

首先去Google Code或Github将ZXing的代码下载下来，整个工程比较大，我们只需要其中涉及iOS的部分，所以最好做一些裁剪。简单来说，我们只需要保留cpp和iphone这2个文件夹，其余的全部删掉。如下图所示：

{% img /images/zxing-step-1.png %}

接着我们继续裁剪，对于cpp这个目录，只保留cpp/core/src/zxing下面的内容，其余内容也可以删掉了。但是整个目录结构必须保持原样。裁剪完后，整个目录结构如下所示：

{% img /images/zxing-step-2.png %}

接下来，我们把裁剪后的zxing目录整个移动到我们的iOS项目的目录下，并且把上图中可以看到的ZXingWidget.xcodeproj文件拖动到我们的iOS工程中。

下一步，我们需要设置ZXing项目和我们原本的iOS项目之间的依赖关系。在我们的iOS项目的设置中，点击build phases tab，然后增加 Target Dependencies 和 Link binary，并且增加这些framework依赖：

	a. AVFoundation
	b. AudioToolbox
	c. CoreVideo
	d. CoreMedia
	e. libiconv
	f. AddressBook
	g. AddressBookUI

完成之后如下图所示：

{% img /images/zxing-step-3.jpg %}


最后一步，在设置中增加如下2个header search path:

 * ./zxing/iphone/ZXingWidget/Classes
 * ./zxing/cpp/core/src

需要注意的是，第一个path要设置成循环查找子目录，而第二个不循环查找，如下图所示：

{% img /images/zxing-step-4.png %}


恭喜你，完成这步之后，你就已经完成ZXing库的集成了。下面谈谈如何使用ZXing库来做二维码识别。

##二维码识别

ZXing的iOS版本提供2种方法来做二维码识别功能，第一种方法比较简单，第二种方法比较复杂。我在做Demo时使用了第一种方法，做真正项目开发的时候使用了第二种方法，所以都给大家介绍一下。

###使用方法一
ZXing直接提供了一个扫描二维码的View Controller，即ZXingWidgetController。在需要使用的界面代码中，加入文件依赖：

``` objc
#import <ZXingWidgetController.h>
#import <QRCodeReader.h> 
``` 
然后在需要扫描的时候，调用如下代码即可：
``` objc
- (IBAction)scanPressed:(id)sender {
  ZXingWidgetController *widController = [[ZXingWidgetController alloc] initWithDelegate:self showCancel:YES OneDMode:NO];
  NSMutableSet *readers = [[NSMutableSet alloc ] init];
  QRCodeReader* qrcodeReader = [[QRCodeReader alloc] init];
  [readers addObject:qrcodeReader];
  [qrcodeReader release];
  widController.readers = readers;
  [readers release];
  [self presentModalViewController:widController animated:YES];
  [widController release];
}
```

在ZXing扫描有结果时，会调用如下回调函数：

``` objc

@protocol ZXingDelegate
- (void)zxingController:(ZXingWidgetController*)controller didScanResult:(NSString *)result;
- (void)zxingControllerDidCancel:(ZXingWidgetController*)controller;
@end

```

###使用方法二

方法二与方法一的区别就相当于AVFoundation和UIImagePickerController的区别一样。简单来说，就是使用方法二比方法一更加麻烦，但是获得的可定制性更高。

使用方法二时，你需要自己用AVFoundation获得Camera返回的实时图象，然后转成UIImage，最后传给ZXing的Decoder类完成二维码的识别。由于使用AVFoundation涉及的代码略多，我写的示意代码如下：

``` objc

#import "Decoder.h"
#import "TwoDDecoderResult.h"
#import "QRCodeReader.h"

- (void)viewDidLoad {
	// setup QR reader
	self.qrReader = [[NSMutableSet alloc ] init];
	QRCodeReader* qrcodeReader = [[QRCodeReader alloc] init];
	[self.qrReader addObject:qrcodeReader];
	self.scanningQR = NO;
	self.step = STEP_QR;
}

// AVFoundation的回调函数
- (void)captureOutput:(AVCaptureOutput *)captureOutput didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer fromConnection:(AVCaptureConnection *)connection {
	// 第一步，将sampleBuffer转成UIImage
	UIImage *image= [self getCaptureImage:sampleBuffer];
	// 第二步，用Decoder识别图象
	Decoder *d = [[Decoder alloc] init];
	d.readers = self.qrReader;
	d.delegate = self;
	self.scanningQR = [d decodeImage:image] == YES ? NO : YES;
}
```

ZXing的Decoder类提供了以下回调函数获得识别结果：

``` objc
@protocol DecoderDelegate<NSObject>
@optional
- (void)decoder:(Decoder *)decoder willDecodeImage:(UIImage *)image usingSubset:(UIImage *)subset;
- (void)decoder:(Decoder *)decoder didDecodeImage:(UIImage *)image usingSubset:(UIImage *)subset withResult:(TwoDDecoderResult *)result {
	NSLog(@"result = %@", [result text]);
}
- (void)decoder:(Decoder *)decoder failedToDecodeImage:(UIImage *)image usingSubset:(UIImage *)subset reason:(NSString *)reason;
- (void)decoder:(Decoder *)decoder foundPossibleResultPoint:(CGPoint)point;

@end

```

##Trouble Shoot & Tips

我在使用中遇到了一些问题，主要是编译的问题。

 1. 一个是找不到 <iostream> 头文件。解决方法：把用到ZXing的源文件扩展名由.m改成.mm。
 2. 报错：Undefined symbols for architecture armv7s，[解决方法](http://stackoverflow.com/questions/12968369/undefined-symbols-for-architecture-armv7-when-using-zxing-library-in-xcode-4-5)：把ZXingWidget的一个build target参数："Build Active Architecture Only" 修改成 "NO".
 3. 报错：No such file or directory，出现该错误可能是你的Header Search Path写错了，或者就是你的zxing库的目录结构不是我上面强调的，好好检查一下吧。
 4. 如果你需要生成二维码做测试，推荐一个不错的在线生成二维码的网站：<http://cli.im/>

##ZXing和OpenCV的兼容问题

ZXing 2.1 和OpenCV 2.4.3的iOS库有一些兼容问题，他们对C++标准库的版本和编译器版本都有一些需求，造成满足一方了，另一方就编译不通过了。Stackoverflow上有人终于找到了一个让它们和平共处的方法，但是只适用于iOS5.0以上版本。正好我们的App只支持iOS5.0+，所以就搞定了。所以如果你也正好遇到这个问题，可以参考[这个贴子](http://stackoverflow.com/questions/13498581/opencv-zxing-incompatibility-on-ios)。


希望本文对大家有用，Have Fun~







