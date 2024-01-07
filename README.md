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
brew install hexo
git clone git@github.com:tangqiaoboy/tangqiaoboy.github.com.git
git checkout source
git submodule init
git submodule update
npm install
```

安装插件：

```
npm install hexo-deployer-git --save
npm install hexo-generator-json-content
npm install hexo-generator-feed --save
```

## 一些 Note

有些时候文章中出现一些奇怪字符会造成发布失败，可以用 detect_code.cpp 来检查。

## 初使化
```
npm install -g hexo-cli
cd <blog folder>
npm install
```

## 设置皮肤

皮肤地址在：https://github.com/tangqiaoboy/hexo-theme-archer.git

通过 gitsubmodule 来管理。

