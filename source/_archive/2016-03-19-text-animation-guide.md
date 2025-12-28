---
title: 如何实现自己没实现过的需求之文本动画
date: 2016-03-20 21:34:23
categories: iOS
tags: [投稿, Swift]
---

> 吕伟（[@我在罪恶坑的日子](http://weibo.com/u/1660258615)）iOS 开发者，这些年在上海工作。专业：扯淡，兼职：开发。
> 感谢投稿，[原文链接](http://www.ismash.cn/post/ru-he-shi-xian-zi-ji-mei-shi-xian-guo-de-xu-qiu-zhi-wen-ben-dong-hua-pian)。


大家好，我是非知名程序员，想跟大家说一段传统相声节目，额，对不起，说错了。想跟大家分享一点关于文本和动画的东西。这不是一篇纯血统，高、精、尖的技术文章，但依然希望有人能像喜欢混血美女一样喜欢。

## 前言

记得以前看到过一个很赞的文字效果的动画，类似于这样：

![textanimation](https://cloud.githubusercontent.com/assets/3759810/13845905/1e55a5d0-ec7e-11e5-9631-68aaf6b07ba1.gif)

当时被惊艳到了，最近偶然间又再次见到，依然还是那么喜欢。假设我们现在需要实现这样的需求。一般碰到需求我们都会去 GitHub 上看看，俗称找轮子（GitHub 基本上只有你想不到的，就没有它没有的）。大多数情况下，没有问题。或者说有点小问题：轮子太多，无从下嘴。

## 选择

> 选轮子就像选姑娘，你不知道后面等着你的是什么 -----罪恶坑小程如是说

程序员江湖，每位大侠的武功和套路不尽一样，少林，武当，昆仑各门各派，百花争艳。实现轮子的思路自然也不一样。有的轮子高深晦涩难懂，功能强大，有的清晰明了，功能简单。不过有一点相同是，选错了就会被坑，只是坑大坑小问题。选轮子自然需要无比谨慎，既要匹配需求同时也要能在掉坑里的时候填上（废话，出 bug 了，你不填，谁填），要能 hold 住。然而填坑哪能那么简单呢，首先轮子实现思路，代码的结构，运行时序你要搞清楚吧，提供了哪些功能，没提供哪些功能，你要了解吧。基本上一个复杂点的轮子，研究下来就要好些时间了。这还不包括你开会，沟通，解 bug，喝茶，倒水，上厕所，抽烟，骂娘，吐槽产品需求的时间。所以，妹子们，不要问我们今天加不加班，要问今天能不能在你睡前下班。（项目快上线了，小程不加班谁加班。嗯哼。）

## 创造

> 如果能用代码扮演上帝话，苍老师的量产不是问题，就看产品经理定的需求是拟物还是扁平。----罪恶坑小程如是说

既然选轮子的时间成本也不低，那有时候我们可以自己造一个轮子。其实写一个的好处也多，有成就感，写好了可以吹牛逼，写坏了填坑速度快。但问题是，以前没写过怎么办？没把握怎么办？比如我们现在需要实现上面的文字效果，但是又不知道怎么写，怎么办？

没关系，上帝创造世间也分了七步走，跟着这位带头大哥后面学，总不会错的。

## 开始
 
> 罗马不是一天建成的，毛片不是一次性拍完的 ----罪恶坑小程如是说 

咦，好像扯得有点多了。对不起，现在开始正式拍（苍老师准备下，小程也准备下，Action）：


#### 1. ** 分解任务 **

通过简单观察我们可以马上知道，上面那个动画效果是通过对每个字符做动画完成的。而在 iOS 里，文本显示控件最常见和常用的是 UILabel。而 iOS 的 Explicit Animation 有 Properties Animation 和 keyframe Animation 两种。

但是 UILabel 控件没有提供对其 Text 中每个字符的控制的功能，我们需要改造下。既然要对每个字符做动画，那少不了需要`frame`，`bounds`，`position`，`transform`，这些属性。
这样看来我们需要两个武器：一个做排版功能的 framework，不用说，肯定是 [TextKit](http://objccn.io/issue-5-1/)。而另一个是能显示单个字符也拥有`frame`，`bounds`，`position`，`transform`等属性的类，很自然，我们想到`CATextLayer`。


#### 2. ** 先解决文本布局 ** 

TextKit 里主要是三个类 `NSTextStorage`，`NSLayoutManager`，`NSContainer`。它们一起帮组我们解决文字布局，排版的工作。

  - **NSTextStorage**：`NSMutableAttributedString`的子类，持有文字内容，当字符发生改变时，通知`NSLayoutManager`对象
  
  - **NSLayoutManager**: 我们的男主角，从`NSTextStorage`里获取文字内容后，转换成对应的 glyph，根据`NSTextContainer`的 visible Region 显示 glyph。
  
  - **NSContainer**: 确定一个 region 来放置 text。这个 region 被`NSLayoutManager`用来决定哪里可以 break lines


不过可惜 UILabel 没有这三个类作为自己的属性对象，我们需要自己解决：

```
class TextAnimationLabel: UILabel,NSLayoutManagerDelegate {   
     let textStorage:NSTextStorage = NSTextStorage(string: "")
     let textLayoutManager:NSLayoutManager = NSLayoutManager()
     let textContainer:NSTextContainer = NSTextContainer()
}
```

除此以外我们还需要两个 Array 用来保存文本变换前的旧字符和变换后的新字符:

```
var oldCharacterTextLayers:[CATextLayer] = [] 
var newCharacterTextLayers:[CATextLayer] = []

```

因为我们需要用我们自己的 textStorage 对象，所以我们需要覆盖 text 和 attributedText 等属性。

```
override var text:String!{
    get {
        return super.text
    }
    set {
        super.text = text
        let attributedText = NSMutableAttributedString(string: newValue)
        let textRange = NSMakeRange(0,newValue.characters.count)
        attributedText.setAttributes([NSForegroundColorAttributeName:self.textColor], range: textRange)
        attributedText.setAttributes([NSFontAttributeName:self.font], range: textRange)
        let paragraphyStyle = NSMutableParagraphStyle()
        paragraphyStyle.alignment = self.textAlignment
        attributedText.addAttributes([NSParagraphStyleAttributeName:paragraphyStyle], range: textRange)
        self.attributedText = attributedText
        }
        
 }
    
override var attributedText:NSAttributedString!{
    get {
        return self.textStorage as NSAttributedString
    }
    set{
        cleanOutOldCharacterTextLayers()
        oldCharacterTextLayers = Array(newCharacterTextLayers)
        textStorage.setAttributedString(newValue)
        self.startAnimation { () -> () in
        }
            self.endAnimation(nil)
    }
}
```

当 TextStorage 的文本内容改变时，会触发一个通知 send textLayoutManager 以便重新布局排版。显然我们可以在排版布局完成后来为每个字符创建设置一个 CATextLayer，并设置相应的 frame 以便正确的显示内容。我们可以有个函数来完成计算。并且 layout finish 完成时调用。

```
//Mark:NSLayoutMangerDelegate
func layoutManager(layoutManager: NSLayoutManager, didCompleteLayoutForTextContainer textContainer: NSTextContainer?, atEnd layoutFinishedFlag: Bool) {
        calculateTextLayers()
        print("\(textStorage.string)")
}
    
    
//MARK:CalculateTextLayer
func calculateTextLayers()
{
}
```

接下来我们的主要想法，是找到 text 里每个 character 以及对应的 glyph rect. 然后用 character 和 glyph rect 创建 CATextLayer

首先我们要有一个空数组用来存放新的 CATextLayer。并且获取 textStorage 的 attributedText。

```
func calculateTextLayers()
{
    newCharacterTextLayers.removeAll(keepCapacity:false)
    let attributedText = textStorage.string
}

```
接下来我们要通过 LayoutManger 找到 TextContainer 的 used Rect，这样方便我们可以让文本垂直居中，就像普通的 Label 那样。

```
func calculateTextLayers()
{
    newCharacterTextLayers.removeAll(keepCapacity:false)
    let attributedText = textStorage.string
    let wordRange = NSMakeRange(0, attributedText.characters.count)
    let attributedString = self.internalAttributedText();
    let layoutRect = textLayoutManager.usedRectForTextContainer(textContainer)
    var index = wordRange.location
    let totalLength = NSMaxRange(wordRange)
    while index < totalLength {
         ...
    }
}

```

现在我们开始迭代处理文本里的每个字符，创建一个 glyphRange 并且用这个 glyphRange 找到对应的 character，然后我们将 glyph index 丢给 LayoutManager 得到 textContainer，再用 container 和 glyphRange 取得 glyphRect(这里需要注意下 kerning 的问题)。

```
let glyphRange = NSMakeRange(index, 1)
let characterRange = textLayoutManager.characterRangeForGlyphRange(glyphRange, actualGlyphRange: nil)
let textContainer = textLayoutManager.textContainerForGlyphAtIndex(index, effectiveRange: nil)
var glyphRect = textLayoutManager.boundingRectForGlyphRange(glyphRange, inTextContainer: textContainer!)

```

最终我们还需要注意的就是 glyph 的 kerning，如果 `kerningRange.location == index`，我们需要将前一个 textLayer 取出来调整其 Rect 的宽度至新的 glyphRect 的最右边，保证 glyph 不会被裁切掉（可以对比下面两张图片）

<img width="122" src="https://cloud.githubusercontent.com/assets/3759810/13854816/4a6b5258-eca8-11e5-9870-15ed2d4f0d70.png">

<img width="122" src="https://cloud.githubusercontent.com/assets/3759810/13854821/4c5b947e-eca8-11e5-811e-e9abb161345f.png">

```
let kerningRange = textLayoutManager.rangeOfNominallySpacedGlyphsContainingIndex(index)
if kerningRange.location == index && kerningRange.length > 1 {
    if newCharacterTextLayers.count > 0 {
        // 如果前一个 textlayer 的 frame.size.width 不变大的话，
        // 当前的 textLayer 会遮挡住字体的一部分，比如 “Yes” 的 Y 右上角会被切掉一部分
        let previousLayer = newCharacterTextLayers[newCharacterTextLayers.endIndex - 1]
        var frame = previousLayer.frame
        frame.size.width += CGRectGetMaxX(glyphRect) - CGRectGetMaxX(frame)
        previousLayer.frame = frame
     }
}

```
这里关于 kerning 和 glyph 要多说一点。先来说下 glyph，简单来说 glyph 是表示一个 character 的具体样式 , 但他们却不是一一对应的关系，比如一个字母 "A" 可以有不同的写法来表示例如：

<img width="417" alt="" src="https://cloud.githubusercontent.com/assets/3759810/13878224/e142bef8-ed4a-11e5-9c84-798cb5939f36.png">

除此以外，还有这种情况：

<img width="243" alt="" src="https://cloud.githubusercontent.com/assets/3759810/13878392/fab15e02-ed4b-11e5-9d38-2dc00ed45b0b.png">

上面是的 "ff" 虽然是两个 character，但是 glyph 却是一个。
不过不用担心，强大 LayoutManager 提供了两个方法帮助我们通过一个找到对应另外那个。

```
func characterIndexForGlyphAtIndex(_ glyphIndex: Int) -> Int
func glyphIndexForCharacterAtIndex(_ charIndex: Int) -> Int
```

现在我们说下 kerning。通常，在水平排布的文本中，glyph 都是一个挨着一个放置的，但是在某些时候为了让文本的可读性更好，看上去更加优雅美观，一个字形和另外一个字形之间可能会稍微的错位下，比如下面这种情况：

<img width="601" alt="" src="https://cloud.githubusercontent.com/assets/3759810/13878767/7631a33c-ed4e-11e5-9d03-46d89d8af9c8.png">
这也是上面为什么”Y“会出现显示不全的原因了。

接下来就比较简单了，创建 Textlayer, 设置垂直居中，添加到数组当中，`index += characterRange.length`，开始下次循环

```
glyphRect.origin.y += (self.bounds.size.height/2)-(layoutRect.size.height/2)
let textLayer = CATextLayer(frame: glyphRect, string: attributedString.attributedSubstringFromRange(characterRange));
layer.addSublayer(textLayer);
newCharacterTextLayers.append(textLayer);
index += characterRange.length

```

#### 3. ** 动画实现 **

上面我们解决了字符排版的问题，接下来动画的实现就相对的容易了，仔细观察那个动画，很容易得出主要是对 `opacity` 和 `transform` 两个属性做属性动画，`opacity` 让每个字体逐渐显示和逐渐消失，而 `transform`则做了两种变形，一种是往下移动，另外一种是旋转。用 `CABasicAnimation` 可以解决单个属性动画，而 `CAAnimationGroup` 则帮我们解决多个动画叠加的复合效果。

```
func groupAnimationWithLayerChanges(old olderLayer:CALayer, new newLayer:CALayer) 
     -> CAAnimationGroup? {

    var animationGroup:CAAnimationGroup?
    var animations:[CABasicAnimation] = [CABasicAnimation]()

    if !CATransform3DEqualToTransform(olderLayer.transform,
    newLayer.transform) {
         let basicAnimation = CABasicAnimation(keyPath: "transform")
         basicAnimation.fromValue = NSValue(CATransform3D: olderLayer.transform)
         basicAnimation.toValue = NSValue(CATransform3D: newLayer.transform)
         animations.append(basicAnimation)
         }

    if olderLayer.opacity != newLayer.opacity {
       let basicAnimation = CABasicAnimation(keyPath: "opacity")
       basicAnimation.fromValue = olderLayer.opacity
       basicAnimation.toValue = newLayer.opacity
       animations.append(basicAnimation)
       }

    if animations.count > 0 {
       animationGroup = CAAnimationGroup()
       animationGroup!.animations = animations
   }

}

```

这里需要注意一个问题，就是隐式动画的问题，Core Animation 基于一个假说，就是屏幕上的任何东西都可以 (或者可能) 做动画，我们平时在写代码时应该有这种印象就是你只是 layer 设置了一个值，没有添加动画，但是你会看到一个平滑过渡的显示效果而不是非常突兀的变化。这就是隐式动画。当我们改变一个属性时，Core Animation 帮我们做了一个动画，动画时间取决于当前 NSTransaction 的设置，而动画类型取决于图层行为。

这里有个有趣的东西，多说一点，就是当我们对 UIView 关联的图层做动画而不是一个单独的图层做动画，比如

```
func changeColor()
{
    CATransaction.begin();
    CATransaction.setAnimationDuration(1.0)
    CGFloat red = CGFloat(arc4random() / (CGFloat)INT_MAX);
    CGFloat green = CGFloat(arc4random() / (CGFloat)INT_MAX);
    CGFloat blue = CGFloat(arc4random() / (CGFloat)INT_MAX);
    self.layerView.layer.backgroundColor = UIColor.(colorWithRed:red green:green blue:blue alpha:1.0).CGColor;
    CATransaction.commit();
}

```

图层的颜色瞬间切换到新的值，而不是之前的平滑过渡，隐式动画似乎给关闭了。
我们知道 UIView 和 CALayer 最重要的关系就是 UIView 是 CALayer 的 delegate，
当我们改变 CALayer 的属性时，它会调用 `func actionForKey(_ event: String) -> CAAction?` 

这个方法，接下来发生的事情在官方文档里都有写，实际上是如下几步:

   * *If the layer has a delegate that implements the actionForLayer:forKey: method, the layer calls that method. The delegate must do one of the following:*

        1. Return the action object for the given key.

        2. Return the NSNull object if it does not handle the action.

   * *The layer looks in the layer’s actions dictionary for a matching key/action pair.*
   * *The layer looks in the style dictionary for an actions dictionary for a matching key/action pair.*
   * *The layer calls the defaultActionForKey: class method to look for any class-defined actions.*

UIView 作为它关联图层的 Delegate，实现了 `actionForLayer(_ layer: CALayer, forKey event: String) -> CAAction?` ，当不在一个动画块中，UIView 返回 nil，而在动画块中则返回一个非空值

```
print("OutSide:\(self.view.actionForLayer(self.view.layer, forKey: "backgroundColor"))")
UIView.beginAnimations(nil, context: nil)
print("InSide:\(self.view.actionForLayer(self.view.layer,
forKey: "backgroundColor"))")
UIView.commitAnimations()
```
显示结果如下

```
OutSide:Optional(<null>)
InSide:Optional(<CABasicAnimation: 0x7f7f93ff81b0>)
```

当然返回 nil 并不是禁用隐式动画的唯一方法，下面这样也行

```
CATransaction.setDisableActions(true)
```

那为什么说这个问题呢？因为我们在对每个字符做动画的时候需要先将隐式动画关闭，否者将会做两次动画，比如下面这样:

![closeimplicitanimation](https://cloud.githubusercontent.com/assets/3759810/13857496/2443d70a-ecb5-11e5-8661-a499e9c8719d.gif)


那么，我们先生成一份 oldlayer, 然后改变相应的属性，生产新的 newLayer。然后创建相应的动画组，添加显式动画。

```
let olderLayer = animationObjc.animatableLayerCopy(layer)
CATransaction.begin()
CATransaction.setDisableActions(true)
newLayer = effectAnimationClosure(layer: layer)
CATransaction.commit()
var animationGroup:CAAnimationGroup?
animationGroup = groupAnimationWithLayerChanges(old: olderLayer, new: newLayer!)
layer.addAnimation(textAniamtionGroup, forKey: textAnimationGroupKey)

```

## 收工

好了，当上面所有的工作完成之后，就是我们最开始看到的那个效果，代码已经上传 GitHub，你可以从 [这里](https://github.com/morpheus1984/TextKitAndAnimationEffect.git) 下载。其实这个 demo 里实现的 label 还有很大优化的空间。比如支持多种类型的动画效果，动画效果可配置等等。这是我接下来打算做的事情。
本人才疏学浅，错漏难免，欢迎大家批评指正。如果你发现 bug，可以提个 pull request。如果你有更好地思路也请告诉我，让我进步，我请你喝咖啡 ：）。

这是我的微信号（未完结，请往下看）：

![wechat](https://cloud.githubusercontent.com/assets/3759810/13864468/9fdcae9c-ecdc-11e5-9c49-278b327d1ba7.png)


## 最后

不知不觉工作许多年了，这几年萝莉变成了姑娘，姑娘变成了孩子妈。大家从 QQ 空间杀到朋友圈。从晒女朋友，到晒结婚照继而到晒娃。这几年鸣人同志都不负众望当上了火影 (丫也不请吃饭)。大家都在发生变化。

学会开始写点东西分享可能是我想要的一个变化。

本来作为非知名程序员，平时都是自己上 GitHub 玩，自认为比起一干牛人既没本领可以提振民心士气，又没有独门绝技可以分享。直到我收到了一封来自组织的信。

最近我加入了一个公会，里面云集了各类高手，轻功，内力，暗器，大家各有所长，时不时分享下自己的看家本领。还是那句老话，不看不知道，一看吓一跳。世界还是外面的大，姑娘还是城里的靓。在群里，大家都很积极活跃，学习氛围异常的好。其实自打做起程序员起，这么多年来，虽然生性慵懒，但是自学却未敢放下，毕竟逆水行舟，不进则退。不可否认的是一个人的学习是很苦闷无聊的，但一群人陪着你一起苦闷无聊也是很欣慰的。

最后我想引用那封邮件里面的话来表达下我对公会的看法:
> 这个社群的意义证明了，在互联网时代，依然有这么多人愿意为知识的积累和个人的成长付费，知识本身的价值得到重新的认知，人们以一种去中心化的方式连接起来，P2P 的创作和分享，可能会让知识和技能的积累、传播达到了一种新的高度、深度和广度


我想一贯懒散的我为何突然想写这么个 blog 可能也是因为这个，毕竟知识的受益者永远是那些积极参与学习并持续思考的人。

额，最后想说的是，是的，那段引用的文字你没看错，这是个需要付费的群，免费时代的付费群，它叫 [攻城狮之路](http://mp.weixin.qq.com/s?__biz=MjM5ODQ2MDIyMA==&mid=402078207&idx=1&sn=c0b437784c7fc789e06767eedf5cdf87&scene=18#wechat_redirect)。

知识是很昂贵的，我一直这么认为。另外，其实这是篇硬广。

