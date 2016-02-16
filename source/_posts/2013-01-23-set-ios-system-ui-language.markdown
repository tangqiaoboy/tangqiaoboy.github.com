---
layout: post
title: "设置应用内的系统控件语言"
date: 2013-01-23 21:05
comments: true
categories: iOS
---

{% img /images/bdj-rank.jpg %}

在iOS应用中，有时候会需要调用系统的一些UI控件，例如：

 1. 在UIWebView中长按会弹出系统的上下文菜单
 2. 在UIImagePickerController中会使用系统的照相机界面
 3. 在编译状态下的UITableViewCell，处于待删除时，会有一个系统的删除按钮。

以上这些UI控件中，其显示的语言并不是和你当前手机的系统语言一致的。而是根据你的App内部的语言设置来显示。结果就是，如果你没有设置恰当的话，你的中文App可能会出现一些英文的控件文字。

<!-- more -->

例如下图中，一个名为“百思不得姐”的应用，其在AppStore免费总榜中排名前100，图书类分类榜排名第一的应用，就闹出了系统控件显示成了英文的笑话，在其软件界面中长按，就会出如下的菜单，可以看到，这个菜单的文字全是英文的：

{% img /images/ios-menu-1.jpg %}

而正常的菜单应该是中文的，如下是新浪微博的正文长按之后的效果：

{% img /images/ios-menu-2.jpg %}


如何解决这个问题呢？方法如下:

用vim直接打开工程的Info.plist文件，在文件中增加如下内容即可：

``` xml
   <key>CFBundleLocalizations</key>       
   <array>
           <string>zh_CN</string>
           <string>en</string>
   </array>
```

TO: 百思不得姐的开发者，不用谢：）你们应用的内容挺有意思的。
