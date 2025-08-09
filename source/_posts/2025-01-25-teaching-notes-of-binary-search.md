---
title: CSPJ 教学思考：二分查找
date: 2025-01-25 22:19:44
tags: cspj
---

## 概述

二分查找的基础逻辑很简单：我们小时候都玩过猜数字游戏，心里想一个数字（ 数字范围是 1-100），让对方猜，如果没猜对，就只告诉对方猜大了还是小了，看看最快几次能猜到。

这个游戏的最佳策略就是二分。先猜 50，如果大了，就猜 25。这样最多 7 次就可以猜到答案。

## 基础模版

对于猜数字这个游戏来说，二分的模版最简单的就是如下形式：

```c++
// 二分查找
int left, right, mid, ans;
left = 1;
right = n;
ans = -1;
while (left <= right) {
	mid = left + (right-left) / 2;
	if (v[mid] > a) {
		right = mid - 1;
	} else if (v[mid] < a) {
		left = mid + 1;
	} else {
		ans = mid;
		break;
	}
}
cout << ans << " ";
```
以上代码需要注意的有以下几点：
 - 查徇范围是 `[left, right]`，即 left 和 right 都是闭区间。
 - 循环条件是`left <= right`，即当 `left == right`时，还需要进行一次测试。
 - `mid = left + (right-left) / 2`其实等价于 `mid = (left + right) / 2`只是后者可能超界，用前者可以避免。

这种思路其实比较简单，写起来基本上不会犯错。但是，如果有多个目标值时，我们可能要多次更新 `ans` 变量。

[P2249 查找](https://www.luogu.com.cn/problem/P2249)就是一道例题，此题需要找到目标值第一次出现的位置，如果用上面的模版，我们需要多次更新 `ans`，参考代码如下：

```c++
#include <bits/stdc++.h>
using namespace std;

int v[1000010];
int n, m, a;
int main() {
	scanf("%d%d", &n, &m);
	for (int i = 1; i <= n; ++i)
		scanf("%d", v+i);
	while (m--) {
		scanf("%d", &a);
		int left, right, mid, ans;
		left = 1;
		right = n;
		ans = -1;
		while (left <= right) {
			mid = left + (right-left)/2;
			if (v[mid] > a) {
				right = mid - 1;
			} else if (v[mid] < a) {
				left = mid + 1;
			} else {
				// 如果找到，则比较 ans 的值，更新它
				if (ans == -1 || ans > mid) ans = mid;
				right = mid - 1;
			}
		}
		cout << ans << " ";
	}
	cout << endl;
	return 0;
}
```

## 另一种模版

除了刚刚的模版外，我们还可以用另外一种写法来写二分：我们用 `[l,r)`来表示目标查找区间，注意这里是左闭右开的区间。然后，我们不停地尝试缩小这个区间：
 - 情况 1：当目标值比 mid 值大的时候，新区间在 `[mid+1, r)`
 - 情况 2：当目标值比 mid 值小的时候，新区间在 `[l, mid)`
 - 情况 3：当目标值与 mid 值相等的时候，因为我们要找最小值，所以新区间在 `[l, mid)`。

以上的情况 2 和情况 3 是可以合并的。结果就是只需要写一个 if 就可以了，核心代码如下：

```c++
while (l < r) {
	mid = l + (r-l)/2;
	if (a > v[mid]) l = mid + 1;
	else r = mid;
}
```

有同学可能会问：如果只有一个值相等，并且在 mid 位置，那以上做法不是把结果就跳出区间了？其实这种情况下，l 的值会一步步右移，最后的循环结束的结果会是 `[mid,mid)`。所以我们还是可以从循环结束的 l 值中读到目标值。

对于这种写法，我们的二分判断会少很多，只需要最后判断一下 l 的值是否是目标值，即可知道是否查找成功。

以下是参考代码（从以前的 32 行缩短为 24 行）：

```c++
#include <bits/stdc++.h>
using namespace std;

int v[1000010];
int n, m, a;
int main() {
	scanf("%d%d", &n, &m);
	for (int i = 1; i <= n; ++i)
		scanf("%d", v+i);
	while (m--) {
		scanf("%d", &a);
		int l, r, mid;
		l = 1; r = n+1;
		while (l < r) {
			mid = l + (r-l)/2;
			if (a > v[mid]) l = mid + 1;
			else r = mid;
		}
		if (l < n+1 && v[l] == a) cout << l << " ";
		else cout << -1 << " ";
	}
	cout << endl;
	return 0;
}
```

如果记不清楚，就分开写：
 - 如果猜对了但要找最小值，就更新 r
 - 如果 mid 大了，则答案在 mid 左侧，就更新 r
 - 如果 mid 小了，则答案在 mid 右侧，就更新 l

另外，以上这种代码其实是不停在`[l,mid)` 和 `[mid+1, r)`之间做选择，所以：
 - `l` 只会更新成 `mid+1`
 - `r` 只会更新成 `mid`

最后答案如果有，则在 `l` 位置，当然 `l` 位置也可能不是答案：
 - 如果目标极小，没找到，则 `l` 位置为查找的范围最左侧下标
 - 如果目标极大，没找到，则 `l` 位置为最初的 r 的位置（那个位置是最后一个元素的下一个位置，直接读取会数组越界）

## lower_bound

其实上面那个写法就是 C++ STL 里面的 `lower_bound` 函数，所以我们可以直接用 `lower_bound` 函数来实现 [P2249 题](https://www.luogu.com.cn/problem/P2249)。

```c++
#include <bits/stdc++.h>
using namespace std;

int v[1000010];
int n, m, a;
int main() {
	scanf("%d%d", &n, &m);
	for (int i = 1; i <= n; ++i)
		scanf("%d", v+i);
	while (m--) {
		scanf("%d", &a);
		int l = lower_bound(v+1, v+n+1, a) - v;
		if (l < n+1 && v[l] == a) cout << l << " ";
		else cout << -1 << " ";
	}
	cout << endl;
	return 0;
}
```

函数 `lower_bound` 在 `[first,last)` 中的前闭后开区间进行二分查找，返回大于或等于目标值的第一个元素位置。如果所有元素都小于目标值，则返回 last 的位置。

这种函数行为初看很奇怪，因为它：
 - 当找到目标值时，它返回达找到的值的第一个位置
 - 当没有目标值时，它返回第一个大于目标值的位置
 - 当所有元素都小于目标值时，它返回 last 的位置

这实际上就是它的内部实现所致（可以理解为这种写法的side effect），它内部实现就是我们刚刚提到的写法，所以才会这么返回目标值。

如果我们想把查找结果转换成数组下标，只需要让它减去数组首地址即可，像这样：
```c++
int idx = lower_bound(v, v+n, a) - v;
```

## upper_bound

除了 `lower_bound` 函数之外，C++还提供了 `upper_bound` 函数。`lower_bound` 在 `[first, last)` 中的前闭后开区间进行二分查找，返回第一个比目标值大的位置。如果没找到，则返回 last 的位置。

`upper_bound` 的内部实现逻辑是：
 - **如果猜对了但要找最大值，就更新 l**
 - 如果 mid 大了，则答案在 mid 左侧，就更新 r
 - 如果 mid 小了，则答案在 mid 右侧，就更新 l

为了方便对比，我把 `lower_bound` 的逻辑再写一下：
 - **如果猜对了但要找最小值，就更新 r**
 - 如果 mid 大了，则答案在 mid 左侧，就更新 r
 - 如果 mid 小了，则答案在 mid 右侧，就更新 l

你看出来了吗？只是第一个更新的逻辑不一样。所以，其实两者的代码很像，我自己分别写了二者的一个实现，大家可以对比看一下，实际上二者实现部分只差了一个字符：

```c++
// 如果目标值等于或者小于 mid，则 r = m
// 如果目标值大于 mid，则 l = m+1
int lower_bound(int a) {
	int l, r;
	l = 0; r = n;
	while (l < r) {
		int m = l + (r-l)/2;
		if (a > v[m]) l = m+1;
		else r = m;
	}
	return l;
}

// 如果 mid 值小于等于目标，就 l=m+1
// 如果 mid 值大于目标，就 r=m
int upper_bound(int a) {
	int l, r;
	l = 0; r = n;
	while (l < r) {
		int m = l + (r-l)/2;
		if (a >= v[m]) l = m+1;
		else r = m;
	}
	return l;
}
```

我们 `upper_bound` 考虑几种情况：
 - 如果目标值极小，那么一直就更新 r，结果返回的就是首地址，为正确值。
 - 如果目标值极大，那么一直就更新 l，结果返回的就是 last。

所以 `upper_bound` 如果没找到，会返回 last。

我们再看 `lower_bound`
 - 如果目标值极小，那么一直就更新 r，结果返回的就是首地址，为第一个大于目标值的地址。
 - 如果目标值极大，那么一直就更新 l，结果返回的就是 last。

所以，其实这两个函数在没找到目标值的情况下，都有可能返回首地址或末地址的。只是对于 `upper_bound` 函数来说，首地址是有意义的。

而 `lower_bound` 函数返回的首地址怎么说呢？有点像 side effect。很少有需求是求这个地址，所以很多时候要特殊处理一下，就像我们刚刚例题里面又判断了一下一样(如下所示)
```c++
if (l < n+1 && v[l] == a) cout << l << " ";
```

## 二分答案

二分不但能用于查找数值，还可以用来暴力尝试答案。因为即便是 0-20 亿这么大的范围的猜数字游戏，也只需要 30 多次就可以猜到，所以如果某个问题可以像猜大小一样，每次获得答案是大了还是小了，就可以用二分的办法来“二分答案”。

对于二分答案一类的题目，最常见的题目描述特征是求某某值的**最大值最小**，或者**最小值最大**。这个特征可以作为我们选择二分解题的小提示。我们在练习题目 [P2678 跳石头](https://www.luogu.com.cn/problem/P2678) 和 [P1182 数列分段 Section II](https://www.luogu.com.cn/problem/P1182) 中就可以看到这种提示。

## 教学和练习题目

教学题目：

| 题目      | 说明 |
| ----------- | ----------- |
| [P2249 查找](https://www.luogu.com.cn/problem/P2249) |  可用 lower_bound 函数 |
| [P1102 A-B 数对](https://www.luogu.com.cn/problem/P1102) | 也可使用 STL map |
| [P1873 砍树](https://www.luogu.com.cn/problem/P1873) | 二分答案 |
| [P3853 路标设置](https://www.luogu.com.cn/problem/P3853)| 天津省选，二分答案|
| [P1678 烦恼的高考志愿](https://www.luogu.com.cn/problem/P1678) | 二分查找，可用 upper_bound 函数|
| [P2440 木材加工](https://www.luogu.com.cn/problem/P2440) |二分答案 |
| [P2678 跳石头](https://www.luogu.com.cn/problem/P2678) |二分答案，NOIP2015 提高组 |
| [P1182 数列分段 Section II](https://www.luogu.com.cn/problem/P1182) | 二分答案 |

练习题目：

| 题目      | 说明 |
| ----------- | ----------- |
| [P1296 奶牛的耳语](https://www.luogu.com.cn/problem/P1296) | 用 upper_bound 二分 |
| [B4305 物品分组](https://www.luogu.com.cn/problem/B4305) | 蓝桥杯青少年组省赛 2024，二分答案  |
| [P1258 小车问题](https://www.luogu.com.cn/problem/P1258) | 二分答案 |
| [P1824 进击的奶牛 Aggressive Cows G](https://www.luogu.com.cn/problem/P1824) | USACO05FEB, 二分答案 |


### P3853 路标设置

二分答案+判定。

```c++
#include <bits/stdc++.h>
using namespace std;

int L, N, K;
int v[100010];

bool check(int mid) {
	int ans = 0;
	for(int i=1; i<N; i++){
		if(v[i]-v[i-1] > mid){
			ans += (v[i]-v[i-1]-1)/mid;	
		}
	}
	if(ans<=K){
		return true;
	}
	return false;	
}

int main() {
	scanf("%d%d%d", &L, &N, &K);
	for (int i = 0; i < N; ++i) {
		scanf("%d", v+i);
	}
	int left, right, mid, ans = INT_MAX;
	left = 1;
	right = L;
	while (left <= right) {
		mid = (left + right) / 2;
		if (check(mid)) {
			right = mid - 1;
			ans = min(ans, mid);
		} else {
			left = mid + 1;
		}
	}
	cout << ans << endl;
	return 0;
}
```

### P1678 烦恼的高考志愿

```c++
/**
 * 二分查找。
 * 用 upper_bound 找到第一个大的位置 idx，然后取 idx 和 idx - 1, 分别试一下。
 * idx 可能是 0 或者末尾（idx == m），要特殊处理一下。
 */
#include <bits/stdc++.h>
using namespace std;

int m, n, vm[100010], a;
long long ans = 0;

int main() {
	scanf("%d%d", &m, &n);
	for (int i = 0; i < m; ++i) 
		scanf("%d", vm+i);
	sort(vm, vm+m);
	for (int i = 0; i < n; ++i) {
		scanf("%d", &a);
		int diff = INT_MAX;
		int idx = upper_bound(vm, vm+m, a)-vm;
		if (idx != m) diff = min(diff, abs(vm[idx]-a));
		if (idx - 1 >=0 ) diff = min(diff, abs(vm[idx-1]-a));
		ans += diff;
	}
	cout << ans << endl;
	return 0;
}
```

### P2440 木材加工

```c++
/**
 * 二分答案
 */
#include <bits/stdc++.h>
using namespace std;

int n, k;
int v[100010];
bool check(int mid) {
	int cnt = 0;
	for (int i = 0; i < n; ++i) {
		cnt += v[i]/mid;
		if (cnt >= k) return true;
	}
	return false;
}
int main() {
	scanf("%d%d", &n, &k);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	int left = 1;
	int right = (int)1e8;
	int ans = 0;
	while (left <= right) {
		int mid = (left + right) / 2;
		if (check(mid)) {
			left = mid + 1;
			ans = max(ans, mid);
		} else {
			right = mid - 1;
		}
	}
	cout << ans << endl;
	return 0;
}
```

### P2678 跳石头

二分答案：用 mid 去试跳，如果间距小于 mid，则去掉那个石头，如果去掉个数超过 k 个，则失败。

```c++
#include <bits/stdc++.h>
using namespace std;

int ed, n, k;
int v[50010];
// 用 mid 去试跳，如果间距小于 mid，则去掉那个石头，如果去掉个数超过 k 个，则失败。
bool check(int mid) {
	int cnt = 0;
	int diff = 0;
	for (int i = 1; i <= n+1; ++i) {
		int dis = v[i] - v[i-1] + diff;
		if (dis < mid) {
			cnt++;
			diff = dis;	
			if (cnt > k) return false;
		} else {
			diff = 0;
		}
	}
	return true;
}
int main() {
	scanf("%d%d%d", &ed, &n, &k);
	for (int i = 1; i <= n; ++i) {
		scanf("%d", v+i);
	}
	v[0] = 0; // 起点
	v[n+1] = ed; // 终点
	int left = 1;
	int right = ed;
	int ans = 0;
	while (left <= right) {
		int mid = left + (right-left)/2;
		if (check(mid)) {
			ans = max(ans, mid);
			left = mid + 1;
		} else {
			right = mid - 1;
		}
	}
	printf("%d\n", ans);
	return 0;
}
```

### P1182 数列分段 Section II

二分答案。对目标答案每 mid 分一段，如果分出来的段数 <= m 即为真。

```c++
#include <bits/stdc++.h>
using namespace std;

int n, m, v[100010];
bool check(int mid) {
	int tot = 0;
	int cnt = 0;
	for (int i = 0; i < n; ++i) {
		cnt += v[i];
		if (v[i] > mid) return false;
		if (cnt > mid) {
			tot++;
			cnt = 0; 
			i--;
		}
	}
	if (cnt != 0) tot++;
	if (tot <= m) return true;
	else return false;
}

int main() {
	scanf("%d%d", &n, &m);
	for (int i = 0; i < n; ++i) {
		scanf("%d", v+i);
	}
	int left = 1;
	int right = (int)(1e9 + 1);
	int ans = INT_MAX;
	while (left <= right) {
		int mid = (left+right)/2;
		if (check(mid)) {
			ans = min(ans, mid);
			right = mid - 1;
		} else {
			left = mid + 1;
		}
	}
	cout << ans << endl;
	return 0;
}
```

### [P1258 小车问题](https://www.luogu.com.cn/problem/P1258)

此题也可以列方程，但是也是一道很有技巧的二分答案的题目，适合用来练习二分的使用技巧。

二分答案，需要二分的值与判定的结果有一个单调关系。如果我们假设一开始把甲载到的位置是 C 点，如果简单二分位置 C，那么得到的两人到达的总时长，并不是单调的。

但是，如果我们二分位置 C，但是判断的是甲与乙的时间差 t1-t2，就会发现：随着 C 的值变大，t1-t2 会单调变小。这就形成了一个单调关系。而我们要找的答案，就是 t1-t2 最接近 0 的位置。

所以，我们就可以二分了，每次二分位置 C:
 - 如果 t1-t2 大于零，则可以增大 C，让 left=mid
 - 如果 t1-t2 大于零，则可以减小 C，让 right=mid

这样，C 的值最终会无限趋近于 t1-t2 等于零的位置。

另外，我们可以较容易推算出甲乙分别的用时公式：
 - 甲的总用时 `t1 = 开车时间 c/b + 步行时间 (s-c)/a`
 - 乙的总用时 `t2 = 开车送甲的时间c/b + 相遇问题时间 + 开车时间`
   - 开车送甲的时间: `m1 = c/b`
   - 相遇问题时间: `m2=(c-c/b*a)/(a+b)`
   - 开车时间: `m3= (s-m1*a-m2*a)/b`

那终止条件是什么呢？我们的答案是要求精度达到小数点后 6 位。所以，我们让 t1-t2 的差小于小数点后 7 位即可。为什么是 7 位而不是 6 位呢？因为如果我们只保证他们的差小于小数点后 6 位，那第 7 位就会涉及四舍五入的问题，这样会造成第 6 位输出的时候有影响。

小结一点，这道题比较难想到的有：
 - 二分的单调性函数
 - 终止条件
 - 精度要多求一位

参考代码如下：

```c++
/**            
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

double s, a, b, ans;

double get_t1(double c) {
    return c/b + (s-c)/a;
}

double get_t2(double c) {
    double m1 = c/b;
    double m2 = (c-c/b*a)/(a+b);
    double m3 = (s-m1*a-m2*a)/b;
    return m1+m2+m3;
}

int main() { 
    cin >> s >> a >> b;
    double left = 0;
    double right = s;
    while (left <= right) {
        double mid = left + (right-left)/2;
        double t1 = get_t1(mid);
        double t2 = get_t2(mid);
        double diff = t1 - t2;
        if (diff > 0) {
            left = mid;
            if (diff < 1e-7) {
                ans = t1; break;
            }
        } else {
            right = mid;
        }
    }
    printf("%.6lf\n", ans);
    return 0;
}
```

## 教学思考

因为`lower_bound` 和 `upper_bound`的写法相比传统写法还是有点复杂，在教学中还是适合用最初的那个易懂的版本。易懂的版本虽然执行起来多几次判断，但是在比赛中这一点多的时间并不影响整体的时间复杂度，所以不会因此扣分。同时，简单易于理解的代码，在学习和解题时，也更加不容易犯错。

待学生理解基础二分的写法后，再把系统的实现拿出来，作为增强的补充练习题目。这么补充练习并不是要学生一定掌握，而是借由实现系统的函数，学会在比赛中调用 C++ 的 `lower_bound` 和 `upper_bound` 库函数，这样可以加速解题的速度。

二分答案的思路很好理解，但是实际写起来还是很容易晕，所以需要多加练习。另外利用题目特征来获得提示，帮助自己快速解题。

## 小结

 - `lower_bound` 和 `upper_bound` 都是极简二分查找的 C++ 内部实现。
 - 因为它们都有 side effect，所以在查找目标不存在时，均可能返回首地址和末地址（取决于目标是极小还是极大）。
   - 因为以上的 side effect，所以我们给 `lower_bound` 赋予了额外的功能：返回第一个大于或等于目标值的位置；如果不存在返回 last。
   - `upper_bound` 在目标值极小的时候，返回首地址（正好符合要求）；在目标值极大的时候，返回 last。
 - 因为 `lower_bound` 有可能返回的不是目标值，所以最后要判断一下。

