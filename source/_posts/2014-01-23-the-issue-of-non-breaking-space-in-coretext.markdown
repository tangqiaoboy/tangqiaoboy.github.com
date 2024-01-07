---
layout: post
title: "非换行空格在CoreText排版上的问题"
date: 2014-01-23 17:36
comments: true
categories: iOS
---

分享一个在使用 Core Text 时遇到的问题。

## 问题描述

我们的猿题库界面因为有图片、公式需要混排，所以用的是 Core Text 实现的排版。

在使用中，发现一些英文题目的换行方式不对，
我们设置的是按单词换行，但是总是有些题目的换行并不是按单词的，造成显示上比较错乱，如下图所示。图中 unchangeable, study, falls 三个单词都被生生截断了，造成阅读上的不适。

<!-- more -->

{% img /images/non-breaking-space-1.png %}

## 解决方案

经过我们的分析，我们最终发现这是由于题目内容中有 [非换行空格](http://en.wikipedia.org/wiki/Non-breaking_space)（`non-breaking-space`）造成的。根据 [wikipedia]((http://en.wikipedia.org/wiki/Non-breaking_space)) 上的介绍，该字符的 ASCII 码为 160，主要做用如下：

>Text-processing software typically assumes that an automatic line break may be inserted anywhere a space character occurs; a non-breaking space prevents this from happening (provided the software recognizes the character). For example, if the text "100 km" will not quite fit at the end of a line, the software may insert a line break between "100" and "km". To avoid this undesirable behaviour, the editor may choose to use a non-breaking space between "100" and "km". This guarantees that the text "100 km" will not be broken: if it does not fit at the end of a line it is moved in its entirety to the next line.

于是我们大概知道整个原因了：编辑在后台录入题目时，是在网页做的富文本编辑器里面，里面的空格输入的是 `&nbsp;`，然后这个空格转存到数据库中会转成 非换行空格（`non-breaking-space`），也就是 ASCII 为 160 的空格。最后传到 iPhone 这边，用 Core Text 排版时，Core Text 认为遇到这个空白符不应该换行，于是就一直不换行，直到显示不了了才强制换行，就造成了单词被截断。

解决办法是在客户端上用以下代码将这种空格替换成普通的空格，普通的空格 ASCII 码为 32。（附：[ASCII 码表](http://www.weste.net/tools/ASCII.asp)）：

``` objc

// 因为显示效果原因，从直观上看不出 2 个空格在编码上的差异，不过代码复制到 Xcode 中能看出来。
NSString *content = ...
content = [content stringByReplacingOccurrencesOfString:@" " withString:@" "];

```

最终改好的效果如下所示：

{% img /images/non-breaking-space-2.png %}

## 其它

感谢 [@onevcat](http://weibo.com/onevcat) 提供信息，让我找到问题的根源。

