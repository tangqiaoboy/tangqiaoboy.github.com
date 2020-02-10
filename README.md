## 发布状态
![](https://travis-ci.com/tangqiaoboy/tangqiaoboy.github.com.svg?branch=source)

## 日常操作

 * 发布新文章: `hexo new 文件名`
 * 预览: `hexo s`
 * 生成文件到 public 目录: `hexo g`
 * 发布: `hexo d`

## 在新的电脑上部署我的博客项目

首先，去 [Nodejs 官网](https://nodejs.org/en/) 下载安装 node。

``` bash
git clone git@github.com:tangqiaoboy/tangqiaoboy.github.com.git
git checkout source
git submodule init
git submodule update
npm install -g hexo-cli
npm install
```

## 一些 Note

有些时候文章中出现一些奇怪字符会造成发布失败，可以用 detect_code.cpp 来检查。

brew install 安装的 node 有问题，需要自己去 [Nodejs 官网](https://nodejs.org/en/)下载 .pkg 格式的安装包安装。

重新安装的时候，git clone 下来，执行 npm install.

如果要修改 archive 的每页文章条数：
/Users/tangqiao/work/git/hexo/node_modules/hexo-generator-archive/index.js:
/Users/tangqiao/work/git/hexo/node_modules/hexo-generator-category/index.js
/Users/tangqiao/work/git/hexo/node_modules/hexo-generator-tag/index.js

广告位修改文章：
themes/jacman/layout/_widget/sponsor.ejs

## 初使化
```
npm install -g hexo-cli
cd <blog folder>
npm install
```


## 设置发布
```
npm install hexo-deployer-git --save
git clone git@github.com:tangqiaoboy/tangqiaoboy.github.com.git public
```

## 设置皮肤
```
mkdir themes
cd themes
git clone git@github.com:tangqiaoboy/jacman.git
```
