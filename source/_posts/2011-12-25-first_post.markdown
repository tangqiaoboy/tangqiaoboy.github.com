---
layout: post
title: "Markdown格式测试"
date: 2011-12-25 14:17
comments: true
categories: [xcode, tool]
published: false
---

大家好。这是一篇测试的文章。
# 一级标题
## 二级标题
###### 六级标题

*斜体*
**粗体**
***粗斜体***

     pre引用文字，原文。


列表一：

 * 1111
 * 22222
   1. 111
   2. 222
 * 33333


列表二：

1. 11111
1. 211222
1. 33333
1. 4444

c代码高亮效果：
``` c
int main() {
    char * s = "hello world";
    printf("%s\n", s);
    return 0;
}
```

objc代码高亮效果：
``` objc
NSString * a = @"abc";
NSLog(@"%@", a);
```

objc的高亮效果:
{% codeblock lang:objc %}
+ (ImageCache *) sharedInstance {
    if (instance == nil) {
        @synchronized(self) {
            if (instance == nil) {
                instance = [[ImageCache alloc] init];
            }
        }
    }
    return instance;
}
{% endcodeblock %}

<!--more-->

objc高亮：
``` objc
+ (ImageCache *) sharedInstance {
    if (instance == nil) {
        @synchronized(self) {
            if (instance == nil) {
                instance = [[ImageCache alloc] init];
            }
        }
    }
    return instance;
}
```

Javascript语法高亮:
{% codeblock lang:javascript %}
function loadURL(url) {
    var iFrame;
    iFrame= document.createElement("iframe");
    iFrame.setAttribute("src", url);
    document.body.appendChild(iFrame); 
    iFrame.parentNode.removeChild(iFrame);
    iFrame = null;
}
{% endcodeblock %}

gist 语法高亮：
{% gist 1519172 %}


图片测试：
{% img /images/mm.png %}

引用测试：
{% blockquote %}
这是一段引用的文字。
第二行。
{% endblockquote %}

链接：
<http://blog.devtang.com>

[我的网站](http://blog.devtang.com)



