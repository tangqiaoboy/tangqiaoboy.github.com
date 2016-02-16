---
layout: post
title: "用Git进行协同开发"
date: 2012-02-29 19:08
comments: true
categories: shell
---

##问题场景描述
常常会遇到这样的协同场景：后台的同事和前端的同事需要共同开发一个新功能，而他们的代码相互依赖，所以需要不停地更新各自的代码进行联调。

对于这种场景，最简单的方式就是，这 2 个同事坐到一起，然后把 svn 当作一个共享代码的中转站来共享开发中的代码。

在这种方式下，大家各自写自己的代码，提交到 svn 上，然后用 svn up 获得对方的代码。在调试问题的时候，大家可能不停地更新代码，然后让对方用 svn up 来更新。最终，虽然开发能够顺利进行，但是 svn 上会积累大量调试中的代码历史。所以，这样把 svn 当作代码中转站是一个很山寨的行为。

在开发 [有道云笔记](http://note.youdao.com) 新的 [iPad 版](http://itunes.apple.com/cn/app/id483995181) 时，我和前端同事 zyc 尝试用 git 进行了协同开发。在这里把具体方案分享给大家，欢迎大家讨论。

<!--More-->

##Git 相关协议介绍
Git 对于你本机的代码项目，允许用很方便的方式进行非授权的只读访问 ,[相关介绍链接](http://progit.org/book/zh/ch4-9.html)。简单来说，就是可以用 Git 自带的 Git daemon 命令在本机的 9418 端口启动一个守护进程，然后其它机器就可以以只读方式访问你开放出来的项目代码。

具体步骤如下：

 * 在你的 Git 工程下新建一个名为 git-daemon-export-ok 的文件放到 .git 目录下，表明该工程允许非授权访问。示例代码如下：

``` bash
cd /path/to/project.git
touch git-daemon-export-ok
```

 * 执行 git daemon 命令，设置你要 Export 出的项目目录的父目录，例如工程的代码地址是：/opt/git/project 的话，则示例代码如下：

``` bash
git daemon --reuseaddr --base-path=/opt/git/ /opt/git/
```

 * 告知对方你的机器的 IP，然后在对方的机器，用下列命令即可检出你的代码：

``` bash
git checkout git://your_ip_address/project
```

 * 如果对方有更新，只需要 git pull 一下。

##协作
对于这种基于 Git 的协作，我们可以在本地随意的提交代码，让对方用 git pull 更新。当开发完成，需要 push 到公共仓库的时候，再用 git rebase -i 将本地的提交进行清理即可。并且由于大家都是在机器间互拷，不依赖 svn 公共服务器，更新代码的速度也要快得多。


