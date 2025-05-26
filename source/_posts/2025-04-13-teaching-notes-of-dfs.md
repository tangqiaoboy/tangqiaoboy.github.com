---
title: CSPJ 教学总结：深度优先搜索（DFS）
date: 2025-04-13 15:27:30
tags: cspj
---

深度优先搜索（DFS）是学生学习算法的第一道门槛，因为它的主要形式是递归。而递归中需要将搜索的相关信息通过参数传递，这一点需要学生深刻理解 DFS。

## 模版

DFS 有比较标准的模版，如下所示：

```c++
void dfs(int pt) // pt 表示层数
{
	if (终止条件) {
		// 处理
		return;
	}
	for (枚举这个层的所有可选项) {
		if（这个选项是合法的）{
	        标记这个选项（保存现场）
			dfs(pt+1); 
	        取消标记（恢复现场）
        }
	}
}
```

我们将运用该模版，完成后面的题目。

## 递归的深度

递归的时候，程序会占用栈空间来保存函数的环境变量。根据编译器以及编辑参数的不同，栈空间的大小也不同。通常情况下，竞赛中的编译器设定的栈空间为 8M 或者 16M。

假如，我们在一个递归函数中使用了 10 个 int 变量，那么每个递归函数就需要 `4*10=40`字节的栈空间。8M 一共可以支持 `8*1000*1000/40=200000`层调用。考虑到栈空间还需要保存当前函数执行的地址等变量，可供支持的调用层数会更小一点。

同学们也可以做如下的递归函数栈空间的测试：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int dfs(int x) {
    int test[9] = {0};
    cout << x << endl;
    dfs(x + 1);
    return 0;
}

int main() {
    dfs(0);
	return 0;
}
```

在我的本地，以上程序调用了约 13 万次后栈溢出。为了保险，我们在比赛中如果调用深度小于 1 万层，那应该是稳妥的；否则我们需要考虑是否用别的解法来解题。

## 教学和练习题目

| 题目名      | 说明 |
| ----------- | ----------- |
| [P1036 选数](https://www.luogu.com.cn/problem/P1036) | NOIP 2002 普及组 |
| [P1219 八皇后 Checker Challenge](https://www.luogu.com.cn/problem/P1219)| USACO 1.5 |
| [P1596 Lake Counting S](https://www.luogu.com.cn/problem/P1596) | USACO10OCT |
| [P2036 PERKET](https://www.luogu.com.cn/problem/P2036) | COCI 2008/2009 #2  |
| [P12139 黑白棋](https://www.luogu.com.cn/problem/P12139)| 蓝桥杯 2025 省 A，写起来较繁琐 |
| [P1605 迷宫](https://www.luogu.com.cn/problem/P1605) | 标准的 DFS |
| [P2404 自然数的拆分问题](https://www.luogu.com.cn/problem/P2404) | |
| [P1019 单词接龙](https://www.luogu.com.cn/problem/P1019) | NOIP 2000 提高组 |
| | |

P7200
P10483

### [P1219 八皇后 Checker Challenge](https://www.luogu.com.cn/problem/P1219)

这是八皇后的变种，N 皇后问题。可以作为基础练习。具体解法是：

 - 我们用变量 `v[15]` 表示每个皇后的列值。
 - 对于新放入的皇后，我们依次检查它与前面的皇后是否在一条斜线上。检查方法是看其“横坐标差”与“纵坐标差”是否相同。检查函数如下：

```c++
bool check(int pt) {
    for (int i = 0; i < pt; i++) {
        if (abs(v[i] - v[pt]) == abs(i - pt)) return false;
    }
    return true;
}
```

完整的代码如下：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n;
int v[15], ans;
bool flag[15];

bool check(int pt) {
    for (int i = 0; i < pt; i++) {
        if (abs(v[i] - v[pt]) == abs(i - pt)) return false;
    }
    return true;
}

void dfs(int pt) {
    if (pt == n) {
        ans++;
        if (ans <= 3) {
            for (int i = 0; i < n; i++) {
                cout << v[i] << " ";
            }
            cout << endl;
        }
        return;
    }
    for (int i = 1; i <= n; i++) {
        if (flag[i]==false) {
            flag[i] = true;
            v[pt] = i;
            if (check(pt)) dfs(pt + 1);
            flag[i] = false;
        }
    }
    
}

int main() {
    cin >> n;
    dfs(0);
    cout << ans << endl;
	return 0;
}
```

### [P1036 选数](https://www.luogu.com.cn/problem/P1036)

此题需要从小到大取数求和，然后再判断是否是素数。用递归的方式来进行枚举。

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, k, tot, ans;
int a[22], p[22];

bool isPrime(int v) {
    for (int i = 2; i*i <= v; ++i) {
        if (v%i == 0) {
            return false;
        }
    }
    return true;
}

void dfs(int pt) {
    if (pt == k+1) {
        if (isPrime(tot)) {
            ans++;
        }
    } else {
        // 每一层都必须取比前一层更大的下标，防止重复取
        for (int i = p[pt-1]+1; i <= n; ++i) {
            p[pt] = i;
            tot += a[i];
            dfs(pt+1);
            tot -= a[i];
        }
    }
}

int main() {
    cin >> n >> k;
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
    }
    dfs(1);
    cout << ans << endl;
    return 0;
}
```

### [P1596 Lake Counting S](https://www.luogu.com.cn/problem/P1596)

此题既可以用 DFS，也可以用 BFS。考虑到 N 和 M 最大值为 100，所以递归的层次最多为 1 万层，所以我们可以试试 DFS。

以下是参考代码：

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;
int n, m;
char tu[105][105];
int ans;
int movex[8] = {0, 0, 1, -1, 1, 1, -1, -1};
int movey[8] = {1, -1, 0, 0, 1, -1, 1, -1};

void dfs(int x, int y) {
    tu[x][y] = '.';
    for (int i = 0; i < 8; i++) {
        int nx = x + movex[i];
        int ny = y + movey[i];
        if (nx < 0 || nx >= n || ny < 0 || ny >= m 
        	|| tu[nx][ny] != 'W') continue;
        dfs(nx, ny);
    }
}

int main() {
    cin >> n >> m;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            cin >> tu[i][j];
        }
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (tu[i][j] == 'W') {
                dfs(i, j);
                ans++;
            }
        }
    }
    cout << ans << endl;
	return 0;
}
```

### [P2036 PERKET](https://www.luogu.com.cn/problem/P2036)

因为 N 最多为 10，每种食材可以选或者不选两种情况，所以最多情况数为 `2^10=1024` 种。搜索时间满足要求。

所以，此题用 DFS 可以非常方便解决。在搜索的时候，我们可以将食材的相关信息带到 DFS 函数的参数中，方便最后答案的求解。

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n;
int s[11], b[11], v[11];
int ans = INT_MAX;

/**
 * pt: 当前处理到的食材
 * cnt: 当前选中的食材数量
 * ss: 当前选中的食材的总酸度
 * bb: 当前选中的食材的总甜度
 */
void dfs(int pt, int cnt, int ss, int bb) {
    if (pt == n) {
        if (cnt > 0) {
            ans = min(ans, abs(ss - bb));
        }
        return;
    }
    v[pt] = 1;
    dfs(pt + 1, cnt + 1, ss * s[pt], bb + b[pt]);
    v[pt] = 0;
    dfs(pt + 1, cnt, ss, bb);
}
int main() {
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> s[i] >> b[i];
    }
    dfs(0, 0, 1, 0);
    cout << ans << endl;
	return 0;
}
```

### [P12139 黑白棋](https://www.luogu.com.cn/problem/P12139)

此题是搜索题，需要在中间尽可能检查状态来剪枝，以节省搜索次数。

题目有三类限制，分别可以用在不同的剪枝环节。

限制一：在每一行和每一列中，黑色棋子和白色棋子的数量必须相等（即为 3）。
 - 我们可以对每一行记录黑子和白子的数量，如果某一行或某一列的一种颜色达到 3，后面则不能用这个颜色。

限制二：不能有超过两个相同颜色的棋子连续排列。
 - 我们可以在当前落子的时候，检查它的左边和上面连续的几个格子，看是否有 3 个相同的子。

限制三：行列唯一性
 - 可以放到最后检查。

另外，这个棋盘有几个位置已经设定了值，我们需要标记下来，搜索的时候跳过对这些位置的尝试，但需要在这些位置做合法性检查。


```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int row_cnt[6][2], col_cnt[6][2];
char tu[7][7], mark[7][7];

bool check(int r, int c) {
    // 在每一行和每一列中，黑色棋子和白色棋子的数量必须相等（即为 3）
    if (row_cnt[r][1] > 3 || row_cnt[r][0] > 3 || col_cnt[c][1] > 3 || col_cnt[c][0] > 3) return false;
    
    // 不能有超过两个相同颜色的棋子连续排列
    if (r >= 2) {
        if (tu[r][c] == '1' && tu[r-1][c] == '1' && tu[r-2][c] == '1') return false;
        if (tu[r][c] == '0' && tu[r-1][c] == '0' && tu[r-2][c] == '0') return false;
    }
    if (c >= 2) {
        if (tu[r][c] == '1' && tu[r][c-1] == '1' && tu[r][c-2] == '1') return false;
        if (tu[r][c] == '0' && tu[r][c-1] == '0' && tu[r][c-2] == '0') return false;
    }
    return true;
}

// 行列唯一性检查
bool final_check() {
    set<int> row_set, col_set;
    for (int i = 0; i < 6; i++) {
        int v = 0;
        for (int j = 0; j < 6; ++j) {
            v = v * 10 + (tu[i][j] - '0');
        }    
        row_set.insert(v);
    }
    if (row_set.size() != 6) return false;
    for (int j = 0; j < 6; ++j) {
        int v = 0;
        for (int i = 0; i < 6; ++i) {
            v = v * 10 + (tu[i][j] - '0');
        }
        col_set.insert(v);
    }
    if (col_set.size() != 6) return false;
    return true;
}

void dfs(int r, int c);
void try_dfs(int r, int c) {
    char ch = tu[r][c];
    row_cnt[r][ch - '0']++;
    col_cnt[c][ch - '0']++;
    if (check(r, c)) {
        int nr = r;
        int nc = c + 1;
        if (nc == 6) {
            nr++;
            nc = 0;
        }
        dfs(nr, nc);
    }
    row_cnt[r][ch - '0']--;
    col_cnt[c][ch - '0']--;
}

void dfs(int r, int c) {
    if (r == 6) {
        if (final_check()) {
            for (int i = 0; i < 6; i++) {
                for (int j = 0; j < 6; j++) {
                    cout << tu[i][j];
                }
            }
            cout << endl;
            // 因为只有一个合法解，所以找到答案就退出
            exit(0);
        }
        return;
    }
    
    if (mark[r][c] == 0) {
        tu[r][c] = '1';
        try_dfs(r, c);
        tu[r][c] = '0';
        try_dfs(r, c);
    } else {
        tu[r][c] = mark[r][c];
        try_dfs(r, c);
    }
}

void init() {
    memset(mark, 0, sizeof(mark));
    mark[0][0] = '1';
    mark[0][1] = '0';
    mark[0][3] = '0';
    mark[1][3] = '0';
    mark[2][4] = '0';
    mark[2][5] = '0';
    mark[4][2] = '1';
    mark[4][5] = '1';
    mark[5][1] = '0';
    mark[5][4] = '1';
}

int main() {
    init();
    dfs(0, 0);
	return 0;
}
```

### [P1605 迷宫](https://www.luogu.com.cn/problem/P1605)

用 DFS 来枚举，但需要标记走过的路。
 - 因为最多只有 5x5=25 个格子，所以递归的深度最大只有 25，不存在溢出情况。
 - 因为有陷阱（不能走）和起点终点（不能重复走），所以我们假设平均每次有 2 条支路，
   整个的最坏情况估计只有 `2^23=8388608` 次，所以也不会超时。

一些陷阱：

 - 终点可能也有障碍物，这个时候始终就到不了。
 - 起点在走之前需要标记，否则会重复走。

参考代码：

```c++
#include <bits/stdc++.h>
using namespace std;

// 0 - 空地
// 1 - 障碍物
int tu[6][6], n, m, t, sx, sy, ex, ey, ans;

int movex[]={1,-1,0,0};
int movey[]={0,0,-1,1};

void dfs(int x, int y) {
    if (x == ex && y == ey) {
        ans++;
        return;
    }
    for (int i = 0; i < 4; ++i) {
        int tox = x + movex[i];
        int toy = y + movey[i];
        if (tox >=1 && tox<=n && toy>=1 && toy<=m && tu[tox][toy]!=1){
            tu[tox][toy]=1;
            dfs(tox, toy);
            tu[tox][toy]=0;
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin >> n >> m >> t;
    cin >> sx >> sy >> ex >> ey;
    while (t--) {
        int x, y;
        cin >> x >> y;
        tu[x][y] = 1;
    }
    tu[sx][sy] = 1;
    dfs(sx, sy);
    cout << ans << endl;
    return 0;
}

```

### [P2404 自然数的拆分问题](https://www.luogu.com.cn/problem/P2404)

DFS，有两个技巧：
 - 保证后面的数 >= 前面的数。
 - 让每个数必须小于 n，这样不会出现 `n=n` 这种等式。

```c++
/**
 * Author: Tang Qiao
 */
#include <bits/stdc++.h>
using namespace std;

int n, tot, v[10];

void dfs(int pt) {
    if (tot == n) {
        cout << v[1];
        for (int i = 2; i < pt; ++i) {
            cout << "+" << v[i];
        }
        cout << endl;
        return;
    }
    for (int i = v[pt-1]; tot + i <=n && i < n ; ++i) {
        tot += i;
        v[pt] = i;
        dfs(pt+1);
        tot -= i;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin >> n;
    v[0] = 1;
    dfs(1);
    return 0;
}
```