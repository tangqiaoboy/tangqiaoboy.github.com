---
layout: post
title: "基于 CoreText 的排版引擎：基础"
date: 2015-06-27 08:39:56 +0800
comments: true
categories: iOS
---

## 版权说明

原创文章，转载请保留以下信息：

 * 本文节选自我的图书：《<a href="http://item.jd.com/11598468.html" target="_blank">iOS 开发进阶 </a>》。
 * 本文涉及的 Demo 工程在这里：<https://github.com/tangqiaoboy/iOS-Pro>。
 * 扫码关注我的「iOS 开发」微信公众帐号：

 ![二维码](http://blog.devtang.com/images/weixin-qr.jpg)

## 本章前言

使用 CoreText 技术，我们可以对富文本进行复杂的排版。经过一些简单的扩展，我们还可以实现对于图片，链接的点击效果。CoreText 技术相对于 UIWebView，有着更少的内存占用，以及可以在后台渲染的优点，非常适合用于内容的排版工作。

本章我们将从最基本的开始，一步一步完成一个支持图文混排、支持图片和链接点击的排版引擎。

## CoreText 简介

CoreText 是用于处理文字和字体的底层技术。它直接和 Core Graphics（又被称为 Quartz）打交道。Quartz 是一个 2D 图形渲染引擎，能够处理 OSX 和 iOS 中的图形显示。

Quartz 能够直接处理字体（font）和字形（glyphs），将文字渲染到界面上，它是基础库中唯一能够处理字形的模块。因此，CoreText 为了排版，需要将显示的文本内容、位置、字体、字形直接传递给 Quartz。相比其它 UI 组件，由于 CoreText 直接和 Quartz 来交互，所以它具有高速的排版效果。

下图是 CoreText 的架构图，可以看到，CoreText 处于非常底层的位置，上层的 UI 控件（包括 UILabel，UITextField 以及 UITextView）和 UIWebView 都是基于 CoreText 来实现的。

> 注意：这个是 iOS7 之后的架构图，在 iOS7 以前，并没有图中的 Text Kit 类，不过 CoreText 仍然是处在最底层直接和 Core Graphics 打交道的模块。

![CoreText 的架构图](http://tangqiao.b0.upaiyun.com/coretext/coretext_arch.png)

UIWebView 也是处理复杂的文字排版的备选方案。对于排版，基于 CoreText 和基于 UIWebView 相比，前者有以下好处：

 * CoreText 占用的内存更少，渲染速度快，UIWebView 占用的内存更多，渲染速度慢。
 * CoreText 在渲染界面前就可以精确地获得显示内容的高度（只要有了 CTFrame 即可），而 UIWebView 只有渲染出内容后，才能获得内容的高度（而且还需要用 javascript 代码来获取）
 * CoreText 的 CTFrame 可以在后台线程渲染，UIWebView 的内容只能在主线程（UI 线程）渲染。
 * 基于 CoreText 可以做更好的原生交互效果，交互效果可以更细腻。而 UIWebView 的交互效果都是用 javascript 来实现的，在交互效果上会有一些卡顿存在。例如，在 UIWebView 下，一个简单的按钮按下效果，都无法做到原生按钮的即时和细腻的按下效果。

当然，基于 CoreText 的排版方案也有一些劣势：

 * CoreText 渲染出来的内容不能像 UIWebView 那样方便地支持内容的复制。
 * 基于 CoreText 来排版需要自己处理很多复杂逻辑，例如需要自己处理图片与文字混排相关的逻辑，也需要自己实现链接点击操作的支持。

在业界，很多应用都采用了基于 CoreText 技术的排版方案，例如：新浪微博客户端，多看阅读客户端。我所在的创业公司的猿题库，也使用了自己基于 CoreText 技术实现的排版引擎，下图是我们产品的一个图文混排的界面（其中所有公式都是用图片的方式呈现的），可以看到，图片和文字排版效果很好。

![猿题库的采用 CoreText 渲染的界面](http://tangqiao.b0.upaiyun.com/coretext/coretext-1.png)

## 基于 CoreText 的基础排版引擎

### 不带图片的排版引擎

下面我们来尝试完成一个基于 CoreText 的排版引擎。我们将从最简单的排版功能开始，然后逐步支持图文混排，链接点击等功能。

首先我们来尝试完成一个不支持图片内容的纯文字排版引擎。

注意 1：由于整个排版引擎的代码太多，为方便读者阅读，文章中只会列出最关键的核心代码，完整的代码请参考本书对应的 github 项目，项目地址是：https://github.com/tangqiaoboy/iOS-Pro 。

## 能输出 Hello World 的 CoreText 工程

### 操作步骤

我们首先新建一个 Xcode 工程，步骤如下：

 1. 打开 Xcode，选择 "File"->"New"->"Project", 在弹出的对话框中，选择 “Single View Application”，然后点击 "Next"。（图 2）
 1. 接着填上项目名 CoreTextDemo，然后点击 “Next”。（图 3）
 1. 选择保存目录后，我们就成功创建了一个空的工程。

 图 2
 ![图 2](http://tangqiao.b0.upaiyun.com/coretext/coretext-2.png)

 图 3
 ![图 3](http://tangqiao.b0.upaiyun.com/coretext/coretext-3.png)

在工程目录 “CoreTextDemo” 上右击，选择 “New File”, 然后填入类名`CTDisplayView`, 并且让它的父类是 UIView。（如下图）

 ![](http://tangqiao.b0.upaiyun.com/coretext/coretext-create-ctdisplayview.png)

接着，我们在`CTDisplayView.m`文件中，让其 import 头文件`CoreText/CoreText.h`，接着输入以下代码来实现其`drawRect`方法：

```
#import "CTDisplayView.h"
#import "CoreText/CoreText.h"

@implementation CTDisplayView

- (void)drawRect:(CGRect)rect
{
    [super drawRect:rect];

    // 步骤 1
    CGContextRef context = UIGraphicsGetCurrentContext();

    // 步骤 2
    CGContextSetTextMatrix(context, CGAffineTransformIdentity);
    CGContextTranslateCTM(context, 0, self.bounds.size.height);
    CGContextScaleCTM(context, 1.0, -1.0);

    // 步骤 3
    CGMutablePathRef path = CGPathCreateMutable();
    CGPathAddRect(path, NULL, self.bounds);

    // 步骤 4
    NSAttributedString *attString = [[NSAttributedString alloc] initWithString:@"Hello World!"];
    CTFramesetterRef framesetter =
    CTFramesetterCreateWithAttributedString((CFAttributedStringRef)attString);
    CTFrameRef frame =
    CTFramesetterCreateFrame(framesetter,
                             CFRangeMake(0, [attString length]), path, NULL);

    // 步骤 5
    CTFrameDraw(frame, context);

    // 步骤 6
    CFRelease(frame);
    CFRelease(path);
    CFRelease(framesetter);
}

@end

```


打开程序的 Storyboard 文件：`Main_iPhone.storyboard`：执行下面 2 步：

 1. 将一个 UIView 控件拖动到主界面正中间。（如下图步骤 1）
 2. 将该 UIView 控件的类名从`UIView`修改为`CTDisplayView`。（如下图步骤 2）

![图 4](http://tangqiao.b0.upaiyun.com/coretext/coretext-4.png)

之后，我们运行程序，就可以看到，Hello World 出现在程序正中间了。如下图。

![图 5](http://tangqiao.b0.upaiyun.com/coretext/coretext-5.png)

###代码解释

下面解释一下`drawRect`方法主要的步骤：

 1. 得到当前绘制画布的上下文，用于后续将内容绘制在画布上。
 1. 将坐标系上下翻转。对于底层的绘制引擎来说，屏幕的左下角是（0, 0）坐标。而对于上层的 UIKit 来说，左上角是 (0, 0) 坐标。所以我们为了之后的坐标系描述按 UIKit 来做，所以先在这里做一个坐标系的上下翻转操作。翻转之后，底层和上层的 (0, 0) 坐标就是重合的了。

    为了加深理解，我们将这部分的代码块注释掉，你会发现，整个`Hello World`界面将上下翻转，如下图所示。

    ![图：上下翻转的界面](http://tangqiao.b0.upaiyun.com/coretext/coretext-flip.png)


 1. 创建绘制的区域，CoreText 本身支持各种文字排版的区域，我们这里简单地将 UIView 的整个界面作为排版的区域。

为了加深理解，我们将该步骤的代码替换成如下代码，测试设置不同的绘制区域带来的界面变化。


```
// 步骤 3
CGMutablePathRef path = CGPathCreateMutable();
CGPathAddEllipseInRect(path, NULL, self.bounds);

// 步骤 4
NSAttributedString *attString = [[NSAttributedString alloc] initWithString:@"Hello World! "
                                 " 创建绘制的区域，CoreText 本身支持各种文字排版的区域，"
                                 " 我们这里简单地将 UIView 的整个界面作为排版的区域。"
                                 " 为了加深理解，建议读者将该步骤的代码替换成如下代码，"
                                 " 测试设置不同的绘制区域带来的界面变化。"];

```

执行结果如下图所示：

![图：椭圆形的排版区域](http://tangqiao.b0.upaiyun.com/coretext/coretext-shape.png)

#### 代码基本的宏定义和 Category

为了方便我们的代码编写，我在`CoreTextDemo-Prefix.pch`文件中增加了以下基本的宏定义，以方便我们使用 NSLog 和 UIColor。

```

#ifdef DEBUG
#define debugLog(...) NSLog(__VA_ARGS__)
#define debugMethod() NSLog(@"%s", __func__)
#else
#define debugLog(...)
#define debugMethod()
#endif

#define RGB(A, B, C)    [UIColor colorWithRed:A/255.0 green:B/255.0 blue:C/255.0 alpha:1.0]

```

我也为 UIView 的 frame 调整增加了一些扩展，可以方便地调整 UIView 的 x, y, width, height 等值。部分关键代码如下（完整的代码请查看示例工程）：

UIView+frameAdjust.h 文件:

```
#import <Foundation/Foundation.h>

@interface UIView (frameAdjust)

- (CGFloat)x;
- (void)setX:(CGFloat)x;

- (CGFloat)y;
- (void)setY:(CGFloat)y;

- (CGFloat)height;
- (void)setHeight:(CGFloat)height;

- (CGFloat)width;
- (void)setWidth:(CGFloat)width;

@end
```


UIView+frameAdjust.m 文件：

```
@implementation UIView (frameAdjust)
- (CGFloat)x {
    return self.frame.origin.x;
}

- (void)setX:(CGFloat)x {
    self.frame = CGRectMake(x, self.y, self.width, self.height);
}

- (CGFloat)y {
    return self.frame.origin.y;
}

- (void)setY:(CGFloat)y {
    self.frame = CGRectMake(self.x, y, self.width, self.height);
}

- (CGFloat)height {
    return self.frame.size.height;
}
- (void)setHeight:(CGFloat)height {
    self.frame = CGRectMake(self.x, self.y, self.width, height);
}

- (CGFloat)width {
    return self.frame.size.width;
}
- (void)setWidth:(CGFloat)width {
    self.frame = CGRectMake(self.x, self.y, width, self.height);
}

@end

```

文章中的其余代码默认都#import 了以上提到的宏定义和 UIView Category。

## 排版引擎框架

上面的 Hello World 工程仅仅展示了 Core Text 排版的基本能力。但是要制作一个较完善的排版引擎，我们不能简单的将所有代码都放到 `CTDisplayView` 的`drawRect`方法里面。根据设计模式中的 " 单一功能原则 "(`Single responsibility principle`)，我们应该把功能拆分，把不同的功能都放到各自不同的类里面。

对于一个复杂的排版引擎来说，可以将其功能拆成以下几个类来完成：

 1. 一个显示用的类，仅负责显示内容，不负责排版
 1. 一个模型类，用于承载显示所需要的所有数据
 1. 一个排版类，用于实现文字内容的排版
 1. 一个配置类，用于实现一些排版时的可配置项

注：" 单一功能原则 "(`Single responsibility principle`)
参考链接：<http://zh.wikipedia.org/wiki/%E5%8D%95%E4%B8%80%E5%8A%9F%E8%83%BD%E5%8E%9F%E5%88%99>

按照以上原则，我们将`CTDisplayView`中的部分内容拆开，由 4 个类构成：

 1. `CTFrameParserConfig`类，用于配置绘制的参数，例如：文字颜色，大小，行间距等。
 1. `CTFrameParser`类，用于生成最后绘制界面需要的`CTFrameRef`实例。
 1. `CoreTextData`类，用于保存由`CTFrameParser`类生成的`CTFrameRef`实例以及`CTFrameRef`实际绘制需要的高度。
 1. `CTDisplayView`类，持有`CoreTextData`类的实例，负责将`CTFrameRef`绘制到界面上。


关于这 4 个类的关键代码如下：

`CTFrameParserConfig`类:


```
#import <Foundation/Foundation.h>
@interface CTFrameParserConfig : NSObject

@property (nonatomic, assign) CGFloat width;
@property (nonatomic, assign) CGFloat fontSize;
@property (nonatomic, assign) CGFloat lineSpace;
@property (nonatomic, strong) UIColor *textColor;

@end

```

```

#import "CTFrameParserConfig.h"

@implementation CTFrameParserConfig

- (id)init {
    self = [super init];
    if (self) {
        _width = 200.0f;
        _fontSize = 16.0f;
        _lineSpace = 8.0f;
        _textColor = RGB(108, 108, 108);
    }
    return self;
}

@end

```

`CTFrameParser`类:

```
#import <Foundation/Foundation.h>
#import "CoreTextData.h"
#import "CTFrameParserConfig.h"

@interface CTFrameParser : NSObject

+ (CoreTextData *)parseContent:(NSString *)content config:(CTFrameParserConfig*)config;

@end

```
```

#import "CTFrameParser.h"
#import "CTFrameParserConfig.h"

@implementation CTFrameParser

+ (NSDictionary *)attributesWithConfig:(CTFrameParserConfig *)config {
    CGFloat fontSize = config.fontSize;
    CTFontRef fontRef = CTFontCreateWithName((CFStringRef)@"ArialMT", fontSize, NULL);
    CGFloat lineSpacing = config.lineSpace;
    const CFIndex kNumberOfSettings = 3;
    CTParagraphStyleSetting theSettings[kNumberOfSettings] = {
        { kCTParagraphStyleSpecifierLineSpacingAdjustment, sizeof(CGFloat), &lineSpacing },
        { kCTParagraphStyleSpecifierMaximumLineSpacing, sizeof(CGFloat), &lineSpacing },
        { kCTParagraphStyleSpecifierMinimumLineSpacing, sizeof(CGFloat), &lineSpacing }
    };

    CTParagraphStyleRef theParagraphRef = CTParagraphStyleCreate(theSettings, kNumberOfSettings);

    UIColor * textColor = config.textColor;

    NSMutableDictionary * dict = [NSMutableDictionary dictionary];
    dict[(id)kCTForegroundColorAttributeName] = (id)textColor.CGColor;
    dict[(id)kCTFontAttributeName] = (__bridge id)fontRef;
    dict[(id)kCTParagraphStyleAttributeName] = (__bridge id)theParagraphRef;

    CFRelease(theParagraphRef);
    CFRelease(fontRef);
    return dict;
}

+ (CoreTextData *)parseContent:(NSString *)content config:(CTFrameParserConfig*)config {
    NSDictionary *attributes = [self attributesWithConfig:config];
    NSAttributedString *contentString =
        [[NSAttributedString alloc] initWithString:content
                                        attributes:attributes];

    // 创建 CTFramesetterRef 实例
    CTFramesetterRef framesetter = CTFramesetterCreateWithAttributedString((CFAttributedStringRef)contentString);

    // 获得要绘制的区域的高度
    CGSize restrictSize = CGSizeMake(config.width, CGFLOAT_MAX);
    CGSize coreTextSize = CTFramesetterSuggestFrameSizeWithConstraints(framesetter, CFRangeMake(0,0), nil, restrictSize, nil);
    CGFloat textHeight = coreTextSize.height;

    // 生成 CTFrameRef 实例
    CTFrameRef frame = [self createFrameWithFramesetter:framesetter config:config height:textHeight];

    // 将生成好的 CTFrameRef 实例和计算好的绘制高度保存到 CoreTextData 实例中，最后返回 CoreTextData 实例
    CoreTextData *data = [[CoreTextData alloc] init];
    data.ctFrame = frame;
    data.height = textHeight;

    // 释放内存
    CFRelease(frame);
    CFRelease(framesetter);
    return data;
}

+ (CTFrameRef)createFrameWithFramesetter:(CTFramesetterRef)framesetter
                                  config:(CTFrameParserConfig *)config
                                  height:(CGFloat)height {

    CGMutablePathRef path = CGPathCreateMutable();
    CGPathAddRect(path, NULL, CGRectMake(0, 0, config.width, height));

    CTFrameRef frame = CTFramesetterCreateFrame(framesetter, CFRangeMake(0, 0), path, NULL);
    CFRelease(path);
    return frame;
}

@end

```

`CoreTextData`类:

```
#import <Foundation/Foundation.h>

@interface CoreTextData : NSObject

@property (assign, nonatomic) CTFrameRef ctFrame;
@property (assign, nonatomic) CGFloat height;

@end
```
```
#import "CoreTextData.h"

@implementation CoreTextData

- (void)setCtFrame:(CTFrameRef)ctFrame {
    if (_ctFrame != ctFrame) {
        if (_ctFrame != nil) {
            CFRelease(_ctFrame);
        }
        CFRetain(ctFrame);
        _ctFrame = ctFrame;
    }
}

- (void)dealloc {
    if (_ctFrame != nil) {
        CFRelease(_ctFrame);
        _ctFrame = nil;
    }
}

@end

```

`CTDisplayView`类：

```
#import <Foundation/Foundation.h>
#import "CoreTextData.h"

@interface CTDisplayView : UIView

@property (strong, nonatomic) CoreTextData * data;

@end

```

```
#import "CTDisplayView.h"

@implementation CTDisplayView

- (void)drawRect:(CGRect)rect
{
    [super drawRect:rect];
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetTextMatrix(context, CGAffineTransformIdentity);
    CGContextTranslateCTM(context, 0, self.bounds.size.height);
    CGContextScaleCTM(context, 1.0, -1.0);

    if (self.data) {
        CTFrameDraw(self.data.ctFrame, context);
    }
}

@end

```

以上 4 个类中的逻辑与之前 Hello World 那个项目的逻辑基本一致，只是分拆到了 4 个类中完成。另外，CTFrameParser 增加了方法来获得要绘制的区域的高度，并将高度信息保存到`CoreTextData`类的实例中。之所以要获得绘制区域的高度，是因为在很多实际使用场景中，我们需要先知道所要显示内容的高度，之后才可以进行绘制。

例如，在 UITableView 在渲染时，UITableView 首先会向 delegate 回调如下方法来获得每个将要渲染的 cell 的高度：

```
- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath;
```
之后，UITableView 会计算当前滚动的位置具体需要绘制的 UITableViewCell 是哪些，然后对于那些需要绘制的 Cell，UITableView 才会继续向其 data source 回调如下方法来获得 UITableViewCell 实例：

```
- (UITableViewCell *)cellForRowAtIndexPath:(NSIndexPath *)indexPath;
```

对于上面的情况，如果我们使用 CoreText 来作为 TableViewCell 的内容，那么就必须在每个 Cell 绘制之前，就知道其需要的绘制高度，否则 UITableView 将无法正常工作。

完成以上 4 个类之后，我们就可以简单地在`ViewController.m`文件中，加入如下代码来配置`CTDisplayView`的显示内容，位置，高度，字体，颜色等信息。代码如下所示。


```
#import "ViewController.h"

@interface ViewController ()

@property (weak, nonatomic) IBOutlet CTDisplayView *ctView;

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];

    CTFrameParserConfig *config = [[CTFrameParserConfig alloc] init];
    config.textColor = [UIColor redColor];
    config.width = self.ctView.width;

    CoreTextData *data = [CTFrameParser parseContent:@" 按照以上原则，我们将`CTDisplayView`中的部分内容拆开。" config:config];
    self.ctView.data = data;
    self.ctView.height = data.height;
    self.ctView.backgroundColor = [UIColor yellowColor];
}

@end

```

注意：从 Xcode4.0 开始，默认的界面编辑就开启了对于`Use Autolayout`的使用，但因为我们在代码中直接修改了变量`ctView`的 frame 信息，所以需要在`Main_iPhone.storyboard`中将`Use Autolayout`这一项取消勾选。如下图所示：

![图：取消勾选 Autolayout](http://tangqiao.b0.upaiyun.com/coretext/coretext-un-select-autolayout.png)

以下是本框架的 UML 示意图，从图中我们可以看出，这 4 个 Core Text 类的关系是这样的：

 1. `CTFrameParser`通过`CTFrameparserConfig`实例来生成`CoreTextData`实例。
 1. `CTDisplayView`通过持有`CoreTextData`实例来获得绘制所需要的所有信息。
 1. `ViewController`类通过配置`CTFrameparserConfig`实例，进而获得生成的`CoreTextData`实例，最后将其赋值给他的`CTDisplayView`成员，达到将指定内容显示在界面上的效果。

![图：UML 示意图](http://tangqiao.b0.upaiyun.com/coretext/coretext-uml.png)

说明 1：整个工程代码在名为`basic_arch`的分支下，读者可以在示例的源代码工程中使用`git checkout basic_arch`来切换到当前讲解的工程示例代码。

说明 2：为了方便操作`UIView`的`frame`属性，项目中增加了一个名为`UIView+frameAdjust.m`文件，它通过`Category`来给`UIView`增加了直接设置`height`属性的方法。

## 定制排版文件格式

对于上面的例子，我们给 CTFrameParser 使增加了一个将 NSString 转换为 CoreTextData 的方法。但这样的实现方式有很多局限性，因为整个内容虽然可以定制字体大小，颜色，行高等信息，但是却不能支持定制内容中的某一部分。例如，如果我们只想让内容的前三个字显示成红色，而其它文字显示成黑色，那么就办不到了。

解决的办法很简单，我们让`CTFrameParser`支持接受 NSAttributeString 作为参数，然后在`ViewController`类中设置我们想要的 NSAttributeString 信息。

```
@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];

    CTFrameParserConfig *config = [[CTFrameParserConfig alloc] init];
    config.width = self.ctView.width;
    config.textColor = [UIColor blackColor];

    NSString *content =
        @" 对于上面的例子，我们给 CTFrameParser 增加了一个将 NSString 转 "
         " 换为 CoreTextData 的方法。"
         " 但这样的实现方式有很多局限性，因为整个内容虽然可以定制字体 "
         " 大小，颜色，行高等信息，但是却不能支持定制内容中的某一部分。"
         " 例如，如果我们只想让内容的前三个字显示成红色，而其它文字显 "
         " 示成黑色，那么就办不到了。"
         "\n\n"
         " 解决的办法很简单，我们让`CTFrameParser`支持接受 "
         "NSAttributeString 作为参数，然后在 NSAttributeString 中设置好 "
         " 我们想要的信息。";
    NSDictionary *attr = [CTFrameParser attributesWithConfig:config];
    NSMutableAttributedString *attributedString =
         [[NSMutableAttributedString alloc] initWithString:content
                                                attributes:attr];
    [attributedString addAttribute:NSForegroundColorAttributeName
                             value:[UIColor redColor]
                             range:NSMakeRange(0, 7)];

    CoreTextData *data = [CTFrameParser parseAttributedContent:attributedString
                                                        config:config];
    self.ctView.data = data;
    self.ctView.height = data.height;
    self.ctView.backgroundColor = [UIColor yellowColor];
}

@end
```

结果如下图所示，我们很方便就把前面 7 个字变成了红色。

![](http://tangqiao.b0.upaiyun.com/coretext/coretext-attribute-string-as-argument.png)

更进一步地，实际工作中，我们更希望通过一个排版文件，来设置需要排版的文字的内容、颜色、字体大小等信息。我在开发猿题库应用时，自己定义了一个基于 UBB 的排版模版，但是实现该排版文件的解析器要花费大量的篇幅，考虑到这并不是本章的重点，所以我们以一个较简单的排版文件来讲解其思想。

我们规定排版的模版文件为 JSON 格式。JSON(JavaScript Object Notation) 是一种轻量级的数据交换格式，易于阅读和编写，同时也易于机器解析和生成。iOS 从 5.0 开始，提供了名为`NSJSONSerialization`的类库来方便开发者对 JSON 的解析。在 iOS5.0 之前，业界也有很多相关的 JSON 解析开源库，例如 JSONKit 可供大家使用。

我们的排版模版示例文件如下所示：

```
[ { "color" : "blue",
    "content" : " 更进一步地，实际工作中，我们更希望通过一个排版文件，来设置需要排版的文字的 ",
    "size" : 16,
    "type" : "txt"
  },
  { "color" : "red",
    "content" : " 内容、颜色、字体 ",
    "size" : 22,
    "type" : "txt"
  },
  { "color" : "black",
    "content" : " 大小等信息。\n",
    "size" : 16,
    "type" : "txt"
  },
  { "color" : "default",
    "content" : " 我在开发猿题库应用时，自己定义了一个基于 UBB 的排版模版，但是实现该排版文件的解析器要花费大量的篇幅，考虑到这并不是本章的重点，所以我们以一个较简单的排版文件来讲解其思想。",
    "type" : "txt"
  }
]
```

通过苹果提供的`NSJSONSerialization`类，我们可以将上面的模版文件转换成 NSArray 数组，每一个数组元素是一个 NSDictionary，代表一段相同设置的文字。为了简单，我们的配置文件只支持配置颜色和字号，但是读者可以依据同样的思想，很方便地增加其它配置信息。

接下来我们要为`CTFrameParser`增加一个方法，让其可以从如上格式的模版文件中生成`CoreTextData`。最终我们的实现代码如下：


```

// 方法一
+ (CoreTextData *)parseTemplateFile:(NSString *)path config:(CTFrameParserConfig*)config {
    NSAttributedString *content = [self loadTemplateFile:path config:config];
    return [self parseAttributedContent:content config:config];
}

// 方法二
+ (NSAttributedString *)loadTemplateFile:(NSString *)path config:(CTFrameParserConfig*)config {
    NSData *data = [NSData dataWithContentsOfFile:path];
    NSMutableAttributedString *result = [[NSMutableAttributedString alloc] init];
    if (data) {
        NSArray *array = [NSJSONSerialization JSONObjectWithData:data
                                           options:NSJSONReadingAllowFragments
                                             error:nil];
        if ([array isKindOfClass:[NSArray class]]) {
            for (NSDictionary *dict in array) {
                NSString *type = dict[@"type"];
                if ([type isEqualToString:@"txt"]) {
                    NSAttributedString *as =
                       [self parseAttributedContentFromNSDictionary:dict
                                                             config:config];
                    [result appendAttributedString:as];
                }
            }
        }
    }
    return result;
}

// 方法三
+ (NSAttributedString *)parseAttributedContentFromNSDictionary:(NSDictionary *)dict
                                                        config:(CTFrameParserConfig*)config {
    NSMutableDictionary *attributes = [self attributesWithConfig:config];
    // set color
    UIColor *color = [self colorFromTemplate:dict[@"color"]];
    if (color) {
        attributes[(id)kCTForegroundColorAttributeName] = (id)color.CGColor;
    }
    // set font size
    CGFloat fontSize = [dict[@"size"] floatValue];
    if (fontSize > 0) {
        CTFontRef fontRef = CTFontCreateWithName((CFStringRef)@"ArialMT", fontSize, NULL);
        attributes[(id)kCTFontAttributeName] = (__bridge id)fontRef;
        CFRelease(fontRef);
    }
    NSString *content = dict[@"content"];
    return [[NSAttributedString alloc] initWithString:content attributes:attributes];
}

// 方法四
+ (UIColor *)colorFromTemplate:(NSString *)name {
    if ([name isEqualToString:@"blue"]) {
        return [UIColor blueColor];
    } else if ([name isEqualToString:@"red"]) {
        return [UIColor redColor];
    } else if ([name isEqualToString:@"black"]) {
        return [UIColor blackColor];
    } else {
        return nil;
    }
}

// 方法五
+ (CoreTextData *)parseAttributedContent:(NSAttributedString *)content config:(CTFrameParserConfig*)config {
    // 创建 CTFramesetterRef 实例
    CTFramesetterRef framesetter = CTFramesetterCreateWithAttributedString((CFAttributedStringRef)content);

    // 获得要缓制的区域的高度
    CGSize restrictSize = CGSizeMake(config.width, CGFLOAT_MAX);
    CGSize coreTextSize = CTFramesetterSuggestFrameSizeWithConstraints(framesetter, CFRangeMake(0,0), nil, restrictSize, nil);
    CGFloat textHeight = coreTextSize.height;

    // 生成 CTFrameRef 实例
    CTFrameRef frame = [self createFrameWithFramesetter:framesetter config:config height:textHeight];

    // 将生成好的 CTFrameRef 实例和计算好的缓制高度保存到 CoreTextData 实例中，最后返回 CoreTextData 实例
    CoreTextData *data = [[CoreTextData alloc] init];
    data.ctFrame = frame;
    data.height = textHeight;

    // 释放内存
    CFRelease(frame);
    CFRelease(framesetter);
    return data;
}

// 方法六
+ (CTFrameRef)createFrameWithFramesetter:(CTFramesetterRef)framesetter
                                  config:(CTFrameParserConfig *)config
                                  height:(CGFloat)height {

    CGMutablePathRef path = CGPathCreateMutable();
    CGPathAddRect(path, NULL, CGRectMake(0, 0, config.width, height));

    CTFrameRef frame = CTFramesetterCreateFrame(framesetter, CFRangeMake(0, 0), path, NULL);
    CFRelease(path);
    return frame;
}

```

以上代码主要由 6 个子方法构成：

 * 方法一用于提供对外的接口，调用方法二实现从一个 JSON 的模版文件中读取内容，然后调用方法五生成`CoreTextData`。
 * 方法二读取 JSON 文件内容，并且调用方法三获得从`NSDictionary`到`NSAttributedString`的转换结果。
 * 方法三将`NSDictionary`内容转换为`NSAttributedString`。
 * 方法四提供将`NSString`转为`UIColor`的功能。
 * 方法五接受一个`NSAttributedString`和一个`config`参数，将`NSAttributedString`转换成`CoreTextData`返回。
 * 方法六是方法五的一个辅助函数，供方法五调用。

然后我们将`ViewController`中的调用代码作一下更改，使其从模版文件中加载内容，如下所示：

```

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];

    CTFrameParserConfig *config = [[CTFrameParserConfig alloc] init];
    config.width = self.ctView.width;
    NSString *path = [[NSBundle mainBundle] pathForResource:@"content" ofType:@"json"];
    CoreTextData *data = [CTFrameParser parseTemplateFile:path config:config];
    self.ctView.data = data;
    self.ctView.height = data.height;
    self.ctView.backgroundColor = [UIColor whiteColor];
}

@end

```

最后运行得到的结果如下所示，可以看到，通过一个简单的模板文件，我们已经可以很方便地定义排版的配置信息了。

![](http://tangqiao.b0.upaiyun.com/coretext/coretext-load-from-json-template.png)

说明：读者可以在示例工程中使用`git checkout json_template`，查看可以运行的示例代码。


