---
layout: post
title: "基于 CoreText 的排版引擎：进阶"
date: 2015-06-27 08:59:55 +0800
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

在上一篇《基于 CoreText 的排版引擎：基础》中，我们学会了排版的基础知识，现在我们来增加复杂性，让我们的排版引擎支持图片和链接的点击。

## 支持图文混排的排版引擎

### 改造模版文件

下面我们来进一步改造，让排版引擎支持对于图片的排版。在上一小节中，我们在设置模版文件的时候，就专门在模板文件里面留了一个名为`type`的字段，用于表示内容的类型。之前的`type`的值都是`txt`，这次，我们增加一个值为`img`的值，用于表示图片。

我们将上一节的`content.json`文件修改为如下内容，增加了 2 个`type`值为`img`的配置项。由于是图片的配置项，所以我们不需要设置颜色，字号这些图片不具有的属性，但是，我们另外增加了 3 个图片的配置属性：

 1. 一个名为`width`的属性，用于设置图片显示的宽度。
 1. 一个名为`height`的属性，用于设置图片显示的高度。
 1. 一个名为`name`的属性，用于设置图片的资源名。

```
[ {
    "type" : "img",
    "width" : 200,
    "height" : 108,
    "name" : "coretext-image-1.jpg"
  },
  { "color" : "blue",
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
  {
    "type" : "img",
    "width" : 200,
    "height" : 130,
    "name" : "coretext-image-2.jpg"
  },
  { "color" : "default",
    "content" : " 我在开发猿题库应用时，自己定义了一个基于 UBB 的排版模版，但是实现该排版文件的解析器要花费大量的篇幅，考虑到这并不是本章的重点，所以我们以一个较简单的排版文件来讲解其思想。",
    "type" : "txt"
  }
]
```

按理说，图片本身的内容信息中，是包含宽度和高度信息的，为什么我们要在这里指定图片的宽高呢？这主要是因为，在真实的开发中，应用的模版和图片通常是通过服务器获取的，模版是纯文本的内容，获取速度比图片快很多，而图片不但获取速度慢，而且为了省流量，通常的做法是直到需要显示图片的时候，再加载图片内容。

如果我们不将图片的宽度和高度信息设置在模板里面，那么 CoreText 在排版的时候就无法知道绘制所需要的高度，我们就无法设置`CoreTextData`类中的`height`信息，没有高度信息，就会对 UITableView 一类的控件排版造成影响。所以，除非你的应用图片能够保证在绘制前都能全部在本地，否则就应该另外提前提供图片宽度和高度信息。

在完成模板文件修改后，我们选取两张测试用的图片，分别将其命名为`coretext-image-1.jpg`和`coretext-image-2.jpg`（和模板中的值一致），将其拖动增加到工程中。向 Xcode 工程增加图片资源是基础知识，在此就不详细介绍过程了。

### CTLine 与 CTRun

接下来我们需要改造的是`CTFrameParser`类，让解析模板文件的方法支持`type`为`img`的配置。

在改造前，我们先来了解一下`CTFrame`内部的组成。通过之前的例子，我们可以看到，我们首先通过`NSAttributeString`和配置信息创建 `CTFrameSetter`，
然后，再通过`CTFrameSetter`来创建`CTFrame`。

在`CTFrame`内部，是由多个`CTLine`来组成的，每个`CTLine`代表一行，每个`CTLine`又是由多个`CTRun`来组成，每个`CTRun`代表一组显示风格一致的文本。我们不用手工管理`CTLine`和`CTRun`的创建过程。

下图是一个`CTLine`和`CTRun`的示意图，可以看到，第三行的`CTLine`是由 2 个`CTRun`构成的，第一个`CTRun`为红色大字号的左边部分，第二个`CTRun`为右边字体较小的部分。

![](http://tangqiao.b0.upaiyun.com/coretext/coretext-ctline.jpg)

虽然我们不用管理`CTRun`的创建过程，但是我们可以设置某一个具体的`CTRun`的`CTRunDelegate`来指定该文本在绘制时的高度、宽度、排列对齐方式等信息。

对于图片的排版，其实 CoreText 本质上不是直接支持的，但是，我们可以在要显示文本的地方，用一个特殊的空白字符代替，同时设置该字体的`CTRunDelegate`信息为要显示的图片的宽度和高度信息，这样最后生成的`CTFrame`实例，就会在绘制时将图片的位置预留出来。

因为我们的`CTDisplayView`的绘制代码是在`drawRect`里面的，所以我们可以方便地把需要绘制的图片，用`CGContextDrawImage`方法直接绘制出来就可以了。

### 改造模版解析类

在了解了以上原理后，我们就可以开始进行改造了。

我们需要做的工作包括：

 1. 改造`CTFrameParser`的`parseTemplateFile:(NSString *)path config:(CTFrameParserConfig*)config;`方法，使其支持对`type`为`img`的节点解析。并且对`type`为`img`的节点，设置其`CTRunDelegate`信息，使其在绘制时，为图片预留相应的空白位置。
 1. 改造`CoreTextData`类，增加图片相关的信息，并且增加计算图片绘制区域的逻辑。
 1. 改造`CTDisplayView`类，增加绘制图片相关的逻辑。

首先介绍对于`CTFrameParser`的改造：

我们修改了`parseTemplateFile`方法，增加了一个名为`imageArray`的参数来保存解析时的图片信息。

```
+ (CoreTextData *)parseTemplateFile:(NSString *)path config:(CTFrameParserConfig*)config {
    NSMutableArray *imageArray = [NSMutableArray array];
    NSAttributedString *content = [self loadTemplateFile:path config:config imageArray:imageArray];
    CoreTextData *data = [self parseAttributedContent:content config:config];
    data.imageArray = imageArray;
    return data;
}
```

接着我们修改`loadTemplateFile`方法，增加了对于`type`是`img`的节点处理逻辑，该逻辑主要做 2 件事情：

 1. 保存当前图片节点信息到`imageArray`变量中
 1. 新建一个空白的占位符。

```
+ (NSAttributedString *)loadTemplateFile:(NSString *)path
                                  config:(CTFrameParserConfig*)config
                              imageArray:(NSMutableArray *)imageArray {
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
                } else if ([type isEqualToString:@"img"]) {
                    // 创建 CoreTextImageData
                    CoreTextImageData *imageData = [[CoreTextImageData alloc] init];
                    imageData.name = dict[@"name"];
                    imageData.position = [result length];
                    [imageArray addObject:imageData];
                    // 创建空白占位符，并且设置它的 CTRunDelegate 信息
                    NSAttributedString *as = [self parseImageDataFromNSDictionary:dict config:config];
                    [result appendAttributedString:as];
                }
            }
        }
    }
    return result;
}
```

最后我们新建一个最关键的方法：`parseImageDataFromNSDictionary`，生成图片空白的占位符，并且设置其`CTRunDelegate`信息。其代码如下：


```

static CGFloat ascentCallback(void *ref){
    return [(NSNumber*)[(__bridge NSDictionary*)ref objectForKey:@"height"] floatValue];
}

static CGFloat descentCallback(void *ref){
    return 0;
}

static CGFloat widthCallback(void* ref){
    return [(NSNumber*)[(__bridge NSDictionary*)ref objectForKey:@"width"] floatValue];
}

+ (NSAttributedString *)parseImageDataFromNSDictionary:(NSDictionary *)dict
                                                config:(CTFrameParserConfig*)config {
    CTRunDelegateCallbacks callbacks;
    memset(&callbacks, 0, sizeof(CTRunDelegateCallbacks));
    callbacks.version = kCTRunDelegateVersion1;
    callbacks.getAscent = ascentCallback;
    callbacks.getDescent = descentCallback;
    callbacks.getWidth = widthCallback;
    CTRunDelegateRef delegate = CTRunDelegateCreate(&callbacks, (__bridge void *)(dict));

    // 使用 0xFFFC 作为空白的占位符
    unichar objectReplacementChar = 0xFFFC;
    NSString * content = [NSString stringWithCharacters:&objectReplacementChar length:1];
    NSDictionary * attributes = [self attributesWithConfig:config];
    NSMutableAttributedString * space =
       [[NSMutableAttributedString alloc] initWithString:content
                                              attributes:attributes];
    CFAttributedStringSetAttribute((CFMutableAttributedStringRef)space,
              CFRangeMake(0, 1), kCTRunDelegateAttributeName, delegate);
    CFRelease(delegate);
    return space;
}

```

接着我们对`CoreTextData`进行改造，增加了`imageArray`成员变量，用于保存图片绘制时所需的信息。

```
#import <Foundation/Foundation.h>
#import "CoreTextImageData.h"

@interface CoreTextData : NSObject

@property (assign, nonatomic) CTFrameRef ctFrame;
@property (assign, nonatomic) CGFloat height;
// 新增加的成员
@property (strong, nonatomic) NSArray * imageArray;

@end
```

在设置`imageArray`成员时，我们还会调一个新创建的`fillImagePosition`方法，用于找到每张图片在绘制时的位置。

```

- (void)setImageArray:(NSArray *)imageArray {
    _imageArray = imageArray;
    [self fillImagePosition];
}

- (void)fillImagePosition {
    if (self.imageArray.count == 0) {
        return;
    }
    NSArray *lines = (NSArray *)CTFrameGetLines(self.ctFrame);
    int lineCount = [lines count];
    CGPoint lineOrigins[lineCount];
    CTFrameGetLineOrigins(self.ctFrame, CFRangeMake(0, 0), lineOrigins);

    int imgIndex = 0;
    CoreTextImageData * imageData = self.imageArray[0];

    for (int i = 0; i < lineCount; ++i) {
        if (imageData == nil) {
            break;
        }
        CTLineRef line = (__bridge CTLineRef)lines[i];
        NSArray * runObjArray = (NSArray *)CTLineGetGlyphRuns(line);
        for (id runObj in runObjArray) {
            CTRunRef run = (__bridge CTRunRef)runObj;
            NSDictionary *runAttributes = (NSDictionary *)CTRunGetAttributes(run);
            CTRunDelegateRef delegate = (__bridge CTRunDelegateRef)[runAttributes valueForKey:(id)kCTRunDelegateAttributeName];
            if (delegate == nil) {
                continue;
            }

            NSDictionary * metaDic = CTRunDelegateGetRefCon(delegate);
            if (![metaDic isKindOfClass:[NSDictionary class]]) {
                continue;
            }

            CGRect runBounds;
            CGFloat ascent;
            CGFloat descent;
            runBounds.size.width = CTRunGetTypographicBounds(run, CFRangeMake(0, 0), &ascent, &descent, NULL);
            runBounds.size.height = ascent + descent;

            CGFloat xOffset = CTLineGetOffsetForStringIndex(line, CTRunGetStringRange(run).location, NULL);
            runBounds.origin.x = lineOrigins[i].x + xOffset;
            runBounds.origin.y = lineOrigins[i].y;
            runBounds.origin.y -= descent;

            CGPathRef pathRef = CTFrameGetPath(self.ctFrame);
            CGRect colRect = CGPathGetBoundingBox(pathRef);

            CGRect delegateBounds = CGRectOffset(runBounds, colRect.origin.x, colRect.origin.y);

            imageData.imagePosition = delegateBounds;
            imgIndex++;
            if (imgIndex == self.imageArray.count) {
                imageData = nil;
                break;
            } else {
                imageData = self.imageArray[imgIndex];
            }
        }
    }
}
```


## 添加对图片的点击支持

### 实现方式

为了实现对图片的点击支持，我们需要给`CTDisplayView`类增加用户点击操作的检测函数，在检测函数中，判断当前用户点击的区域是否在图片上，如果在图片上，则触发点击图片的逻辑。苹果提供的`UITapGestureRecognizer`可以很好的满足我们的要求，所以我们这里用它来检测用户的点击操作。

我们这里实现的是点击图片后，先用`NSLog`打印出一行日志。实际应用中，读者可以根据业务需求自行调整点击后的效果。

我们先为`CTDisplayView`类增加`UITapGestureRecognizer`：

```
- (id)initWithCoder:(NSCoder *)aDecoder {
    self = [super initWithCoder:aDecoder];
    if (self) {
        [self setupEvents];
    }
    return self;
}

- (void)setupEvents {
    UIGestureRecognizer * tapRecognizer =
          [[UITapGestureRecognizer alloc] initWithTarget:self
                    action:@selector(userTapGestureDetected:)];
    tapRecognizer.delegate = self;
    [self addGestureRecognizer:tapRecognizer];
    self.userInteractionEnabled = YES;
}

```

然后增加`UITapGestureRecognizer`的回调函数：


```
- (void)userTapGestureDetected:(UIGestureRecognizer *)recognizer {
    CGPoint point = [recognizer locationInView:self];
    for (CoreTextImageData * imageData in self.data.imageArray) {
        // 翻转坐标系，因为 imageData 中的坐标是 CoreText 的坐标系
        CGRect imageRect = imageData.imagePosition;
        CGPoint imagePosition = imageRect.origin;
        imagePosition.y = self.bounds.size.height - imageRect.origin.y
                          - imageRect.size.height;
        CGRect rect = CGRectMake(imagePosition.x, imagePosition.y, imageRect.size.width, imageRect.size.height);
        // 检测点击位置 Point 是否在 rect 之内
        if (CGRectContainsPoint(rect, point)) {
            // 在这里处理点击后的逻辑
            NSLog(@"bingo");
            break;
        }
    }
}
```

### 事件处理

在界面上，`CTDisplayView`通常在`UIView`的树形层级结构中，一个 UIView 可能是最外层 View Controller 的 View 的孩子的孩子的孩子（如下图所示）。在这种多级层次结构中，很难通过`delegate`模式将图片点击的事件一层一层往外层传递，所以最好使用`NSNotification`，来处理图片点击事件。

![](http://tangqiao.b0.upaiyun.com/coretext/coretext-uiview-tree.png)

在 Demo 中，我们在最外层的 View Controller 中监听图片点击的通知，当收到通知后，进入到一个新的界面来显示图片点击内容。

注：读者可以将 demo 工程切换到`image_click`分支，查看示例代码。

### 添加对链接的点击支持

####修改模板文件

我们修改模版文件，增加一个名为 link 的类型，用于表示链接内容。如下所示：

```
[
  { "color" : "default",
    "content" : " 这在这里尝试放一个参考链接：",
    "type" : "txt"
  },
  { "color" : "blue",
    "content" : " 链接文字 ",
    "url" : "http://blog.devtang.com",
    "type" : "link"
  },
  { "color" : "default",
    "content" : " 大家可以尝试点击一下 ",
    "type" : "txt"
  }
]

```

####解析模版中的链接信息

我们首先增加一个`CoreTextLinkData`类，用于记录解析 JSON 文件时的链接信息：

```
@interface CoreTextLinkData : NSObject

@property (strong, nonatomic) NSString * title;
@property (strong, nonatomic) NSString * url;
@property (assign, nonatomic) NSRange range;

@end

```

然后我们修改 CTFrameParser 类，增加解析链接的逻辑：

```
+ (NSAttributedString *)loadTemplateFile:(NSString *)path
                                  config:(CTFrameParserConfig*)config
                              imageArray:(NSMutableArray *)imageArray
                               linkArray:(NSMutableArray *)linkArray {
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
                    // 省略
                } else if ([type isEqualToString:@"img"]) {
                    // 省略
                } else if ([type isEqualToString:@"link"]) {
                    NSUInteger startPos = result.length;
                    NSAttributedString *as =
                       [self parseAttributedContentFromNSDictionary:dict
                                                             config:config];
                    [result appendAttributedString:as];
                    // 创建 CoreTextLinkData
                    NSUInteger length = result.length - startPos;
                    NSRange linkRange = NSMakeRange(startPos, length);
                    CoreTextLinkData *linkData = [[CoreTextLinkData alloc] init];
                    linkData.title = dict[@"content"];
                    linkData.url = dict[@"url"];
                    linkData.range = linkRange;
                    [linkArray addObject:linkData];
                }
            }
        }
    }
    return result;
}

```

然后，我们增加一个 Utils 类来专门处理检测用户点击是否在链接上。主要的方法是使用 CTLineGetStringIndexForPosition 函数来获得用户点击的位置与 NSAttributedString 字符串上的位置的对应关系。这样就知道是点击的哪个字符了。然后判断该字符串是否在链接上即可。该 Util 在实现逻辑如下：

```
// 检测点击位置是否在链接上
+ (CoreTextLinkData *)touchLinkInView:(UIView *)view atPoint:(CGPoint)point data:(CoreTextData *)data {
    CTFrameRef textFrame = data.ctFrame;
    CFArrayRef lines = CTFrameGetLines(textFrame);
    if (!lines) return nil;
    CFIndex count = CFArrayGetCount(lines);
    CoreTextLinkData *foundLink = nil;

    // 获得每一行的 origin 坐标
    CGPoint origins[count];
    CTFrameGetLineOrigins(textFrame, CFRangeMake(0,0), origins);

    // 翻转坐标系
    CGAffineTransform transform =  CGAffineTransformMakeTranslation(0, view.bounds.size.height);
    transform = CGAffineTransformScale(transform, 1.f, -1.f);

    for (int i = 0; i < count; i++) {
        CGPoint linePoint = origins[i];
        CTLineRef line = CFArrayGetValueAtIndex(lines, i);
        // 获得每一行的 CGRect 信息
        CGRect flippedRect = [self getLineBounds:line point:linePoint];
        CGRect rect = CGRectApplyAffineTransform(flippedRect, transform);

        if (CGRectContainsPoint(rect, point)) {
            // 将点击的坐标转换成相对于当前行的坐标
            CGPoint relativePoint = CGPointMake(point.x-CGRectGetMinX(rect),
                                                point.y-CGRectGetMinY(rect));
            // 获得当前点击坐标对应的字符串偏移
            CFIndex idx = CTLineGetStringIndexForPosition(line, relativePoint);
            // 判断这个偏移是否在我们的链接列表中
            foundLink = [self linkAtIndex:idx linkArray:data.linkArray];
            return foundLink;
        }
    }
    return nil;
}

+ (CGRect)getLineBounds:(CTLineRef)line point:(CGPoint)point {
    CGFloat ascent = 0.0f;
    CGFloat descent = 0.0f;
    CGFloat leading = 0.0f;
    CGFloat width = (CGFloat)CTLineGetTypographicBounds(line, &ascent, &descent, &leading);
    CGFloat height = ascent + descent;
    return CGRectMake(point.x, point.y - descent, width, height);
}

+ (CoreTextLinkData *)linkAtIndex:(CFIndex)i linkArray:(NSArray *)linkArray {
    CoreTextLinkData *link = nil;
    for (CoreTextLinkData *data in linkArray) {
        if (NSLocationInRange(i, data.range)) {
            link = data;
            break;
        }
    }
    return link;
}

```

最后改造一下`CTDisplayView`，使其在检测到用户点击后，调用上面的 Util 方法即可。我们这里实现的是点击链接后，先用`NSLog`打印出一行日志。实际应用中，读者可以根据业务需求自行调整点击后的效果。

```
- (void)userTapGestureDetected:(UIGestureRecognizer *)recognizer {
    CGPoint point = [recognizer locationInView:self];
    // 此处省略上一节中介绍的，对图片点击检测的逻辑

    CoreTextLinkData *linkData = [CoreTextUtils touchLinkInView:self atPoint:point data:self.data];
    if (linkData) {
        NSLog(@"hint link!");
        return;
    }
}
```

注：在 Demo 中工程中，我们实现了点击链接跳转到一个新的界面，然后用 UIWebView 来显示链接内容的逻辑。读者可以将 demo 工程切换到`link_click`分支，查看示例代码。

Demo 工程的 Gif 效果图如下，读者可以将示例工程用`git checkout image_support`切换到当前章节状态，查看相关代码逻辑。

![](http://tangqiao.b0.upaiyun.com/coretext/coretext-demo.gif)
