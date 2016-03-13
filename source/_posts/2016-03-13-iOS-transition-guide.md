---
title: iOS 视图控制器转场详解
date: 2016-03-13 16:15:47
categories: iOS
tags: 投稿
---

> 作者：[seedante](http://weibo.com/u/1815689155)，神秘人士，他的 [GitHub](https://github.com/seedante)。
> 感谢投稿，[原文链接](https://github.com/seedante/iOS-Note/wiki/ViewController-Transition)。

## 前言

屏幕左边缘右滑返回，TabBar 滑动切换，你是否喜欢并十分依赖这两个操作，甚至觉得 App 不支持这类操作的话简直反人类？这两个操作在大屏时代极大提升了操作效率，其背后的技术便是今天的主题：视图控制器转换(View Controller Transition)。

视图控制器中的视图显示在屏幕上有两种方式：最主要的方式是内嵌在容器控制器中，比如 UINavigationController，UITabBarController, UISplitController；由另外一个视图控制器显示它，这种方式通常被称为模态(Modal)显示。View Controller Transition 是什么？在 NavigationController 里 push 或 pop 一个 View Controller，在 TabBarController 中切换到其他 View Controller，以 Modal 方式显示另外一个 View Controller，这些都是 View Controller Transition。在 storyboard 里，每个 View Controller 是一个 Scene，View Controller Transition 便是从一个 Scene 转换到另外一个 Scene；为方便，以下对 View Controller Transition 的中文称呼采用 Objccn.io 中的翻译「转场」。

在 iOS 7 之前，我们只能使用系统提供的转场效果，大部分时候够用，但仅仅是够用而已，总归会有各种不如意的小地方，但我们却无力改变；iOS 7 开放了相关 API 允许我们对转场效果进行全面定制，这太棒了，自定义转场动画以及对交互手段的支持带来了无限可能。

本文并非华丽的转场动画教程，相反，文中的转场动画效果都十分简单，但本文的内容并不简单，我将带你探索转场背后的机制，缺陷以及实现过程中的技巧与陷阱。阅读本文需要读者至少要对 ViewController 和 View 的结构以及协议有基本的了解，最好自己亲手实现过一两种转场动画。如果你对此感觉没有信心，推荐观看官方文档：[View Controller Programming Guide for iOS](https://developer.apple.com/library/ios/featuredarticles/ViewControllerPGforiPhoneOS/index.html#//apple_ref/doc/uid/TP40007457-CH2-SW1)，学习此文档将会让你更容易理解本文的内容。对你想学习的小节，我希望你自己亲手写下这些代码，一步步地看着效果是如何实现的，至少对我而言，看各种相关资料时只有字面意义上的理解，正是一步步的试验才能让我理解每一个步骤。本文涉及的内容较多，为了避免篇幅过长，我只给出关键代码而不是从新建工程开始教你每一个步骤。本文基于 Xcode 7 以及 Swift 2，Demo 合集地址：[iOS-ViewController-Transition-Demo](https://github.com/seedante/iOS-ViewController-Transition-Demo.git)。

<h2 id="Chapter1">Transition 解释</h2>

前言里从行为上解释了转场，那在转场时发生了什么？下图是从 WWDC 2013 Session 218 整理的，解释了转场时视图控制器和其对应的视图在结构上的变化：

![The Anatomy of Transition](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/The%20Anatomy%20of%20Transition.png?raw=true)

转场过程中，作为容器的父 VC 维护着多个子 VC，但在视图结构上，只保留一个子 VC 的视图，所以转场的本质是下一场景(子 VC)的视图替换当前场景(子 VC)的视图以及相应的控制器(子 VC)的替换，表现为当前视图消失和下一视图出现，基于此进行动画，动画的方式非常多，所以限制最终呈现的效果就只有你的想象力了。图中的 Parent VC 可替换为 UIViewController, UITabbarController 或 UINavigationController 中的任何一种。

目前为止，官方支持以下几种方式的自定义转场：

1. 在 UINavigationController 中 push 和 pop;
2. 在 UITabBarController 中切换 Tab;
3. Modal 转场：presentation 和 dismissal，俗称视图控制器的模态显示和消失，仅限于`modalPresentationStyle`属性为 UIModalPresentationFullScreen 或 UIModalPresentationCustom 这两种模式;
4. UICollectionViewController 的布局转场：UICollectionViewController 与 UINavigationController 结合的转场方式，实现很简单。

官方的支持包含了 iOS 中的大部分转场方式，还有一种自定义容器中的转场并没有得到系统的直接支持，不过借助协议这种灵活的方式，我们依然能够实现对自定义容器控制器转场的定制，在压轴环节我们将实现这一点。

iOS 7 以协议的方式开放了自定义转场的 API，协议的好处是不再拘泥于具体的某个类，只要是遵守该协议的对象都能参与转场，非常灵活。转场协议由5种协议组成，在实际中只需要我们提供其中的两个或三个便能实现绝大部分的转场动画：

1.**转场代理(Transition Delegate)：**

自定义转场的第一步便是提供转场代理，告诉系统使用我们提供的代理而不是系统的默认代理来执行转场。有如下三种转场代理，对应上面三种类型的转场：

    <UINavigationControllerDelegate> //UINavigationController 的 delegate 属性遵守该协议。
    <UITabBarControllerDelegate> //UITabBarController 的 delegate 属性遵守该协议。
    <UIViewControllerTransitioningDelegate> //UIViewController 的 transitioningDelegate 属性遵守该协议。
    
这里除了[`<UIViewControllerTransitioningDelegate>`](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIViewControllerTransitioningDelegate_protocol/index.html#//apple_ref/doc/uid/TP40013060)是 iOS 7 新增的协议，其他两种在 iOS 2 里就存在了，在 iOS 7 时扩充了这两种协议来支持自定义转场。

转场发生时，UIKit 将要求转场代理将提供转场动画的核心构件：动画控制器和交互控制器(可选的)；由我们实现。

2.**动画控制器(Animation Controller)：**

最重要的部分，负责添加视图以及执行动画；遵守[`<UIViewControllerAnimatedTransitioning>`](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIViewControllerAnimatedTransitioning_Protocol/index.html#//apple_ref/doc/uid/TP40013387)协议；由我们实现。

3.**交互控制器(Interaction Controller)：**

通过交互手段，通常是手势来驱动动画控制器实现的动画，使得用户能够控制整个过程；遵守[`<UIViewControllerInteractiveTransitioning>`](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIViewControllerInteractiveTransitioning_protocol/index.html#//apple_ref/doc/uid/TP40013059)协议；系统已经打包好现成的类供我们使用。

4.**转场环境(Transition Context):**

提供转场中需要的数据；遵守[`<UIViewControllerContextTransitioning>`](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIViewControllerContextTransitioning_protocol/index.html#//apple_ref/doc/uid/TP40013057)协议；由 UIKit 在转场开始前生成并提供给我们提交的动画控制器和交互控制器使用。

5.**转场协调器(Transition Coordinator)：**

可在转场动画发生的同时并行执行其他的动画，其作用与其说协调不如说辅助，主要在 Modal 转场和交互转场取消时使用，其他时候很少用到；遵守[`<UIViewControllerTransitionCoordinator>`](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIViewControllerTransitionCoordinator_Protocol/index.html#//apple_ref/doc/uid/TP40013295)协议；由 UIKit 在转场时生成，UIViewController 在 iOS 7 中新增了方法`transitionCoordinator()`返回一个遵守该协议的对象，且该方法只在该控制器处于转场过程中才返回一个此类对象，不参与转场时返回 nil。

总结下，5个协议只需要我们操心3个；实现一个最低限度可用的转场动画，我们只需要提供上面五个组件里的两个：转场代理和动画控制器即可，还有一个转场环境是必需的，不过这由系统提供；当进一步实现交互转场时，还需要我们提供交互控制器，也有现成的类供我们使用。

<h2 id="Chapter2">阶段一：非交互转场</h2>

这个阶段要做两件事，提供转场代理并由代理提供动画控制器。在转场代理协议里动画控制器和交互控制器都是可选实现的，没有实现或者返回 nil 的话则使用默认的转场效果。动画控制器是表现转场效果的核心部分，代理部分非常简单，我们先搞定动画控制器吧。


<h3 id="Chapter2.1">动画控制器协议</h3>

动画控制器负责添加视图以及执行动画，遵守`UIViewControllerAnimatedTransitioning`协议，该协议要求实现以下方法：

    //执行动画的地方，最核心的方法。
    (Required)func animateTransition(_ transitionContext: UIViewControllerContextTransitioning)
    //返回动画时间，"return 0.5" 已足够，非常简单，出于篇幅考虑不贴出这个方法的代码实现。
    (Required)func transitionDuration(_ transitionContext: UIViewControllerContextTransitioning?) -> NSTimeInterval
    //如果实现了，会在转场动画结束后调用，可以执行一些收尾工作。
    (Optional)func animationEnded(_ transitionCompleted: Bool)
    
最重要的是第一个方法，该方法接受一个遵守`<UIViewControllerContextTransitioning>`协议的转场环境对象，上一节的 API 解释里提到这个协议，它提供了转场所需要的重要数据：参与转场的视图控制器和转场过程的状态信息。

UIKit 在转场开始前生成遵守转场环境协议`<UIViewControllerContextTransitioning>`的对象 transitionContext，它有以下几个方法来提供动画控制器需要的信息：
    
    //返回容器视图，转场动画发生的地方。
    func containerView() -> UIView?
    //获取参与转场的视图控制器，有 UITransitionContextFromViewControllerKey 和 UITransitionContextToViewControllerKey 两个 Key。 
    func viewControllerForKey(_ key: String) -> UIViewController?
    //iOS 8新增 API 用于方便获取参与参与转场的视图，有 UITransitionContextFromViewKey 和 UITransitionContextToViewKey 两个 Key。
    func viewForKey(_ key: String) -> UIView? AVAILABLE_IOS(8_0)
    
通过`viewForKey:`获取的视图是`viewControllerForKey:`返回的控制器的根视图，或者 nil。`viewForKey:`方法返回 nil 只有一种情况： UIModalPresentationCustom 模式下的 Modal 转场 ，通过此方法获取 presentingView 时得到的将是 nil，在后面的 Modal 转场里会详细解释。

前面提到转场的本质是下一个场景的视图替换当前场景的视图，从当前场景过渡下一个场景。下面称即将消失的场景的视图为 fromView，对应的视图控制器为 fromVC，即将出现的视图为 toView，对应的视图控制器称之为 toVC。几种转场方式的转场操作都是可逆的，一种操作里的 fromView 和 toView 在逆向操作里的角色互换成对方，fromVC 和 toVC 也是如此。**在动画控制器里，参与转场的视图只有 fromView 和 toView 之分，与转场方式无关。转场动画的最终效果只限制于你的想象力。**这也是动画控制器在封装后可以被第三方使用的重要原因。

在 iOS 8 中可通过以下方法来获取参与转场的三个重要视图，在 iOS 7 中则需要通过对应的视图控制器来获取，为避免 API 差异导致代码过长，示例代码中直接使用下面的视图变量：

    let containerView = transitionContext.containerView()
    let fromView = transitionContext.viewForKey(UITransitionContextFromViewKey)
    let toView = transitionContext.viewForKey(UITransitionContextToViewKey)
    
<h3 id="Chapter2.2">动画控制器实现</h3>

转场 API 是协议的好处是不限制具体的类，只要对象实现该协议便能参与转场过程，这也带来另外一个好处：封装便于复用，尽管三大转场代理协议的方法不尽相同，但它们返回的动画控制器遵守的是同一个协议，因此可以将动画控制器封装作为第三方动画控制器在其他控制器的转场过程中使用。

三种转场方式都有一对可逆的转场操作，你可以为了每一种操作实现单独的动画控制器，也可以实现通用的动画控制器。处于篇幅的考虑，本文示范一个比较简单的 Slide 动画控制器：Slide left and right，而且该动画控制器在三种转场方式中是通用的，不必修改就可以直接在工程中使用。效果示意图：

![SlideAnimation](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/SlideAnimation.gif?raw=true)

在交互式转场章节里我们将在这个基础上实现文章开头提到的两种效果：NavigationController 右滑返回 和 TabBarController 滑动切换。尽管对动画控制器来说，转场方式并不重要，可以对 fromView 和 toView 进行任何动画，但上面的动画和 Modal 转场风格上有点不配，主要动画的方向不对，不过我在这个 Slide 动画控制器里为 Modal 转场适配了和系统的风格类似的竖直移动动画效果；另外 Modal 转场并没有比较合乎操作直觉的交互手段，而且和前面两种容器控制器的转场在机制上有些不同，所以我将为 Modal 转场示范另外一个动画。

在转场中操作是可逆的，返回操作时的动画应该也是逆向的。对此，Slide 动画控制器需要针对转场的操作类型对动画的方向进行调整。Swift 中 enum 的关联值可以视作有限数据类型的集合体，在这种场景下极其合适。设定转场类型：

    enum SDETransitionType{
        //UINavigationControllerOperation 是枚举类型，有 None, Push, Pop 三种值。
        case NavigationTransition(UINavigationControllerOperation) 
        case TabTransition(TabOperationDirection)
        case ModalTransition(ModalOperation)
    }
    
    enum TabOperationDirection{
        case Left, Right
    }
    
    enum ModalOperation{
        case Presentation, Dismissal
    }
使用示例：在 TabBarController 中切换到左边的页面。

    let transitionType = SDETransitionType.TabTransition(.Left)

Slide 动画控制器的核心代码：

    class SlideAnimationController: NSObject, UIViewControllerAnimatedTransitioning {
        init(type: SDETransitionType) {...}
        
        func animateTransition(transitionContext: UIViewControllerContextTransitioning) {
            ...
             //1
            containerView.addSubview(toView)
            
            //计算位移 transform，NavigationVC 和 TabBarVC 在水平方向进行动画，Modal 转场在竖直方向进行动画。
            var toViewTransform = ...
            var fromViewTransform = ...
            toView.transform = toViewTransform
            
            //根据协议中的方法获取动画的时间。
            let duration = self.transitionDuration(transitionContext)
            UIView.animateWithDuration(duration, animations: {
                fromView.transform = fromViewTransform
                toView.transform = CGAffineTransformIdentity
                }, completion: { _ in
                    //考虑到转场中途可能取消的情况，转场结束后，恢复视图状态。
                    fromView.transform = CGAffineTransformIdentity
                    toView.transform = CGAffineTransformIdentity
                    //2
                    let isCancelled = transitionContext.transitionWasCancelled()
                    transitionContext.completeTransition(!isCancelled)
            })
        }
    }

   
注意上面的代码有2处标记，是动画控制器必须完成的：

1. 将 toView 添加到容器视图中，使得 toView 在屏幕上显示( Modal 转场中此点稍有不同，下一节细述)；
2. 正确地结束转场过程。转场的结果有两种：完成或取消。非交互转场的结果只有完成一种情况，不过交互式转场需要考虑取消的情况。如何结束取决于转场的进度，通过`transitionWasCancelled()`方法来获取转场的状态，使用`completeTransition:`来完成或取消转场。

实际上，这里示范的简单的转场动画和那些很复杂的转场动画在转场的部分要做的事情都是上面提到的这两点，它们的区别主要在于动画的部分。

转场结束后，fromView 会从视图结构中移除，UIKit 自动替我们做了这事，你也可以手动处理提前将 fromView 移除，这完全取决于你。`UIView`的类方法`transitionFromView:toView:duration:options:completion:`也能做同样的事，使用下面的代码替换上面的代码，甚至不需要获取 containerView 以及手动添加 toView 就能实现一个类似的转场动画：

    UIView.transitionFromView(fromView, toView: toView, duration: durantion, options: .TransitionCurlDown, completion: { _ in
        let isCancelled = transitionContext.transitionWasCancelled()
        transitionContext.completeTransition(!isCancelled)
    })
    
<h3 id="Chapter2.3">特殊的 Modal 转场</h3>

<h4 id="Chapter2.3.1">Modal 转场的差异</h4>

Modal 转场中需要做的事情和两种容器 VC 的转场一样，但在细节上有些差异。

![ContainerVC VS Modal](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/ContainerVC%20VS%20Modal.png?raw=true)

UINavigationController 和 UITabBarController 这两个容器 VC 的根视图在屏幕上是不可见的(或者说是透明的)，可见的只是内嵌在这两者中的子 VC 中的视图，转场是从子 VC 的视图转换到另外一个子 VC 的视图，其根视图并未参与转场；而 Modal 转场，以 presentation 为例，是从 presentingView 转换到 presentedView，根视图 presentingView 也就是 fromView 参与了转场。而且 NavigationController 和 TabBarController 转场中的 containerView 也并非这两者的根视图。

Modal 转场与两种容器 VC 的转场的另外一个不同是：Modal 转场结束后 presentingView 可能依然可见，UIModalPresentationPageSheet 模式就是这样。这种不同导致了 Modal 转场和容器 VC 的转场对 fromView 的处理差异：容器 VC 的转场结束后 fromView 会被主动移出视图结构，这是可预见的结果，我们也可以在转场结束前手动移除；而 Modal 转场中，presentation 结束后 presentingView(fromView) 并未主动被从视图结构中移除。准确来说，是 UIModalPresentationCustom 这种模式下的 Modal 转场结束时 fromView 并未从视图结构中移除；UIModalPresentationFullScreen 模式的 Modal 转场结束后 fromView 依然主动被从视图结构中移除了。这种差异导致在处理 dismissal 转场的时候很容易出现问题，没有意识到这个不同点的话出错时就会毫无头绪。下面来看看 dismissal 转场时的场景。

ContainerView 在转场期间作为 fromView 和 toView 的父视图。三种转场过程中的 containerView 是 UIView 的私有子类，不过我们并不需要关心 containerView 具体是什么。在 dismissal 转场中：

1. UIModalPresentationFullScreen 模式：presentation 后，presentingView 被主动移出视图结构，在 dismissal 中 presentingView 是 toView 的角色，其将会重新加入 containerView 中，实际上，我们不主动将其加入，UIKit 也会这么做，前面的两种容器控制器的转场里不是这样处理的，不过这个差异基本没什么影响。
2. UIModalPresentationCustom 模式：转场时 containerView 并不担任 presentingView 的父视图，后者由 UIKit 另行管理。在 presentation 后，fromView(presentingView) 未被移出视图结构，在 dismissal 中，注意不要像其他转场中那样将 toView(presentingView) 加入 containerView 中，否则本来可见的 presentingView 将会被移除出自身所处的视图结构消失不见。如果你在使用 Custom 模式时没有注意到这点，就很容易掉进这个陷阱而很难察觉问题所在，这个问题曾困扰了我一天。

对于 Custom 模式，我们可以参照其他转场里的处理规则来打理：presentation 转场结束后主动将 fromView(presentingView) 移出它的视图结构，并用一个变量来维护 presentingView 的父视图，以便在 dismissal 转场中恢复；在 dismissal 转场中，presentingView 的角色由原来的 fromView 切换成了 toView，我们再将其重新恢复它原来的视图结构中。测试表明这样做是可行的。但是这样一来，在实现上，需要在转场代理中维护一个动画控制器并且这个动画控制器要维护 presentingView 的父视图，第三方的动画控制器必须为此改造。显然，这样的代价是无法接受的。

**小结**：经过上面的尝试，建议是，不要干涉官方对 Modal 转场的处理，我们去适应它。在 Custom 模式下，由于 presentingView 不受 containerView 管理，在 dismissal 转场中不要像其他的转场那样将 toView(presentingView) 加入 containerView，否则 presentingView 将消失不见，而应用则也很可能假死；而在 presentation 转场中，切记不要手动将 fromView(presentingView) 移出其父视图。

iOS 8 为`<UIViewControllerContextTransitioning>`协议添加了`viewForKey:`方法以方便获取 fromView 和 toView，但是在 Modal 转场里要注意，从上面可以知道，Custom 模式下，presentingView 并不受 containerView 管理，这时通过`viewForKey:`方法来获取 presentingView 得到的是 nil，必须通过`viewControllerForKey:`得到 presentingVC 后来获取。因此在 Modal 转场中，较稳妥的方法是从 fromVC 和 toVC 中获取 fromView 和 toView。

顺带一提，前面提到的`UIView`的类方法`transitionFromView:toView:duration:options:completion:`能在 Custom 模式下工作，却与 FullScreen 模式有点不兼容。

<h4 id="Chapter2.3.2">Modal 转场实践</h4>

UIKit 已经为 Modal 转场实现了多种效果，当 UIViewController 的`modalPresentationStyle`属性为`.Custom` 或`.FullScreen`时，我们就有机会定制转场效果，此时`modalTransitionStyle`指定的转场动画将会被忽略。

Modal 转场开放自定义功能后最令人感兴趣的是定制 presentedView 的尺寸，下面来我们来实现一个带暗色调背景的小窗口效果。Demo 地址：[CustomModalTransition](https://github.com/seedante/iOS-ViewController-Transition-Demo/tree/master/CustomModalTransition)。

![ModalTransition](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/ModalTransition.gif?raw=true)

由于需要保持 presentingView 可见，这里的 Modal 转场应该采用 UIModalPresentationCustom 模式，此时 presentedVC 的`modalPresentationStyle`属性值应设置为`.Custom`。而且与容器 VC 的转场的代理由容器 VC 自身的代理提供不同，Modal 转场的代理由 presentedVC 提供。动画控制器的核心代码：

    class OverlayAnimationController: NSobject, UIViewControllerAnimatedTransitioning{
        ... 
        func animateTransition(transitionContext: UIViewControllerContextTransitioning) {            
            ...
            //不像容器 VC 转场里需要额外的变量来标记操作类型，UIViewController 自身就有方法跟踪 Modal 状态。
            //处理 Presentation 转场：
            if toVC.isBeingPresented(){
                //1
                containerView.addSubview(toView)
                //在 presentedView 后面添加暗背景视图 dimmingView，注意两者在 containerView 中的位置。
                let dimmingView = UIView()
                containerView.insertSubview(dimmingView, belowSubview: toView)

                //设置 presentedView 和 暗背景视图 dimmingView 的初始位置和尺寸。
                let toViewWidth = containerView.frame.width * 2 / 3
                let toViewHeight = containerView.frame.height * 2 / 3
                toView.center = containerView.center
                toView.bounds = CGRect(x: 0, y: 0, width: 1, height: toViewHeight)
                
                dimmingView.backgroundColor = UIColor(white: 0.0, alpha: 0.5)
                dimmingView.center = containerView.center
                dimmingView.bounds = CGRect(x: 0, y: 0, width: toViewWidth, height: toViewHeight)
                
                //实现出现时的尺寸变化的动画：
                UIView.animateWithDuration(duration, delay: 0, options: .CurveEaseInOut, animations: {
                    toView.bounds = CGRect(x: 0, y: 0, width: toViewWidth, height: toViewHeight)
                    dimmingView.bounds = containerView.bounds
                    }, completion: {_ in
                        //2
                        let isCancelled = transitionContext.transitionWasCancelled()
                        transitionContext.completeTransition(!isCancelled)
                })
            }
            //处理 Dismissal 转场，按照上一小节的结论，.Custom 模式下不要将 toView 添加到 containerView，省去了上面标记1处的操作。
            if fromVC.isBeingDismissed(){
                let fromViewHeight = fromView.frame.height
                UIView.animateWithDuration(duration, animations: {
                    fromView.bounds = CGRect(x: 0, y: 0, width: 1, height: fromViewHeight)
                    }, completion: { _ in
                        //2
                        let isCancelled = transitionContext.transitionWasCancelled()
                        transitionContext.completeTransition(!isCancelled)
                })
            }
        }
    }
 

<h4 id="Chapter2.3.3">iOS 8的改进：UIPresentationController</h4>

iOS 8 针对分辨率日益分裂的 iOS 设备带来了新的适应性布局方案，以往有些专为在 iPad 上设计的控制器也能在 iPhone 上使用了，一个大变化是在视图控制器的(模态)显示过程，包括转场过程，引入了`UIPresentationController`类，该类接管了 UIViewController 的显示过程，为其提供转场和视图管理支持。当 UIViewController 的` modalPresentationStyle`属性为`.Custom`时(不支持`.FullScreen`)，我们有机会通过控制器的转场代理提供`UIPresentationController`的子类对 Modal 转场进行进一步的定制。官方对该类参与转场的流程和使用方法有非常详细的说明：[Creating Custom Presentations](https://developer.apple.com/library/ios/featuredarticles/ViewControllerPGforiPhoneOS/DefiningCustomPresentations.html#//apple_ref/doc/uid/TP40007457-CH25-SW1)。

`UIPresentationController`类主要给 Modal 转场带来了以下几点变化：

1. 定制 presentedView 的外观：设定 presentedView 的尺寸以及在 containerView 中添加自定义视图并为这些视图添加动画；
2. 可以选择是否移除 presentingView；
3. 可以在不需要动画控制器的情况下单独工作；
4. iOS 8 中的适应性布局。

以上变化中第1点 iOS 7 中也能做到，3和4是 iOS 8 带来的新特性，只有第2点才真正解决了 iOS 7 中的痛点。在 iOS 7 中定制外观时，动画控制器需要负责管理额外添加的的视图，`UIPresentationController`类将该功能剥离了出来独立负责，其提供了如下的方法参与转场，对转场过程实现了更加细致的控制，从命名便可以看出与动画控制器里的`animateTransition:`的关系：

    func presentationTransitionWillBegin()
    func presentationTransitionDidEnd(_ completed: Bool)
    func dismissalTransitionWillBegin()
    func dismissalTransitionDidEnd(_ completed: Bool)

除了 presentingView，`UIPresentationController`类拥有转场过程中剩下的角色：

    //指定初始化方法。
    init(presentedViewController presentedViewController: UIViewController, presentingViewController presentingViewController: UIViewController)
    var presentingViewController: UIViewController { get }
    var presentedViewController: UIViewController { get }
    var containerView: UIView? { get }
    //提供给动画控制器使用的视图，默认返回 presentedVC.view，通过重写该方法返回其他视图，但一定要是 presentedVC.view 的上层视图。
    func presentedView() -> UIView?     
    
没有 presentingView 是因为 Custom 模式下 presentingView 不受 containerView 管理，`UIPresentationController`类并没有改变这一点。iOS 8 扩充了转场环境协议，可以通过`viewForKey:`方便获取转场的视图，而该方法在 Modal 转场中获取的是`presentedView()`返回的视图。因此我们可以在子类中将 presentedView 包装在其他视图后重写该方法返回包装后的视图当做 presentedView 在动画控制器中使用。

接下来，我用`UIPresentationController`子类实现上一节「Modal 转场实践」里的效果，presentingView 和 presentedView 的动画由动画控制器负责，剩下的事情可以交给我们实现的子类来完成。

参与角色都准备好了，但有个问题，无法直接访问动画控制器，不知道转场的持续时间，怎么与转场过程同步？这时候前面提到的用处甚少的转场协调器(Transition Coordinator)将在这里派上用场。该对象可通过 UIViewController 的`transitionCoordinator()`方法获取，这是 iOS 7 为自定义转场新增的 API，该方法只在控制器处于转场过程中才返回一个与当前转场有关的有效对象，其他时候返回 nil。

转场协调器遵守`<UIViewControllerTransitionCoordinator>`协议，它含有以下几个方法：

    //与动画控制器中的转场动画同步，执行其他动画
    animateAlongsideTransition:completion:
    //与动画控制器中的转场动画同步，在指定的视图内执行动画
    animateAlongsideTransitionInView:animation:completion:
由于转场协调器的这种特性，动画的同步问题解决了。

    class OverlayPresentationController: UIPresentationController {
        let dimmingView = UIView()
        
        //Presentation 转场开始前该方法被调用。
        override func presentationTransitionWillBegin() {
            self.containerView?.addSubview(dimmingView)
            
            let initialWidth = containerView!.frame.width*2/3, initialHeight = containerView!.frame.height*2/3
            self.dimmingView.backgroundColor = UIColor(white: 0.0, alpha: 0.5)
            self.dimmingView.center = containerView!.center
            self.dimmingView.bounds = CGRect(x: 0, y: 0, width: initialWidth , height: initialHeight)
            //使用 transitionCoordinator 与转场动画并行执行 dimmingView 的动画。
            presentedViewController.transitionCoordinator()?.animateAlongsideTransition({ _ in
                self.dimmingView.bounds = self.containerView!.bounds
            }, completion: nil)
        }
        //Dismissal 转场开始前该方法被调用。添加了 dimmingView 消失的动画，在上一节中并没有添加这个动画，
        //实际上由于 presentedView 的形变动画，这个动画根本不会被注意到，此处只为示范。
        override func dismissalTransitionWillBegin() {
            presentedViewController.transitionCoordinator()?.animateAlongsideTransition({ _ in
                self.dimmingView.alpha = 0.0
                }, completion: nil)
        }    
    }
`OverlayPresentationController`类接手了 dimmingView 的工作后，需要回到上一节`OverlayAnimationController`里把涉及 dimmingView 的部分删除，然后在 presentedVC 的转场代理属性`transitioningDelegate`中提供该类实例就可以实现和上一节同样的效果。

    func presentationControllerForPresentedViewController(_ presented: UIViewController, 
                                  presentingViewController presenting: UIViewController, 
                                          sourceViewController source: UIViewController) -> UIPresentationController?{
        return OverlayPresentationController(presentedViewController: presented, presentingViewController: presenting)
    }

在 iOS 7 中，Custom 模式的 Modal 转场里，presentingView 不会被移除，如果我们要移除它并妥善恢复会破坏动画控制器的独立性使得第三方动画控制器无法直接使用；在 iOS 8 中，`UIPresentationController`解决了这点，给予了我们选择的权力，通过重写下面的方法来决定 presentingView 是否在 presentation 转场结束后被移除：
    
    func shouldRemovePresentersView() -> Bool

返回 true 时，presentation 结束后 presentingView 被移除，在 dimissal 结束后 UIKit 会自动将 presentingView 恢复到原来的视图结构中。通过`UIPresentationController`的参与，Custom 模式完全实现了 FullScreen 模式下的全部特性。

你可能会疑惑，除了解决了 iOS 7中无法干涉 presentingView 这个痛点外，还有什么理由值得我们使用`UIPresentationController`类？除了能与动画控制器配合，`UIPresentationController`类也能脱离动画控制器独立工作，在转场代理里我们仅仅提供后者也能对 presentedView 的外观进行定制，缺点是无法控制 presentedView 的转场动画，因为这是动画控制器的职责，这种情况下，presentedView 的转场动画采用的是默认的动画效果，转场协调器实现的动画则是采用默认的动画时间。

iOS 8 带来了适应性布局，[`<UIContentContainer>`](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIContentContainer_Ref/index.html#//apple_ref/doc/uid/TP40014526)协议用于响应视图尺寸变化和屏幕旋转事件，之前用于处理屏幕旋转的方法都被废弃了。UIViewController 和 UIPresentationController 类都遵守该协议，在 Modal 转场中如果提供了后者，则由后者负责前者的尺寸变化和屏幕旋转，最终的布局机会也在后者里。在`OverlayPresentationController`中重写以下方法来调整视图布局以及应对屏幕旋转：
   
    override func containerViewWillLayoutSubviews() {
        self.dimmingView.center = self.containerView!.center
        self.dimmingView.bounds = self.containerView!.bounds
        
        let width = self.containerView!.frame.width * 2 / 3, height = self.containerView!.frame.height * 2 / 3
        self.presentedView()?.center = self.containerView!.center
        self.presentedView()?.bounds = CGRect(x: 0, y: 0, width: width, height: height)
    }


<h3 id="Chapter2.4">转场代理</h3>

完成动画控制器后，只需要在转场前设置好转场代理便能实现动画控制器中提供的效果。转场代理的实现很简单，但是在设置代理时有不少陷阱，需要注意。

<h4 id="Chapter2.4.1">UINavigationControllerDelegate</h4>

定制 UINavigationController 这种容器控制器的转场时，很适合实现一个子类，自身集转场代理，动画控制器于一身，也方便使用，不过这样做有时候又限制了它的使用范围，别人也实现了自己的子类时便不能方便使用你的效果，这里采取的是将转场代理封装成一个类。

    class SDENavigationControllerDelegate: NSObject, UINavigationControllerDelegate {
        //在<UINavigationControllerDelegate>对象里，实现该方法提供动画控制器，返回 nil 则使用系统默认的效果。
        func navigationController(navigationController: UINavigationController, 
             animationControllerForOperation operation: UINavigationControllerOperation, 
                             fromViewController fromVC: UIViewController, 
                                 toViewController toVC: UIViewController) -> UIViewControllerAnimatedTransitioning? {
            //使用上一节实现的 Slide 动画控制器，需要提供操作类型信息。
            let transitionType = SDETransitionType.NavigationTransition(operation)
            return SlideAnimationController(type: transitionType)
        }
    }

如果你在代码里为你的控制器里这样设置代理：

    //错误的做法，delegate 是弱引用，在离开这行代码所处的方法范围后，delegate 将重新变为 nil，然后什么都不会发生。
    self.navigationController?.delegate = SDENavigationControllerDelegate()
可以使用强引用的变量来引用新实例，且不能使用本地变量，在控制器中新增一个变量来维持新实例就可以了。

    self.navigationController?.delegate = strongReferenceDelegate

解决了弱引用的问题，这行代码应该放在哪里执行呢？很多人喜欢在`viewDidLoad()`做一些配置工作，但在这里设置无法保证是有效的，因为这时候控制器可能尚未进入 NavigationController 的控制器栈，`self.navigationController`返回的可能是 nil；如果是通过代码 push 其他控制器，在 push 前设置即可；`prepareForSegue:sender:`方法是转场前更改设置的最后一次机会，可以在这里设置；保险点，使用`UINavigationController`子类，自己作为代理，省去到处设置的麻烦。

不过，通过代码设置终究显得很繁琐且不安全，在 storyboard 里设置一劳永逸：在控件库里拖拽一个 NSObject 对象到相关的 UINavigationControler 上，在控制面板里将其类别设置为`SDENavigationControllerDelegate`，然后拖拽鼠标将其设置为代理。

最后一步，像往常一样触发转场：

    self.navigationController?.pushViewController(toVC, animated: true)//or
    self.navigationController?.popViewControllerAnimated(true)
在 storyboard 中通过设置 segue 时开启动画也将看到同样的 Slide 动画。Demo 地址：[NavigationControllerTransition](https://github.com/seedante/iOS-ViewController-Transition-Demo/tree/master/NavigationControllerTransition)。

<h4 id="Chapter2.4.2">UITabBarControllerDelegate</h4>

同样作为容器控制器，UITabBarController 的转场代理和 UINavigationController 类似，通过类似的方法提供动画控制器，不过`<UINavigationControllerDelegate>`的代理方法里提供了操作类型，但`<UITabBarControllerDelegate>`的代理方法没有提供滑动的方向信息，需要我们来获取滑动的方向。
    
    class SDETabBarControllerDelegate: NSObject, UITabBarControllerDelegate {
        //在<UITabBarControllerDelegate>对象里，实现该方法提供动画控制器，返回 nil 则没有动画效果。
        func tabBarController(tabBarController: UITabBarController, animationControllerForTransitionFromViewController 
                                        fromVC: UIViewController, 
                         toViewController toVC: UIViewController) -> UIViewControllerAnimatedTransitioning?{
            let fromIndex = tabBarController.viewControllers!.indexOf(fromVC)!
            let toIndex = tabBarController.viewControllers!.indexOf(toVC)!
            
            let tabChangeDirection: TabOperationDirection = toIndex < fromIndex ? .Left : .Right
            let transitionType = SDETransitionType.TabTransition(tabChangeDirection)
            let slideAnimationController = SlideAnimationController(type: transitionType)
            return slideAnimationController
        }
    }
    
为 UITabBarController 设置代理的方法和陷阱与上面的 UINavigationController 类似，注意`delegate`属性的弱引用问题。点击 TabBar 的相邻页面进行切换时，将会看到 Slide 动画；通过以下代码触发转场时也将看到同样的效果：

    tabBarVC.selectedIndex = ...//or
    tabBarVC.selectedViewController = ...
Demo 地址：[ScrollTabBarController](https://github.com/seedante/iOS-ViewController-Transition-Demo/tree/master/ScrollTabBarController)。

<h4 id="Chapter2.4.3">UIViewControllerTransitioningDelegate</h4>

Modal 转场的代理协议`<UIViewControllerTransitioningDelegate>`是 iOS 7 新增的，其为 presentation 和 dismissal 转场分别提供了动画控制器。在「特殊的 Modal 转场」里实现的`OverlayAnimationController`类可同时处理 presentation 和 dismissal 转场。`UIPresentationController`只在 iOS 8中可用，通过`available`关键字可以解决 API 的版本差异。 

    class SDEModalTransitionDelegate: NSObject, UIViewControllerTransitioningDelegate {
        func animationControllerForPresentedController(presented: UIViewController, 
                                 presentingController presenting: UIViewController, 
                                         sourceController source: UIViewController) -> UIViewControllerAnimatedTransitioning? {
            return OverlayAnimationController()
        }
        
        func animationControllerForDismissedController(dismissed: UIViewController) -> UIViewControllerAnimatedTransitioning? {
            return OverlayAnimationController()
        }
        
        @available(iOS 8.0, *)
        func presentationControllerForPresentedViewController(presented: UIViewController, 
                                    presentingViewController presenting: UIViewController, 
                                            sourceViewController source: UIViewController) -> UIPresentationController? {
            return OverlayPresentationController(presentedViewController: presented, presentingViewController: presenting)
        }
    }
    
Modal 转场的代理由 presentedVC 的`transitioningDelegate`属性来提供，这与前两种容器控制器的转场不一样，不过该属性作为代理同样是弱引用，记得和前面一样需要有强引用的变量来维护该代理，而 Modal 转场需要 presentedVC 来提供转场代理的特性使得 presentedVC 自身非常适合作为自己的转场代理。另外，需要将 presentedVC 的`modalPresentationStyle`属性设置为`.Custom`或`.FullScreen`，只有这两种模式下才支持自定义转场，该属性默认值为`.FullScreen`。自定义转场时，决定转场动画效果的`modalTransitionStyle`属性将被忽略。

开启转场动画的方式依然是两种：在 storyboard 里设置 segue 并开启动画，但这里并不支持`.Custom`模式，不过还有机会挽救，转场前的最后一个环节`prepareForSegue:sender:`方法里可以动态修改`modalPresentationStyle`属性；或者全部在代码里设置，示例如下：

    let presentedVC = ...
    presentedVC.transitioningDelegate = strongReferenceSDEModalTransitionDelegate
    //当与 UIPresentationController 配合时该属性必须为.Custom。
    presentedVC.modalPresentationStyle = .Custom/.FullScreen      
    presentingVC.presentViewController(presentedVC, animated: true, completion: nil)
    
Demo 地址：[CustomModalTransition](https://github.com/seedante/iOS-ViewController-Transition-Demo/tree/master/CustomModalTransition)。

<h2 id="Chapter3">阶段二：交互式转场</h2>

激动人心的部分来了，好消息是交互转场的实现难度比你想象的要低。

<h3 id="Chapter3.1">实现交互化</h3>

在非交互转场的基础上将之交互化需要两个条件：

1. 由转场代理提供交互控制器，这是一个遵守`<UIViewControllerInteractiveTransitioning>`协议的对象，不过系统已经打包好了现成的类`UIPercentDrivenInteractiveTransition`供我们使用。我们不需要做任何配置，仅仅在转场代理的相应方法中提供一个该类实例便能工作。另外交互控制器必须有动画控制器才能工作。

2. 交互控制器还需要交互手段的配合，最常见的是使用手势，或是其他事件，来驱动整个转场进程。

满足以上两个条件很简单，但是很容易犯错误。

**正确地提供交互控制器**：

如果在转场代理中提供了交互控制器，而转场发生时并没有方法来驱动转场进程(比如手势)，转场过程将一直处于开始阶段无法结束，应用界面也会失去响应：在 NavigationController 中点击 NavigationBar 也能实现 pop 返回操作，但此时没有了交互手段的支持，转场过程卡壳；在 TabBarController 的代理里提供交互控制器存在同样的问题，点击 TabBar 切换页面时也没有实现交互控制。因此仅在确实处于交互状态时才提供交互控制器，可以使用一个变量来标记交互状态，该变量由交互手势来更新状态。

以为 NavigationController 提供交互控制器为例：

    class SDENavigationDelegate: NSObject, UINavigationControllerDelegate {
        var interactive = false
        let interactionController = UIPercentDrivenInteractiveTransition()
        ...
        
        func navigationController(navigationController: UINavigationController, interactionControllerForAnimationController 
                                   animationController: UIViewControllerAnimatedTransitioning) -> UIViewControllerInteractiveTransitioning? {
            return interactive ? self.interactionController : nil
        }
    }

TabBarController 的实现类似，Modal 转场代理分别为 presentation 和 dismissal 提供了各自的交互控制器，也需要注意上面的问题。

问题的根源是交互控制的工作机制导致的，交互过程实际上是由转场环境对象`<UIViewControllerContextTransitioning>`来管理的，它提供了如下几个方法来控制转场的进度：

    func updateInteractiveTransition(_ percentComplete: CGFloat)//更新转场进度，进度数值范围为0.0~1.0。
    func cancelInteractiveTransition()//取消转场，转场动画从当前状态返回至转场发生前的状态。
    func finishInteractiveTransition()//完成转场，转场动画从当前状态继续直至结束。

交互控制协议`<UIViewControllerInteractiveTransitioning>`只有一个必须实现的方法：

    func startInteractiveTransition(_ transitionContext: UIViewControllerContextTransitioning)
在转场代理里提供了交互控制器后，转场开始时，该方法自动被 UIKit 调用对转场环境进行配置。

系统打包好的`UIPercentDrivenInteractiveTransition`中的控制转场进度的方法与转场环境对象提供的三个方法同名，实际上只是前者调用了后者的方法而已。系统以一种解耦的方式使得动画控制器，交互控制器，转场环境对象互相协作，我们只需要使用`UIPercentDrivenInteractiveTransition`的三个同名方法来控制进度就够了。如果你要实现自己的交互控制器，而不是`UIPercentDrivenInteractiveTransition`的子类，就需要调用转场环境的三个方法来控制进度，压轴环节我们将示范如何做。

交互控制器控制转场的过程就像将动画控制器实现的动画制作成一部视频，我们使用手势或是其他方法来控制转场动画的播放，可以前进，后退，继续或者停止。`finishInteractiveTransition()`方法被调用后，转场动画从当前的状态将继续进行直到动画结束，转场完成；`cancelInteractiveTransition()`被调用后，转场动画从当前的状态回拨到初始状态，转场取消。

在 NavigationController 中点击 NavigationBar 的 backBarButtomItem 执行 pop 操作时，由于我们无法介入 backBarButtomItem 的内部流程，就失去控制进度的手段，于是转场过程只有一个开始，永远不会结束。其实我们只需要有能够执行上述几个方法的手段就可以对转场动画进行控制，用户与屏幕的交互手段里，手势是实现这个控制过程的天然手段，我猜这是其被称为交互控制器的原因。

**交互手段的配合**：

下面使用演示如何利用屏幕边缘滑动手势`UIScreenEdgePanGestureRecognizer`在 NavigationController 中控制 Slide 动画控制器提供的动画来实现右滑返回的效果，该手势绑定的动作方法如下：

    func handleEdgePanGesture(gesture: UIScreenEdgePanGestureRecognizer){
        //根据移动距离计算交互过程的进度。
        let percent = ...
        switch gesture.state{
        case .Began:
            //转场开始前获取代理，一旦转场开始，VC 将脱离控制器栈，此后 self.navigationController 返回的是 nil。
            self.navigationDelegate = self.navigationController?.delegate as? SDENavigationDelegate
            //更新交互状态
            self.navigationDelegate?.interactive = true
            //1.交互控制器没有 start 之类的方法，当下面这行代码执行后，转场开始；
            //如果转场代理提供了交互控制器，它将从这时候开始接管转场过程。
            self.navigationController?.popViewControllerAnimated(true)
        case .Changed:
            //2.更新进度：
            self.navigationDelegate?.interactionController.updateInteractiveTransition(percent)
        case .Cancelled, .Ended:
            //3.结束转场：
            if percent > 0.5{
                //完成转场。
                self.navigationDelegate?.interactionController.finishInteractiveTransition()
            }else{
                //或者，取消转场。
                self.navigationDelegate?.interactionController.cancelInteractiveTransition()
            }
            //无论转场的结果如何，恢复为非交互状态。
            self.navigationDelegate?.interactive = false
        default: self.navigationDelegate?.interactive = false
        }
    }

交互转场的流程就是三处数字标记的代码。不管是什么交互方式，使用什么转场方式，都是在使用这三个方法控制转场的进度。**对于交互式转场，交互手段只是表现形式，本质是驱动转场进程。**很希望能够看到更新颖的交互手法，比如通过点击页面不同区域来控制一套复杂的流程动画。TabBarController 的 Demo 中也实现了滑动切换 Tab 页面，代码是类似的，就不占篇幅了；示范的 Modal 转场我没有为之实现交互控制，原因也提到过了，没有比较合乎操作直觉的交互手段，不过真要为其添加交互控制，代码和上面是类似的。

转场交互化后结果有两种：完成和取消。取消后动画将会原路返回到初始状态，但已经变化了的数据怎么恢复？

一种情况是，控制器的系统属性，比如，在 TabBarController 里使用上面的方法实现滑动切换 Tab 页面，中途取消的话，已经变化的`selectedIndex`属性该怎么恢复为原值；上面的代码里，取消转场的代码执行后，`self.navigationController`返回的依然还是是 nil，怎么让控制器回到 NavigationController 的控制器栈顶。对于这种情况，UIKit 自动替我们恢复了，不需要我们操心(可能你都没有意识到这回事)；

另外一种就是，转场发生的过程中，你可能想实现某些效果，一般是在下面的事件中执行，转场中途取消的话可能需要取消这些效果。

    func viewWillAppear(_ animated: Bool)
    func viewDidAppear(_ animated: Bool)
    func viewWillDisappear(_ animated: Bool)
    func viewDidDisappear(_ animated: Bool)
交互转场介入后，视图在这些状态间的转换变得复杂，WWDC 上苹果的工程师还表示转场过程中 view 的`Will`系方法和`Did`系方法的执行顺序并不能得到保证，虽然几率很小，但如果你依赖于这些方法执行的顺序的话就可能需要注意这点。而且，`Did`系方法调用时并不意味着转场过程真的结束了。另外，fromView 和 toView 之间的这几种方法的相对顺序更加混乱，具体的案例可以参考这里：[The Inconsistent Order of View Transition Events](http://wangling.me/2014/02/the-inconsistent-order-of-view-transition-events.html)。

如何在转场过程中的任意阶段中断时取消不需要的效果？这时候该转场协调器(Transition Coordinator)再次出场了。

<h3 id="Chapter3.2">Transition Coordinator</h3>

转场协调器(Transition Coordinator)的出场机会不多，但却是关键先生。Modal
转场中，`UIPresentationController`类只能通过转场协调器来与动画控制器同步，并行执行其他动画；这里它可以在交互式转场结束时执行一个闭包：

    func notifyWhenInteractionEndsUsingBlock(_ handler: (UIViewControllerTransitionCoordinatorContext) -> Void)
当转场由交互状态转变为非交互状态(在手势交互过程中则为手势结束时)，无论转场的结果是完成还是被取消，该方法都会被调用；得益于闭包，转场协调器可以在转场过程中的任意阶段搜集动作并在交互中止后执行。闭包中的参数是一个遵守`<UIViewControllerTransitionCoordinatorContext>`协议的对象，该对象由 UIKit 提供，和前面的转场环境对象`<UIViewControllerContextTransitioning>`作用类似，它提供了交互转场的状态信息。

    override func viewWillAppear(animated: Bool) {
        super.viewWillDisappear(animated)
        self.doSomeSideEffectsAssumingViewDidAppearIsGoingToBeCalled()
        //只在处于交互转场过程中才可能取消效果。
        if let coordinator = self.transitionCoordinator() where coordinator.initiallyInteractive() == true{
            coordinator.notifyWhenInteractionEndsUsingBlock({
                interactionContext in
                if interactionContext.isCancelled(){
                    self.undoSideEffects()
                }
            })
        }
    }

不过交互状态结束时并非转场过程的终点(此后动画控制器提供的转场动画根据交互结束时的状态继续或是返回到初始状态)，而是由动画控制器来结束这一切：

    optional func animationEnded(_ transitionCompleted: Bool)
如果实现了该方法，将在转场动画结束后调用。

UIViewController 可以通过`transitionCoordinator()`获取转场协调器，该方法的文档中说只有在 Modal 转场过程中，该方法才返回一个与当前转场相关的有效对象。实际上，NavigationController 的转场中 fromVC 和 toVC 也能返回一个有效对象，TabBarController 有点特殊，fromVC 和 toVC 在转场中返回的是 nil，但是作为容器的 TabBarController 可以使用该方法返回一个有效对象。

转场协调器除了上面的两种关键作用外，也在 iOS 8 中的适应性布局中担任重要角色，可以查看[`<UIContentContainer>`](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIContentContainer_Ref/index.html#//apple_ref/doc/uid/TP40014526)协议中的方法，其中响应尺寸和屏幕旋转事件的方法都包含一个转场协调器对象，视图的这种变化也被系统视为广义上的 transition，参数中的转场协调器也由 UIKit 提供。这个话题有点超出本文的范围，就不深入了，有需要的话可以查看文档和相关 session。

<h3 id="Chapter3.3">封装交互控制器</h3>

`UIPercentDrivenInteractiveTransition`类是一个系统提供的交互控制器，在转场代理的相关方法里提供一个该类实例就够了，还有其他需求的话可以实现其子类来完成，那这里的封装是指什么？系统把交互控制器打包好了，但是交互控制器工作还需要其他的配置。程序员向来很懒，能够自动完成的事绝不肯写一行代码，写一行代码就能搞定的事绝不写第二行，所谓少写一行是一行。能不能顺便把交互控制器的配置也打包好省得写代码啊？当然可以。

热门转场动画库 [VCTransitionsLibrary](https://github.com/ColinEberhardt/VCTransitionsLibrary#using-an-interaction-controller) 封装好了多种动画效果，并且自动支持 pop, dismissal 和 tab change 等操作的手势交互，其手法是在转场代理里为 toVC 添加手势并绑定相应的处理方法。

为何没有支持 push 和 presentation 这两种转场？因为 push 和 presentation 这两种转场需要提供 toVC，而库并没有 toVC 的信息，这需要作为使用者的开发者来提供；对于逆操作的 pop 和 dismiss，toVC 的信息已经存在了，所以能够实现自动支持。而 TabBarController 则是个例外，它是在已知的子 VC 之间切换，不存在这个问题。需要注意的是，库这样封装了交互控制器后，那么你将无法再让同一种手势支持 push 或 presentation，要么只支持单向的转场，要么你自己实现双向的转场。当然，如果知道 toVC 是什么类的话，你可以改写这个库让 push 和 present 得到支持。不过，对于在初始化时需要配置额外信息的类，这种简单的封装可能不起作用。[VCTransitionsLibrary](https://github.com/ColinEberhardt/VCTransitionsLibrary#using-an-interaction-controller) 库还支持添加自定义的简化版的动画控制器和交互控制器，在封装和灵活之间的平衡控制得很好，代码非常值得学习。

只要愿意，我们还可以变得更懒，不，是效率更高。[FDFullscreenPopGesture](https://github.com/forkingdog/FDFullscreenPopGesture.git) 通过 category 的方法让所有的 UINavigationController 都支持右滑返回，而且，一行代码都不用写，这是配套的博客：[一个丝滑的全屏滑动返回手势](http://blog.sunnyxx.com/2015/06/07/fullscreen-pop-gesture/)。那么也可以实现一个类似的 FullScreenTabScrollGesture 让所有的 UITabBarController 都支持滑动切换，不过，UITabBar 上的 icon 渐变动画有点麻烦，因为其中的 UITabBarItem 并非 UIView 子类，无法进行动画。[WXTabBarController](https://github.com/leichunfeng/WXTabBarController.git) 这个项目完整地实现了微信界面的滑动交互以及 TabBar 的渐变动画。不过，它的滑动交互并不是使用转场的方式完成的，而是使用 UIScrollView，好处是兼容性更好。兼容性这方面国内的环境比较差，iOS 9 都出来了，可能还需要兼容 iOS 6，而自定义转场需要至少 iOS 7 的系统。该项目实现的 TabBar 渐变动画是基于 TabBar 的内部结构实时更新相关视图的 alpha 值来实现的(不是UIView 动画），这点非常难得，而且使用 UIScrollView 还可以实现自动控制 TabBar 渐变动画，相比之下，使用转场的方式来实现这个效果会麻烦一点。

一个较好的转场方式需要顾及更多方面的细节，NavigationController 的 NavigationBar 和 TabBarController 的 TabBar 这两者在先天上有着诸多不足需要花费更多的精力去完善，本文就不在这方面深入了，上面提及的几个开源项目都做得比较好，推荐学习。

<h3 id="Chapter3.4">交互转场的限制</h3>

如果希望转场中的动画能完美地被交互控制，必须满足2个隐性条件：

1. 使用 UIView 动画的 API。你当然也可以使用 Core Animation 来实现动画，甚至，这种动画可以被交互控制，但是当交互中止时，会出现一些意外情况：如果你正确地用 Core Animation 的方式复现了 UIView 动画的效果(不仅仅是动画，还包括动画结束后的处理)，那么手势结束后，动画将直接跳转到最终状态；而更多的一种状况是，你并没有正确地复现 UIView 动画的效果，手势结束后动画会停留在手势中止时的状态，界面失去响应。所以，如果你需要完美的交互转场动画，必须使用 UIView 动画。
2. 在动画控制器的`animateTransition:`中提交动画。问题和第1点类似，在`viewWillDisappear:`这样的方法中提交的动画也能被交互控制，但交互停止时，立即跳转到最终状态。

如果你希望制作多阶段动画，在某个动画结束后再执行另外一段动画，可以通过 UIView Block Animation 的 completion 闭包来实现动画链，或者是通过设定动画执行的延迟时间使得不同动画错分开来，但是交互转场不支持这两种形式。UIView 的 keyFrame Animation API 可以帮助你，通过在动画过程的不同时间节点添加关键帧动画就可以实现多阶段动画。我实现过一个这样的多阶段转场动画，Demo 在此：[CollectionViewAlbumTransition](https://github.com/seedante/SDECollectionViewAlbumTransition.git)。

<h2 id="Chapter4">插曲：UICollectionViewController 布局转场</h2>

前面一直没有提到这种转场方式，与三大主流转场不同，布局转场只针对 CollectionViewController 搭配 NavigationController 的组合，且是作用于布局，而非视图。采用这种布局转场时，NavigationController 将会用布局变化的动画来替代 push 和 pop 的默认动画。苹果自家的照片应用中的「照片」Tab 页面使用了这个技术：在「年度-精选-时刻」几个时间模式间切换时，CollectionViewController 在 push 或 pop 时尽力维持在同一个元素的位置同时进行布局转换。

布局转场的实现比三大主流转场要简单得多，只需要满足四个条件：NavigationController + CollectionViewController, 且要求后者都拥有相同数据源， 并且开启`useLayoutToLayoutNavigationTransitions`属性为真。

    let cvc0 = UICollectionViewController(collectionViewLayout: layout0)
    //作为 root VC 的 cvc0 的该属性必须为 false，该属性默认为 false。
    cvc0.useLayoutToLayoutNavigationTransitions = false
    let nav = UINavigationController(rootViewController: cvc0)
    //cvc0, cvc1, cvc2 必须具有相同的数据，如果在某个时刻修改了其中的一个数据源，其他的数据源必须同步，不然会出错。
    let cvc1 = UICollectionViewController(collectionViewLayout: layout1)
    cvc1.useLayoutToLayoutNavigationTransitions = true
    nav.pushViewController(cvc1, animated: true)
    
    let cvc2 = UICollectionViewController(collectionViewLayout: layout2)
    cvc2.useLayoutToLayoutNavigationTransitions = true
    nav.pushViewController(cvc2, animated: true)
    
    nav.popViewControllerAnimated(true)
    nav.popViewControllerAnimated(true)
    
Push 进入控制器栈后，不能更改`useLayoutToLayoutNavigationTransitions`的值，否则应用会崩溃。当 CollectionView 的数据源(section 和 cell 的数量)不完全一致时，push 和 pop 时依然会有布局转场动画，但是当 pop 回到 rootVC 时，应用会崩溃。可否共享数据源保持同步来克服这个缺点？测试表明，这样做可能会造成画面上的残缺，以及不稳定，建议不要这么做。
    
此外，iOS 7 支持 UICollectionView 布局的交互转换(Layout Interactive Transition)，过程与控制器的交互转场(ViewController Interactive Transition)类似，这个功能和布局转场(CollectionViewController Layout Transition)容易混淆，前者是在自身布局转换的基础上实现了交互控制，后者是 CollectionViewController 与 NavigationController 结合后在转场的同时进行布局转换。感兴趣的话可以看[这个功能的文档](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UICollectionView_class/index.html#//apple_ref/occ/instm/UICollectionView/startInteractiveTransitionToCollectionViewLayout:completion:)。

布局转场不支持交互控制。Demo 地址：[CollectionViewControllerLayoutTransition](https://github.com/seedante/iOS-ViewController-Transition-Demo/tree/master/CollectionViewControllerLayoutTransition)。


<h2 id="Chapter5">进阶</h2>

是否觉得本文中实现的例子的动画效果太过简单？的确很简单，与 [VCTransitionsLibrary](https://github.com/ColinEberhardt/VCTransitionsLibrary#using-an-interaction-controller) 这样的转场动画库提供的十种动画效果相比是很简单的，不过就动画而言，与本文示例的本质是一样的，它们都是针对 fromView 和 toView 的整体进行的动画，但在效果上更加复杂。我在本文中多次强调转场动画的本质是是对即将消失的当前视图和即将出现的下一屏幕的内容进行动画，「在动画控制器里，参与转场的视图只有 fromView 和 toView 之分，与转场方式无关。转场动画的最终效果只限制于你的想象力」，当然，还有你的实现能力。

本文前面的目的是帮助你熟悉转场的整个过程，你也看到了，转场动画里转场部分的实现其实很简单，大部分复杂的转场动画与本文范例里简单的转场动画相比，复杂的部分在动画部分，转场的部分都是一样的。因此，学习了前面的内容后并不能帮助你立马就能够实现 Github 上那些热门的转场动画，它们成为热门的原因在于动画本身，与转场本身关系不大，但它们与转场结合后就有了神奇的力量。那学习了作为进阶的本章能立马实现那些热门的转场效果吗？有可能，有些效果其实很简单，一点就透，还有一些效果涉及的技术属于本文主题之外的内容，我会给出相关的提示就不深入了。

本章的进阶分为两个部分：

1. 案例分析：动画的方式非常多，有些并不常见，有些只是简单到令人惊讶的组合，只是你不曾了解过所以不知道如何实现，一旦了解了就不再是难事。尽管这些动画本身并不属于转场技术这个主题，但与转场动画组合后往往有着惊艳的视觉效果，这部分将提供一些实现此类转场动画的思路，技巧和工具来扩展视野。有很多动画类型我也没有尝试过，可能的话我会继续更新一些有意思的案例。
2. 自定义容器转场：官方支持四种方式的转场，而且这些也足以应付绝大多数需求了，但依然有些地方无法顾及。本文一直通过探索转场的边界的方式来总结使用方法以及陷阱，在本文的压轴部分，我们将挣脱系统的束缚来实现自定义容器控制器的转场效果。

<h3 id="Chapter5.1">案例分析</h3>

动画的持续时间一般不超过0.5秒，稍纵即逝，有时候看到一个复杂的转场动画也不容易知道实现的方式，我一般是通过逐帧解析的手法来分析实现的手段：开源的就运行一下，使用系统自带的 QuickPlayer 对 iOS 设备进行录屏，再使用 QuickPlayer 打开视频，按下 cmd+T 打开剪辑功能，这时候就能查看每一帧了；Gif 等格式的原型动画的动图就直接使用系统自带的 Preview 打开看中间帧。

**子元素动画**

当转场动画涉及视图中的子视图时，往往无法依赖第三方的动画库来实现，你必须为这种效果单独定制，神奇移动就是一个典型的例子。神奇移动是 Keynote 中的一个动画效果，如果某个元素在连续的两页 Keynote 同时存在，在页面切换时，该元素从上一页的位置移动到下一页的位置，非常神奇。在转场中怎么实现这个效果呢？最简单的方法是截图配合移动动画：伪造那个元素的视图添加到 containerView 中，从 fromView 中的位置移动到 toView 中的位置，这期间 fromView 和 toView 中的该元素视图隐藏，等到移动结束恢复 toView 中该元素的显示，并将伪造的元素视图从 containerView 中移除。

UIView 有几个`convert`方法用于在不同的视图之间转换坐标：

    func convertPoint(_ point: CGPoint, toView view: UIView?) -> CGPoint
    func convertPoint(_ point: CGPoint, fromView view: UIView?) -> CGPoint
    func convertPoint(_ point: CGPoint, fromView view: UIView?) -> CGPoint
    func convertPoint(_ point: CGPoint, fromView view: UIView?) -> CGPoint

对截图这个需求，iOS 7 提供了趁手的工具，UIView Snapshot API：

    func snapshotViewAfterScreenUpdates(_ afterUpdates: Bool) -> UIView
    //获取视图的部分内容
    func resizableSnapshotViewFromRect(_ rect: CGRect, afterScreenUpdates afterUpdates: Bool, withCapInsets capInsets: UIEdgeInsets) -> UIView

当`afterScreenUpdates`参数值为`true`时，这两个方法能够强制视图立刻更新内容，同时返回更新后的视图内容。在 push 或 presentation 中，如果 toVC 是 CollectionViewController 并且需要对 visibleCells 进行动画，此时动画控制器里是无法获取到的，因为此时 collectionView 还未向数据源询问内容，执行此方法后能够达成目的。UIView 的`layoutIfNeeded()`也能要求立即刷新布局达到同样的效果。

**Mask 动画**

![MaskAnimtion](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/MaskAnimtion.gif?raw=true)

左边的动画教程：[How To Make A View Controller Transition Animation Like in the Ping App](http://www.raywenderlich.com/86521/how-to-make-a-view-controller-transition-animation-like-in-the-ping-app)；右边动画的开源地址：[BubbleTransition](https://github.com/andreamazz/BubbleTransition.git)。

Mask 动画往往在视觉上令人印象深刻，这种动画通过使用一种特定形状的图形作为 mask 截取当前视图内容，使得当前视图只表现出 mask 图形部分的内容，在 PS 界俗称「遮罩」。UIView 有个属性`maskView`可以用来遮挡部分内容，但这里的效果并不是对`maskView`的利用；CALayer 有个对应的属性`mask`，而 CAShapeLayer 这个子类搭配 UIBezierPath 类可以实现各种不规则图形。这种动画一般就是 mask + CAShapeLayer + UIBezierPath 的组合拳搞定的，实际上实现这种圆形的形变是很简单的，只要发挥你的想象力，可以实现任何形状的形变动画。

这类转场动画在转场过程中对 toView 使用 mask 动画，不过，右边的这个动画实际上并不是上面的组合来完成的，它的真相是这样：

![Truth behind BubbleTransition](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/Truth%20behind%20BubbleTransition.gif?raw=true)

这个开发者实在是太天才了，这个手法本身就是对 mask 概念的应用，效果卓越，但方法却简单到难以置信。关于使用 mask + CAShapeLayer + UIBezierPath 这种方法实现 mask 动画的方法请看我的[这篇文章](http://www.jianshu.com/p/3c925a1609f8)。

**高性能动画框架**

有些动画使用 UIView 的动画 API 难以实现，或者难以达到较好的性能，又或者两者皆有，幸好我们还有其他选择。[StartWar](https://yalantis.com/blog/uidynamics-uikit-or-opengl-3-types-of-ios-animations-for-the-star-wars/) 使用更底层的 OpenGL 框架来解决性能问题以及 Objc.io 在探讨转场这个话题时[使用 GPUImage 定制动画](http://objccn.io/issue-5-3/)都是这类的典范。在交互控制器章节中提到过，官方只能对 UIView 动画 API 实现的转场动画实施完美的交互控制，这也不是绝对的，接下来我们就来挑战这个难题。


<h3 id="Chapter5.2">自定义容器控制器转场</h3>

压轴环节我们将实现这样一个效果：

![ButtonTransition](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/CustomContainerVCButtonTransition.gif?raw=true)
![ContainerVC Interacitve Transition](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/ContainerVCTransition.mov.gif?raw=true)

Demo 地址：[CustomContainerVCTransition](https://github.com/seedante/iOS-ViewController-Transition-Demo/tree/master/CustomContainerVCTransition)。

分析一下思路，这个控制器和 UITabBarController 在行为上比较相似，只是 TabBar 由下面跑到了上面。我们可以使用 UITabBarController 子类，然后打造一个伪 TabBar 放在顶部，原来的 TabBar 则隐藏，行为上完全一致，使用 UITabBarController 子类的好处是可以减轻实现转场的负担，不过，有时候这样的子类不是你想要的，UIViewController 子类能够提供更多的自由度，好吧，一个完全模仿 UITabBarController 行为的 UIViewController 子类，实际上我没有想到非得这样做的原因，但我想肯定有需要定制自己的容器控制器的场景，这正是本节要探讨的。Objc.io 也讨论过[这个话题](http://objccn.io/issue-12-3/)，文章的末尾把实现交互控制当做作业留了下来。珠玉在前，我就站在大牛的肩上继续这个话题吧。Objc.io 的这篇文章写得较早使用了 Objective-C 语言，如果要读者先去读这篇文章再继续读本节的内容，难免割裂，所以本节还是从头讨论这个话题吧，最终效果如上面所示，在自定义的容器控制器中实现交互控制切换子视图，也可以通过填充了 UIButton 的 ButtonTabBar 来实现 TabBar 一样行为的 Tab 切换，在通过手势切换页面时 ButtonTabBar 会实现渐变色动画。ButtonTabBar 有很大扩展性，改造或是替换为其他视图还是有很多应用场景的。

<h4 id="Chapter5.2.1">实现分析</h4>

既然这个自定义容器控制器和 UITabBarController 行为类似，我便实现了一套类似的 API：`viewControllers`数组是容器 VC 维护的子 VC 数组，初始化时提供要显示的子 VC，更改`selectedIndex`的值便可跳转到对应的子视图。利用 Swift 的属性观察器实现修改`selectedIndex`时自动执行子控制器转场。下面是实现子 VC 转场的核心代码，转场结束后遵循系统的惯例将 fromView 移除：

    class SDEContainerViewController: UIViewController{
        ...
        //发生转场的容器视图，是 root view 的子视图。
        private let privateContainerView = UIView()
        var selectedIndex: Int = NSNotFound{
            willSet{
                transitionViewControllerFromIndex(selectedIndex, toIndex: newValue)
            }
        }
        //实现 selectedVC 转场：
        private func transitionViewControllerFromIndex(fromIndex: Int, toIndex: Int){
            //添加 toVC 和 toView
            let newSelectedVC = viewControllers![toIndex]
            self.addChildViewController(newSelectedVC)
            self.privateContainerView.addSubview(newSelectedVC.view)
            newSelectedVC.didMoveToParentViewController(self)
        
            UIView.animateWithDuration(transitionDuration, animations: {
                /*转场动画*/
                }, completion: { finished in
                    //移除 fromVC 和 fromView。
                    let priorSelectedVC = viewControllers![fromIndex]
                    priorSelectedVC.willMoveToParentViewController(nil)
                    priorSelectedVC.view.removeFromSuperview()
                    priorSelectedVC.removeFromParentViewController()
            })
        }
    }

实现转场就是这么十几行代码而已，其他容器 VC 转场过程做了类似的事情。回忆下我们在动画控制器里做的事情，实际上只是上面代码中的一部分。转场协议这套 API 将这个过程分割为五个组件，这套复杂的结构带来了可高度自定义的动画效果和交互控制。我们温习下转场协议，来看看如何在既有的转场协议框架下实现自定义容器控制器的转场动画以及交互控制：

1. 转场代理：既有的转场代理协议并没有直接支持我们这种转场方式，没关系，我们自定义一套代理协议来提供动画控制器和交互控制器；
2. 动画控制器：动画控制器是可复用的，这里采用动画控制器章节封装的 Slide 动画控制器，可以拿来直接使用而不用修改；
3. 交互控制器：官方封装了一个现成的交互控制器类，但这个类是与 UIKit 提供的转场环境对象配合使用的，而这里的转场显然需要我们来提供转场环境对象，因此`UIPercentDrivenInteractiveTransition`无法在这里使用，需要我们来实现这个协议；
4. 转场环境：在官方支持的转场方式中，转场环境是由 UIKit 主动提供给我们的，既然现在的转场方式不是官方支持的，显然需要我们自己提供这个对象以供动画控制器和交互控制器使用；
5. 转场协调器：在前面的章节中我提到过，转场协调器(Transition Coordinator)的使用场景有限而关键，也是由系统提供，我们也可以重写相关方法来提供。这个部分我留给读者当作是本文的一道作业吧。

下面我们来将上面的十几行代码(不包括实际的动画代码)使用协议封装成本文前半部分里熟悉的样子。

<h4 id="Chapter5.2.2">协议补完</h4>

模仿 UITabBarControllerDelegate 协议的 ContainerViewControllerDelegate 协议：

    //在 Swift 协议中声明可选方法必须在协议声明前添加 @objc 修饰符。
    @objc protocol ContainerViewControllerDelegate{
        func containerController(containerController: SDEContainerViewController, animationControllerForTransitionFromViewController 
                                              fromVC: UIViewController, 
                               toViewController toVC: UIViewController) -> UIViewControllerAnimatedTransitioning?
        optional func containerController(containerController: SDEContainerViewController, interactionControllerForAnimation 
                                          animationController: UIViewControllerAnimatedTransitioning) -> UIViewControllerInteractiveTransitioning?
    }
在容器控制器`SDEContainerViewController`类中，添加转场代理属性：

    weak var containerTransitionDelegate: ContainerViewControllerDelegate?

代理的定位就是提供动画控制器和交互控制器，系统打包的`UIPercentDrivenInteractiveTransition`类只是调用了转场环境对象的对应方法而已，执行`navigationController.pushViewController(toVC, animated: true)`这类语句触发转场后 UIKit 就接管了剩下的事情，再综合文档的描述，可知转场环境便是实现这一切的核心。

在文章前面的部分里转场环境对象的作用只是提供涉及转场过程的信息和状态，现在需要我们实现该协议，并且实现隐藏的那部分职责。
`<UIViewControllerContextTransitioning>`协议里的绝大部分方法都是必须实现的，不过现在我们先实现非交互转场的部分，实现这个是很简单的，主要是调用动画控制器执行转场动画。在「实现分析」一节里我们看到实现转场的代码只有十几行而已，动画控制器需要做的只是处理视图和动画的部分，转场环境对象则要负责管理子 VC，通过`SDEContainerViewController`提供 containerView 以及 fromVC 和 toVC，实现并不是难事。显然由我们实现的自定义容器 VC 来提供转场环境对象是最合适的，并且转场环境对象应该是私有的，其初始化方法极其启动转场的方法如下：

    class ContainerTransitionContext: NSObject, UIViewControllerContextTransitioning{
        init(containerViewController: SDEContainerViewController, 
                       containerView: UIView, 
           fromViewController fromVC: UIViewController, 
               toViewController toVC: UIViewController){...}
               
        //非协议方法，是启动非交互式转场的便捷方法。
        func startNonInteractiveTransitionWith(delegate: ContainerViewControllerDelegate){
            //转场开始前添加 toVC，转场动画结束后会调用 completeTransition: 方法，在该方法里完成后续的操作。
            self.privateContainerViewController.addChildViewController(privateToViewController)
            //通过 ContainerViewControllerDelegate 协议定义的方法生成动画控制器，方法名太长了略去。
            self.privateAnimationController = delegate.XXXmethod
            //启动转场并执行动画。
            self.privateAnimationController.animateTransition(self)
        }
        //协议方法，动画控制器在动画结束后调用该方法，完成管理子 VC 的后续操作，并且考虑交互式转场可能取消的情况撤销添加的子 VC。
        func completeTransition(didComplete: Bool) {
            if didComplete{
                //转场完成，完成添加 toVC 的工作，并且移除 fromVC 和 fromView。
                self.privateToViewController.didMoveToParentViewController(privateContainerViewController)
                self.privateFromViewController.willMoveToParentViewController(nil)
                self.privateFromViewController.view.removeFromSuperview()
                self.privateFromViewController.removeFromParentViewController()
            }else{
                //转场取消，移除 toVC 和 toView。
                self.privateToViewController.didMoveToParentViewController(privateContainerViewController)
                self.privateToViewController.willMoveToParentViewController(nil)
                self.privateToViewController.view.removeFromSuperview()
                self.privateToViewController.removeFromParentViewController()
            }
            //非协议方法，处理收尾工作：如果动画控制器实现了 animationEnded: 方法则执行；如果转场取消了则恢复数据。
            self.transitionEnd()
        }
    }
在`SDEContainerViewController`类中，添加转场环境属性：

    private var containerTransitionContext: ContainerTransitionContext?

并修改`transitionViewControllerFromIndex:toIndex`方法实现自定义容器 VC 转场动画：

    private func transitionViewControllerFromIndex(fromIndex: Int, toIndex: Int){
        if self.containerTransitionDelegate != nil{
            let fromVC = viewControllers![fromIndex]
            let toVC = viewControllers![toIndex]
            self.containerTransitionContext = ...//利用 fromVC 和 toVC 初始化。
            self.containerTransitionContext?.startNonInteractiveTransitionWith(containerTransitionDelegate!)
        }else{/*没有提供转场代理的话，则使用最初没有动画的转场代码，或者提供默认的转场动画*/}
    }

这样我们就利用协议实现了自定义容器控制器的转场动画，可以使用第三方的动画控制器来实现不同的效果。

不过要注意这几个对象之间错综复杂的引用关系避免引用循环，关系图如下：

![Reference in Transition](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/Reference%20in%20Transition.png?raw=true)

<h4 id="Chapter5.2.3">交互控制</h4>

交互控制器的协议`<UIViewControllerInteractiveTransitioning>`仅仅要求实现一个必须的方法:
    
    func startInteractiveTransition(_ transitionContext: UIViewControllerContextTransitioning)
根据文档的描述，该方法用于配置以及启动交互转场。我们前面使用的`UIPercentDrivenInteractiveTransition`类提供的更新进度的方法只是调用了转场环境对象的相关方法。所以，是转场环境对象替交互控制器把脏活累活干了，我们的实现还是维持这种关系好了。正如前面说的，「交互手段只是表现形式，本质是驱动转场进程」，让我们回到转场环境对象里实现对动画进度的控制吧。

怎么控制动画的进度？这个问题的本质是怎么实现对 UIView 的 `animateWithDuration:animations:completion:`这类方法生成的动画的控制。能够控制吗？能。

<h5 id="Chapter5.2.3.1">动画控制和 CAMediaTiming 协议</h5>

这个协议定义了一套时间系统，是控制动画进度的关键。UIView Animation 是使用 Core Animation 框架实现的，也就是使用 UIView 的 CALayer 对象实现的动画，而 CALayer 对象遵守该协议。

在交互控制器的小节里我打了一个比方，交互控制器就像一个视频播放器一样控制着转场动画这个视频的进度。依靠 CAMediaTiming 这套协议，我们可以在 CALayer 对象上对添加的动画实现控制。官方的实现很有可能也是采用了同样的手法。CAMediaTiming 协议中有以下几个属性：

    //speed 作用类似于播放器上控制加速/减速播放，默认为1，以正常速度播放动画，为0时，动画将暂停。
    var speed: Float 
    //修改 timeOffset 类似于拖动进度条，对一个2秒的动画，该属性为1的话，动画将跳到中间的部分。
    //但当动画从中间播放到预定的末尾时，会续上0秒到1秒的动画部分。
    var timeOffset: CFTimeInterval
    //动画相对于父 layer 延迟开始的时间，这是一个实际作用比字面意义复杂的属性。 
    var beginTime: CFTimeInterval  
    
Core Animation 的文档中提供了如何暂停和恢复动画的示例：[How to pause the animation of a layer tree](https://developer.apple.com/library/ios/qa/qa1673/_index.html)。我们将之利用实现对进度的控制，这种方法对其中的子视图上添加的动画也能够实现控制，这正是我们需要的。假设在 containerView 中的 toView 上执行一个简单的沿着 X 轴方向移动 100 单位的位移动画，由`executeAnimation()`方法执行。下面是使用手势控制该动画进度的核心代码：

    func handlePan(gesture: UIPanGestureRecognizer){
        switch gesture.state{
        case .Began:
            //开始动画前将 speed 设为0，然后执行动画，动画将停留在开始的时候。
            containerView.layer.speed = 0
            //在transitionContext里，这里替换为 animator.animateTransition(transitionContext)。
            executeAnimation() 
        case .Changed:
            let percent = ...
            //此时 speed 依然为0，调整 timeOffset 可以直接调整动画的整体进度，这里的进度控制以时间计算，而不是比例。
            containerView.layer.timeOffset = percent * duration
        case .Ended, .Cancelled:
            if progress > 0.5{
                //恢复动画的运行不能简单地仅仅将 speed 恢复为1，这是一套比较复杂的机制。
                let pausedTime = view.layer.timeOffset
                containerView.layer.speed = 1.0 
                containerView.layer.timeOffset = 0.0
                containerView.layer.beginTime = 0.0
                let timeSincePause = view.layer.convertTime(CACurrentMediaTime(), fromLayer: nil) - pausedTime
                containerView.layer.beginTime = timeSincePause
            }else{/*逆转动画*/}
            default:break
        }
    }

<h5 id="Chapter5.2.3.2">取消转场</h5>

交互控制动画时有可能被取消，这往往带来两个问题：恢复数据和逆转动画。

这里需要恢复的数据是`selectedIndex`，我们在交互转场开始前备份当前的`selectedIndex`，如果转场取消了就使用这个备份数据恢复。逆转动画反而看起来比较难以解决。

在上面的 pan 手势处理方法中，我们如何逆转动画的运行呢？既然`speed`为0时动画静止不动，调整为负数是否可以实现逆播放呢？不能，效果是视图消失不见。不过我们还可以调整`timeOffset`属性，从当前值一直恢复到0。问题是如何产生动画的效果？动画的本质是视图属性在某段时间内的连续变化，当然这个连续变化并不是绝对的连续，只要时间间隔够短，变化的效果就会流畅得看上去是连续变化，在这里让这个变化频率和屏幕的刷新同步即可，`CADisplayLink`可以帮助我们实现这点，它可以在屏幕刷新时的每一帧执行绑定的方法：

    //在上面的/*逆转动画*/处添加以下两行代码：
    let displayLink = CADisplayLink(target: self, selector: "reverseAnimation:")
    displayLink.addToRunLoop(NSRunLoop.mainRunLoop(), forMode: NSDefaultRunLoopMode)
    
    func reverseAnimation(displayLink: CADisplayLink){
        //displayLink.duration表示每一帧的持续时间，屏幕的刷新频率为60，duration = 1/60。
        //这行代码计算的是，屏幕刷新一帧后，timeOffset 应该回退一帧的时间。
        let timeOffset = view.layer.timeOffset - displayLink.duration
        if timeOffset > 0{
            containerView.layer.timeOffset = timeOffset
        }else{
            //让 displayLink 失效，停止对当前方法的调用。
            displayLink.invalidate()
            //回到最初的状态。
            containerView.layer.timeOffset = 0
            //speed 恢复为1后，视图立刻跳转到动画的最终状态。
            containerView.layer.speed = 1
        }
    }

最后一句代码会令人疑惑，为何让视图恢复为最终状态，与我们的初衷相悖。`speed`必须恢复为1，不然后续发起的转场动画无法顺利执行，视图也无法响应触摸事件，直接原因未知。但`speed`恢复为1后会出现一个问题：由于在原来的动画里 fromView 最终会被移出屏幕，尽管 Slide 动画控制器 UIView 动画里的 completion handle 里会恢复 fromView 和 toView 的状态，这种状态的突变会造成闪屏现象。怎么解决？添加一个假的 fromView 到 containerView替代已经被移出屏幕外的真正的 fromView，然后在很短的时间间隔后将之移除，因为此时 fromView 已经归位。在恢复`speed`后添加以下代码：

    let fakeFromView = privateFromViewController.view.snapshotViewAfterScreenUpdates(false)
    containerView.addSubview(fakeFromView)
    performSelector("removeFakeFromView:", withObject: fakeFromView, afterDelay: 1/60)
    //在 Swift 中动态调用私有方法会出现无法识别的选择器错误，解决办法是将私有方法设置为与 objc 兼容，需要添加 @objc 修饰符。
    @objc private func removeFakeFromView(fakeView: UIView){
        fakeView.removeFromSuperview()
    }


经过试验，上面用来控制和取消 UIView 动画的方法也适用于用 Core Animation 实现的动画，毕竟 UIView 动画是用 Core Animation 实现的。不过，我们在前面提到过，官方对 Core Animation 实现的交互转场动画的支持有缺陷，估计官方鼓励使用更高级的接口吧，因为转场动画结束后需要调用`transitionContext.completeTransition(!isCancelled)`，而使用 Core Animation 完成这一步需要进行恰当的配置，实现的途径有两种且实现并不简单，相比之下 UIView 动画使用 completion block 对此进行了封装，使用非常方便。转场协议的结构已经比较复杂了，选择 UIView 动画能够显著降低实现成本。

上面的实现忽略了一个细节：时间曲线。逆转动画时每一帧都回退相同的时间，也就是说，逆转动画的时间曲线是线性的。交互控制器的协议`<UIViewControllerInteractiveTransitioning>`还有两个可选方法：
    
    optional func completionCurve() -> UIViewAnimationCurve
    optional func completionSpeed() -> CGFloat
这两个方法记录了动画采用的动画曲线和速度，在逆转动画时如果能够根据这两者计算出当前帧应该回退的时间，那么就能实现完美的逆转，显然这是一个数学问题。恩，我们跳过这个细节吧，因为我数学不好，讨论这个问题很吃力。推荐阅读 Objc.io 的[交互式动画](http://objccn.io/issue-12-6/)一文，该文探讨了如何打造自然真实的交互式动画。


<h5 id="Chapter5.2.3.3">最后的封装</h5>

接下来要做的事情就是将上述代码封装在转场环境协议要求实现的三个方法里：

    func updateInteractiveTransition(percentComplete: CGFloat)
    func finishInteractiveTransition()
    func cancelInteractiveTransition()

正如系统打包的`UIPercentDrivenInteractiveTransition`类只是调用了 UIKit 提供的转场环境对象里的同名方法，我实现的`SDEPercentDrivenInteractiveTransition`类也采用了同样的方式调用我们实现的`ContainerTransitionContext`类的同名方法。

引入交互控制器后的转场引用关系图：

![Reference in Transition with Interactor](https://github.com/seedante/iOS-ViewController-Transition-Demo/blob/master/Figures/Reference%20in%20Transition%20with%20Interactor.png?raw=true)


回到`SDEContainerViewController`类里修改转场过程的入口处：

    private func transitionViewControllerFromIndex(fromIndex: Int, toIndex: Int){
        ...
        if containerTransitionDelegate != nil{
            let fromVC = viewControllers![fromIndex]
            let toVC = viewControllers![toIndex]
            self.containerTransitionContext = ...//利用 fromVC 和 toVC 初始化。
            //interactive 属性标记是否进入交互状态，由手势来更新该属性的状态。
            if interactive{
                priorSelectedIndex = fromIndex //备份数据，以备取消转场时使用。
                self.containerTransitionContext?.startInteractiveTranstionWith(containerTransitionDelegate!)
            }else{
                self.containerTransitionContext?.startNonInteractiveTransitionWith(containerTransitionDelegate!)
            }
        }else{/*没有提供转场代理的话，则使用最初没有动画的转场代码，或者提供默认的转场动画*/}
    } 
实现手势控制的部分就如前面的交互控制器章节里的那样，完整的代码请看 Demo。

顺便说下 ButtonTabButton 在交互切换页面时的渐变色动画，这里我只是随着转场的进度更改了 Button 的字体颜色而已。那么当交互结束时如何继续剩下的动画或者取消渐变色动画呢，就像交互转场动画的那样。答案是`CADidplayLink`，前面我使用它在交互取消时逆转动画，这里使用了同样的手法。

关于转场协调器，文档表明在转场发生时`transitionCoordinator()`返回一个有效对象，但系统并不支持当前的转场方式，测试表明在当前的转场过程中这个方法返回的是 nil，需要重写该方法来提供。该对象只需要实现前面提到三个方法，其中在交互中止时执行绑定的闭包的方法可以通过通知机制来实现，有点困难的是两个与动画控制器同步执行动画的方法，其需要精准地与动画控制器中的动画保持同步，这两个方法都要接受一个遵守[`<UIViewControllerTransitionCoordinatorContext>`](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIViewControllerTransitionCoordinatorContext_Protocol/index.html#//apple_ref/doc/uid/TP40013294)协议的参数，该协议与转场环境协议非常相似，这个对象可以由我们实现的转场环境对象来提供。不过既然现在由我们实现了转场环境对象，也就知道了执行动画的时机，提交并行的动画似乎并不是难事。这部分就留给读者来挑战了。


<h2 id="Chapter6">尾声：转场动画的设计</h2>

虽然我不是设计师，但还是想在结束之前聊一聊我对转场动画设计的看法。动画的使用无疑能够提升应用的体验，但仅限于使用了合适的动画。

除了一些加载动画可以炫酷华丽极尽炫技之能事，绝大部分的日常操作并不适合使用过于炫酷或复杂的动画，比如 [VCTransitionsLibrary](https://github.com/ColinEberhardt/VCTransitionsLibrary#using-an-interaction-controller) 这个库里的大部分效果。该库提供了多达10种转场效果，从技术上讲，大部分效果都是针对 transform 进行动画，如果你对这些感兴趣或是恰好有这方面的使用需求，可以学习这些效果的实现，从代码角度看，封装技巧也很值得学习，这个库是学习转场动画的极佳范例；不过从使用效果上看，这个库提供的效果像 PPT 里提供的动画效果一样，绝大部分都应该避免在日常操作中使用。不过作为开发者，我们应该知道技术实现的手段，即使这些效果并不适合在绝大部分场景中使用。

场景转换的目的是过渡到下一个场景，在操作频繁的日常场景中使用复杂的过场动画容易造成视觉疲劳，这种情景下使用简单的动画即可，实现起来非常简单，更多的工作往往是怎么把它们与其他特性更好地结合起来，正如 [FDFullscreenPopGesture](https://github.com/forkingdog/FDFullscreenPopGesture.git) 做的那样。除了日常操作，也会遇到一些特殊的场景需要定制复杂的转场动画，这种复杂除了动画效果本身的复杂，这需要掌握相应的动画手段，也可能涉及转场过程的配合，这需要对转场机制比较熟悉。比如 [StarWars](https://github.com/Yalantis/StarWars.iOS)，这个转场动画在视觉上极其惊艳，一出场便获得上千星星的青睐，它有贴合星战内涵的创意设计和惊艳的视觉表现，以及优秀的性能优化，如果要评选年度转场动画甚至是史上最佳，我会投票给它；而我在本文里实现的范例，从动画效果来讲，都是很简单的，可以预见本文无法吸引大众的转发，压轴环节里的自定义容器控制器转场也是如此，但是后者需要熟知转场机制才能实现。从这点来看，转场动画在实际使用中走向两个极端：日常场景中的转场动画十分简单，实现难度很低；特定场景的转场动画可能非常复杂，不过实现难度并不能一概而论，正如我在案例分析一节里指出的几个案例那样。

希望本文能帮助你。
