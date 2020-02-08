---
title: 用 Travis 来自动更新博客
date: 2020-02-09 01:43:45
categories:
tags:
---

Travis 是一个自动化集成测试工具，原本的用处主要是在提交代码之后进行自动化的编译和测试。但是其实你不光可以拿它来编译代码，还可以做任何你需要执行代码做的事情，就比如更新博客文章。

如果你的博客像我一样使用 Hexo 生成静态文件，并且发布在 GitHub Pages 上，那么你可以使用 Travis 来自动帮助你发布博客文章，以下是具体操作说明。

## 授权 travis

 * 去 [Travis](https://github.com/marketplace/travis-ci) 授权访问你的 Github。如果你的博客是开源的，那么你可以免费使用 Travis。
 * 去 [Github 的应用管理界面](https://github.com/settings/installations) 设置 Travis 的访问权限。
 * 去 [Github 的 Token 管理界面](https://github.com/settings/tokens)，点击 `Generate new token` 按钮，生成一个 `OAuth Token`，权限可以都勾上。但是要注意，不要把这个 Token 的内容直接放到博客文件中。
 * 去 [Travis](https://travis-ci.com/) 页面，进入到你博客项目的设置里，在 `Environment Variables` 下，增加一个名为 `GITHUB_TOKEN` 的环境变量，值为你刚刚生成的 `OAuth Token` 值。为了方便调试，建议你勾选上 `DISPLAY VALUE IN BUILD LOG`。如下图所示：

 {% img /images/travis-1.png %}


## 修改项目

### 修改依赖为 submodule

将你依赖的主题，以 submodule 的方式添加到项目中，这样 Travis 会在 clone 你的主项目的时候，自动把 submodule 也 clone 下来。注意，因为 Travis 并不拥用你的 SSH 私钥，所以你需要用 https 的方式来下载代码。代码如下：

``` bash
git submodule add -f https://github.com/tangqiaoboy/jacman.git
themes/jacman
```
请将上面的代码稍当修改，把主题换成你使用的主题项目地址。

### 创建 .travis.yml 文件

接着，在项目中创建一个 `.travis.yml` 的文件，内容如下：

``` yml
sudo: false
language: node_js
node_js:
  - 10 # use nodejs v10 LTS
cache: npm
branches:
  only:
    - source # build source branch only
git:
  depth: 1
  submodules: true
env:
  global:
    - GITHUB_TOKEN: "${GITHUB_TOKEN}"
before_install:
  - npm install -g hexo-cli
install:
  - npm install
script:
  - # echo "$GITHUB_TOKEN" # 调试用
  - hexo generate
after_success:
  - git config --global user.name 'Tang Qiao' # 结合自己的情况修改
  - git config --global user.email 'tangqiaoboy@gmail.com'  # 结合自己的情况修改
  - sed -in-place -e "s/git@/https:\/\/${GITHUB_TOKEN}@/" _config.yml  # 结合自己的情况修改
  - sed -in-place -e "s/github.com:tangqiaoboy/github.com\/tangqiaoboy/" _config.yml  # 结合自己的情况修改
  - # cat _config.yml # 调试用
  - hexo deploy

```

上面的文件针对的是我个人的博客，请你对上面的文件进行适当修改，将博客地址替换成你自己的。

### 修改 _config.yml

在 `_config.yml` 中增加 deploy 相关设置：

``` yml
deploy:
  type: git
  message: "Site updated: {{ now('YYYY-MM-DD HH:mm') }}"
  repo: 
    github: git@github.com:tangqiaoboy/tangqiaoboy.github.com.git
  branch: master
```

### 原理

完成了以上设置之后，每次你有 push 文件源文的时候，Travis 就会自动帮你 build 代码，生成博客文件，并且发布到 GitHub Pages 上。

以上这些修改主要起的作用是：通过在 `.travis.yml` 中调用 sed，修改 `_config.yml` 文件中的 repo 地址，将自己之前申请的 `GITHUB_TOKEN` 给替换上去，最后用它完成鉴权，把文章上传到你自己的仓库中。

## 参考链接

 * <https://maologue.com/Auto-deploy-Hexo-with-Travis-CI/>
 * <https://hexo.io/docs/github-pages>
 * <https://gist.github.com/rokibhasansagar/b92dc248a6e88e0d9403e45499002165>
