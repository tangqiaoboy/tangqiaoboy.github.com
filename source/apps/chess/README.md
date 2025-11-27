# 国际象棋 - 人机对战

一个功能完整的国际象棋人机对战游戏，使用纯HTML、CSS和JavaScript实现。

## 功能特性

### 核心功能
- ✅ 完整的国际象棋规则实现
- ✅ 人机对战（AI使用Minimax算法）
- ✅ 可调整AI难度（4个难度级别）
- ✅ 多种棋盘样式（经典、木质、大理石、绿色）
- ✅ 多种棋子样式（经典、现代、斯汤顿）
- ✅ 可选择先后手（白方/黑方）
- ✅ 悔棋功能
- ✅ 走棋历史记录
- ✅ 被吃棋子显示

### 游戏规则
- 完整的国际象棋规则，包括：
  - 所有棋子的移动规则
  - 吃子规则
  - 将军检测
  - 将死检测
  - 和棋检测（无子可动）
  - 防止走导致自己被将军的棋

## 使用方法

1. 直接在浏览器中打开 `index.html` 文件即可开始游戏
2. 点击棋子选择，然后点击目标位置移动
3. 点击"设置"按钮可以调整：
   - AI难度（简单/中等/困难/专家）
   - 棋盘样式
   - 棋子样式
   - 玩家颜色（白方/黑方）

## 文件结构

```
chess/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── chess-engine.js     # 游戏逻辑引擎
├── ai-engine.js        # AI引擎（Minimax算法）
├── app.js              # 主应用逻辑
└── README.md           # 说明文档
```

## AI算法

游戏使用Minimax算法配合Alpha-Beta剪枝来实现AI对手：

- **简单（深度1）**：AI只考虑当前一步
- **中等（深度2）**：AI考虑当前和下一步
- **困难（深度3）**：AI考虑当前和未来两步
- **专家（深度4）**：AI考虑当前和未来三步

深度越高，AI越强，但计算时间也越长。

## 技术特点

- 纯前端实现，无需服务器
- 响应式设计，支持移动设备
- 使用LocalStorage保存设置
- 完整的国际象棋规则验证
- 优雅的UI设计

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge等）

## 开发中遇到的问题及解决方案

### 1. 无限递归问题（Maximum call stack size exceeded）

**问题描述：**
在实现王车易位功能时，出现了无限递归调用，导致浏览器崩溃。

**问题原因：**
- `getCastlingMoves` 调用 `isInCheck` 检查王是否被将军
- `isInCheck` 调用 `getPossibleMoves` 获取所有可能的移动
- 对于王，`getPossibleMoves` 调用 `getKingMoves`
- `getKingMoves` 又调用 `getCastlingMoves`
- 形成无限递归循环

**解决方案：**
1. 创建 `isSquareAttacked` 方法，直接调用各棋子的基础移动方法（如 `getPawnMoves`、`getRookMoves` 等），而不通过 `getPossibleMoves`
2. 创建 `getKingMovesWithoutCastling` 方法，专门用于攻击检查，不包含王车易位
3. 修改 `isInCheck` 方法，直接使用 `isSquareAttacked` 检查王是否被攻击
4. 修改 `getCastlingMoves`，使用 `isSquareAttacked` 而不是 `isInCheck` 来检查王是否被将军

**关键代码：**
```javascript
// 避免递归的关键：isSquareAttacked 直接调用基础移动方法
isSquareAttacked(row, col, byWhite) {
    // 直接获取移动，不通过getPossibleMoves（避免递归）
    switch (pieceType) {
        case 'k':
            moves = this.getKingMovesWithoutCastling(r, c, !byWhite);
            break;
        // ...
    }
}
```

### 2. 棋子点击事件无法触发

**问题描述：**
点击棋盘上的棋子时，点击事件无法正常触发，导致无法选择或移动棋子。

**问题原因：**
- 棋子元素（`.piece`）覆盖在格子元素（`.square`）之上
- 棋子元素默认会拦截点击事件，导致点击无法传递到格子元素
- 坐标标记元素也可能阻止点击事件

**解决方案：**
1. 为棋子元素添加 `pointer-events: none` CSS属性，让点击事件穿透到格子元素
2. 为坐标标记元素添加 `pointer-events: none`，确保不会阻止点击
3. 确保格子元素（`.square`）有正确的 `z-index` 和 `cursor: pointer`

**关键代码：**
```css
.piece {
    pointer-events: none; /* 让点击事件穿透到格子 */
}

.coordinate {
    pointer-events: none; /* 坐标标记不阻止点击 */
}
```

### 3. AI移动太快，用户看不清

**问题描述：**
AI走棋速度太快，用户无法看清AI移动了哪个棋子。

**解决方案：**
1. 在AI走棋前添加延迟（500ms），让用户有时间观察
2. 高亮显示AI上次移动的起始和目标位置
3. 使用橙色高亮和边框，带有动画效果
4. 玩家移动后自动清除AI移动标记

**关键代码：**
```javascript
// 记录AI移动位置
this.lastAIMove = {
    from: { row: bestMove.from.row, col: bestMove.from.col },
    to: { row: bestMove.to.row, col: bestMove.to.col }
};

// 在renderBoard中标记AI移动的格子
if (this.lastAIMove) {
    if ((row === this.lastAIMove.from.row && col === this.lastAIMove.from.col) ||
        (row === this.lastAIMove.to.row && col === this.lastAIMove.to.col)) {
        square.classList.add('last-ai-move');
    }
}
```

### 4. 王车易位功能实现

**问题描述：**
需要实现国际象棋的王车易位功能，包括短易位（王侧）和长易位（后侧）。

**实现要点：**
1. 跟踪王和车的移动状态（`hasMoved` 对象）
2. 检查王车易位的所有条件：
   - 王和车都未移动过
   - 王和车之间没有其他棋子
   - 王没有被将军
   - 王经过的格子没有被攻击
   - 王到达的格子没有被攻击
3. 执行易位时，同时移动王和车
4. 在走棋历史中使用标准记谱（O-O 和 O-O-O）

**关键代码：**
```javascript
getCastlingMoves(kingRow, kingCol, isWhite) {
    // 检查所有易位条件
    // 使用 isSquareAttacked 而不是 isInCheck 避免递归
    if (this.isSquareAttacked(kingRow, kingCol, isWhite)) {
        return moves;
    }
    // ...
}
```

## 未来可能的改进

- [ ] 添加开局库
- [ ] 添加残局数据库
- [ ] 添加在线对战功能
- [ ] 添加游戏回放功能
- [ ] 添加更多棋盘和棋子样式
- [ ] 优化AI算法性能

## 作者

**唐巧**

- 个人网站：https://blog.devtang.com

## 许可证

MIT License

