---
layout: post
title: "用脚本来简化iOS美术同学的工作"
date: 2012-08-26 20:34
comments: true
categories: iOS
---

## 问题
我们知道，在 iOS 开发中，为了使我们的 app 能够同时支持 iPhone 的 Retina 屏幕和普通屏幕，美术同学需要对 UI 设计稿中的每个元素进行 2 次切图。苹果要求对图片元素的命名分别为 name.png 和 name@2x.png，带 @2x 的表示是 Retina 屏幕的贴图，不带 @2x 的同名文件为普通屏幕的贴图。

我在开发的时候发现很难要求美术同学按照开发的要求来对图片命名。她们通常对于切图的命名是例如 * 登录按钮大 .png* ，* 登录按钮小 .png*, * 登录按钮按下大 .png* * 登录按钮按下小 .png* 这样的形式。于是，对这些文件按照苹果的要求进行重命名就成了我这个码农的一个体力活。

<!-- more -->

## 解决方案
有什么方法能减少开发和美术的体力活呢？想到因为 name@2x.png 的图片是 name.png 图片的 2 整倍，所以，我们完全可以让美术只切 @2x 的大图，而我们使用脚本来生成小图。于是我写了下面这样的一个脚本，我只需要将所有的大图按照类似 name-1@2x.png , name-2@2x.png 方式命名，然后脚本就会自动帮我生成对应的名为 name-1.png 和 name-2.png 的小图。



``` objc
#! /bin/bash
# File name : convertImage.sh
# Author: Tang Qiao
# 

# print usage
usage() {
    cat << EOF
    Usage:
        convertImage.sh <src directory> <dest directory>
EOF
}

if [ $# -ne 2 ]; then
    usage
    exit 1
fi

SRC_DIR=$1
DEST_DIR=$2

# check src dir
if [ ! -d $SRC_DIR ]; then
    echo "src directory not exist: $SRC_DIR"
    exit 1
fi

# check dest dir
if [ ! -d $DEST_DIR ]; then
    mkdir -p $DEST_DIR
fi

for src_file in $SRC_DIR/*.* ; do
    echo "process file name: $src_file"
    # 获得去掉文件名的纯路径
    src_path=`dirname $src_file`
    # 获得去掉路径的纯文件名
    filename=`basename $src_file`
    # 获得文件名字 (不包括扩展名)
    name=`echo "$filename" | cut -d'.' -f1`
    # remove @2x in filename if there is
    name=`echo "$name" | cut -d"@" -f1`
    # 获得文件扩展名
    extension=`echo "$filename" | cut -d'.' -f2`
    dest_file="$DEST_DIR/${name}.${extension}"

    convert $src_file -resize 50% $dest_file
done
```

脚本使用方法：将以上代码另存为 convertImage.sh，然后用以下方式调用此脚本，即可将源文件夹中所有以 @2x 结尾的图片文件转成一半大小的、去掉 @2x 的小图片。

``` bash
convertImage.sh 源文件夹 目标文件夹 
``` 

使用以上脚本后，美术只用切一半的图了。因为给我的切图少了，所以我可以更加方便地找到对应的切图了。另外，我也减少了一半对切图进行重命名的工作。

## Tips

### imagemagick
如果你运行以上脚本失败，请先用 brew 或 port 安装 imagemagick。imagemagick 是一个相当强大的图象处理库。
``` bash
brew install imagemagick
```

### 检查图片
在使用该脚本一段时间后，我发现美术同学给我的大图的长宽常常不是偶数，这样造成缩小的图就不是原图的整倍数了。为了方便我检查美术给我的图片是否宽高都是偶数，我写了如下检查的脚本，这样就可以检查图片的宽高是否符合要求了。

``` bash                                                                                                                                  
#! /bin/bash
# File name : checkImageSize.sh
# Author: Tang Qiao
# 

usage() {
    cat <<EOF
    Usage:
        checkImageSize.sh <directory>
EOF
}

if [ $# -ne 1 ]; then
    usage
    exit 1
fi

SRC_DIR=$1

# check src dir
if [ ! -d $SRC_DIR ]; then
    echo "src directory not exist: $SRC_DIR"
    exit 1
fi

for src_file in $SRC_DIR/*.png ; do
    echo "process file name: $src_file"
    width=`identify -format "%[fx:w]" $src_file`
    height=`identify -format "%[fx:h]" $src_file`
    # check width
    modValue=`awk -v a=$width 'BEGIN{printf "%d", a % 2}'`
    if [ "$modValue" == "1" ]; then
       echo "[Error], the file $src_file width is $width" 
    fi
    # check height
    modValue=`awk -v a=$height 'BEGIN{printf "%d", a % 2}'`
    if [ "$modValue" == "1" ]; then
       echo "[Error], the file $src_file height is $height" 
    fi
done
```

### 问题
我在使用以上方法时，发现由于 imagemagick 压缩比太高，生成的图片如果象素太小，它就会生成索引图片，而不知道何故，少量索引图片在 iPhone 3GS 上会显示出一条黑线在图片底部。对于这些图片，用 photoshop 将其模式改成 RGB 颜色即可。如下所示：

{% img /images/ui-script-tips.png  %}

用脚本代替体力活是一件很 happy 的事情，因为你可以用省下来的时间多做一些有意思的事情了。

Have fun !

### 后记

在发表完这篇文章后，得到了很多反馈。

其中 [李祎](http://weibo.com/wangyihan01) 同学提到了一个 iOS 独立开发者的解决思路：<http://kevincao.com/2011/08/prepare-png-for-iphone-app/> ，我感觉该博客中提到的方法，或许更加适合美术同学，因为整个操作都是图形化的。所以附在这里，希望对大家有用。

另外，网易杭研院的 [施强](http://weibo.com/myerlang) 同学推荐了一个用于缩图的软件:<http://www.xnconvert.com/> ，据说也能很好的解决以上问题。一并在此推荐给大家作为参考。




