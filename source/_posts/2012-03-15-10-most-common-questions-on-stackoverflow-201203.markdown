---
layout: post
title: "iPhone开发常问的十个问题(2012年3月版)"
date: 2012-03-15 22:04
comments: true
categories: iOS
---

##前言
今天去stackoverflow.com上看了一下iPhone标签下排名最高的10个问题，将它们整理出来，希望这些常见问题能帮到一些iPhone开发的初学者。本来想把答案也翻译过来的，后来发现答案资料通常都比较复杂，翻译起来太麻烦。所以大家还是看英文的答案吧，我只顺带用中文总结一下答案。

<!-- more -->

###问题一: [有哪些iPhone开发和Objective-C的入门资料](http://stackoverflow.com/questions/1939/how-to-articles-for-iphone-development-and-objective-c)

这个确实是最常问的问题了。对于我个人来说，入门时所看的资料主要是《From C++ to Objective-c》和《iPhone开发基础教程》，另外，我也把stanford的iphone视频课程看完了，链接是：<http://www.stanford.edu/class/cs193p/cgi-bin/index.php>

个人体会是边学边做，上手会比较快。编程这东西，不自己上手做做，没感觉。另外，如果入门之后想提高的话，我觉得还是需要把苹果每年的WWDC视频都下载下来看看，里面讲的东西还是非常有用的, 链接是: <http://developer.apple.com/WWDC/>

###问题二: [如何在Windows中进行iPhone开发](http://stackoverflow.com/questions/113547/iphone-development-on-windows)

大家还是把Windows想太全能了。至少在开发这一块上，Windows对于程序员来说，还是相当不友好的。这一点在使用Mac系统后，差别一下子就体会到了。就比如说git，在Windows下使用就有很多问题。另外话说回来，Mac机也不是什么都好，在中国，Mac系统相关的国内软件相当少，Mac下的游戏也相对Windows少很多，如果你想用Mac机来娱乐的话，会比较受限制。


###问题三: [有哪些基于iPhone的base64编码的库](http://stackoverflow.com/questions/392464/any-base64-library-on-iphone-sdk)

从这个问题的答案中，我选了一个我个人觉得比较好用的Base64编码库，放到我的Xcode Tool中了。地址是：<https://github.com/tangqiaoboy/xcode_tool/tree/master/Encoding>。

###问题四: [如何判断当前iPhone是否联网](http://stackoverflow.com/questions/1083701/how-to-check-for-an-active-internet-connection-on-iphone-sdk)

最佳的答案是用苹果提供的Reachability类。详细的使用方式大家自己看答案吧，写得很清楚。

###问题五: [如何做一个快速并且轻量级的PDF阅读器](http://stackoverflow.com/questions/3889634/fast-and-lean-pdf-viewer-for-iphone-ipad-ios-tips-and-hints)

我暂时没这个需求，就没有详细看答案。

###问题六: [如何让我的app支持打开一种格式的文件](http://stackoverflow.com/questions/2774343/how-do-i-associate-file-types-with-an-iphone-application)

在iPhone 3.2以上系统中，使用URL schemes即可完成这个需求。详细见答案。

###问题七: [当键盘出现的时候，如何让UITextField自动上移](http://stackoverflow.com/questions/1126726/how-to-make-a-uitextfield-move-up-when-keyboard-is-present)

对于iPhone界面控件的操作应该算是开发中必备的能力。键盘出现的时候上移相关的控件算是常见的需求，但是从这么多人问这个问题就可以看出，还是有很多人对这些需求的实现方式有疑问。

对于这个问题，主要是通过增加对键盘出现和消失的相应的Notification，然后在键盘出现和消息的时候，通过设置相关控件的frame来实现。相关代码如下，来源自stackoverflow。

``` objc
-(void)textFieldDidBeginEditing:(UITextField *)sender
{
    if ([sender isEqual:_textField])
    {
        //move the main view, so that the keyboard does not hide it.
        if  (self.view.frame.origin.y >= 0)
        {
            [self setViewMovedUp:YES];
        }
    }
}

//method to move the view up/down whenever the keyboard is shown/dismissed
-(void)setViewMovedUp:(BOOL)movedUp
{
    [UIView beginAnimations:nil context:NULL];
    [UIView setAnimationDuration:0.5]; // if you want to slide up the view

    CGRect rect = self.view.frame;
    if (movedUp)
    {
        // 1. move the view's origin up so that the text field that will be hidden come above the keyboard 
        // 2. increase the size of the view so that the area behind the keyboard is covered up.
        rect.origin.y -= kOFFSET_FOR_KEYBOARD;
        rect.size.height += kOFFSET_FOR_KEYBOARD;
    }
    else
    {
        // revert back to the normal state.
        rect.origin.y += kOFFSET_FOR_KEYBOARD;
        rect.size.height -= kOFFSET_FOR_KEYBOARD;
    }
    self.view.frame = rect;

    [UIView commitAnimations];
}


- (void)keyboardWillShow:(NSNotification *)notif
{
    //keyboard will be shown now. depending for which textfield is active, move up or move down the view appropriately

    if ([_textField isFirstResponder] && self.view.frame.origin.y >= 0)
    {
        [self setViewMovedUp:YES];
    }
    else if (![_textField isFirstResponder] && self.view.frame.origin.y < 0)
    {
        [self setViewMovedUp:NO];
    }
}


- (void)viewWillAppear:(BOOL)animated
{
    // register for keyboard notifications
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillShow:) 
                                                 name:UIKeyboardWillShowNotification object:self.view.window]; 
}

- (void)viewWillDisappear:(BOOL)animated
{
     // unregister for keyboard notifications while not visible.
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillShowNotification object:nil]; 
}
```

###问题八: [有关UIImagePickerController, Image, Memory的问题和答案整理](http://stackoverflow.com/questions/1282830/uiimagepickercontroller-uiimage-memory-and-more)

这个其实是一个相关问题的汇总贴。其中对于UIImage的操作示例挺有用处。做iPhone开发，总是会遇到一些图象处理相关的东西，能够从这儿积累一些相应的知识，到真正自己需要的时候帮助就大了。

###问题九: [如何对包含自定义元素类型的NSMutableArray排序](http://stackoverflow.com/questions/805547/how-to-sort-an-nsmutablearray-with-custom-objects-in-it)

答案讨论了各种方法，下面是其中提到的最简单的方法：定义一个比较用的selector

``` objc
- (NSComparisonResult)compare:(Person *)otherObject {
    return [self.birthDate compare:otherObject.birthDate];
}

NSArray *sortedArray;
sortedArray = [drinkDetails sortedArrayUsingSelector:@selector(compare:)];
```

###问题十: [如何在iPhone中使用自定义字体](http://stackoverflow.com/questions/360751/can-i-embed-a-custom-font-in-an-iphone-application)

答案讨论了在iOS3.2以前及以后的做法，现在都5.1了，估计支持3.2以前的app很少了吧。所以我把iOS3.2以后的办法附在下面。简单来说，就是iOS3.2苹果支持自定义字体，只需要在Info.plist文件中设置UIAppFonts相关的信息即可。步骤如下：

 1. 将自定义字体加到你的工程资源文件中
 1. 在 info.plist 文件中增加一名为 UIAppFonts 的key
 1. 将这个key修改成array
 1. 将你用到的所有字体的名字，作为这个array的值，一项一项填进去（包括扩展名）
 1. 保存 info.plist
 1. 现在就可以在代码中直接用[UIFont fontWithName:@”CustomFontName” size:12]来取得你自定义的字体了。 
