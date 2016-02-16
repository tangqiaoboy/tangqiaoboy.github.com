---
layout: post
title: "使用Objective-C的文档生成工具:appledoc"
date: 2012-02-01 20:37
comments: true
categories: xcode iOS
---

##前言

做项目的人多了，就需要文档了。今天开始尝试写一些项目文档。但是就源代码来说，文档最好和源码在一起，这样更新起来更加方便和顺手。象 Java 语言本身就自带 javadoc 命令，可以从源码中抽取文档。今天抽空调研了一下 objective-c 语言的类似工具。

<!-- more -->

从 [stackoverflow](http://stackoverflow.com/questions/813529/documentation-generator-for-objective-c) 上找到三个比较 popular 的工具：doxygen, headdoc 和 appledoc 。它们分别的官方网址如下：

 * docxygen <http://www.stack.nl/~dimitri/doxygen/index.html>  
 * headdoc <http://developer.apple.com/opensource/tools/headerdoc.html> 
 * appledoc <http://gentlebytes.com/appledoc/> 


##介绍
我把这 3 个工具都大概调研了一下，说一下我的感受。
###docxygen
docxygen 感觉是这 3 个工具中支持语言最多的，可以配置的地方也比较多。我大概看了一下文档，觉得还是比较复杂，而且默认生成的风格与苹果的风格不一致。就去看后面 2 个工具的介绍了。另外，它虽然是开源软件，但是没有将源码放到 github 上让我感觉这个工具的开发活跃度是不是不够。

###headerdoc
headerdoc 是 xcode 自带的文档生成工具。在安装完 xcode 后，就可以用命令行：headdoc2html + 源文件名 来生成对应的文档。我个人试用了一下，还是比较方便的，不过 headerdoc 的注释生成规则比较特别，只生成以 /\*! \*/ 的格式的注释。还有一个缺点是每个类文件对应一个注释文件，没有汇总的文件，这点感觉有点不爽。

###appledoc
appledoc 是在 stackoverflow 上被大家推荐的一个注释工具。有几个原因造成我比较喜欢它：

1. 它默认生成的文档风格和苹果的官方文档是一致的，而 doxygen 需要另外配置。 
2. appledoc 就是用 objective-c 生成的，必要的时候调试和改动也比较方便。
3. 可以生成 docset，并且集成到 Xcode 中。这一点是很赞的，相当于在源码中按住 option 再单击就可以调出相应方法的帮助。
4. appledoc 源码在 github 上，而 doxygen 在 svn 上。我个人比较偏激地认为比较活跃的开源项目都应该在 github 上。
5. 相对于 headerdoc，它没有特殊的注释要求，可以用 /\*\* \*/ 的格式，也可以兼容 /\*! \*/ 的格式的注释，并且生成的注释有汇总页面。

##安装
那么简单介绍一下如何安装 appledoc，安装非常简单，只需要 2 步：
```
 git clone git://github.com/tomaz/appledoc.git
 cd appledoc
 sudo sh install-appledoc.sh
```

##使用
使用 appledoc 时，只需要用如下命令即可：
```
appledoc -o ./doc --project-name ynote --project-company youdao .
```
appledoc 会扫描当前路径下的所有文件，然后生成好文档放到 doc 目录下。你也可以用 appledoc --help 查看所有可用的参数。

基本上使用起来还是比较方便的，详细的信息可以查看官方的文档：<http://gentlebytes.com/appledoc/>



