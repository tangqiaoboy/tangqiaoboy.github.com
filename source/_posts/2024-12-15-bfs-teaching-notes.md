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
| [P1135 奇怪的电梯](https://www.luogu.com.cn/problem/P1135) | BFS 不仅仅可以是在地图上，也可以是另外的搜索形式 |
| [P1162 填涂颜色](https://www.luogu.com.cn/problem/P1162)  | 学习标记技巧：将地图往外扩一圈 0 ，减少标记难度 |
| [P1825 Corn Maze S](https://www.luogu.com.cn/problem/P1825)| 变种的地图，可以传送 |
| [P1451 求细胞数量](https://www.luogu.com.cn/problem/P1451) | 多次的 BFS 标记 |


推荐更多练习的题目如下，可作为**基础训练**之用：

| 题目名      | 说明 |
| ----------- | ----------- |
| [P1746 离开中山路](https://www.luogu.com.cn/problem/P1746) | 比较标准的练习，无坑 |
|[P1506 拯救oibh总部](https://www.luogu.com.cn/problem/P1506) | 强化[P1162 填涂颜色](https://www.luogu.com.cn/problem/P1162) 中学到的标记技巧|
| [P1331 海战](https://www.luogu.com.cn/problem/P1331) | 多次 BFS 标记的同时，如何判断标记物是矩行|

以下题目难度更高一些，可以作为**强化训练**之用：

| 题目名   | 说明 |
| ----------- | ----------- |
| [P2895 Meteor Shower S](https://www.luogu.com.cn/problem/P2895)| USACO 08 FEB |
| [P1141 01迷宫](https://www.luogu.com.cn/problem/P1141) | 数据量很大，需要提前保存查询结果 |
| [P2802 回家](https://www.luogu.com.cn/problem/P2802) | 状态变为走过时的血量有没有变高 |
| [P8604 危险系数](https://www.luogu.com.cn/problem/P8604)| [蓝桥杯 2013 国 C]题目，用 BFS 暴力尝试 |
| [Takahashi is Slime 2](https://atcoder.jp/contests/abc384/tasks/abc384_e) | 变种的 BFS，需要用优先队列 |


# 4、例题代码

以下是详细的例题代码说明。

## B3625 迷宫寻路

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

## 迷宫寻路加强：求步数

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

## 迷宫寻路加强：求路径

当我们需要输出路径的时候，我们需要做两件事情：

1、把 BFS 经过的数据全部保存下来。这个时候我们就不能用队列了，只能用 vector，然后另外用一个变量 idx 来记录处理过的元素下标。于是，判断是否处理完的条件变成了如下的形式：

```c++
while (idx != q.size())
```

2、我们需要对每个元素中增加一个 `parent` 变量，记录它是来自哪一个下标。这样就可以把整个路径串起来。如下的形式：

```c++
struct Node {
	int x, y, step, parent;
	Node(int _x, int _y, int _step, int _parent) {
		x = _x; y = _y; step = _step; parent=_parent;
	}
};
```

最终，整体的代码如下：

```c++
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

struct Node {
	int x, y, step, parent;
	Node(int _x, int _y, int _step, int _parent) {
		x = _x; y = _y; step = _step; parent=_parent;
	}
};

void bfs(int x, int y) {
	bool result = false;
	int tox, toy, step;
	vector<Node> q;
	int idx = 0;
	q.push_back(Node(x, y, 1, -1));
	flag[x][y] = true;
	while (idx != q.size()) {
		Node node = q[idx];
		if (node.x == n-1 && node.y == m-1) {
			result = true;
			// output
			stack<Node> s;
			s.push(node);
			while (node.parent != -1) {
				node = q[node.parent];
				s.push(node);
			}
			while (!s.empty()) {
				node = s.top(); s.pop();
				printf("(%d, %d) ->\n", node.x+1, node.y+1);
			}
			break;
		}
		for (int i = 0; i < 4; ++i) {
			tox = node.x + movex[i];
			toy = node.y + movey[i];
			if (tox >= 0 && tox <n && toy >=0 && toy<m
				&& tu[tox][toy] == '.' 
				&& flag[tox][toy]== false) {
				flag[tox][toy] = true;
				q.push_back(Node(tox, toy, step+1, idx));
			}
		}
		idx++;
	}
	if (!result) printf("No\n");
}

int main() {
	cin >> n >> m;
	for (int i = 0; i < n; ++i) {
		cin >> tu[i];
	}
	bfs(0, 0);
	return 0;
}
/*
3 5
.##.#
.#...
...#.
*/

```

## P1443 马的遍历

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

## P1135 奇怪的电梯

[P1135 奇怪的电梯](https://www.luogu.com.cn/problem/P1135) 一题的意义在于，用非地图的形式来教学 BFS，让学生知道 BFS 不仅仅可以是在地图上。

但从实现来说，此题的难度相对较小。此题的参考代码如下：

```c++
/**
 * P1135 奇怪的电梯
 * 
 * 宽度优先搜索
 */
#include <bits/stdc++.h>
using namespace std;

int N, A, B;
int jump[210];
char flag[210]={0};
int ans = -1;

struct Node {
	int v;
	int step;
};

void bfs() {
	Node node, up, down;
	queue<Node> q;

	if (A == B) {
		ans = 0;
		return ;
	}
	node.v = A;
	node.step = 0;
	q.push(node);
	flag[node.v] = 1;
	while (!q.empty()) {
		up = down = node = q.front(); q.pop();
		
		up.v += jump[node.v];
		down.v -= jump[node.v];
		up.step = down.step = node.step + 1;
		if (up.v <= N && flag[up.v] == 0) {
			q.push(up);
			flag[up.v] = 1;
		} 
		if (down.v >=1 && flag[down.v] ==0 ) {
			q.push( down );
			flag[down.v] = 1;
		} 
		if (up.v == B || down.v == B) {
			ans = node.step + 1;
			break;
		}
	}
}


int main() {
	scanf("%d%d%d", &N, &A, &B);
	for (int i = 0; i < N; ++i) {
		scanf("%d", jump+i+1);
	}
	bfs();
	printf("%d\n", ans);
	return 0;
}

```

## P1162 填涂颜色

[P1162 填涂颜色](https://www.luogu.com.cn/problem/P1162) 可以用来学习地图标记的一个技巧：将地图往外扩一圈 0 ，减少标记难度。实际在写的时候，只需要从下标 1 开始读数据即可。

此题的参考代码如下，代码的最后用注释带了一个测试用例。

```c++
/**
 * P1162 填涂颜色
 */
#include <bits/stdc++.h>
using namespace std;

int n;
int tu[40][40] = {0};
bool flag[40][40] = {false};
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};

void bfs(int x, int y) {
	queue<int> q;
	q.push(x);
	q.push(y);
	flag[x][y] = true;
	
	while (!q.empty()) {
		x = q.front(); q.pop();
		y = q.front(); q.pop();
		for (int i = 0; i < 4; ++i) {
			int tox = x+movex[i];
			int toy = y+movey[i];
			if (tox>=0 && tox<=n+1 && toy >=0 && toy<=n+1
				&& tu[tox][toy] == 0 && flag[tox][toy]==false) {
				q.push(tox);
				q.push(toy);
				flag[tox][toy] = true;
			}
		} 
	}
}

int main() {
	scanf("%d", &n);
	for (int i = 1; i <= n; ++i) {
		for (int j = 1; j <=n; ++j) {
			scanf("%d", &tu[i][j]);
		}
	}

	bfs(0, 0);

	for (int i = 1; i <= n; ++i) {
		for (int j = 1; j <=n; ++j) {
			if (tu[i][j] == 0 && flag[i][j] == false) {
				printf("%d ", 2);
			} else {
				printf("%d ", tu[i][j]);
			}
		}
		printf("\n");
	}

	return 0;
}

/*

6
0 0 0 0 0 0
0 0 1 1 1 1
0 1 1 0 1 0
1 1 0 0 1 1
0 1 0 0 1 1
1 1 1 1 1 0
*/

```

## P1506 拯救oibh总部

[P1506 拯救oibh总部](https://www.luogu.com.cn/problem/P1506) 强化上一题学到的技巧。

同时我们此题学习用 memset 将 char 数组统一设置成字符'0'：

```c++
memset(tu, '0', sizeof(tu));
```

参考代码：

```c++
/**
 * P1506 拯救oibh总部
 */
#include <bits/stdc++.h>
using namespace std;

int n,m;
char tu[510][510]={0};
bool flag[510][510]={false};
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};

void bfs(int x, int y) {
	queue<int> q;
	q.push(x);
	q.push(y);
	flag[x][y] = 1;
	while (!q.empty()) {
		x = q.front(); q.pop();
		y = q.front(); q.pop();
		for (int i = 0; i < 4; ++i) {
			int tox = x + movex[i];
			int toy = y + movey[i];
			if (tox>=0 && tox <=n+1 &&
				toy>=0 && toy <=m+1 &&
				tu[tox][toy] == '0' && 
				flag[tox][toy] == false) {
				flag[tox][toy] = true;
				q.push(tox);
				q.push(toy);
			}
		}
	}
}

int main() {
	memset(tu, '0', sizeof(tu));
	scanf("%d%d", &n, &m);
	for (int i = 1; i <= n; ++i) {
		char ss[510];
		scanf("%s", ss);
		for (int j = 1; j <= m; ++j) {
			tu[i][j] = ss[j-1];
		}
	}
	bfs(0, 0);

	int ans = 0;
	for (int i = 1; i <= n; ++i) {
		for (int j = 1; j <=m; ++j) {
			if (tu[i][j] == '0' && flag[i][j]==false) 
				ans++;
		}
	}
	printf("%d\n", ans);

	return 0;
}
```

## P1825 Corn Maze S

[P1825 Corn Maze S](https://www.luogu.com.cn/problem/P1825) 增加了“地图传送”这种新的玩法，使得 BFS 代码写起来会更加复杂一点。

像这种更复杂的 BFS，我们就可以引入结构体，来让代码更整洁一点。结构体定义如下：

``` c++
struct Node {
	int x, y;
	Node() {x=y=0;}
	Node(int _x, int _y) {x = _x; y=_y;}
};
```

因为在 BFS 的过程中，我们还需要记录步数，所以我们用 STL 的 pair 来存储队列元素。借此题，我们完成了 pair 的教学。

pair 的关键用法如下：

```c++
// 定义
queue<pair<Node, int> > q;
// 入队
q.push(make_pair(a, 0));
// 出队
pair<Node, int> one = q.front(); q.pop();
// 使用
Node a = one.first;
int step = one.second;
```

完整的代码如下：
```c++
/**
 * P1825 [USACO11OPEN] Corn Maze S
 * 宽度优先搜索
 * 
 * 遇到传送的时候，把位置更新到另一个传送点。
 */
#include <bits/stdc++.h>
using namespace std;

int N,M;
char tu[310][310]={0};
bool flag[310][310]={0};
struct Node {
	int x, y;
	Node() {x=y=0;}
	Node(int _x, int _y) {x = _x; y=_y;}
};
Node st;
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};

bool operator==(Node a, Node b) {
	return a.x == b.x && a.y == b.y;
}

Node getNode(char ch) {
	for (int i = 0; i < N; ++i) {
		for (int j = 0; j < M; ++j) {
			if (tu[i][j] == ch) {
				return Node(i,j);
			}
		}
	}
	return Node(0, 0);
}

Node getOtherNode(char ch, int x, int y) {
	for (int i = 0; i < N; ++i) {
		for (int j = 0; j < M; ++j) {
			if (x == i && y == j) continue;
			if (tu[i][j] == ch) {
				return Node(i,j);
			}
		}
	}
	return Node(0, 0);
}

int bfs(Node a) {
	queue<pair<Node, int> > q;
	q.push(make_pair(a, 0));
	flag[a.x][a.y] = true;
	while (!q.empty()) {
		pair<Node, int> one = q.front(); q.pop();
		a = one.first;
		int step = one.second;
		char ch = tu[a.x][a.y];
		if (ch >= 'A' && ch <='Z') {
			a = getOtherNode(ch, a.x, a.y);
		} else if (ch == '=') {
			return step;
		}
		for (int i = 0; i < 4; ++i) {
			int tox = a.x + movex[i];
			int toy = a.y + movey[i];
			if (tox>=0 && tox<N && toy>=0 && toy<M &&
				tu[tox][toy] != '#' && !flag[tox][toy]) {
				q.push(make_pair(Node(tox, toy), step+1));
				flag[tox][toy] = true;
			}
		}
	}
	return 0;
}

int main() {
	scanf("%d%d", &N, &M);
	for (int i = 0; i < N; ++i) {
		scanf("%s", tu[i]);
	}
	Node st = getNode('@');
	printf("%d\n", bfs(st));
	return 0;
}

```

## P1451 求细胞数量

[P1451 求细胞数量](https://www.luogu.com.cn/problem/P1451) 是一道非常基础的 BFS 题目。此题需要多次调用 BFS，参考代码如下：

```c++
/**
 * P1451 求细胞数量
 */
#include <bits/stdc++.h>
using namespace std;

int n, m, ans = 0;
char tu[110][110]={0};
bool flag[110][110]={false};
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};
	
void bfs(int x, int y) {
	queue<int> q;

	q.push(x);
	q.push(y);
	flag[x][y] = true;
	
	while (!q.empty()) {
		x = q.front(); q.pop();
		y = q.front(); q.pop();

		for (int i = 0; i < 4; ++i) {
			int tox = x + movex[i];
			int toy = y + movey[i];
			if (tox >= 0 && tox < n &&
				toy >= 0 && toy < m && 
				tu[tox][toy]!='0' &&
				flag[tox][toy]==false) {
				flag[tox][toy] = true;
				q.push(tox);
				q.push(toy);
			}
		}
	}
}

int main() {
	scanf("%d%d", &n, &m);
	for (int i = 0; i < n; ++i) {
		scanf("%s", tu[i]);
	}
	for (int i = 0; i < n; ++i) {
		for (int j = 0; j < m; ++j) {
			if (tu[i][j] != '0' && flag[i][j] == false) {
				bfs(i, j);
				ans++;
			}
		}
	}
	printf("%d\n", ans);
	return 0;
}

```

## P1331 海战

[P1331 海战](https://www.luogu.com.cn/problem/P1331) 一题的标记矩形的形式比较难想到，我个人用的是另外一个判断方法：看看所填充的坐标最小和最大值计算出来的矩形面积与标记的数量是否刚好匹配。

参考代码如下：

```c++
/**
 * 宽度优先搜索。
 * 
 * 先用 floodfill 把每组船支标记。标记的时候，记录：
 *  - 最小 minx, miny 和最大 maxx, maxy
 * 然后判断是否标记的船只数量是否是正方形：
 *  - cnt == (maxx-minx+1)*(maxy-miny+1)
 * 
 */
#include <bits/stdc++.h>
using namespace std;

int R, C;
char tu[1100][1100] = {0};
bool flag[1100][1100] = {false};
int shipCnt = 0;
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};
bool debug = false;

bool mark(int x, int y) {
	int ans = 0;
	int minx, miny, maxx, maxy;
	queue<int> q;

	q.push(x);
	q.push(y);
	minx = maxx = x;
	miny = maxy = y;
	flag[x][y] = true;
	
	while (!q.empty()) {
		x = q.front(); q.pop();
		y = q.front(); q.pop();
		ans++;
		minx = min(minx, x);
		miny = min(miny, y);
		maxx = max(maxx, x);
		maxy = max(maxy, y);
		for (int i = 0; i < 4; ++i) {
			int tox = x + movex[i];
			int toy = y + movey[i];
			if (tox >=0 && tox < R && toy>=0 && toy<C
				&& tu[tox][toy] == '#' && !flag[tox][toy]) {
				q.push(tox);
				q.push(toy);
				flag[tox][toy] = true;
			}
		}
	}
	int cnt = (maxx-minx+1)*(maxy-miny+1);
	if (ans == cnt) {
		shipCnt++;
		return true;
	} else {
		return false;
	}
}

void init() {
	scanf("%d%d", &R, &C);
	for (int i = 0; i < R; ++i) {
		scanf("%s", tu[i]);
	}
}

void process() {
	for (int i = 0; i < R; ++i) {
		for (int j = 0; j < C; ++j) {
			if (tu[i][j] == '#' && flag[i][j] == false) {
				if (!mark(i, j)) {
					shipCnt = -1;
					return;
				}
			}
		}
	}
}

int main() {
	init();
	process();
	if (shipCnt == -1) printf("Bad placement.\n");
	else printf("There are %d ships.\n", shipCnt);
	return 0;
}
/*
6 8
.....#.#
##.....#
##.....#
.......#
##.....#
#..#...#
*/

```

## [P2895 Meteor Shower S](https://www.luogu.com.cn/problem/P2895)

此题解法：
 - 标记下地图每个不能行走的位置，以及它变成焦土的时间。
 - 在 BFS 的时候，如果当前时间位置还没变成焦土，就可以继续走。

陷阱：有第 0 时刻就落下来的流星。

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int m;
// -1 表示可以行走，非 -1 表示在第 i 时刻变成焦土
int tu[310][310];
bool vis[310][310];
int movex[] = {0, 0, 0, 1, -1};
int movey[] = {0, 1, -1, 0, 0};
struct Node {
    int x, y, t;
    Node(int _x, int _y, int _t) : x(_x), y(_y), t(_t) {}
};

void mark(int x, int y, int t) {
    for (int i = 0; i < 5; i++) {
        int nx = x + movex[i];
        int ny = y + movey[i];
        if (nx >= 0 && ny >= 0) {
            if (tu[nx][ny] == -1) tu[nx][ny] = t;
            else tu[nx][ny] = min(tu[nx][ny], t);
        }
    }
}

void bfs() {
    queue<Node> q;
    q.push(Node(0, 0, 0));
    vis[0][0] = true;
    while (!q.empty()) {
        Node node = q.front();
        q.pop();
        if (tu[node.x][node.y] == -1) {
            cout << node.t << endl;
            return;
        }
        for (int i = 1; i < 5; i++) {
            int nx = node.x + movex[i];
            int ny = node.y + movey[i];
            if (nx >= 0 && ny >= 0 && !vis[nx][ny]) {
                if (tu[nx][ny] == -1) {
                    cout << node.t + 1 << endl;
                    return;
                }
                if (tu[nx][ny] > node.t + 1) {
                    vis[nx][ny] = true;
                    q.push(Node(nx, ny, node.t + 1));
                }
            }
        }
    }
    cout << -1 << endl;
}

int main() {
    memset(tu, -1, sizeof(tu));
    cin >> m;
    for (int i = 0; i < m; i++) {
        int x, y, t;
        cin >> x >> y >> t;
        mark(x, y, t);
    }
    bfs();
    
	return 0;
}
```

## P1141 01迷宫

[P1141 01迷宫](https://www.luogu.com.cn/problem/P1141) 这道题的难度在于，我们需要 BFS  之后，把结果全部保存下来，之后每次查询的时候把答案直接输出就可以了。

参考代码：

```c++
/**
 * 此题 m 的量很大，所以要提前算出答案。
 */
#include <bits/stdc++.h>
using namespace std;

int n, m;
char tu[1100][1100];
int flag[1100][1100];
vector<int> ans;
int movex[]={1,-1,0,0};
int movey[]={0,0,-1,1};
bool debug=true;

char convert(char ch) {
	if (ch == '0') return '1';
	else return '0';
}

int mark(int x, int y, int v) {
	int cnt = 0;
	queue<pair<int,int> > q;
	q.push(make_pair(x, y));
	cnt++;
	flag[x][y] = v;
	while (!q.empty()) {
		pair<int, int> a = q.front(); q.pop();
		x = a.first;
		y = a.second;
		char ch = convert(tu[x][y]);
		for (int i = 0; i < 4; ++i) {
			int tox = x + movex[i];
			int toy = y + movey[i];
			if (tox >=0 && toy >=0 && tox <n && toy<n 
				&&tu[tox][toy]==ch
				&&flag[tox][toy]==-1) {
				q.push(make_pair(tox, toy));
				cnt++;
				flag[tox][toy] = v;
			}
		}
	}
	return cnt;
}

void process() {
	for (int i = 0; i < n; ++i) {
		for (int j = 0; j < n; ++j){
			flag[i][j] = -1;
		}
	}
	int idx = 0;
	for (int i = 0; i < n; ++i) {
		for (int j = 0; j < n; ++j) {
			if (flag[i][j] == -1) {
				// 标记 idx 
				int cnt = mark(i, j, idx);
				// 把标为 idx 的个数放到 ans 数组中
				ans.push_back(cnt);
				idx++;
			}
		}
	}
}

int main() {
	scanf("%d%d", &n, &m);
	for (int i = 0; i < n; ++i) {
		scanf("%s", tu[i]);
	}
	process();
	for (int i = 0; i < m; ++i) {
		int x, y;
		scanf("%d%d", &x, &y);
		int idx = flag[x-1][y-1];
		printf("%d\n", ans[idx]);
	}
	return 0;
}

```

## P1746 离开中山路

[P1746 离开中山路](https://www.luogu.com.cn/problem/P1746)参考代码如下：

```c++
/**
 * P1746 离开中山路
 */
#include <bits/stdc++.h>
using namespace std;

int n;
char tu[1100][1100]={0};
char flag[1100][1100]={0};
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};
int fx, fy, tx, ty;

int bfs(int x, int y, int step) {
	queue<int> q;
	q.push(x); q.push(y); q.push(step);
	flag[x][y] = 1;
	while (!q.empty()) {
		x = q.front(); q.pop();
		y = q.front(); q.pop();
		step = q.front(); q.pop();
		if (x == tx-1 && y == ty-1) return step;
		for (int i = 0; i < 4; ++i) {
			int tox = x+movex[i];
			int toy = y+movey[i];
			if (tox >= 0 && tox <n &&
				toy >= 0 && toy <n &&
				tu[tox][toy]=='0' &&
				flag[tox][toy]==0) {
				flag[tox][toy] = 1;
				q.push(tox); q.push(toy); q.push(step+1);
			}
		}
	}
	return -1;
}

int main() {
	scanf("%d", &n);
	for (int i = 0; i < n; ++i) {
		scanf("%s", tu[i]);
	}
	scanf("%d%d%d%d", &fx, &fy, &tx, &ty);
	int ans = bfs(fx-1, fy-1, 0);
	printf("%d\n", ans);
	return 0;
}

```

## P2802 回家

[P2802 回家](https://www.luogu.com.cn/problem/P2802)一题的解题技巧是：将 flag 数组用于保存走上去时的最大血量。如果走上去最大血量可以更高，也是可以再次走的。

另外，当只剩 1 格血时，下一步不管走到哪儿都是死，所以就不用扩展了。

参考代码如下：

```c++
/**
 * P2802 回家
 */
#include <bits/stdc++.h>
using namespace std;

int n,m;
int tu[15][15];
char flag[15][15]={0};
int sx, sy, tx, ty;
int movex[]={-1,1,0,0};
int movey[]={0,0,-1,1};

struct Node {
	int x, y, s, t;
	Node(int _x, int _y, int _s, int _t) {
		x = _x; y=_y; s=_s; t=_t;
	}
};

int bfs(int x, int y) {
	queue<Node> q;
	q.push(Node(x, y, 0, 6));
	flag[x][y] = 6;
	while (!q.empty()) {
		Node node = q.front(); q.pop();
		if (node.x == tx && node.y == ty) {
			return node.s;
		}
		// 如果没到终点，只剩 1 点血，怎么都死
		if (node.t == 1) continue;
		for (int i = 0; i < 4; ++i) {
			int tox = node.x + movex[i];
			int toy = node.y + movey[i];
			if (tox >= 0 && tox < n &&
				toy >= 0 && toy < m && 
				tu[tox][toy] != 0 &&
				flag[tox][toy] < node.t - 1) {
				flag[tox][toy] = node.t -1;
				int life = node.t - 1;
				if (tu[tox][toy] == 4) {
					life = 6;
				}
				q.push(Node(tox, toy, node.s+1, life));
			}
		}
	}
	return -1;
}

int main() {
	scanf("%d%d", &n, &m);
	for (int i = 0; i < n; ++i) {
		for (int j = 0; j < m; ++j) {
			scanf("%d", &tu[i][j]);
			if (tu[i][j] == 2) { sx = i; sy = j; }
			if (tu[i][j] == 3) { tx = i; ty = j; }
		}
	}
	int ans = bfs(sx, sy);
	printf("%d\n", ans);

	return 0;
}
```


