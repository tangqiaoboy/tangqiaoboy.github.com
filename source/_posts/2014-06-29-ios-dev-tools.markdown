---
layout: post
title: "那些好用的iOS开发工具"
date: 2014-06-29 13:12:01 +0800
comments: true
categories: iOS
---

{% img /images/ColorSync-Utility-icon.png %}

## 版权说明

本文首发于《程序员》杂志 2014 年 6 月刊，未经允许，请勿转载。

## 前言

从苹果发明 iPhone 起，AppStore 上的一个又一个类似 flappy bird 的一夜暴富的故事刺激着大量开发者加入移动开发大军。随着这些开发者出现的，还有大量方便 iOS 开发者的各种工具。这些工具作为整个应用开发生态链的重要一环，极大地方便了广大应用开发者，节省了应用开发的时间。

本文将从应用工具、命令行工具、插件工具 3 个方面，介绍这些优秀的应用。

## 图形应用工具

### Charles

{% img /images/charles-logo.png %}

Charles（<http://www.charlesproxy.com>）是在 Mac 下常用的截取网络封包的工具，在做 iOS 开发时，我们为了调试与服务器端的网络通讯协议，常常需要截取网络封包来分析。Charles 通过将自己设置成系统的网络访问代理服务器，使得所有的网络访问请求都通过它来完成，从而实现了网络封包的截取和分析。

Charles 详细的使用说明，欢迎阅读我的文章：[《iOS 开发工具-网络封包分析工具 Charles》](/2013/12/11/network-tool-charles-intr/)

### 界面调试

PonyDebugger（<https://github.com/square/PonyDebugger>）、Reveal（<http://revealapp.com/>）、Spark Inspector（<http://sparkinspector.com/>）是三个常用的界面调试工具，可以在程序运行时动态调试 iOS 应用界面。PonyDebugger 是免费并且开源的，后两者是收费的，不过功能更加强大。

对于动态或复杂的交互界面，手写 UI 的是不可避免的，而 Reveal 一类的工具可以方便我们查看控件的相应属性是否正常，并且可以在程序运行时，动态地修改界面元素。这样就不用反复地修改代码并且重启程序了。

### xScope

xScope（<http://xscopeapp.com/>）是一类与界面开发相关的工具集。对于 iOS 开发，比较好用的功能包括它的放大镜取色工具、标尺工具等。其中放大镜取色工具可以将取到的多个色集收集起来，方便后续使用，并且支持直接粘贴成相关的程序颜色代码。

xScope 是收费软件，对于未付费版本，其功能有一些限制。

### ImageOptim

ImageOptim（<http://imageoptim.com/>）是一个图象压缩的免费工具。iOS 工程默认使用的是 pngcrush 命令来压缩图片，不过其压缩比率其实不高。对于应用中图片资源比较多的读者，可以尝试使用 ImageOptim 来达到最大的图片压缩效果。

如果你从未尝试过 ImageOptim 一类的图片压缩工具，那么第一次给 IPA 文件瘦身的效果应该是比较惊人的。我个人的经验是，初次使用时 ImageOptim 能减少至少 10% 的应用图片资源占用。

ImageOptim 的实现原理是使用各种开源的图像压缩工具，然后取效果最好的那一个。它尝试的工具包括：PNGOUT, Zopfli, Pngcrush, AdvPNG, extended OptiPNG, JpegOptim, jpegrescan, jpegtran 和 Gifsicle。

安装方式是从其官方网站（<http://imageoptim.com/>）上下载程序文件，拖动到 “应用程序” 目录即可。下图是本篇文章所有的配图，可以看到使用 ImageOptim 达到了 29.5% 的体积缩小。

{% img /images/tool-imageoptim.jpg %}

### 马克鳗

马克鳗（<http://www.getmarkman.com/>）是国人开发的一款免费标注工具，可以方便地在美术输出的设计稿上标注相应界面元素的大小，颜色，边距，说明等。

## 命令行工具

### CocoaPods

{% img /images/xcode-cmd-cocoapods.png %}

每种语言发展到一个阶段，就会出现相应的依赖管理工具或者是中央代码仓库。比如 Java 的 maven，Nodejs 的 npm 等。而 CocoaPods（<http://cocoapods.org/>）是为 iOS 程序提供依赖管理的工具。开发 iOS 项目不可避免地要使用第三方开源库，CocoaPods 的出现使得我们可以节省设置和更新第三方开源库的时间。

在我开发猿题库客户端时，其使用了 24 个第三方开源库。在没有使用 CocoaPods 以前，我需要:

 1. 把这些第三方开源库的源代码文件复制到项目中，或者设置成 git 的 submodule。
 1. 对于这些开源库通常需要依赖系统的一些 framework，我需要手工地将这些 framework 一一增加到项目依赖中，比如通常情况下，一个网络库就需要增加以下 framework: CFNetwork, SystemConfiguration, MobileCoreServices, CoreGraphics, zlib。
 1. 对于某些开源库，我还需要设置`-licucore`或者 `-fno-objc-arc`等编译参数
 1. 管理这些依赖包的更新。
 
这些体力活虽然简单，但毫无技术含量并且浪费时间。在使用 CocoaPods 之后，我只需要将用到的第三方开源库放到一个名为 Podfile 的文件中，然后执行`pod install`。CocoaPods 就会自动将这些第三方开源库的源码下载下来，并且为我的工程设置好相应的系统依赖和编译参数。

使用 CocoaPods 还需要注意以下几点：

 1. 需要使用 CocoaPods 生成的 .xcworkspace 文件来打开工程，而不是以前的 .xcodeproj 文件。
 2. 每次更改了 Podfile 文件，你需要重新执行一次`pod update`命令。
 3. 当你执行`pod install`之后，除了 Podfile 外，CocoaPods 还会生成一个名为`Podfile.lock`的文件，你应该把这个文件加入到版本管理中。因为 Podfile.lock 会锁定当前各依赖库的版本，之后如果多次执行`pod install` 不会更改版本，要`pod update`才会改`Podfile.lock`了。这样的好处是：当多人协作的时候，可以保证所有人的第三库环境是完全一样的。

详细的使用说明，欢迎阅读我的文章：[《用 CocoaPods 做 iOS 程序的依赖管理》](/2014/05/25/use-cocoapod-to-manage-ios-lib-dependency/)

### nomad

nomad（<http://nomad-cli.com/>）是一个方便你操作苹果开发者中心（Apple Developer Center）的命令行工具，可以做的事情包括方便地添加测试设备，更新证书文件，增加 App id，验证 IAP 的凭证等。

安装方式：

```
gem install nomad-cli
```

安装完后，首先执行`ios login`，你的 Developer 账号密码会被它存储到 Keychain 中，之后就可以用命令行来完成各种后台操作了，例如：

添加测试设备：

```
ios devices:add "TangQiaos iPhone"=<Device Identifier>
```

更新证书文件:

```
ios profiles:devices:add TangQiao_Profile "TangQiaos iPhone"=<Device Identifier>
```

nomad 还有很多功能，建议大家阅读其官方网站的文档进一步学习。

### xctool

xctool（<https://github.com/facebook/xctool>）是 facebook 开源的一个 iOS 编译和测试的工具。使用它而不是用 Xcode 的 UI 界面是因为它是一个纯命令行工具。比如：我们可以使用 xctool 在命令生下进行编译和单元测试，然后将测试结果集成到 Jenkins 中，这样就实现了自动化的持续集成。虽然苹果也在 OSX Server 上推出了自己的自动化集成工具 BOT，但其配置和使用上现在仍然不太方便。

安装 xctool 可以使用 brew 命令：

```
brew install xctool
```

使用 xctool 编译项目可以使用如下命令：

```
path/to/xctool.sh \
  -project YourProject.xcodeproj \
  -scheme YourScheme \
  build
```


使用 xctool 执行单元测试，可以使用如下命令：

```
path/to/xctool.sh \
  -workspace YourWorkspace.xcworkspace \
  -scheme YourScheme \
  test
```

xctool 还有很多功能，建议大家阅读 xctool 官方网站的文档进一步了解更多的功能。

### appledoc

appledoc（<https://github.com/tomaz/appledoc>）是一个从源码中抽取文档的工具。

对于开发者来说，文档最好和源码在一起，这样更新起来更加方便和顺手。象 Java 一类的语言本身就自带 javadoc 命令，可以从源码中抽取文档。而 appledoc 就是一个类似 javadoc 的命令行程序，可以从 iOS 工程的源代码中抽取相应的注释，生成帮助文档。

相对于其它的文档生成工具，appledoc 的优点是：

 * 它默认生成的文档风格和苹果的官方文档是一致的。
 * appledoc 就是用 objective-c 写的，必要的时候调试和改动也比较方便。
 * 它可以生成 docset，并且集成到 xcode 中。集成之后，在相应的 API 调用处，按住 option 再单击就可以调出相关的帮助文档。
 * 它没有特殊的注释要求，兼容性高。

安装 appledoc 可以直接使用 brew 命令：

```
brew install appledoc
```

使用时切换到 iOS 工程目录下，执行以下操作即可，appledoc 会扫描当前路径下的所有文件，然后生成好文档放到 doc 目录下。你也可以用 appledoc —help 查看所有可用的参数。

```
appledoc -o <output_path> \
--project-name <project_name> \
--project-company <project_company> .
```

详细的使用介绍，欢迎阅读我的文章：[《使用 Objective-C 的文档生成工具:appledoc》](/2012/02/01/use-appledoc-to-generate-xcode-doc/)

## Xcode 插件

Xcode 是 iOS 的集成开发环境，虽然苹果一直在不断改进 Xcode，但程序员总是有各种新奇的想法和需求，当 Xcode 无法满足他们时，于是他们就会通过插件的方式来为 Xcode 增加新的功能。本节将会给大家介绍一些常用的 Xcode 增强插件。

Xcode 所有的插件都安装在目录`~/Library/Application Support/Developer/Shared/Xcode/Plug-ins/`下，每个插件为一个子目录，你也可以手工切换到这个目录来增加或删除插件。

### Alcatraz

{% img /images/tool-alcatraz-logo.jpg %}

Alcatraz（<http://alcatraz.io/>）是管理 Xcode 所有插件的插件，它可以直接集成到 Xcode 的图形界面中，让你感觉就像在使用 Xcode 自带的功能一样。Alcatraz 不但可以管理 Xcode 的插件，它另外还提供了管理 Xcode 工程模版以及颜色配置的功能。

使用如下的命令行来安装 Alcatraz：

```
mkdir -p ~/Library/Application\ Support/\
Developer/Shared/Xcode/Plug-ins;
curl -L http://git.io/lOQWeA |\
 tar xvz -C ~/Library/Application\ Support/\
 Developer/Shared/Xcode/Plug-ins

```

安装成功后重启 Xcode，就可以在 Xcode 的顶部菜单中的 "Window"->“Package Manager” 中找到 Alcatraz。点击 “Package Manager”，即可启动插件列表页面。你可以在右上角搜索插件，对于想安装的插件，点击其左边的图标，即可下载安装，如下所示，我正在安装 KImageNamed 插件：

{% img /images/alcatraz-install.jpg %}

安装完成后，再次点击插件左边的图标，可以将该插件删除。

以下所有介绍的插件均可用该方法来安装或删掉，就不另行介绍了。

Alcatraz 详细的使用介绍，欢迎阅读我的文章：[《使用 Alcatraz 来管理 Xcode 插件》](/2014/03/05/use-alcatraz-to-manage-xcode-plugins/)

### KSImageNamed

KSImageNamed（<https://github.com/ksuther/KSImageNamed-Xcode>）是一个帮助你输入 [UIImage imageNamed:] 中的资源名的插件。当你输入`[UIImage imageNamed:]`时，会自动的弹出上下文菜单，供你选择你需要输入的图片资源名字，另外在选择图片资源时，还可以在左侧预览该资源。如下图所示：

{% img /images/xcode-plugin-nsimage.jpg %}

### XVim

XVim（<https://github.com/JugglerShu/XVim>）是一个 Xcode 的 vim 插件，可以在 Xcode 的编辑窗口中开启 vim 模式。

vim 模式最大的好处是可以全键盘操作，可以方便地移动光标以及复制、粘贴代码。XVim 对于 Xcode 的分栏模式也有很好的支持，与 vim 自带的分栏模式一样，可以用快捷键`ctrl + w`来切换当前编辑的分栏。

### FuzzyAutocompletePlugin

FuzzyAutocompletePlugin (<https://github.com/FuzzyAutocomplete/FuzzyAutocompletePlugin>) 允许使用模糊的方式来进行代码自动补全。

举个例子，如果我们要重载 `viewDidAppear:`方法，那么我们必须依次建入 view、did、appear 才能得到相应的补全信息，使用 FuzzyAutocompletePlugin 之后，我们可以建入 vda (view、did、appear 三个单词的首字母)，或任意符合 viewDidAppear 整个单词出现顺序的子串 (例如 vdapp, adear 等)，即可匹配到该方法。

![](https://raw.githubusercontent.com/FuzzyAutocomplete/FuzzyAutocompletePlugin/master/demo.gif)

### XToDo

XToDo（<https://github.com/trawor/XToDo>）是一个查找项目中所有的带有 `TODO`, `FIXME`, `???`, `!!!` 标记的注释。

通常我们在项目开发中，由于种种原因，一些事情需要以后处理，这个时候为了防止遗忘，加上`TODO`或`FIXME`注释是非常有必要的，但是上线或提交代码前要寻找这些未解决的事项却稍显麻烦。XToDo 可以提供一个汇总的界面，集中显示所有的未完成的`TODO`和`FIXME`标记。

### BBUDebuggerTuckAway

BBUDebuggerTuckAway（<https://github.com/neonichu/BBUDebuggerTuckAway>）是一个非常小的工具，可以在你编辑代码的时候自动隐藏底部的调试窗口。因为通常情况下，调试的时候是加断点或监控变量变化，或者在 Console 窗口用`po`来输出一些调试信息。如果开始编辑代码了，说明已经调试结束了，这个时候隐藏调试窗口，可以给编辑界面更多空间，方便我们修改代码。

### SCXcodeSwitchExpander

SCXcodeSwitchExpander（<https://github.com/stefanceriu/SCXcodeSwitchExpander>）帮助你迅速地在`switch`语句中填充枚举类型的每种可能的取值。

例如，当你输入`switch`，然后键入一个`NSTableViewAnimationOptions`类时，该插件会将其可能的取值补全在每一个`case`之后，如下图所示：

{% img /images/xcode-plugin-switch.jpg %}

### deriveddata-exterminator

deriveddata-exterminator（<https://github.com/kattrali/deriveddata-exterminator>）是一个清除 Xcode 缓存目录的插件。

有些时候 Xcode 会出各种奇怪的问题，最常见的是在某些复杂操作下（例如同一个项目，来回切换到各种分支版本），会造成 Xcode 显示一些编译的错误或警告，但是最终却又可以编译通过。新手遇到这种问题常常束手无策，而熟悉 Xcode 的人就知道，通常清除 Xcode 缓存就可以解决这类问题。该插件在 Xcode 菜单上增加了一个清除缓存按钮，可以一键方便地清楚缓存内容。

### VVDocumenter

VVDocumenter（<https://github.com/onevcat/VVDocumenter-Xcode>）是一个自动生成代码注释的工具，可以方便地将函数的参数名和返回值提取出来，这样结合上一节介绍的`appledoc`命令，就可以方便地将帮助文档输出。

{% img /images/xcode-plugin-vvdocument.png %}

### ClangFormat

ClangFormat（<https://github.com/travisjeffery/ClangFormat-Xcode>）是一个自动调整代码风格（Code Style）的工具。Xcode 本身的代码缩进自动调整功能比较弱，特别是对于 JSON 格式，常常产生非常丑陋的默认缩进效果。ClangFormat-Xcode 可以更好地对代码进行重新排版，并且内置了各种排版风格，也支持自定义风格。

### ColorSense

ColorSense（<https://github.com/omz/ColorSense-for-Xcode>）是一个`UIColor`颜色输入辅助工具，可以帮助你在编写`UIColor`代码时，实时预览相应的颜色，如下图所示：

{% img /images/xcode-plugin-color.png %}

### XcodeBoost

XcodeBoost（<https://github.com/fortinmike/XcodeBoost>）包含多个辅助修改代码的小功能，比如：

 * 可以在 .m 文件中复制方法实现，然后将该方法的定义粘贴到对应的 .h 文件中
 * 可以在某一个源文件中直接输入正则表达式查找
 * 可以复制粘贴代码时不启用 Xcode 的自动缩进功能（Xcode 的自动缩进经常出问题，造成已经调整好的代码缩进，因为粘贴时被 Xcode 调整坏了）
 
 
## 总结

本文分图形应用工具，命令行工具，Xcode 插件三个部分，介绍了 iOS 开发中好用的工具。其中涉及的图形工具部分是收费的，而命令行工具和 Xcode 插件工具全部是免费并且开源的工具，笔者在此也感谢广大的开源软件作者，是他们让整个软件生态圈更加美好。
