---
layout: post
title: "使用Privoxy做智能代理切换"
date: 2012-12-08 16:47
comments: true
categories: mac
---

{% blockquote %}

You take the blue pill, the story ends, you wake up in your bed, and believe whatever you want to believe. 

You take the red pill, you stay in Wonderland, and I show you just how deep the rabbit hole goes.

-- 《黑客帝国》

{% endblockquote %}

如果你不知道什么是“墙”，那么应该祝福你继续活在美丽的Matrix里。但如果你选择服用红色药丸，那么在享受了墙外的信息流畅之后，你就再也无法忍受墙内的世界了。

<!-- more -->

##GoAgent

[GoAgent](https://code.google.com/p/goagent/)是一个基于Google App Engine的翻墙工具。关于GoAgent的安装教程，网络上已经有很多了，大家可以随便搜索一下就可以找到，当然，记得用google搜索。

##SwitchySharp

拿GoAgent直接作代理服务器地址不太合适，因为如果全部走代理的话，国内的访问太慢了，所以我们需要给Chrome浏览器配置[SwitchySharp插件](https://chrome.google.com/webstore/detail/proxy-switchysharp/dpplabbmogkhghncfbfdeeokoefdjegm)，SwitchySharp插件加上自动更新的“墙”List（地址见下图），我们就可以在浏览器中享受无墙的世界了。

{% img /images/switch-sharp.png %}

##Privoxy

因为虽然SwitchySharp搞定了访问网页时的代理智能切换，但是我们在使用诸如Dropbox, twitter客户端等软件时，还是无法智能切换到代理。而使用Privoxy就能解决这个问题。

Privoxy是一个智能代理切换软件，它的使用必须基于GoAgent或其它已部署好的代理服务。下面介绍如何安装和配置privoxy。

###安装

使用brew就可以一键安装：

``` bash
brew install privoxy
```

###自动启动

设置好自动启动后，我们就不用管它了。方法如下：

切换到/Library/LaunchAgents目录，用sudo vim新建一个名为local.privoxy.plist的文件，文件内容如下所示：

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>local.arcueid.privoxy</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/sbin/privoxy</string>
        <string>--no-daemon</string>
        <string>/usr/local/etc/privoxy/config</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>/usr/local/Cellar/privoxy/3.0.19/sbin/privoxy.log</string>
    <key>StandardOutPath</key>
    <string>/usr/local/Cellar/privoxy/3.0.19/sbin/privoxy.log</string>
</dict>
</plist>
```

编辑完成后，执行如下命令，就可以把privoxy设置成开机自动启动了：

``` bash
sudo launchctl load /Library/LaunchAgents/local.privoxy.plist 
```

可以用如下2条命令验证privoxy已经启动了。一是用ps查看是否有privoxy进程，二是查看privoxy默认监听的8118端口是否已经打开。如下所示：

``` bash
[tangqiao LaunchAgents]$ps aux  | grep privoxy
tangqiao       25641   0.3  0.0  2436516    492 s001  U+    5:31下午   0:00.00 grep --color=auto privoxy
root           17984   0.0  0.2  2477764  17452   ??  Ss   10:13上午   0:50.28 /usr/local/Cellar/privoxy/3.0.19/sbin/privoxy --no-daemon /usr/local/etc/privoxy/config
[tangqiao LaunchAgents]$netstat -an | grep 8118
tcp4       0      0  127.0.0.1.8118         *.*                    LISTEN   
```

###配置

我们需要配置Provixy才能使用它。配置步骤如下：

一. 用vim打开privoxy的配置文件：vim /usr/local/etc/privoxy/config
在最后增加如下内容：
```
    actionsfile wall.action
```

二. 在/usr/local/etc/privoxy/目录下新建一个名为 wall.action的文件，然后在上面添加如下内容：

```
{+forward-override{forward 0.0.0.0:8087}}
.google.com.hk
.facebook.com
.google.com
.fbcdn.net
.gstatic.com
.gmail.com
.twitter.com
.youtube.com
```

该内容第一行表示接下来的内容会智能走端口为8087的代理，后面每行一个地址。你可以随时将你想增加的内容添加进去。该配置文件的官方详细说明文档[在这里](http://www.privoxy.org/3.0.19/user-manual/actions-file.html#ACTIONS-FILE)。

三. 打开mac的代理设置，将“Web代理”和"安全Web代理"都设置成127.0.0.1，端口为8118。如下图所示：

  {% img /images/mac-proxy.png %}

###Tips

 1. 如果你的GoAgent监听在8087端口，而Privoxy监听在8118端口，那么到这一步，你就可以让你的所有应用正常翻墙了。
需要注意的是SwitchySharp默认会忽略系统代理直接连接网络，你可能需要选择它的“使用系统代理设置”这一项，如下所示：
    
    {% img /images/switch-sharp-use-system-proxy.png %}
 
 2. 用浏览器访问 config.privoxy.org，即可用Web界面管理自己的provixy配置文件。不过，事先需要在config文件中启用Web管理功能，方法是编辑/usr/local/etc/privoxy/config 文件，将enable-edit-actions的值设置为1即可。

 3. 访问 <http://config.privoxy.org/show-url-info> 可以查询某一个特定的URL是否会走代理服务。我们可以随时在这儿查询，结合上面的第2步，将一些URL Pattern加入到代理列表文件 wall.action 中, 我们就可以方便地管理Privoxy。

 4. 证书是个麻烦事儿，由于GoAgent的证书是自己生成的而不是权威机构颁发的，所以需要把GoAgent的证书加到钥匙串访问的可信证书里面，如下图所示。另外GoAgent的默认带的证书因为是公开的，所以有潜在被[中间人攻击](http://zh.wikipedia.org/zh-hk/%E4%B8%AD%E9%97%B4%E4%BA%BA%E6%94%BB%E5%87%BB)的危险，所以更安全的做法是把默认的证书删掉再重启GoAgent，这样GoAgent就会重新另外生成一个证书了，再把这个新证书加到钥匙串访问中，会更安全一些。
    {% img /images/goagent-cer.png %}


##参考文章
 1. <http://venmos.com/blog/2012/09/20/mac-autossh-privoxy/>

 2. <http://y-zh.net/archives/77>


