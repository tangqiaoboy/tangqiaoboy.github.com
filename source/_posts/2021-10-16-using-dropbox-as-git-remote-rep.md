---
title: 把 DropBox 当作私有化 Git 仓库
date: 2021-10-16 22:15:58
categories:
tags:
---

## 一、序

我最近有一些随手的小项目，不便于公开到 GitHub 上面，但是又想有一个简单的私有化仓库。

于是我想到了 DropBox。

但是，我们不能简单地把项目放到 DropBox 目录中，因为这样会使得每次简单的保存都会发起文件同步，编译的时候的一些临时文件改动也会造成 DropBox 同步，这样会把电脑 CPU 占用搞得很高。

我们要的只是一个远程仓库。

于是我想到了 `Git init --bare` 指令，测试了一下，效果还可以，给大家分享一下。

## 二、方法

1、我们还是正常地在本地非 DropBox 目录用 Git 来管理工程，我们假设这个本地的工程已经建好了。

2、同步地，我们在 DropBox 目录下，新建一个对应的同步目录，在目录下，使用 `git init --bare` 进行初始化（如下图）。该指令只会创建一个空的 Git 仓库，同时没有工作区和缓存区。

{% img /images/dropbox-1.png %}

3、在代码工程的 Git 仓库，使用 `git remote add` 指令，将刚刚创建的仓库指定成名为 `origin` 的远程仓库（如下图）。

{% img /images/dropbox-2.png %}

4、最后执行 `git push origin master` 将代码同步到 DropBox。

5、看了一眼 DropBox 状态，它很快就将代码同步到了云端。

{% img /images/dropbox-3.png %}

6、当我们要在另一台电脑上下载这个工程时，只需要这样：`git clone <DropBox仓库目录> <本地目录>` 即可（如下图）。

{% img /images/dropbox-4.png %}

以上。


