---
layout: post
title: "让你的APP支持iPhone5"
date: 2012-10-05 16:18
comments: true
categories: iOS
---

## 前言

国庆节前，为了支持 iPhone5 的屏幕分辨率 (640 象素 x 1136 象素)，我尝试着升级粉笔网 [iPhone 客户端](http://itunes.apple.com/cn/app/fen-bi-wang/id551540593)。整个过程花了大概一天的时间，我把这个过程总结下来，希望对大家有帮助。

<!-- more -->

## 升级准备

为了支持 iPhone5，我们首先需要准备以下工具和资源：

 1. 下载最新版的 XCode4.5
 2. 让美术同学提供 640 x 1136 分辨率的启动画面，640 x 1136 分辨率的程序截图（用于在 app store 中显示）
 3. 由于 iPhone5 使用的 A6 处理器采用了新的 armv7s 架构，所以如果你使用了第三方的静态链接库，需要下载对应支持 armv7s 的版本。我们由于使用了第三方的数据统计工具 Flurry，所以下载更新了 Flurry 的静态链接库。
 4. 如果你的显示器分辨率太小，将无法显示完整的 iPhone5 模拟器，可选的解决办法是换个更大的显示器或者把显示器竖起来，象我这样:

{% img /images/iphone5support-1.jpg %}

另外还有一个简单的办法，可以在启动模拟器后，用快捷键 command+3(50%)，command+2(75%), command+1(100%)，来调整模拟器的显示比例，谢谢 [Superrr 一一](http://weibo.com/arcsystemworks) 提供的方法，比我的简单多了。

## 具体升级步骤如下

#### 升级启动画面和第三方链接库

升级启动画面，将美术同学提供的 640 x 1136 分辨率的启动画面图片，命名为 Default-568h@2x.png，添加到工程中即可。

升级第三方链接库，这个只需要用新的第三方链接库替换掉以前的即可。如果你使用了例如 opencv 这种需要自己编译对应版本链接库的开源库，那么替换之前，需要自己先用 xcode4.5 编译其 armv7s 版本的静态链接库。

#### 调整 xib 文件

粉笔网客户端的界面基本上都是顶部是 UINavigationBar, 底部是 UITabBar 或 UIToolBar，中间是 UITableView。

对于这一类界面，调整起来非常简单，只需要将 UITableView 设置成高度自动扩展的 Autosizing 方式，如下图所示：

{% img /images/autosizing-1.png %}

对于底部的 UIToolBar，Autosizing 设置成靠底部对齐的方式即可。如下图所示：

{% img /images/autosizing-2.png %}

#### 代码调整
有一些界面元素的位置是用代码来设置的，例如 “发表笔记” 界面中浮动贴在输入法键盘上面的各种可选操作的 UIToolbar。因为键盘的高度在不同的输入法下是不一样的，所以需要用代码动态调整。

我的调整代码如下：

``` objc

// 说明：keyboardWillShow 函数和 keyboardWillHide 函数分别监听了
// UIKeyboardWillShowNotification 和 UIKeyboardWillHideNotification

- (void) keyboardWillShow:(NSNotification *)notification {
    NSDictionary * info = [notification userInfo];
    CGSize kbSize = [[info objectForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue].size;
    float textViewHeight = UI_SCREEN_HEIGHT - UI_STATUS_BAR_HEIGHT - UI_NAVIGATION_BAR_HEIGHT - UI_TOOL_BAR_HEIGHT - kbSize.height;
    [UIView animateWithDuration:0.3 animations:^{
        _textView.frame = CGRectMake(0, UI_NAVIGATION_BAR_HEIGHT, UI_SCREEN_WIDTH, textViewHeight);
        _toolbar.frame = CGRectMake(0, UI_NAVIGATION_BAR_HEIGHT + textViewHeight, UI_SCREEN_WIDTH, UI_TOOL_BAR_HEIGHT);
    }];
}

- (void) keyboardWillHide:(NSNotification *)notification {
    CGSize kbSize = CGSizeMake(320, 216);
    float textViewHeight = UI_SCREEN_HEIGHT - UI_STATUS_BAR_HEIGHT - UI_NAVIGATION_BAR_HEIGHT - UI_TOOL_BAR_HEIGHT - kbSize.height;
    [UIView animateWithDuration:0.3 animations:^{
        _textView.frame = CGRectMake(0, UI_NAVIGATION_BAR_HEIGHT, UI_SCREEN_WIDTH, textViewHeight);
        _toolbar.frame = CGRectMake(0, UI_NAVIGATION_BAR_HEIGHT + textViewHeight, UI_SCREEN_WIDTH, UI_TOOL_BAR_HEIGHT);
    }];
}

```

可以看到，我将设备的各种高度都定义成了宏，这里的宏 UI_SCREEN_HEIGHT 表示整个设备的高度，以前这个宏的值是固定的 480，现在因为 iPhone5 中高度值变了，所以我们将这个宏定义改成了如下的值，这样，所有相关的用代码实现的界面位置调整都搞定了。我的 UI 相关的宏定义如下：

``` objc
#define UI_NAVIGATION_BAR_HEIGHT        44
#define UI_TOOL_BAR_HEIGHT              44
#define UI_TAB_BAR_HEIGHT               49
#define UI_STATUS_BAR_HEIGHT            20
#define UI_SCREEN_WIDTH                 320
// 将以下宏定义的值从 480 改成 [[UIScreen mainScreen] bounds].size.height
#define UI_SCREEN_HEIGHT                ([[UIScreen mainScreen] bounds].size.height)

```

如果你以前没有将这些设备的高度值抽取成宏，我建议你通过查找替换，先将所有用到 480 的地方修改成宏，然后再增加上面的宏定义即可。

当然，也有一些调整稍微复杂一些，例如粉笔网首页的上拉加载更多，需要判断上拉高度是否到达阈值，这些也是和设备高度相关的。这些阈值信息以前可能就直接写成和高度相关的值，例如 220 什么的，这些通过直接查找 480 还没法直接找到。

对于这些问题，只能是通过在模拟器中测试，发现问题，然后再把这些 “Magic Number” 替换成用上面提到的宏计算的公式。例如我们的上拉加载更多的阈值宏定义如下：

``` cpp

#define LOAD_MORE_TEXT_HEIGHT 77
// 显示文字阈值
#define LOAD_MORE_THRESHOLD (UI_SCREEN_HEIGHT - UI_STATUS_BAR_HEIGHT - UI_NAVIGATION_BAR_HEIGHT - UI_TAB_BAR_HEIGHT - LOAD_MORE_TEXT_HEIGHT)
// 刷新阈值
#define LOAD_MORE_MAX       (LOAD_MORE_THRESHOLD + 10.0)
```

#### 调整屏幕 Rotation 的回调函数
从 iOS6 开始，苹果修改了屏幕旋转的回调函数。在 iOS6 以前，回调函数是

``` objc
- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}
```

现在新的回调函数是：
``` objc
- (BOOL)shouldAutorotate {
    return YES;
}

- (NSInteger)supportedInterfaceOrientations {
    return UIInterfaceOrientationMaskAllButUpsideDown;
}

- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation {
    return UIInterfaceOrientationPortrait;
}
```

并且，现在是否旋转屏幕是由最上层的 View Controller 决定。例如，如果你是由 UITabBarController 或 UINavigationController 包起来的界面的话，是否旋转屏幕就由 UITabBarController 或 UINavigationController 中的 shouldAutorotate 回调决定，而默认其返回的是 YES。修改方法是给这 2 个容器 Controller 增加 Addition, 将其 shouldAutorotate 修改成由当前显示的子 view controller 决定，或者直接默认返回 NO。

#### 提交应用

基本上就是以上这些调整工作了，完了之后用 Xcode4.5 编译后提交审核，并且在 itunes connect 中设置 iPhone5 屏幕尺寸的 app 介绍截图即可。业界传言说对于支持 iPhone5 的程序，苹果在应用审核的时候会优先进行，我不知道是否是真的，不过我们的应用确实只用了 5 天时间就通过了审核，这是我个人遇到过的最快的一次审核。

祝大家国庆节玩得开心～

