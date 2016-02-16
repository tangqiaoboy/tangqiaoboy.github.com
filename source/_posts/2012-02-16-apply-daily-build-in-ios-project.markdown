---
layout: post
title: "给iOS工程增加Daily Build"
date: 2012-02-16 19:27
comments: true
categories: iOS
published: true
---

## 前言
Daily Build 是一件非常有意义的事情，也是敏捷开发中关于 “持续集成” 的一个实践。Daily Build 对于开发来说有如下好处：

 * 保证了每次 check in 的代码可用，不会造成整个工程编译失败。
 * 进度跟进。产品经理可以每天看到最新的开发进度，并且试用产品，调整一些细节。很多时候，一个新功能，你真正用了一下才能有体会好或不好，所以 daily build 也给产品经理更多时间来调理他的设计。
 * 需求确认。产品经理可以确认开发的功能细节是他的预期。因为我们的开发比较紧凑，所以都没有传统的需求说明文档，所以 daily build 也给产品经理用于尽早确认开发的功能细节是他的预期，我就遇到一次产品经理发现开发出的一个功能细节和他的预期不一致，但是因为有 daily build，使得我可以尽早做修改，把修改的代价减小了。
 * 测试跟进。如果功能点是独立的话，测试同事完全可以根据 daily build 来进行一些早期的测试。越早的 Bug 反馈可以使得修改 bug 所需的时间越短。

<!--more-->

## 步骤

### xcodebuild 命令
如何做 daily build 呢？其实 Xcode 就提供了命令行 build 的命令，这个命令是 xcodebuild，用 xcodebuild -usage
可以查看到所有的可用参数，如下所示：

``` bash
[tangqiao ~]$xcodebuild -usage
Usage: xcodebuild [-project <projectname>] [[-target <targetname>]...|-alltargets] [-configuration <configurationname>] [-arch <architecture>]... [-sdk [<sdkname>|<sdkpath>]] [<buildsetting>=<value>]... [<buildaction>]...
       xcodebuild [-project <projectname>] -scheme <schemeName> [-configuration <configurationname>] [-arch <architecture>]... [-sdk [<sdkname>|<sdkpath>]] [<buildsetting>=<value>]... [<buildaction>]...
       xcodebuild -workspace <workspacename> -scheme <schemeName> [-configuration <configurationname>] [-arch <architecture>]... [-sdk [<sdkname>|<sdkpath>]] [<buildsetting>=<value>]... [<buildaction>]...
       xcodebuild -version [-sdk [<sdkfullpath>|<sdkname>] [<infoitem>] ]
       xcodebuild -list [[-project <projectname>]|[-workspace <workspacename>]]
       xcodebuild -showsdks

```

一般情况下的命令使用如下:

``` bash
xcodebuild -configuration Release -target "YourProduct"
```

但在 daily build 中，用 Release 用为 configuration 其实不是特别好。因为 Release 的证书可能会被经常修改。我们可以基于 Release 的 Configuation，建一个专门用于 daily build 的 configuration。方法是：在工程详细页面中，选择 Info 一栏，在 Configurations 一栏的下方点击 “+” 号，然后选择 "Duplicate Release Configuration", 新建名为 "DailyBuild" 的 Configuration, 如下图所示：

{% img /images/daily_build_1.png %}

之后就可以用如下命令来做 daily build 了

``` bash
xcodebuild -configuration DailyBuild -target "YourProduct"
```

执行完命令后，会在当前工程下的 build/DailyBuild-iphoneos/ 目录下生成一个名为： YourProduct.app 的文件。这个就是我们 Build 成功之后的程序文件。

### 生成 ipa 文件
接下来我们需要生成 ipa 文件，在生成 ipa 文件这件事情上，xcode 似乎没有提供什么工具，不过这个没什么影响，因为 ipa 文件实际上就是一个 zip 文件，我们使用系统的 zip 命令来生成 ipa 文件即可。需要注意的是，ipa 文件并不是简单地将编辑好的 app 文件打成 zip 文件，它需要将 app 文件放在一个名为 Payload 的文件夹下，然后将整个 Payload 目录打包成为 .ipa 文件，命令如下：

``` bash
cd $BUILD_PATH
mkdir -p ipa/Payload
cp -r ./DailyBuild-iphoneos/$PRODUCT_NAME ./ipa/Payload/
cd ipa
zip -r $FILE_NAME *
```

### 生成安装文件
苹果允许用 itms-services 协议来直接在 iphone/ipad 上安装应用程序，我们可以直接生成该协议需要的相关文件，这样产品经理和测试同学都可以直接在设备上安装新版的应用了。相关的参考资料可以见：[这里](http://blog.encomiabile.it/2010/12/21/ios4-and-wireless-application-deploy/) 和 [这里](http://blog.s135.com/itms-services/)

具体来说，就是需要生成一个带 itms-services 协议的链接的 html 文件，以及一个 plist 文件。

生成 html 的示例代码如下：

``` bash
cat << EOF > install.html
<!DOCTYPE HTML>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title> 安装此软件 </title>
  </head>
  <body>
    <ul>
      <li> 安装此软件:<a href="itms-services://?action=download-manifest&url=http%3A%2F%2Fwww.yourdomain.com%2Fynote.plist">$FILE_NAME</a></li>
    </ul>
    </div>
  </body>
</html>
EOF
```

生成 plist 文件的代码如下，注意，需要将下面的涉及 www.yourdomain.com 的地方换成你线上服务器的地址，将 ProductName 换成你的 app 安装后的名字。

``` bash
cat << EOF > ynote.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
   <key>items</key>
   <array>
       <dict>
           <key>assets</key>
           <array>
               <dict>
                   <key>kind</key>
                   <string>software-package</string>
                   <key>url</key>
                   <string>http://www.yourdomain.com/$FILE_NAME</string>
               </dict>
               <dict>
                   <key>kind</key>
                   <string>display-image</string>
                   <key>needs-shine</key>
                   <true/>
                   <key>url</key>
                   <string>http://www.yourdomain.com/icon.png</string>
               </dict>
           <dict>
                   <key>kind</key>
                   <string>full-size-image</string>
                   <key>needs-shine</key>
                   <true/>
                   <key>url</key>
                   <string>http://www.yourdomain.com/icon.png</string>
               </dict>
           </array><key>metadata</key>
           <dict>
               <key>bundle-identifier</key>
               <string>com.yourdomain.productname</string>
               <key>bundle-version</key>
               <string>1.0.0</string>
               <key>kind</key>
               <string>software</string>
               <key>subtitle</key>
               <string>ProductName</string>
               <key>title</key>
               <string>ProductName</string>
           </dict>
       </dict>
   </array>
</dict>
</plist>


EOF

```

### 定时运行
这一点非常简单，使用 crontab -e 命令即可。大家可以随意 google 一下 crontab 命令，可以找到很多相关文档。假如我们要每周 1-5 的早上 9 点钟执行 daily build，则 crontab 的配置如下：

```
0 9 * * * 1-5 /Users/tangqiao/dailybuild.sh >> /Users/tangqiao/dailybuild.log 2>&1
```

### 失败报警
在 daily build 脚本运行失败时，最好能发报警邮件或者短信，以便能够尽早发现。发邮件可以用 python 的 smtplib 来写，示例如下：

``` python
import smtplib

sender = 'sender@devtang.com'
receivers = ['receiver@devtang.com']

message = """From: Alert <sender@devtang.com>
To: Some one <receiver@devtang.com>
Subject: SMTP email sample

Hope you can get it.
"""

try:
    obj = smtplib.SMTP('server.mail.devtang.com')
    obj.sendmail(sender, receivers, message)
    print 'OK: send mail succeed'
except Exception:
    print 'Error: unable to send mail'

```

### 上传
daily build 编译出来如果需要单独上传到另外一台 web 机器上，可以用 ftp 或者 scp 协议。如果 web 机器悲剧的是 windows 机器的话，可以在 windows 机器上开一个共享，然后用 mount -t smbfs 来将这个共享 mount 到本地，相关的示例代码如下：
``` bash
mkdir upload
mount -t smbfs //$SMB_USERNAME:$SMB_PASSWORD@$SMB_TARGET ./upload
if [ "$?" -ne 0 ]; then
    echo "Failed to mount smb directory"
    exit 1
fi
mkdir ./upload/$FOLDER
cp $FILE_NAME ./upload/$FOLDER/
if [ "$?" -eq 0 ]; then
    echo "[OK] $FILE_NAME is uploaded to $SMB_TARGET" 
else
    echo "[ERROR] $FILE_NAME is FAILED to  uploaded to $SMB_TARGET" 
fi
umount ./upload
```

## 遇到的问题
本来我写的自动化脚本在 Mac OS X 10.6 下运行得很好。但是升级到 lion 后，脚本在手动执行时很正常，但是在用 crontab 启动时就会出现找不到开发者证书的错误。在网上搜了很久也没有找到解决办法。最后我试了一下在 “钥匙串访问” 中把开发者证书从 “登录” 那栏拖动到 “系统” 那栏，居然就解决了，如下图所示：

{% img /images/dailybuild_issue.jpg %}

另外我搜到 2 个类似的问题的解决方案，虽然对我这个没起作用，也一并放在这儿，或许对遇到类似问题的人有帮助：

 * <http://stackoverflow.com/questions/7635143/cannot-build-xcode-project-from-command-line-but-can-from-xcode>
 * <http://shappy1978.iteye.com/blog/765842>


## 总结
将以上各点结合起来，就可以用 bash 写出一个 daily build 脚本了。每天这一切都会自动完成，心情相当好。
