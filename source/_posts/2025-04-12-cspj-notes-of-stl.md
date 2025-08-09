---
title: CSPJ 教学总结：STL
date: 2025-04-12 22:00:46
tags: cspj
---

STL 库是 C++ 语言的标准库，我们在比赛中主要用到的有如下内容。

## [string 类](https://zh.cppreference.com/w/cpp/string/basic_string)
 - substr
 - find
 - replace
 - insert
 - erase
 - c_str


## [容器](https://zh.cppreference.com/w/cpp/container)

 - pair
 - vector
 - deque
 - list
 - stack
 - queue
 - priority_queue
 - map
 - unordered_map
 - set
 - unordered_set

## [算法库](https://zh.cppreference.com/w/cpp/algorithm)

| 函数      | 调用示意 |  说明 |
| ----------- |----------- | ----------- |
| sort      | `sort(v.begin(), v.end())`       | 快速排序 |
| stable_sort   | `stable_sort(v.begin(), v.end())`  | 稳定排序 |
| [unique](https://zh.cppreference.com/w/cpp/algorithm/unique) |`unique(v.begin(), v.end())` | 去重，返回的是去重后的元素末地址。可以结合 erase 函数来把多余数据删除。参考代码：`v.erase(unique(v.begin(), v.end()), v.end());` |
| next_permutation | `next_permutation(v, v+n)` | 返回全排列的下一个值，当没有下一个排列时，函数返回 false |
| prev_permutation| `prev_permutation(v, v+n)` | 返回全排列的上一个值，当没有上一个排列时，函数返回 false|
| nth_element | `nth_element(v.begin(), v.begin() + k, v.end()),`| 函数执行后，v.begin()+k 位置的数为排序后的最终位置，即左边的数都小于它，后面的数都大于它 |
| lower_bounds | `lower_bounds(v, v+n, a)` | 查找大于或等于 a 的第一个位置，如果没找到则返回 end() |
| upper_bounds | `upper_bounds(v, v+n, a)` | 查找大于 a 第一个位置，如果没找到则返回 end() |
| [equal_range](https://en.cppreference.com/w/cpp/algorithm/equal_range) | `equal_range(v, v+n, a)` | equal_range 返回一个 pair，`first` 元素是查找到的匹配 a 值的左边界，`second` 元素是匹配到的 a 值的右边界，边界为左闭右开原则。当 `first == second` 的时候，相当于没找到目标值 |
| \_\_gcd | `__gcd(a, b)` | 返回 a 和 b 的最大公约数 |
| reverse | `reverse(v.begin(), v.end())`| 将原序列逆序 |
|min_element |`min_element(v.begin(), v.end())` |返回的是地址，如果想要值，可以用 `*` 获得对应下标的值，如果想获得下标，可以让它减去 v.begin() |
|max_element |`max_element(v.begin(), v.end())` | 返回的是地址，如果想要值，可以用 `*` 获得对应下标的值，如果想获得下标，可以让它减去 v.begin() |
|accumulate |`accumulate(v.begin(), v.end(), 0);` | 第三个参数是初始值 |

## 练习

| 题号      | 说明 |
| ----------- | ----------- |
| [P1996 约瑟夫问题](https://www.luogu.com.cn/problem/P1996) | 适合用 list       |
| [P3613 寄包柜](https://www.luogu.com.cn/problem/P3613)   | 适合用 map 和 pair        |
| [P4387 验证栈序列](https://www.luogu.com.cn/problem/P4387)   |适合用 stack        |
| [P1540 机器翻译](https://www.luogu.com.cn/problem/P1540)   | NOIP 2010 提高组，适合用 vector 以及 STL 的 find 算法        |
| [P1449 后缀表达式](https://www.luogu.com.cn/problem/P1449) |适合练习 stack         |
| [P2058 海港](https://www.luogu.com.cn/problem/P2058)| NOIP 2016 普及组，练习桶和队列 |
| [P2234 营业额统计](https://www.luogu.com.cn/problem/P2234)  | 练习 set 和 `lower_bound` 函数|
| [P4305 不重复数字](https://www.luogu.com.cn/problem/P4305)| 可以练习 `unordered_map` 以及对比 cin 和 scanf 的速度差别 |
| [P1571 眼红的Medusa](https://www.luogu.com.cn/problem/P1571) | 练习 map 或 set |


### [P4387 验证栈序列](https://www.luogu.com.cn/problem/P4387)

解法：把 A 数组中的元素住栈里面 push，然后如果栈顶元素和 B 数组的当前元素相同，就 pop，同时 B 数组的当前元素后移。

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int t, n, a[100010], b[100010];

int main() {
	ios::sync_with_stdio(false);
	cin >> t;
	while (t--) {
		cin >> n;
		for (int i = 0; i < n; ++i) 
			cin >> a[i];
		for (int i = 0; i < n; ++i) 
			cin >> b[i];
		stack<int> q;
		int idx = 0;
		for (int i = 0; i < n; ++i) {
			q.push(a[i]);
			while (!q.empty() && q.top() == b[idx]) {
				q.pop();
				idx++;
			}
		}
		if (q.empty()) cout << "Yes" << endl;
		else cout << "No" << endl;
	}
	return 0;
}
```

### [P1540 机器翻译](https://www.luogu.com.cn/problem/P1540)

参考代码：

```c++
#include <bits/stdc++.h>
using namespace std;

int main() {
	ios::sync_with_stdio(false);
	int m, n, t, ans = 0;
	cin >> m >> n;
	vector<int> v; 
	while (cin >> t) {
		if (find(v.begin(), v.end(), t) == v.end()) { // 如果不在内存中
			v.push_back(t); 
			++ans;
		}
		if (v.size() > m) 
			v.erase(v.begin());
	}
	cout << ans << endl;
}
```


### [P1449 后缀表达式](https://www.luogu.com.cn/problem/P1449) 

表达式计算:

 - 不停读入。
 - 如果读到数字，就和之前的数字拼接：`a = a * 10 + ch - '0'`
 - 如果读到 `.` 就压栈
 - 如果读到运算符，就出栈两个数进行运算，结果再压栈
 - 如果读到 `@` 结束

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

stack<int> s;
int a, v1, v2;

int main() {
	char ch;
	while (cin >> ch) {
		if (ch == '@') break;
		if (ch >= '0' &&  ch <='9') {
			a = a*10 + ch - '0';
		} else if (ch == '.') {
			s.push(a);
			a = 0;
		} else if (ch == '+') {
			v1 = s.top(); s.pop(); v2 = s.top(); s.pop();
			s.push(v1 + v2);
		} else if (ch == '-') {
			v1 = s.top(); s.pop(); v2 = s.top(); s.pop();
			s.push(v2 - v1);
		} else if (ch == '*') {
			v1 = s.top(); s.pop(); v2 = s.top(); s.pop();
			s.push(v1 * v2);
		} else if (ch == '/') {
			v1 = s.top(); s.pop(); v2 = s.top(); s.pop();
			s.push(v2 / v1);
		}
	}
	cout << s.top() << endl;
	return 0;
}
```

### [P2058 海港](https://www.luogu.com.cn/problem/P2058)

解法：用一个队列记录所有 24 小时内的船。用一个桶记录每个国家的乘客数量。
 - 每次有新船入队列的时候，更新桶。如果桶更新前是 0，则 `ans++`
 - 每次新船入队列后，检查最早的队列，如果超24 小时，则出队
 - 出队的时候，更新桶，如果桶的数量减为 0，则 `ans--`

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

struct Node {
	int t;
	int len;
	vector<int> v;
};

// 桶，记录每个国家的乘客数量
int cnt[100010], n, t, ans;
// 队列
queue<Node> q;

int main() {
	ios::sync_with_stdio(false);
	cin >> n;
	for (int i = 0; i < n; ++i) {
		Node a;
		cin >> a.t >> a.len;
		a.v.resize(a.len);
		for (int j = 0; j < a.len; ++j) {
			cin >> a.v[j];
			if (cnt[a.v[j]] == 0) ans++;
			cnt[a.v[j]]++;
		}
		q.push(a);
		int min_t = a.t - 86400;
		// 检查出列
		a = q.front();
		while (a.t <= min_t) {
			for (int j = 0; j < a.len; ++j) {
				cnt[a.v[j]]--;
				if (cnt[a.v[j]] == 0) ans--;
			}
			q.pop();
			a = q.front();
		}
		cout << ans << endl;
	}
	return 0;
}
```

### [P2234 营业额统计](https://www.luogu.com.cn/problem/P2234) 

把营业额往 set 里面放，这样数据就是有序的。然后用 `lower_bound` 查找大于等于 x 的值。
 - 如果找到了，那么波动就是 0
 - 如果没找到，比较当前位置和上一个位置与 x 的差，取较小那个；同时插入 x

取上一个位置的时候要处理一下边界，如果是在 `s.begin()`位置的话就不用处理了。

取当前位置的时候要处理一下，看看是不是在 `s.end()`。

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

set<int> s;
int n, x, ans;
bool debug = false;

int main() {
	ios::sync_with_stdio(false);
	cin >> n;
	cin >> x;
	ans = x;
	s.insert(x);
	for (int i = 1; i < n; ++i) {
		cin >> x;
		set<int>::iterator it;
		it = s.lower_bound(x);
		if (it != s.end() && *it == x) {
			continue;
		} else {
			int diff = INT_MAX;
			if (it != s.end()) {
				diff = min(diff, abs(*it-x));
			}
			if (it != s.begin()) {
				it--;
				diff = min(diff, abs(*it-x));
			}
			ans += diff;
			s.insert(x);
		}
	}
	cout << ans << endl;
	return 0;
}
```