---
layout: post
title: "封装同步的UIActionSheet"
date: 2012-06-24 21:51
comments: true
categories: iOS
---

## 问题
做 iOS 开发的同学想必都用过 UIActionSheet。UIActionSheet 可以弹出一个选择列表，让用户选择列表中的某一项操作。使用 UIActionSheet 非常简单，以下是一个简单的示例代码：

``` objc
- (void)someButtonClicked {
    UIActionSheet * sheet = [[UIActionSheet alloc] initWithTitle:nil delegate:self cancelButtonTitle:@"ddd" destructiveButtonTitle:@"aaa" otherButtonTitles:@"bbb", @"ccc", @"ddd", nil];
    sheet.destructiveButtonIndex = 1;
    [sheet showInView:self.view];
}

- (void)actionSheet:(UIActionSheet *)actionSheet clickedButtonAtIndex:(NSInteger)buttonIndex {
    int result = buttonIndex;
    NSLog(@"result = %d", result);
}

```

但我个人在使用时，感觉 UIActionSheet 有以下 2 个问题：

<!-- more -->

1. UIActionSheet 是一个异步的调用，需要设置 delegate 来获得用户选择的结果。这么小粒度的选择界面，把调用显示和回调方法分开写在 2 个方法中，使得原本简单的逻辑复杂了。虽然也不会复杂到哪儿去，但是每次调用 UIActionSheet 就需要另外写一个 delegate 回调方法，让我觉得这是一个过度的设计。如果 UIActionSheet 在弹出界面时，是一个同步调用，在调用完 showInView 方法后，就能获得用户的点击结果，那该多方便。

2. UIActionSheet 默认的 init 方法比较恶心。cancel Button 其实默认是在最底部的，但是在 init 方法中是放在第一个参数。destructive 默认是列表的第一个。如果你需要的界面不是将 destructive button 放在第一个，就需要再指定一次 destructiveButtonIndex，而这个 index 的下标，是忽略 cancel button 来数的，虽说也不是很麻烦，但是心里感觉比较恶心。



## 改造 UIActionSheet

基于上面 2 个原因，我想把 UIActionSheet 改造成一个同步的调用。这样，在我调用它的 showInView 方法后，我希望它直接同步地返回用户的选择项，而不是通过一个 Delegate 方法来回调我。另外，我也不希望 init 方法有那么多麻烦的参数，我只希望 init 的时候，指定一个数组能够设置每个 button 的 title 就行了。

于是我写了一个 SynchronizedUIActionSheet 类，这个类将 UIActionSheet 简单封装了一下，利用 CFRunLoopRun 和 CFRunLoopStop 方法来将 UIActionSheet 改造成同步的调用。整个代码如下所示：

SynchronizedUIActionSheet.h 文件：

``` objc
// SynchronizedUIActionSheet.h
#import <Foundation/Foundation.h>

@interface SynchronizedUIActionSheet : NSObject<UIActionSheetDelegate>

@property (nonatomic, strong) NSArray * titles;
@property (nonatomic, assign) NSInteger destructiveButtonIndex;
@property (nonatomic, assign) NSInteger cancelButtonIndex;


- (id)initWithTitles:(NSArray *)titles;

- (NSInteger)showInView:(UIView *)view;

@end
```

SynchronizedUIActionSheet.m 文件：

``` objc
#import "SynchronizedUIActionSheet.h"

@implementation SynchronizedUIActionSheet {
    UIActionSheet * _actionSheet;
    NSInteger _selectedIndex;
}

@synthesize titles = _titles;
@synthesize destructiveButtonIndex = _destructiveButtonIndex;
@synthesize cancelButtonIndex = _cancelButtonIndex;

- (id)initWithTitles:(NSArray *)titles {
    self = [super init];
    if (self) {
        _titles = titles;
        _destructiveButtonIndex = 0;
        _cancelButtonIndex = titles.count - 1;
    }
    return self;
}

- (void)setTitles:(NSArray *)titles {
    _titles = titles;
    _cancelButtonIndex = titles.count - 1;    
}

- (NSInteger)showInView:(UIView *)view {
    _actionSheet = [[UIActionSheet alloc] init];
    for (NSString * title in _titles) {
        [_actionSheet addButtonWithTitle:title];
    }
    if (_destructiveButtonIndex != -1) {
        _actionSheet.destructiveButtonIndex = _destructiveButtonIndex;
    }
    if (_cancelButtonIndex != -1) {
        _actionSheet.cancelButtonIndex = _cancelButtonIndex;
    }
    [_actionSheet showInView:view];
    CFRunLoopRun();
    return _selectedIndex;
}

- (void)actionSheet:(UIActionSheet *)actionSheet clickedButtonAtIndex:(NSInteger)buttonIndex {
    _selectedIndex = buttonIndex;
    _actionSheet = nil;
    CFRunLoopStop(CFRunLoopGetCurrent());
}


@end

```

在改造后，调用 ActionSheet 的示例代码如下，是不是感觉逻辑清爽了一些？

``` objc
- (IBAction)testButtonPressed:(id)sender {
    SynchronizedUIActionSheet * synActionSheet = [[SynchronizedUIActionSheet alloc] init];
    synActionSheet.titles = [NSArray arrayWithObjects:@"aaa", @"bbb", @"ccc", @"ddd", nil];
    synActionSheet.destructiveButtonIndex = 1;
    NSUInteger result = [synActionSheet showInView:self.view];
    NSLog(@"result = %d", result);
}

```

## 总结

利用 NSRunLoop 来将原本的异步方法改成同步，可以使我们在某些情形下，方便地将异步方法变成同步方法来执行。

例如以前我们在做有道云笔记 iPad 版的时候，采用的图片多选控件需要用户允许我们获得地理位置信息，如果用户没有选择允许，那个这个图片多选控件就会执行失败。为了不让这个控件挂掉，我们想在用户禁止访问地理位置时，不使用该控件，而使用系统自带的图片单选的 UIImagePickerController 控件来选择图片。对于这个需求，我们明显就希望将获得地理位置信息这个系统确认框做成同步的，使得我们可以根据用户的选择再决定用哪种图片选择方式。最终，我们也用类似上面的方法，用 NSRunLoop 来使我们的异步方法调用暂停在某一行，直到获得用户的反馈后，再往下执行，示例代码如下：

``` objc
- (id)someCheck {
    BOOL isOver = NO;
    // do the async check method, after the method return, set isOver to YES
    while (!isOver) {
        [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate distantFuture]];
    }
    return value;
}
```

以上 Demo 代码我放到 github 上了 , 地址是 [这里](https://github.com/tangqiaoboy/SynchronizedUIActionSheetDemo)，请随意取用。祝端午节快乐。

