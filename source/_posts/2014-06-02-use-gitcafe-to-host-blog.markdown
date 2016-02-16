---
layout: post
title: "将博客从GitHub迁移到GitCafe"
date: 2014-06-02 17:22:02 +0800
comments: true
categories: summary
---

我之前一直使用 [Github Pages 功能](https://pages.github.com/) 以及 [Octopress](http://octopress.org/) 来搭建个人博客，我也写了一篇文章 [《象写程序一样写博客：搭建基于 github 的博客》](http://blog.devtang.com/blog/2012/02/10/setup-blog-based-on-github/) 来分享博客搭建的技术细节。

但是自从我的博客每天访问量超过 2000 次以后，我就发现博客的访问速度还是一个不可忽视的问题。通过 [监控宝](http://www.jiankongbao.com/) 和 [Google Analytics](http://www.google.com/analytics/)，我发现有些博客文章的平均打开时间长达 4 秒钟。于是我开始考虑将博客搭建在更快的服务器上面。

我的首先考虑是购买独立的 VPS，我买的是 [DigitalOcean](https://www.digitalocean.com/?refcode=f54eef197afd)，[DigitalOcean](https://www.digitalocean.com/?refcode=f54eef197afd) 算下来每月只需要 5$。于是在一个周末，我花时间购买了 DigitalOcean 家的 VPS，安装了 Nginx，然后在上面运行了一个脚本，定时将我 github 博客的内容自动更新过来（其实就是定期`git pull`一下我博客的 repo）。

就这样运行了一个月，我发现虽然 [DigitalOcean](https://www.digitalocean.com/?refcode=f54eef197afd) 服务器的 ping 值相比 github 要快一些。但是从监控数据上看，整体的网页访问速度并没有什么提高。就在我在微博上抱怨的时候，一个朋友推荐我试试 [GitCafe](http://gitcafe.com/signup?invited_by=tangqiaoboy)。于是我就尝试了一下，结果你猜怎么着？我被吓坏了。

ping 值直接从 200ms 左右减少到 3ms 左右，如下图所示：

{% img /images/gitcafe-ping.jpg %}

监控宝的统计显示，首页平均打开时间从原来的 1800ms 减少到 350ms 左右，快了 5 倍，如下图所示：

{% img /images/gitcafe-jiankong.jpg %}

所以我强烈建议各位基于 Github Pages 功能来搭建个人博客的朋友，将博客内容镜像到 [GitCafe](http://gitcafe.com/signup?invited_by=tangqiaoboy) 上。如果你有个人的独立域名，那么镜像之后就可以随时将博客地址在 Github 和 Gitcafe 之间切换了。对于各位博主来说，这样做没有任何风险，因为你可以随时再切换回去。当然，免费用了人家的服务，如果你能像我这样，在网站的底部附上感谢内容，那是再好不过的了。

以下为大家介绍详细的迁移过程。

## 迁移教程

### 注册

如果你还没有注册过 [GitCafe](http://gitcafe.com/signup?invited_by=tangqiaoboy)，首先需要 [点这里](https://gitcafe.com/signup) 注册一下。

注册完成之后，去 [公钥管理](https://gitcafe.com/account/public_keys) 那儿添加一下你的 ssh 公钥，这样以后提交代码会方便很多。当然你也可以不设置这一步，每次提交通过密码来验证。

### 在 GitCafe 上新建一个博客项目

然后我们需要先在 GitCafe 上新建一个博客项目。GitCafe 的博客搭建官方教程藏得比较深，所以我第一次还没有找到，教程地址在 [这里](https://gitcafe.com/GitCafe/Help/wiki/Pages-%E7%9B%B8%E5%85%B3%E5%B8%AE%E5%8A%A9#wiki)。具体来说，就是创建一个与用户名 (如果是组织，就是组织名) 相同名称的项目。如果你创建的项目名与用户名相同，GitCafe 会自动识别成这是一个 Page 项目，如下所示：

{% img /images/gitcafe-create-page.jpg %}

### 设置多个 Git Remote 源

接下来我们需要将原本提交到 Github 上的博客内容同步提交到 GitCafe。因为我的博客是基于 [Octopress](http://octopress.org/) 的，我介绍一下 Octopress 的做法，其它博客引擎的做法类似。

对于 Octopress，我们只需要每次提交网站内容时，执行完 `rake deploy`之后，再执行以下脚本即可（你可以将该脚本中的代码仓库地址换成你的，然后将其保存成一个脚 本文件，需要时执行一下即可）：

``` bash

cd _deploy
# 添加 gitcafe 源
git remote add gitcafe git@gitcafe.com:tangqiaoboy/tangqiaoboy.git >> /dev/null 2>&1
# 提交博客内容
echo "### Pushing to GitCafe..."
git push -u gitcafe master:gitcafe-pages
echo "### Done"%

```

大概解释一下以上内容，Octopress 在发布时会将自己的 `_delpoy`目录切换到 master 分支，然后将生成的博客内容放到`_delpoy`目录中，然后执行`git push`操作。正常情况下，默认内容是 push 到 github 上的。我们执行的以上脚本，就是为该项目增加了一个名为`gitcafe`的远程仓库，然后将 master 分支 push 到`gitcafe`的`gitcafe-pages`分支。

### 修改 Rakefile (可选)

除了以上方法外，你也可以直接修改`Rakefile`。在其第 269 行后增加如下代码，也可以达到同样的目的，这样你每次就仍然只需要执行`rake deploy`即可同时将博客同步到 github 和 gitcafe：

``` ruby
system "git remote add gitcafe git@gitcafe.com:tangqiaoboy/tangqiaoboy.git >> /dev/null 2>&1"
system "git push -u gitcafe master:gitcafe-pages"
```

插入代码的示例位置如下：

{% img /images/gitcafe-edit-rakefile.jpg %}


### 设置域名

GitCafe 的自定义域名设置比 github 要友好得多，它不但提供了图形界面设置，并且支持同时设置多个域名。在`项目管理`->`域名管理`中，我们可以找到相应的设置项，如下所示：

{% img /images/gitcafe-set-domain.jpg %}

在设置完之后，我们需要去域名解析的服务商那儿，将对应的域名用`A 记录`类型，解析到`117.79.146.98`即可。

### 添加对 GitCafe 的感谢 (可选)

如果你也想像我一样，想在博客底部添加对 GitCafe 的感谢，可以参考 [这个提交](https://github.com/tangqiaoboy/tangqiaoboy.github.com/commit/a8ff6914d6fca786baf5702de3da01d408bd7b43)。它通过修改 Octopress 的`source/_includes/custom/footer.html`模版文件完成。

##感谢

最后再次感谢 GitCafe，上个月在 QCon 大会上了解到他们的发展思路和 Github 很不一样。虽然它还是一家创业公司，但是我期待看到它最终能够推动国内开源和技术社区的发展。

