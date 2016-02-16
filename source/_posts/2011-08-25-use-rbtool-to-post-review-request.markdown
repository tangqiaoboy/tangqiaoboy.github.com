---
layout: post
title: "使用RBTool自动提交code review请求"
date: 2011-08-25 18:13
comments: true
categories: shell
---

###前言
让我们回想一下手工提交review请求的过程:

1. 首先得用 svn diff > filename.diff 生成diff文件。
2. 然后输入review board的网址，可能是 rb.companyname.com
3. 然后需要输入你的账号密码进行登录验证。
4. 然后你需要填写你的svn repository 地址，然后上传diff文件。
5. 然后你进到review请求的详细页面，填写summary, description, test-done, group和people项，而通常情况下，你的group是固定的，review你的people也就是那么几个人来回变。
6. 最后你填完这些内容，点击 publish 来发布你的review请求。

<!--more-->

###RBTool安装和配置
是不是觉得很烦索？其实review board官网提供了一个RBTool，
可以帮你把这些步骤全部省掉，一切只需要在命令行敲一条 post-review指令即可。
很心动吧？让我们来看看如何安装RBTool。

首先需要你的电脑里安装了git, python, Mac同学表示这些东西都安全装预好了，如果是老版本的mac，也可以自行下载安装。Git的windows/mac/linux版本下载地址是：<http://git-scm.com/> 。 

下载安装完git后，输入 
<pre>
git clone git://github.com/reviewboard/rbtools.git 
cd rbtools
sudo python setup.py install 
</pre>
OK，post-review已经安装好了。

然后你需要小小配置一下，在自己svn项目的根目录下，建立：.reviewboardrc 文件。在文件中输入：

```
REVIEWBOARD_URL = "http://rb.yourcompany.com"
REPOSITORY = "https://dev.yourcompany.com/svn/xxxx"
```

这2行分别代表你们公司的review board网址和svn根目录地址。

###RBTool的使用
OK，以后你要提交review请求，只需要在项目根目录下输入 post-review 即可。第一次需要输入登陆review board的用户名密码，post-review工具会记住密码，以后就不用输入了。post-review默认会将你当前svn目录下的diff修改提交到review board上。你也可以加上一些指定的参数来指定group, people, description等等。比如我就写了一个小脚本，将post-review改成：
<pre>
post-review --target-groups=mygroup --target-people=friendname1,friendname2
</pre>

post-review还可以更新以前提交的diff,方法是用 -r 指定review number即可。具体的可以用post-review --help来查看详细信息。也可以去review board官网查看详细的说明：<http://www.reviewboard.org/docs/codebase/dev/getting-started/#rbtools>

如果是用git svn管理的项目，另外加上参数：--parent git-svn 即可。

赶快用RBTool工具提高你的工作效率吧～
