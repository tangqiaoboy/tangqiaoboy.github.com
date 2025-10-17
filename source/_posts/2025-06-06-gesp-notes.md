---
title: GESP 核心考点
date: 2025-06-06 22:12:03
tags: cspj
---

# GESP 1 级

## 大题核心考点

1 级主要考查分支和循环结构，所以大题的解法一般都是一个 for 循环，然后循环里面用 if 之类的条件判断做一些事情，最后再输出结果。其代码框架为：

```c++
// 循环结构, 例如 for ...
	// 判断条件
// 输出结果
```

拿 GESP202309 一级题目：[小明的幸运数](https://www.luogu.com.cn/problem/B3864) 来说，其核心代码是：

```c++
// 循环
for (int i = l; i <= r; ++i) {
	// 判断条件
    if (isLucky(i)) {
    	// 累加
        ans += i;
    }
}
// 输出结果
cout << ans << endl;
```

另外一个例子，GESP202503 一级题目：[四舍五入](https://www.luogu.com.cn/problem/B4258)，核心代码：

```c++
// 循环
for (int i = 1; i <= n; ++i) {
    cin >> a;
    b = a%10;
    a = a/10;
    // 判断条件
    if (b <= 4) a = a*10;
    else a = a*10 + 10;
    // 输出结果
    cout << a << endl;
}
```

# GESP 2 级

## 大题核心考点

### 考点一：双重循环

GESP 2 级相对 1 级，对循环结构的考查进行了加强，一般需要用双层嵌套的循环才能完成大题。有一类双层嵌套循环需要特别关注，就是模拟输出类，这一类题过去考过多次，包括：

 - GESP202309，[小杨的 X 字矩阵](https://www.luogu.com.cn/problem/B3865)
 - GESP202312，[小杨的 H 字矩阵](https://www.luogu.com.cn/problem/B3924)
 - GESP202403，[小杨的日字矩阵](https://www.luogu.com.cn/problem/B3955)
 - GESP202409，[小杨的 N 字矩阵](https://www.luogu.com.cn/problem/B4037)
 - GESP202503，[等差矩阵](https://www.luogu.com.cn/problem/B4259)
 - GESP202303，[画三角形](https://www.luogu.com.cn/problem/B3837)
 - 样题，[画正方形](https://www.luogu.com.cn/problem/B3844)

以[等差矩阵](https://www.luogu.com.cn/problem/B4259)为例，其关键代码为嵌套的 for 循环，参考如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, m;
int tu[55][55];
int main() {
    cin >> n >> m;
    // 嵌套的 for 循环
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            cout << i*j << " ";
        }
        cout << endl;
    }
    return 0;
}
```

如果学生还是不熟悉，可以考虑如下更多的练习：
 - 模仿 [小杨的 X 字矩阵](https://www.luogu.com.cn/problem/B3865)，输出 “又” 字，倒 “N” 字，“工” 字矩阵，“口”字矩阵
 - 模仿 [画三角形](https://www.luogu.com.cn/problem/B3837)，输出 左对齐、右对齐的正三角形，倒三角形
 - 模仿 [等差矩阵](https://www.luogu.com.cn/problem/B4259)，输出求和的矩阵，输出只有偶数的等差矩阵（奇数位填 `*`）

有一些时候，双重循环也不一定以输出图案的方式来进行考查，比如题目 [B4356 202506 二级 数三角形](https://www.luogu.com.cn/problem/B4356) 就是一个案例，参考代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int main() {  
    int n;
    int ans = 0;
    cin >> n;
    for (int a = 1; a<=n; ++a) {
        for (int b = a; b<=n; ++b) {
            if (a*b%2 == 0)
                ans++;
        }
    }
    cout << ans << endl;
    return 0;
}
```

更多的练习题目如下：
 
 - <https://www.luogu.com.cn/problem/B3994>
 - <https://www.luogu.com.cn/problem/B3995>
 - <https://www.luogu.com.cn/problem/B3986>
 - <https://www.luogu.com.cn/problem/B3988>

#### 解题思路

对于双重循环输出图形，解题的关键在于：分析图形所代表的序列。例如图形：

```
+---+
-+-+-
--+--
-+-+-
+---+
```

对应的序列是 
 - `(1,1)(2,2)(3,3)(4,4)(5,5)`
 - `(1,5)(2,4)(3,3)(4,2)(5,1)`

然后，我们在做双重循环输出的时候，已经有两个序列 i 和 j，分别表示行号和列号。
我们可以分析 i 和 j 与我们需要输出的数据有什么关系，最后就会发现，规律是 `i == j` 或者 `i+j == n+1`

我们再看一个复杂的：

```
..#..
.#.#.
#...#
.#.#.
..#..
```

它对应的序列不太好找规律，我们可以用两个变量 a 和 b，分别表示每一行需要输出的 y 坐标。
刚开始 `(a,b)=(3,3)`，然后：
 - 对于上半部分，每增加一行，`a--`, `b++`。
 - 对下下半部分，每增加一行，`a++`, `b--`。

我们再看一些更复杂的：
```
..#....#..
.#.#..#.#.
#...##...#
.#.#..#.#.
..#....#..
```

或：

```
..#...#..
.#.#.#.#.
#...#...#
.#.#.#.#.
..#...#..
```

都可以用刚刚找到的思路来解决。

但对于更复杂的图形，就得再想办法，比如
 - <https://iai.sh.cn/problem/645>
 - <https://iai.sh.cn/problem/634>

这类题目需要根据题目的输出要求，思考问题拆解的办法，每道题的解法可能都不一样。

### 考点二：常用函数

2 级还会考一些我们经常会实现的函数。包括：

#### 求素数函数

参考题目：[GESP202306 找素数](https://www.luogu.com.cn/problem/B3840)

```c++
bool isPrime(int a) {
	for (int i = 2; i*i <=a; i++) {
		if (a%i == 0) {
			return false;
		}
	}
	return true;
}
```

更多练习：
 - [P1217 回文质数 Prime Palindromes](https://www.luogu.com.cn/problem/P1217)

#### 求闰年函数

参考题目：[GESP202503 时间跨越](https://www.luogu.com.cn/problem/B4260)

关键代码：

```c++

bool isLeapYear(int year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}
```

#### 把一个数的每一位数字拆分的写法

参考题目：[GESP202406 计数](https://www.luogu.com.cn/problem/B4007)

关键代码：

```c++
int count(int a, int k) {
	int ret = 0;
	while (a) {
		if (a%10 == k) ret++;
		a/=10;
	}
	return ret;
}
```

练习题目：
 - [GESP202409 数位之和](https://www.luogu.com.cn/problem/B4036)
 - [B2078 含 k 个 3 的数](https://www.luogu.com.cn/problem/B2078)
 - [B2081 与 7 无关的数](https://www.luogu.com.cn/problem/B2081)
 - [B2152 分离整数的各个数](https://www.luogu.com.cn/problem/B2152)
 - [B2154 数 1 的个数](https://www.luogu.com.cn/problem/B2154)

# GESP 3 级

## 选择、判断题核心考点

 - 原码，返码，补码的表示
 - 进制转换（二进制、八进制、十进制、十六进制）
 - 位运算
 - 字符串相关的操作

## 大题核心考点

### 考点一：字符串操作

3 级对字符串的操作要求非常高，需要考生灵活掌握字符串的变换、拼接、求子串、判断回文等操作。

求子串可以用 string 类的 `substr(int pos, int len)` 函数。需要注意该函数的两个参数分别是起始下标和长度。

其中，判断回文的写法如下：
```c++
bool isReverse(string &s) {
	int len = s.length();
	for (int i = 0; i < len/2; ++i) {
		if (s[i] != s[len-i-1]) {
			return false;
		}
	}
	return true;
}
```

以真题 [GESP202409 回文拼接](https://www.luogu.com.cn/problem/B4039) 为例，考生需要对字符串进行切分，然后分别判断是否是回文串。

参考代码如下：
```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n;
string s;

bool isReverse(string &s) {
	int len = s.length();
	for (int i = 0; i < len/2; ++i) {
		if (s[i] != s[len-i-1]) {
			return false;
		}
	}
	return true;
}

int main() {
	ios::sync_with_stdio(false);
	cin >> n;
	while (n--) {
		cin >> s;
		bool ans = false;
		if (s.length() >= 4) {
			for (int i = 2; i < s.length() - 1; i++) {
				string s1 = s.substr(0, i);
				string s2 = s.substr(i);
				if (isReverse(s1) && isReverse(s2)) {
					ans = true;
					break;
				}
			}
		}
		if (ans) cout << "Yes" << endl;
		else cout << "No" << endl;
	}
	return 0;
}
```

该考点的相关真题：
 - [GESP202306 密码合规](https://www.luogu.com.cn/problem/B3843)
 - [GESP202403 字母求和](https://www.luogu.com.cn/problem/B3956)
 - [GESP202406 移位](https://www.luogu.com.cn/problem/B4003)
 - [GESP202412 打印数字](https://www.luogu.com.cn/problem/B4067)
 - [GESP202309 进制判断](https://www.luogu.com.cn/problem/B3868)

其中 [GESP202309 进制判断](https://www.luogu.com.cn/problem/B3868) 看起来是考进制的规则，实际上也是考字符串的查找。参考代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int isRange(string s, string range) {
	for (int i = 0; i < s.length(); ++i) {
		char ch = s[i];
		int j = 0;
		for (j=0; j<range.length(); ++j) {
			if (ch == range[j]) {
				break;
			}
		}
		if (j == range.length()) return 0;
	} 
	return 1;
}

int main() {
	int n;
	string s;
	cin >> n;
	while (n--) {
		cin >> s;
		cout << isRange(s, "01") << " " 
		     << isRange(s, "01234567") << " " 
		     << isRange(s, "0123456789") << " " 
		     << isRange(s, "0123456789ABCDEF") << endl;
	}
	return 0;
}
```

### 考点二：前缀和

前缀和的计算技巧是：用一个累加变量来不停地更新前 N 个数的和，这样我们只需要用 O（N）的时间复杂度，就可以把所有的前缀和求出来。

参考题目：[GESP202409 平衡序列](https://www.luogu.com.cn/problem/B4038)

此题解法是：暴力测试，先计算出总和 tot ，然后看前缀和的两倍有没有可能等于 tot。

参考代码：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int t, n, v[10010], tot;
int main() {
	ios::sync_with_stdio(false);
	cin >> t;
	while (t--) {
		cin >> n;
		tot = 0;
		for (int i = 0; i < n; ++i) {
			cin >> v[i];
			tot += v[i];
		}
		int cnt = 0;
		bool ans = false;
		for (int i = 0; i < n && cnt*2<tot; ++i) {
			cnt += v[i];
			if (cnt*2 == tot) {
				ans = true;
			}
		}
		if (ans) cout << "Yes" << endl;
		else cout << "No" << endl;
	}
	return 0;
}
```

### 考点三：位运算

考生需要熟悉二进制，以及数的位运算操作。

典型考题为：[GESP202503 2025](https://www.luogu.com.cn/problem/B4261)

此题的思路如下：因为 x 最大是 2025，而如果 y 需要影响 x 的运算，只能与 x 的 bit 位是 1 的位进行操作。所以 y 如果存在，则必定小于 2048。因为 2048 的二进制 1 的 bit 位已经超过 2025 的最高位了。所以直接枚举 1～2048 之间的答案即可。

参考代码：

```c++
#include <bits/stdc++.h>
using namespace std;

int ans = -1;
int x;
int main() {
	cin >> x;
	for (int i = 1; i < 2048; ++i) {
		if ((x & i) + (x | i) == 2025) {
			ans = i;
			break;
		}
	}
	cout << ans << endl;
	return 0;
}
```

# GESP 4 级

## 大题核心考点

考点比较散，以下是历次考题的考点。

 - GESP-202306 幸运数：模拟
 - GESP-202309 进制转换：进制转换
 - GESP-202309 变长编码：位操作
 - GESP-202312 小杨的字典：字符串操作
 - GESP-202312 田忌赛马：排序，模拟
 - GESP-202403 相似字符串：字符串操作
 - GESP-202403 做题：贪心
 - GESP-202406 黑白方块：枚举
 - GESP-202406 宝箱：枚举，二分
 - GESP-202409 黑白方块：枚举
 - GESP-202409 区间排序：排序
 - GESP-202412 Recamán：枚举
 - GESP-202412 字符排序：排序
 - GESP-202503 荒地开垦：枚举
 - GESP-202503 二阶矩阵：枚举
 - GESP-202509 排兵布阵：枚举 
 - GESP-202509 最长连续段：排序

其中，比较常考的考点：
 - 枚举：考了 7 次。
 - 排序：考了 4 次。
 - 字符串操作：考了 2 次。

# GESP 5 级

## 大题核心考点

待补充

# GESP 6 级

## 大题核心考点

### 最近公共祖先

 - [P10109 GESP-202312 六级 工作沟通](https://www.luogu.com.cn/problem/P10109)
 - [P13016 GESP-202506 六级 最大因数](https://www.luogu.com.cn/problem/P13016)

### 动态规划

包括 01 背包和完全背包：

 - [B3873  202309 六级 小杨买饮料](https://www.luogu.com.cn/problem/B3873)
 - [P13015 202506 六级 学习小组](https://www.luogu.com.cn/problem/P13015)
 - [P10721 202406 六级 计算得分](https://www.luogu.com.cn/problem/P10721)

基础动态规划：

 - [P10108 202312 六级 闯关游戏](https://www.luogu.com.cn/problem/P10108)
 - [P10376 202403 六级 游戏](https://www.luogu.com.cn/problem/P10376)
 - [P11246 202409 六级 小杨和整数拆分](https://www.luogu.com.cn/problem/P11246)

记忆化搜索：
 - [P10250 GESP样题 六级 下楼梯](https://www.luogu.com.cn/problem/P10250)

复杂贪心：
 - [P11247 202409 六级 算法学习](https://www.luogu.com.cn/problem/P11247)

### 其它

树状数组：
 - [B3874 202309 六级 小杨的握手问题](https://www.luogu.com.cn/problem/B3874)

暴力枚举：
 - [P10377 202403 六级 好斗的牛](https://www.luogu.com.cn/problem/P10377)

模拟+高精度：
 - [P11375 202412 六级 树上游走](https://www.luogu.com.cn/problem/P11375)

## 相关练习题目

### 背包

从 [这儿](https://www.luogu.com.cn/problem/list?type=luogu&page=1&tag=139&orderBy=difficulty&order=asc) 可以获得洛谷上所有的背包相关题目，推荐练习的如下：

 - [P1734 最大约数和](https://www.luogu.com.cn/problem/P1734)
 - [P1507 NASA的食物计划](https://www.luogu.com.cn/problem/P1507)
 - [P1164 小A点菜](https://www.luogu.com.cn/problem/P1164)
 - [P1060 NOIP 2006 普及组 开心的金明](https://www.luogu.com.cn/problem/P1060)
 - [P1358 扑克牌](https://www.luogu.com.cn/problem/P1358)
 - [P1877 HAOI2012 音量调节](https://www.luogu.com.cn/problem/P1877)
 - [P1910 L 国的战斗之间谍](https://www.luogu.com.cn/problem/P1910)
 - [P1926 小书童——刷题大军](https://www.luogu.com.cn/problem/P1926)
 - [P1855 榨取kkksc03](https://www.luogu.com.cn/problem/P1855)
 - [P2430 严酷的训练](https://www.luogu.com.cn/problem/P2430)
 - [P1802 5 倍经验日](https://www.luogu.com.cn/problem/P1802)
 - [P1757 通天之分组背包](https://www.luogu.com.cn/problem/P1757)

# GESP 7 级

## 大题核心考点

### 动态规划

背包：

 - [P13018 202506 七级 调味平衡](https://www.luogu.com.cn/problem/P13018)



