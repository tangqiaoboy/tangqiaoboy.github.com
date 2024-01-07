---
title: 重装 M2 的 MBP 
date: 2024-01-07 00:04:25
categories:
tags:
---

{% img /images/macbook-m2.jpg %}

因为工作的电脑使用满 4 年，所以周末领到了一台新的 M2 的 MBP。考虑到新电脑 CPU 不太一样，所以我没有使用迁移助手，尝试重装了一遍电脑。

整个安装下来最麻烦的就是开发者环境，基本上无法正常连上外网下载各种开源软件，最后我灵机一动搜了一下，才发现清华大学上有不少开源软件的镜像。这样大大加快了我安装软件的速度。

整理了一下自己的生产力工具，现在做业务之后，基本不写代码了，所以偶尔写博客或者查资料有这些软件就够用了：

### iTerm2

拥有一个更好的 Terminal 操作界面： <https://iterm2.com/>

### Home Brew

用镜像安装Home Brew: <https://mirrors.tuna.tsinghua.edu.cn/help/homebrew/>

有了 [Home Brew](https://brew.sh/) 之后就可以装我需要的一些环境：

```bash
brew install node
brew install hexo
```

npm 的资源比较慢，安好 node 之后也把镜像设置一下：

npm： `npm config set registry http://mirrors.cloud.tencent.com/npm/`

### Oh My Zsh

Oh My Zsh 可以利用镜像安装：<https://mirrors.tuna.tsinghua.edu.cn/help/ohmyzsh.git/>

安装完可以设置一下 [autojump](https://github.com/wting/autojump#installation) 插件

再把 [macos 插件](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/macos)打开。

### Sublime Text 

我主要用 [Sublime Text](https://www.sublimetext.com/) 来写博客。

配合下面的设置可以方便在命令行中调用 Sublime Text。

```
export PATH="/Applications/Sublime Text.app/Contents/SharedSupport/bin:$PATH"
```

### Alfred

在安装软件的时候，我顺便花 30 美元把我的 Alfred 升级到了 5.0，试了一下它的 Power Pack 提供的 [Snippets](https://www.alfredapp.com/extras/snippets/) 功能，比 [Dash](https://kapeli.com/dash) 还强大很多，于是果断把 Dash 换掉了。麻烦的是我自己原本整理的 Snippets 无法方便迁移，只能一个一个复制，不过也当再次整理了，因为很多 Snippets 没用了。

Alfred 的 Snippets 也支持利用 [Dropbox 同步](https://www.alfredapp.com/help/advanced/sync/)。

### 1Password 6

我还在使用之前买的 1Password 本地一次性付费版本，不用每月续费，配合 Dropbox 同步密码。

### Dropbox

离不开它，所有重要工作资料都用它来同步和备份。

### Surge 

有了 [Surge](https://nssurge.com/)，Dropbox 才能正常工作。

### ImageOptim

[ImageOptim](https://imageoptim.com/mac) 可以帮助我压缩博客的图片。

{% img /images/imageoptim.png %}

