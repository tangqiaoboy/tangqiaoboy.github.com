---
layout: post
title: "让UILabel的文字顶部对齐"
date: 2011-11-20 22:43
comments: true
categories: iOS
---

默认UILabel是垂直居中对齐的，如果你的UILabel高度有多行，当内容少的时候，会自动垂直居中。

如下图所示（图片来自stackoverflow)：

{% img /images/UILabel_1.jpg %}

比较郁闷的是，UILabel并不提供设置其垂直对齐方式的选项。所以如果你想让你的文字顶部对齐，那么就需要自己想办法了。 stackoverflow.com 上提供了几种方法来达到顶部对齐的效果。

#### 方法一
在显示文字时，首先计算显示当前的文字需要多宽和多高，然后将对应的UILabel的大小改变成对应的宽度和高度。此方法的相示意图如下：

{% img /images/UILabel_2.png %}

在显示文字时，首先计算显示当前的文字需要多宽和多高，然后将对应的UILabel的大小改变成对应的宽度和高度。此方法的相示意图如下：

``` objc
    CGSize maximumSize = CGSizeMake(300, 9999);
    NSString *dateString = @"The date today is January 1st, 1999";
    UIFont *dateFont = [UIFont fontWithName:@"Helvetica" size:14];
    CGSize dateStringSize = [dateString sizeWithFont:dateFont 
        constrainedToSize:maximumSize 
        lineBreakMode:self.dateLabel.lineBreakMode];
    CGRect dateFrame = CGRectMake(10, 10, 300, dateStringSize.height);
    self.dateLabel.frame = dateFrame;
```
#### 方法二
此方法更加简单粗暴，但是很有效。其方法是在文本后面加多一些\n。
需要注意的是，\n后还得加至少一个空格，否则多余的\n会被UILabel忽略。从这一点上看，UILabel似乎又过于“聪明”了。

该方法的示意图如下：

{% img /images/UILabel_3.png %}

该方法的代码如下：

``` objc
for(int i=0; i<newLinesToPad; i++)
    self.text = [self.text stringByAppendingString:@"\n "];
```

#### 方法三
最正统的方法，利用objective-c的category特性，修改UILabel的绘制代码。示例代码如下：

``` objc
// -- file: UILabel+VerticalAlign.h
#pragma mark VerticalAlign
@interface UILabel (VerticalAlign)
- (void)alignTop;
- (void)alignBottom;
@end

// -- file: UILabel+VerticalAlign.m
@implementation UILabel (VerticalAlign)
- (void)alignTop {
    CGSize fontSize = [self.text sizeWithFont:self.font];
    double finalHeight = fontSize.height * self.numberOfLines;
    double finalWidth = self.frame.size.width;    //expected width of label
    CGSize theStringSize = [self.text sizeWithFont:self.font constrainedToSize:CGSizeMake(finalWidth, finalHeight) lineBreakMode:self.lineBreakMode];
    int newLinesToPad = (finalHeight  - theStringSize.height) / fontSize.height;
    for(int i=0; i<newLinesToPad; i++)
        self.text = [self.text stringByAppendingString:@"\n "];
}

- (void)alignBottom {
    CGSize fontSize = [self.text sizeWithFont:self.font];
    double finalHeight = fontSize.height * self.numberOfLines;
    double finalWidth = self.frame.size.width;    //expected width of label
    CGSize theStringSize = [self.text sizeWithFont:self.font constrainedToSize:CGSizeMake(finalWidth, finalHeight) lineBreakMode:self.lineBreakMode];
    int newLinesToPad = (finalHeight  - theStringSize.height) / fontSize.height;
    for(int i=0; i<newLinesToPad; i++)
        self.text = [NSString stringWithFormat:@" \n%@",self.text];
}
@end
```

我选了简单暴力的方法二，你呢？

#### 参考资料

<http://stackoverflow.com/questions/1054558/how-do-i-vertically-align-text-within-a-uilabel> <br/>
<https://discussions.apple.com/thread/1759957?threadID=1759957>