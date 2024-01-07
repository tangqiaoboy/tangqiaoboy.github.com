---
layout: post
title: "去掉Xcode源码末尾的空格"
date: 2011-12-10 17:08
comments: true
categories: iOS
---

在用 Xcode 开发的时候，很容易就在行末增加一些空格了。这些空格在上传到 review board 上后 , 就会被特别的颜色显示出来。因为一种好的编程风格是说 , 不应该在行末增加不必要的空格。如果是用 eclipse 写 java, 那么这种时候选中写好的代码，按 `ctrl+shift+F` 即可调整源码的风格 , 将尾部的空格去掉。可惜在 Xcode 中并没有提供相应的功能。

不过我们可以用命令行来达到这一效果 , 在工程目录下输入:

``` bash
find . -name "*.[hm]" | xargs sed -Ee 's/ +$//g' -i ""
```

这样 , 就可以把源码中行末多出来的空格去掉了 , 是不是很爽 ? 可以把这句加到执行 post-review 的脚本上，这样就可以做到自动去空格了。

顺便说一下，我打算把这些小脚本工具总结出来，放到 github 上，地址是 <https://github.com/tangqiaoboy/xcode_tool>，感兴趣的同学可以把它 clone 下来。

祝玩得开心～

## 2013 年 6 月 22 日更新

上文写于 2011 年末，在 2012 年在 WWDC 大会上，苹果推出了 Xcode4。从 Xcode4 开始，Xcode 会自动去掉源码末尾的空格。所以上面提到的脚本基本没用了。不过对于工程中的 html 或 js 文件，Xcode 的去末尾空格功能并没有打开，所以在某些时候才能有一些小用处。

另外，每次记得敲命令来去掉空格是一件很恶心的事情，最好是由程序自动完成。考虑到现在 git 已经很普及了，在这里介绍另一种在 git 仓库中创建钩子 (hook) 的方法来去掉所有提交文件的末尾空格，具体做法如下：

在工程目录的 `.git/hooks/` 目录下，创建一个名为 `pre-commit` 的文件，输入如下内容

``` bash
#!/bin/sh
if git-rev-parse --verify HEAD >/dev/null 2>&1 ; then
   against=HEAD
else
   # Initial commit: diff against an empty tree object
   against=4b825dc642cb6eb9a060e54bf8d69288fbee4904
fi
# Find files with trailing whitespace
for FILE in `exec git diff-index --check --cached $against -- | sed '/^[+-]/d' | sed -E 's/:[0-9]+:.*//' | uniq` ; do
    # Fix them!
    sed -i '' -E 's/[[:space:]]*$//' "$FILE"
    git add "$FILE"
done

```

然后用 `chmod +x pre-commit` 给该文件加上执行权限。这样，每次在 git 提交文件的时候，该脚本就会被自动执行并且将提交文件末尾的空格去掉。

