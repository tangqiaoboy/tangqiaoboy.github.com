---
title: CSPJ 教学思考：宽度优先搜索
date: 2024-12-15 16:54:30
tags: cspj
---

在学习完数据结构队列(queue)后，就可以让学生学习宽度优先搜索了。

宽度优先搜索（BFS）的形式相对固定，但是写起来代码偏长，学生在学习的时候，老是容易忘掉一些环节，所以需要加强练习。

# 1、模版记忆

我整理了一个 BFS 的模版，每次教学前让孩子复述这个环节，通过这种方式来强化模版的记忆，帮助学生掌握这个算法。

模版如下：

``` c++
void bfs() {
	queue< ? > q;

	q.push( ? );
	标记 ? 已经处理
	
	while (!q.empty()) {
		? = q.front(); q.pop();

		for(各种情况) {
		  if (可入队) {
			q.push( ? )
			标记 ? 已经处理
		  }
		} 
	}
}
```

# 2、关于结构体的使用

在教学宽度优先搜索的初期，其实并不需要将入队的数据整合成结构体。这样反而会让代码变得更复杂。可以直接将需要入队的数据成组地 push 和 pop，这样就实现了简易的类似结构体的效果。

# 3、教学题目 

推荐的教学题目如下：

| 题目名      | 说明 |
| ----------- | ----------- |
| [B3625 迷宫寻路](https://www.luogu.com.cn/problem/B3625)      | 新手入门，没有陷阱，学习方向数组写法       |
| [P1443 马的遍历](https://www.luogu.com.cn/problem/P1443)   | 需要求步数，需要写 8 个方向        |
| [P1135 奇怪的电梯](https://www.luogu.com.cn/problem/P1135) | 让学生知道，BFS 不仅仅可以是在地图上，也可以是另外的搜索形式 |
| [P1162 填涂颜色](https://www.luogu.com.cn/problem/P1162)  | 此题可以用来学习地图标记的一个技巧：将地图往外扩一圈 0 ，减少标记难度 |
| [P1825 Corn Maze S](https://www.luogu.com.cn/problem/P1825)| 变种的地图，可以传送 |
| [P1331 海战](https://www.luogu.com.cn/problem/P1331) | 此题在多次 BFS 标记的同时，还增加了一个思考点：如何判断标记物是矩行|


以下题目难度高很多，可以作为强化训练之用。

| 题目名   | 说明 |
| ----------- | ----------- |
| [P1141 01迷宫](https://www.luogu.com.cn/problem/P1141) | 数据量很大，需要提前保存查询结果 |
| [Takahashi is Slime 2](https://atcoder.jp/contests/abc384/tasks/abc384_e) | 变种的 BFS，需要用优先队列 |

以下是详细的说明。

## 迷宫寻路

[B3625 迷宫寻路](https://www.luogu.com.cn/problem/B3625) 是一道非常基础的宽度优先搜索，只需要输出 YES 或者 NO，对输出的要求也较小，适合拿来入门教学。

在本例题中，我们也要开始教会学生定义 movex、movey 数组，后续在迷宫一类的宽度搜索题目中，这种技巧非常见。movex、movey 的快速定义技巧是：movex 和 movey 的结构交替，每一组都是一个 1 和一个 0，同时变换 1 的正负号。记住这样的技巧就可以快速定义出这两个数组。代码如下：

``` c++
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};
```
本例还需要一个数组标记是否走过，我们使用 flag 数组。参考代码如下：

``` c++
/**
 * B3625 迷宫寻路，宽度优先搜索。
 */
#include <bits/stdc++.h>
using namespace std;

int n, m;
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};
char tu[110][110];
bool flag[110][110] = {false};

void bfs(int x, int y) {
	bool result = false;
	int tox, toy;
	queue<int> q;
	q.push(x); q.push(y);
	flag[x][y] = true;
	while (!q.empty()) {
		x = q.front(); q.pop();
		y = q.front(); q.pop();
		if (x == n-1 && y == m-1) {
			result = true;
			break;
		}
		for (int i = 0; i < 4; ++i) {
			tox = x + movex[i];
			toy = y + movey[i];
			if (tox >= 0 && tox <n && toy >=0 && toy<m
				&& tu[tox][toy] == '.' 
				&& flag[tox][toy]== false) {
				flag[tox][toy] = true;
				q.push(tox); q.push(toy);
			}
		}
	}
	if (result) cout << "Yes" << endl;
	else cout << "No" << endl;
}

int main() {
	cin >> n >> m;
	for (int i = 0; i < n; ++i) {
		cin >> tu[i];
	}
	bfs(0, 0);
	return 0;
}
```
## 迷宫寻路 加强

有了上面的代码，我们可以在题目上做变动，比如把输出的要求改为：
**如果能到达，则输出到达终点的最短步数** ，引导学生思考，现有的代码要做怎样的改造，才能实现新的要求。

于是，我们讨论得出，需要将"步数"引入到代码中，于是，原来的代码增加了两处修改：
 - 每次入队的时候，将当前位置到达的步数也入队
 - 如果到达终点，记录下来当时的步数

改动的代码如下：
``` c++
/**
 * B3625 迷宫寻路，宽度优先搜索。
 */
#include <bits/stdc++.h>
using namespace std;

int n, m, ans;
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};
char tu[110][110];
bool flag[110][110] = {false};

void bfs(int x, int y) {
	bool result = false;
	int tox, toy, step;
	queue<int> q;
	q.push(x); q.push(y); 
	q.push(1); // 改动 1
	flag[x][y] = true;
	while (!q.empty()) {
		x = q.front(); q.pop();
		y = q.front(); q.pop();
		step = q.front(); q.pop();  // 改动 2
		if (x == n-1 && y == m-1) {
			result = true;
			ans = step;  // 改动 3
			break;
		}
		for (int i = 0; i < 4; ++i) {
			tox = x + movex[i];
			toy = y + movey[i];
			if (tox >= 0 && tox <n && toy >=0 && toy<m
				&& tu[tox][toy] == '.' 
				&& flag[tox][toy]== false) {
				flag[tox][toy] = true;
				q.push(tox); q.push(toy); 
				q.push(step+1);  // 改动 4
			}
		}
	}
	if (result) cout << "Yes, step = " << ans << endl;
	else cout << "No" << endl;
}

int main() {
	cin >> n >> m;
	for (int i = 0; i < n; ++i) {
		cin >> tu[i];
	}
	bfs(0, 0);
	return 0;
}

```
## 马的遍历

有了迷宫寻路的变种练习基础，我们就可以正式练习用 BFS 来求最近的步数一类的题目了。这其中比较适合的题目是： [P1443 马的遍历](https://www.luogu.com.cn/problem/P1443)。

《马的遍历》一题要求我们把所有位置的最近距离都求出来，我们可以用一个数组来保存结果。

同时，马可以跳 8 个方向，有了之前的建 movex, movey 的经验，我们知道，每组数是 1 与 2 的各种组合。于是可以快速写出来这两个方向数组。

具体写法是：
 - 先写 x 数组，把所有的负数写出来，再写所有的正数。
 - 考虑到每个数会有正负两个 y 与此搭档，所以每个数我们写两遍。这样就写出来了 `-2,-2,-1,-1,1,1,2,2`
 - 然后我们对着 movex 写 movey，凡是对应的 movex 是 2 的，我们就写 1，凡是 movex 是 1的，我们就写 2，同样的我们需要写正数和负数两遍。
 - 写完后两个数组的字符串也应该是刚好一样的，可以帮我们作为一个检查手段。

具体如下所示：
``` c++
int movex[]={-2,-2,-1,-1,1,1,2,2};
int movey[]={-1,1,2,-2,2,-2,1,-1};
```
完整的《马的遍历》的代码如下：

``` c++
/**
 * P1443 马的遍历, 宽度优先搜索
 */
#include <bits/stdc++.h>
using namespace std;

// 坐标是从 1,1 开始算的
int n, m, x, y;
int tu[410][410];
bool flag[410][410]={false};
int movex[]={-2,-2,-1,-1,1,1,2,2};
int movey[]={-1,1,2,-2,2,-2,1,-1};

void bfs(int x, int y) {
	queue<int> q;

	q.push(x); q.push(y); q.push(0);
	tu[x][y] = 0;
	flag[x][y] = true;
	
	while (!q.empty()) {
		x = q.front(); q.pop();
		y = q.front(); q.pop();
		int step = q.front(); q.pop();
		for (int i = 0; i < 8; ++i) {
			int tox = x + movex[i];
			int toy = y + movey[i];
			if (tox>=1 && tox<=n && toy>=1 && toy<=m &&
				!flag[tox][toy]){
				flag[tox][toy] = true;
				q.push(tox); q.push(toy); q.push(step+1);
				tu[tox][toy] = step+1;
			}
		}
	}
}

int main() {
	memset(tu, -1, sizeof(tu));
	cin>>n>>m>>x>>y;
	bfs(x, y);
	for (int i = 1; i <=n ; ++i) {
		for (int j = 1; j<=m; ++j) {
			printf("%d ", tu[i][j]);
		}
		printf("\n");
	}
	return 0;
}
```
本题还有一个小的教学点，就是用 memset 来初始化值为 -1。可以顺便教学 memset 可以初使化的值，告诉学生不是每种值都可以用 memset 来初始化。


