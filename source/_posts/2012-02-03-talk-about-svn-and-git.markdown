---
layout: post
title: "Git 的使用感受"
date: 2012-02-03 21:08
comments: true
categories: shell
---

从开始工作到现在，在公司里面一直用 svn 来做版本管理。大约半年前听说了 Git，因为 Git 的光辉相当耀眼，作者是 Linus Torvalds，被大量的开源软件采用，如 jQuery, Perl, Qt, ROR, YUI, GNOME 等，所以决定学一学。
比较庆幸的是，国内有一本较好的介绍 Git 的书：[《Git 权威指南》](http://www.amazon.cn/Git%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97-%E8%92%8B%E9%91%AB/dp/B0058FLC40/ref=sr_1_1?ie=UTF8&qid=1328277616&sr=8-1)。
我大概花了一个月的周末时间来学习它。在这里总结一下使用 Git 的感受，主要是和 SVN 来做一些比较，以便突出 Git 的特点。

<!--more-->

## 学习成本

首先我感觉 Git 的学习成本还是比较高的。svn 基本上不到 20 个命令就可以应付日常的工作了，而 Git 有上百个命令。我在学习 SVN 的时候，基本上没有看什么书，最多就是在网上随便看了一些贴子，就基本会使用 SVN 了。而我花在 Git 的学习时间算下来，至少有 1 周。

因为 Git 的学习成本较高，所以当一个会 svn 的同学刚刚接触 Git 的时候，如果简单地把 Git 当 SVN 用，就会感觉 Git 相当难用。我在公司就时常听到同事抱怨它。所以我认为，要想真正用好 Git，还是需要投入时间来学习它，否则是很难使用的。

## Git 的内部结构

Git 真正是一个面向程序员的工具，它的内部数据结构是一个有向无环图，并且，你必须理解它的内部数据结构后，才能掌握它。因为你的很多操作，都其实对应的是这个有向无环图的操作。比如:

* git commit 就是增加一个结点。
* git commit --amend 就是改发一个结点。
* git reset 就是修改 HEAD 指向的结点。

另外，Git 内部包括三个区域：工作区，暂存区和版本库。

* git add 是将工作区的内容保存到暂存区
* git checkout 是将暂存区的内容覆盖工作区
* git commit 是将暂存区的内容保存到版本库
* git reset 默认情况下是将版本库的内容覆盖工作区
* git diff 也有三种情况，分别是比较工作区与暂存区，工作区与版本库，暂存区与版本库之间的差别

了解了 Git 的内部结构，对于这些 Git 的命令就更加理解了。

## svn 的坑

svn 在平常使用上基本没什么坑，平时通过
`svn pe svn:ignore .` 设置好忽略的文件，以免误把不应该加入版本管理的文件加进来。

我唯一遇到的一次问题是这样的：我有一个目录要加入 svn 的版本库，但是目录里面的一些文件不想加入。如果直接输入 svn add 目录名，就会把目录下所有文件都加入到版本管理中。如果 cd 到那个目录里面配置 svn:ignore，又会因为当前目录还不在版本管理中，设置不了。最后找到的解决办法是在 svn add 的时候增加 --non-recursive 参数：

```
svn add dirname --non-recursive
或者是：
$ svn add dirname --depth empty
```

还有就是对于一些不小心用 svn add 加入了版本管理，但实际上不应该加的目录。可以这么做：

```
svn export spool spool-tmp    (这里 export 可以将原目录中的 .svn 目录给清除掉)
svn rm spool
svn ci -m 'Removing inadvertently added directory "spool".'
mv spool-tmp spool
svn propset svn:ignore 'spool' .
svn ci -m 'Ignoring a directory called "spool".'
```

## Git 的坑

 * 在 windows 下的文件的权限因为无法和 linux 上完全一致，所以用 Git 检出的文件权限可能显示为被更改。
另外因为 windows 下的换行和 linux 上也不一样，协作开发时也容易出问题。所以在 windows 上使用 Git 的同学需要加上以下 2 行配置参数：

```
git config --global core.filemode false
git config --global core.autocrlf true
第一句是忽略文件权限的改动。
第二句是将文件 checkout 时自动把 LF 转成 CRLF，check in 时自动把 CRLF 转成 LF
```

 * svn 的 `svn revert filename` 对应的其实是 `git checkout -- filename`, 而 `git revert xxx` 是基于 xxx 提交所做的改动，做一次反向提交，和 svn revert 完全不一样。


## Git 的一些小技巧

### 节省clone体积

有些时候，我们只想简单学习一下项目代码，这个时候，用 `git clone rep_address --depth 1` 可以只 clone 每个文件最新的一个提交，这样速度会快很多。

### 强制推送

一旦推送到远程仓库后，就不要用类似 `git reset`, `git ci --amend`, `git rebase` 等破坏性提交了，否则远程仓库会因为你的新推送不是 Fast Forward 而拒绝提交 (关于什么是 Fast Forward 要讲的太多了，自已看书吧)。如果实在不小心做了。在确定别人没有检出前，用 `git push -f` 可以强制推送到远程仓库中。如下图:

{% img /images/git_push_f.jpg %}


### 使用 git svn

 在公司没有应用 git 前，你可以用 git svn 来做管理。 git svn 相关命令：

```
git svn clone -r REV1:HEAD svn_addr local_addr
git svn dcommit  提交到 SVN
git svn fetch    从 svn up 信息
git svn rebase   将从 svn up 过来的信息，rebase 成 git 提交
git svn rebase --continue  冲突后继续 rebase 信息
```

用 git svn clone 的时候，带上 -r rev1:HEAD 参数，可以省去将 SVN 整个提交历史抓取下来的时间。

### 设置常用命令的别名

 在用户的 home 目录下，有一个 .gitconfig 文件，里面可以配置一些别名，方便平时的 git 操作。
特别是那些平日使用 SVN 的短命令习惯了的同学，配置一下别名后，使用 git 就会相当顺手了。我配置的别名如下。这里特别多说一句，有些人喜欢将 ci 设置成 commit -a，这样就不用 git add 来把需要提交的文件加入到暂存区了。在《Git 权威指南》中，作者极力反对这样做。因为 Git 本身在提交前有 add 这步，就是为了让提交者能够审视自己的提交文件，以防止错误的提交发生。
<pre>
[alias]
    st = status -s
    ci = commit
    l = log --oneline --decorate -13
    ll = log --oneline --decorate
    co = checkout
    br = branch
    rb = rebase
    dci = dcommit
</pre>


### 删除不在 git 管理下的文件
 如果你需要删除 Git 下没有加入到版本库中的文件，可以使用：
```
git clean -nd 测试删除
git clean -fd 真实删除
```

### 搭建自己的远程仓库

搭建一个 Git 远程仓库相当简单，直接在一台带 SSH 的服务器上用 git init --bare dirname 即可。本地可以用 git remote 命令来设置多个远程分支。另外，第一次提交的时候，因为远程仓库中没有任何分支，需要用如下指令建立 master 分支：
```
git remote add origin yourname@yourhost.com:~/path/repository_name
git remote add add2 yourname@yourhost.com:~/path/repository_name
git push origin master
git push add2 master
// 如果 git remote add 设置地址写错了，可以用 git remote set-url 更改：
git remote set-url origin yourname@yourhost.com:~/path/repository_name
```

### 如何用 Git 将一个文件的历史提交恢复？

上次遇到一个问题，我某次提交改动了很多文件，但是其中有一个是不应该改的。所以我需要把这次提交中关于那个文件的改动撤销。直接用 git checkout 命令可以检出某一个文件的历史版本，然后就可以将对这个文件的改动取消了。如下：

```
git checkout CommitId fileName 
git ci -m "revert a file modification"
```

### 本地工作区还有未提交的内容时，不能 pull?

可以先用 git stash 将内容暂存，然后再 pull，成功后再 git stash pop 将修改恢复。

### 提交的邮箱错了？

有些时候，因为同时在 github 和公司内部做提交，所以用 2 个不同的邮箱。如果一个新工程 clone 下来，忘了用 git config 来设置提交用户名和邮箱，就有可能用错误的邮箱作为账号名提交。这个时候，如果你只是错了最近的一次提交而已，可以用如下命令来将最近的一次提交作者名和邮箱修改：

``` bash
git config user.email your-email@163.com
git config user.name your-name
git commit --amend --reset-author
```
如果等你发现的时候，已经错了很多提交了。可以用如下命令来一次性修改多个提交的用户名和邮箱：

``` bash
git filter-branch -f --env-filter "
    GIT_AUTHOR_NAME='Tang Qiao'
    GIT_AUTHOR_EMAIL='tangqiao@fenbi.com'
    GIT_COMMITTER_NAME='Tang Qiao'
    GIT_COMMITTER_EMAIL='tangqiao@fenbi.com'
" HEAD

```

### 提交的时候自动去掉源码末尾的空格

源码末尾的空格几乎都是无意义的，应该去掉的。大多数 review 系统，都会将源码末尾的空格标红。所以，我们何不在提交时让 git 自动帮我们去掉这些空格呢？这个可以通过设置 git 的 hook 来实现，具体方法如下：

1. 用 vim 编辑一个名为 pre-commit 的文件： 
```
vim .git/hooks/pre-commit 
```

2. 输入如下代码，保存退出 vim

```
#!/bin/sh

if git-rev-parse --verify HEAD >/dev/null 2>&1 ; then
   against=HEAD
else
   # Initial commit: diff against an empty tree object
   against=4b825dc642cb6eb9a060e54bf8d69288fbee4904
fi

# Find files with trailing whitespace
for FILE in `exec git diff-index --check --cached $against -- | sed '/^[+-]/d' | sed -E 's/:[0-9]+:.*//' | uniq` ; do
    # Fix them!
    sed -i '' -E 's/[[:space:]]*$//' "$FILE"
    git add "$FILE"
done
```

3. 增加 pre-commit 的运行权根：
```
chmod +x .git/hooks/pre-commit
```

### 让常用操作自动带颜色
默认的 git diff, status, log 什么的都是不带颜色的，可以用如下命令让它们都带上颜色。另外还有一些有趣的命令，一并列在下面。

```
git config --global --add user.email "email@163.com"
git config --global --add user.name "your name"

git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status -s
git config --global alias.l log --oneline --decorate -12 

git config --global color.diff auto
git config --global color.status auto
git config --global color.branch auto
git config --global merge.tool kdiff3
git config --global meregtool.kdiff3.path "/usr/bin/kdiff3"  
git config --global alias.visual "!gitk" 
```

### 自动补全 git 命令

1. 安装 bash-completion: brew install bash-completion

2. 按要求把以下代码增加到 .bash_profile 文件中：

```
  if [ -f `brew --prefix`/etc/bash_completion ]; then
    . `brew --prefix`/etc/bash_completion
  fi
```

3. 下载 bash-completion 对于 Git 的支持

``` bash
cd /usr/local/etc/bash_completion.d/
sudo curl -O https://raw.github.com/git/git/master/contrib/completion/git-completion.bash
```

## 一些 Git 的资料

* [Git Magic](http://www-cs-students.stanford.edu/~blynn/gitmagic/intl/zh_cn/) 很通俗的一本介绍 Git 的书，比较短小精炼。
* [Pro Git](http://progit.org/book/zh/) 全面介绍 Git 的书，非常详细。
* [《Git 权威指南》](http://www.amazon.cn/Git%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97-%E8%92%8B%E9%91%AB/dp/B0058FLC40/ref=sr_1_1?ie=UTF8&qid=1328277616&sr=8-1) 中国人写的一本介绍 Git 的书，也非常通俗。我个人主要就是通过这本书来学习 Git 的。
* [Github](http://www.github.com) 基于 Git 的开源网站。在 Github 的托管的项目相当多，著名的有：rails, jquery, node, homebrew, three20, jekyll, jquery-ui, backbone, coffee-script, tornado, redis, underscore, asi-http-request, django。


