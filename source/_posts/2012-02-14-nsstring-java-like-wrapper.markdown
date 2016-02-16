---
layout: post
title: "给NSString增加Java风格的方法"
date: 2012-02-14 17:17
comments: true
categories: iOS
---

我实在受不了 NSString 冗长的方法调用了，每次写之前都要查文档。特别是那个去掉前后多余的空格的方法，长得离谱。与之对应的别的语言，拿 java 来说，对应的方法名叫 trim。拿 python 来说，对应的方法名叫 strip。但是 Objective-C 呢？是下面这段：

``` objc
[self stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
```
<!--more-->

其实我也明白 Objective-C 这种长函数名的好处，就是能很清楚地了解当前的方法是干什么的。但是一些常用的方法，简单的方法名同样能表达清楚意思，并且更容易记住。长方法名的最大的问题是，代码写到一半得查文档，直接把思路打断了，所以我上周末花了一天时间把 Objective-C 的 NSString 类给封装了一下，把相应的方法调用都换成与 Java 类似的了。这样我每次用的时候就不用写那么长又记不住的方法名了。

主要封装后的方法定义如下：

``` objc
@interface NSString(Wrapper)
- (unichar) charAt:(int)index;
- (int) compareTo:(NSString*) anotherString;
- (int) compareToIgnoreCase:(NSString*) str;
- (BOOL) contains:(NSString*) str;
- (BOOL) startsWith:(NSString*)prefix;
- (BOOL) endsWith:(NSString*)suffix;
- (BOOL) equals:(NSString*) anotherString;
- (BOOL) equalsIgnoreCase:(NSString*) anotherString;
- (int) indexOfChar:(unichar)ch;
- (int) indexOfChar:(unichar)ch fromIndex:(int)index;
- (int) indexOfString:(NSString*)str;
- (int) indexOfString:(NSString*)str fromIndex:(int)index;
- (int) lastIndexOfChar:(unichar)ch;
- (int) lastIndexOfChar:(unichar)ch fromIndex:(int)index;
- (int) lastIndexOfString:(NSString*)str;
- (int) lastIndexOfString:(NSString*)str fromIndex:(int)index;
- (NSString *) substringFromIndex:(int)beginIndex toIndex:(int)endIndex;
- (NSString *) toLowerCase;
- (NSString *) toUpperCase;
- (NSString *) trim;
- (NSString *) replaceAll:(NSString*)origin with:(NSString*)replacement;
- (NSArray *) split:(NSString*) separator;
@end
```

看着方法体，一下子感觉轻松了好多，以后再也不必每次写的时候查文档了。代码放到 github 上了，你可以用如下命令获得代码或者直接访问网址 <https://github.com/tangqiaoboy/xcode_tool> ：

``` bash
git clone git@github.com:tangqiaoboy/xcode_tool.git
cd xcode_tool/NSStringWrappeer
```

如果要把这个 Wrapper 加到现有工程中，只需要拷贝我的文件：NSStringWrapper.h 和 NSStringWrapper.m 到你自己的工程中即可。在使用的时候注意我修改了一点，我将查找不存在的返回值设置成了-1，这样和 java 语言保持一致，如果你想用 NSNotFound 作为查找不存在时的结果，请修改文件 NSStringWrapper.m 顶部的宏定义:JavaNotFound 即可，如下所示：

``` objc
// 如果不喜欢，可以将-1 改成 NSNotFound 即可
#define JavaNotFound -1

```

Have fun!

