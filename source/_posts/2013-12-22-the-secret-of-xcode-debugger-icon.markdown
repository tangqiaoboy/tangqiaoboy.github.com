---
layout: post
title: "XCode Debugger中的Icon符号的意义"
date: 2013-12-22 19:23
comments: true
categories: iOS
---

你注意到了吗？在 Xcode 中，当你点击查看调用栈的时候，调用栈的每个方法前面都有一个 Icon，而且还有好几种不同的样子，如下图所示，你知道它们代表什么意思吗？

{% img /images/debugger-icon.png %}

<!-- more -->

其实它们代表的意义如下：

 * Person icon is User
 * Mug icon is AppKit (or UIKit)
 * Briefcase icon is Frameworks
 * Gear icon is System
 * Morse code icon is Foundation
 * Spider web looking icon is Web

另外，Debuger 中的图标（如下图所示）也是有意义：

{% img /images/debugger-icon2.jpg %}

具体意义如下：

 * L = Local variable
 * A = Argument
 * S = Static variable
 * V = global Variable
 * R = register
 * i = Instance variable
 * E = Expression

或许你觉得以上内容没什么实用价值，那再分享一个实用的。

在 XCode5 中，点击一个小眼睛图标，就直接预览 UIImage 的内容，如下图所示：

{% img /images/debugger-preview-image.png %}

这个有用吧，祝大家玩得开心～

