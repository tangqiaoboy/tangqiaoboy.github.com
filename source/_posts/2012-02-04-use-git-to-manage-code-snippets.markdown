---
layout: post
title: "使用 Git 来管理 Xcode 中的代码片段"
date: 2012-02-04 14:32
comments: true
categories: iOS
tags: Git
---

### 代码片段介绍

xcode4 引入了一个新 feature: code snippets，在整个界面的右下角，可以通过快捷键：cmd + ctrl + opt + 2 调出来。code snippets 是一些代码的模版，对于一些常见的编程模式，xcode 都将这些代码抽象成模版放到 code snippet 中，使用的时候，只需要键入快捷键，就可以把模版的内容填到代码中。

<!--more-->

例如，在引入 GCD(Grand Central Dispatch) 后，当我们需要一个延时的操作时，只需要在 xcode 中键入：dispatch
, 就可以看到 xcode 中弹出一个上下文菜单，第一项就是相应的代码片段。如下图所示：

{% img /images/dispatch_after_snippet.jpg %}

### 定义自己的代码片段

那么如何自定义 code snippet 呢，相当简单，当你觉得某段代码很有用，可以当作模版的时候，将其整块选中，
拖动到 xcode 右下角的 code snippets 区域中即可。xcode 会自动帮你创建一个新的代码片段。
之后你可以单击该代码片段，在弹出的界面中选择 edit，即可为此代码片段设置快捷键等信息。

如果有些地方你想让用户替换掉，可以用 `<#被替换的内容#>` 的格式。
这样在代码片段被使用后，焦点会自动移到该处，你只需要连贯的键入替换后的内容即可。如下图所示：

{% img /images/edit_code_snippet.jpg %}

关于 xcode 的一些代码片段，[这里](http://nearthespeedoflight.com/article/xcode_4_code_snippets) 有一些用户的总结心得。

### 使用 Git 管理代码片段
在了解了 code snippet 之后，我在想能不能用 Git 来管理它，于是就研究了一下，发现它都存放于目录 ~/Library/Developer/Xcode/UserData/CodeSnippets 中。于是，我就将这个目录设置成一个 Git 的版本库，然后将自己整理
的代码片段都放到 Github 上了。现在我有 2 台 mac 机器，一台笔记本，一台公司的 iMac，我常常在 2 台机器间切换着工作，由于将代码片段都放在 github 上，所以我在任何一端有更新，另一端都可以很方便的用 git pull 将更新拉到本地。前两天将公司机器升级到 lion，又重装了 lion 版的 xcode，简单设置一下，所有代码片段都回来了，非常方便。

我的代码片段所在的 github 地址是 <https://github.com/tangqiaoboy/xcode_tool>, 使用它非常方便，只需要如下 3 步即可：

```
git clone https://github.com/tangqiaoboy/xcode_tool
cd xcode_tool
./setup_snippets.sh
```

大家也可以将我的 github 项目 fork 一份，改成自己的。这样可以方便地增加和管理自己的代码片段。

祝大家玩得开心。

