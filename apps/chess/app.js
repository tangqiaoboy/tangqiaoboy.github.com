// 主应用文件

class ChessApp {
    constructor() {
        this.engine = new ChessEngine();
        this.ai = new AIEngine(2);
        this.playerColor = 'white'; // 玩家颜色
        this.boardStyle = 'classic';
        this.pieceStyle = 'classic';
        this.isPlayerTurn = true;
        this.lastAIMove = null; // 记录AI上次移动的位置
        
        this.init();
    }

    init() {
        this.renderBoard();
        this.setupEventListeners();
        this.updateUI();
        this.loadSettings();
    }

    renderBoard() {
        const board = document.getElementById('chessboard');
        board.innerHTML = '';
        board.className = `chessboard ${this.boardStyle}`;

        // 创建64个格子
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;

                // 添加坐标标记
                if (row === 7) {
                    const fileLabel = document.createElement('span');
                    fileLabel.className = 'coordinate file';
                    fileLabel.textContent = String.fromCharCode(97 + col); // a-h
                    square.appendChild(fileLabel);
                }
                if (col === 0) {
                    const rankLabel = document.createElement('span');
                    rankLabel.className = 'coordinate rank';
                    rankLabel.textContent = 8 - row;
                    square.appendChild(rankLabel);
                }

                // 添加棋子
                const piece = this.engine.getPiece(row, col);
                if (piece) {
                    const pieceElement = this.createPieceElement(piece, row, col);
                    square.appendChild(pieceElement);
                }

                // 标记AI上次移动的棋子
                if (this.lastAIMove) {
                    if ((row === this.lastAIMove.from.row && col === this.lastAIMove.from.col) ||
                        (row === this.lastAIMove.to.row && col === this.lastAIMove.to.col)) {
                        square.classList.add('last-ai-move');
                    }
                }

                // 绑定点击事件
                square.addEventListener('click', (e) => {
                    this.handleSquareClick(row, col);
                });
                board.appendChild(square);
            }
        }
    }

    createPieceElement(piece, row, col) {
        const pieceElement = document.createElement('div');
        pieceElement.className = `piece ${this.pieceStyle}`;
        pieceElement.dataset.row = row;
        pieceElement.dataset.col = col;
        pieceElement.textContent = this.getPieceSymbol(piece);
        return pieceElement;
    }

    getPieceSymbol(piece) {
        const symbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        return symbols[piece] || piece;
    }

    handleSquareClick(row, col) {
        if (this.engine.gameOver) return;
        
        const isPlayerColor = this.engine.currentPlayer === this.playerColor;
        if (!isPlayerColor) return; // 不是玩家的回合

        const piece = this.engine.getPiece(row, col);
        const isPlayerPiece = piece && this.engine.isWhite(piece) === (this.playerColor === 'white');

        if (this.engine.selectedSquare) {
            const [selectedRow, selectedCol] = this.engine.selectedSquare;
            
            // 如果点击的是已选中的棋子，取消选择
            if (selectedRow === row && selectedCol === col) {
                this.clearSelection();
                return;
            }

            // 如果点击的是己方棋子，切换选择
            if (isPlayerPiece) {
                this.selectSquare(row, col);
                return;
            }

            // 尝试移动
            if (this.engine.movePiece(selectedRow, selectedCol, row, col)) {
                this.clearSelection();
                this.lastAIMove = null; // 清除AI移动记录
                this.updateUI();
                this.updateCapturedPieces();
                this.addMoveToHistory();
                
                // 检查游戏是否结束
                if (this.engine.gameOver) {
                    this.handleGameOver();
                    return;
                }

                // AI回合
                if (this.engine.currentPlayer !== this.playerColor) {
                    this.makeAIMove();
                }
            }
        } else {
            // 选择棋子
            if (isPlayerPiece) {
                this.selectSquare(row, col);
            }
        }
    }

    selectSquare(row, col) {
        this.clearSelection();
        this.engine.selectedSquare = [row, col];
        
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add('selected');
        }

        // 显示可能的走法
        this.engine.possibleMoves = this.engine.getPossibleMoves(row, col);
        this.engine.possibleMoves.forEach(move => {
            const targetSquare = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (targetSquare) {
                const targetPiece = this.engine.getPiece(move.row, move.col);
                if (move.castling) {
                    // 王车易位用特殊标记
                    targetSquare.classList.add('possible-castling');
                } else if (targetPiece) {
                    targetSquare.classList.add('possible-capture');
                } else {
                    targetSquare.classList.add('possible-move');
                }
            }
        });
    }

    clearSelection() {
        if (this.engine.selectedSquare) {
            const [row, col] = this.engine.selectedSquare;
            const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (square) {
                square.classList.remove('selected');
            }
        }

        // 清除可能的走法标记
        document.querySelectorAll('.possible-move, .possible-capture, .possible-castling').forEach(el => {
            el.classList.remove('possible-move', 'possible-capture', 'possible-castling');
        });

        this.engine.selectedSquare = null;
        this.engine.possibleMoves = [];
    }
    
    clearLastAIMove() {
        // 清除AI移动标记（当玩家移动时）
        document.querySelectorAll('.last-ai-move').forEach(el => {
            el.classList.remove('last-ai-move');
        });
    }

    updateUI() {
        // 更新当前玩家显示
        const currentPlayerEl = document.getElementById('current-player');
        const currentPlayer = this.engine.currentPlayer === 'white' ? '白方' : '黑方';
        currentPlayerEl.textContent = currentPlayer;

        // 更新游戏状态
        const gameStatusEl = document.getElementById('game-status');
        if (this.engine.gameOver) {
            if (this.engine.winner === 'draw') {
                gameStatusEl.textContent = '和棋';
            } else {
                const winner = this.engine.winner === 'white' ? '白方' : '黑方';
                gameStatusEl.textContent = `${winner}获胜`;
            }
        } else {
            gameStatusEl.textContent = '进行中';
        }

        // 重新渲染棋盘
        this.renderBoard();
    }

    updateCapturedPieces() {
        const whiteCaptured = document.getElementById('captured-white-pieces');
        const blackCaptured = document.getElementById('captured-black-pieces');
        
        whiteCaptured.innerHTML = '';
        blackCaptured.innerHTML = '';

        this.engine.capturedPieces.white.forEach(piece => {
            const span = document.createElement('span');
            span.textContent = this.getPieceSymbol(piece);
            whiteCaptured.appendChild(span);
        });

        this.engine.capturedPieces.black.forEach(piece => {
            const span = document.createElement('span');
            span.textContent = this.getPieceSymbol(piece);
            blackCaptured.appendChild(span);
        });
    }

    addMoveToHistory() {
        const moveList = document.getElementById('move-list');
        if (this.engine.moveHistory.length > 0) {
            const lastMove = this.engine.moveHistory[this.engine.moveHistory.length - 1];
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            moveItem.textContent = `${this.engine.moveHistory.length}. ${lastMove.notation}`;
            moveList.appendChild(moveItem);
            moveList.scrollTop = moveList.scrollHeight;
        }
    }

    async makeAIMove() {
        // 显示AI正在思考
        const gameStatusEl = document.getElementById('game-status');
        gameStatusEl.textContent = 'AI思考中...';

        // 延迟一下，让UI更新
        await new Promise(resolve => setTimeout(resolve, 500));

        const bestMove = this.ai.getBestMove(this.engine);
        
        if (bestMove) {
            // 记录AI的移动
            this.lastAIMove = {
                from: { row: bestMove.from.row, col: bestMove.from.col },
                to: { row: bestMove.to.row, col: bestMove.to.col }
            };

            this.engine.movePiece(
                bestMove.from.row,
                bestMove.from.col,
                bestMove.to.row,
                bestMove.to.col
            );
            
            this.updateUI();
            this.updateCapturedPieces();
            this.addMoveToHistory();

            if (this.engine.gameOver) {
                this.handleGameOver();
            }
        }
    }

    handleGameOver() {
        const gameStatusEl = document.getElementById('game-status');
        if (this.engine.winner === 'draw') {
            gameStatusEl.textContent = '和棋！';
            alert('游戏结束：和棋！');
        } else {
            const winner = this.engine.winner === 'white' ? '白方' : '黑方';
            gameStatusEl.textContent = `${winner}获胜！`;
            alert(`游戏结束：${winner}获胜！`);
        }
    }

    newGame() {
        this.engine = new ChessEngine();
        this.lastAIMove = null; // 重置AI移动记录
        this.clearSelection();
        
        document.getElementById('move-list').innerHTML = '';
        this.updateUI();
        this.updateCapturedPieces();
        
        // 如果玩家选择黑方，需要先让AI走
        if (this.playerColor === 'black') {
            this.engine.currentPlayer = 'white';
            this.makeAIMove();
        }
    }

    undoMove() {
        if (this.engine.moveHistory.length === 0) return;
        
        // 如果玩家是后手，需要撤销两步（AI的一步和玩家的一步）
        if (this.playerColor === 'black' && this.engine.currentPlayer === 'white') {
            this.engine.undoMove();
        }
        
        this.engine.undoMove();
        this.clearSelection();
        this.clearLastAIMove(); // 清除AI移动标记
        this.lastAIMove = null; // 重置AI移动记录
        this.updateUI();
        this.updateCapturedPieces();
        
        // 更新走棋历史
        const moveList = document.getElementById('move-list');
        moveList.innerHTML = '';
        this.engine.moveHistory.forEach((move, index) => {
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            moveItem.textContent = `${index + 1}. ${move.notation}`;
            moveList.appendChild(moveItem);
        });
    }

    setupEventListeners() {
        // 新游戏按钮
        document.getElementById('new-game-btn').addEventListener('click', () => {
            if (confirm('确定要开始新游戏吗？')) {
                this.newGame();
            }
        });

        // 悔棋按钮
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });

        // 设置按钮
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        // 设置模态框
        const modal = document.getElementById('settings-modal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // 应用设置按钮
        document.getElementById('apply-settings').addEventListener('click', () => {
            this.applySettings();
        });
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        
        // 加载当前设置
        document.getElementById('difficulty').value = this.ai.difficulty;
        document.getElementById('board-style').value = this.boardStyle;
        document.getElementById('piece-style').value = this.pieceStyle;
        document.getElementById('player-color').value = this.playerColor;
        
        modal.style.display = 'block';
    }

    applySettings() {
        const difficulty = document.getElementById('difficulty').value;
        const boardStyle = document.getElementById('board-style').value;
        const pieceStyle = document.getElementById('piece-style').value;
        const playerColor = document.getElementById('player-color').value;

        this.ai.setDifficulty(difficulty);
        this.boardStyle = boardStyle;
        this.pieceStyle = pieceStyle;
        this.playerColor = playerColor;

        // 保存设置
        this.saveSettings();

        // 关闭模态框
        document.getElementById('settings-modal').style.display = 'none';

        // 更新UI
        this.renderBoard();
        
        // 如果改变了玩家颜色，需要重新开始游戏
        if (this.engine.moveHistory.length > 0) {
            if (confirm('更改设置需要重新开始游戏，是否继续？')) {
                this.newGame();
            }
        }
    }

    saveSettings() {
        const settings = {
            difficulty: this.ai.difficulty,
            boardStyle: this.boardStyle,
            pieceStyle: this.pieceStyle,
            playerColor: this.playerColor
        };
        localStorage.setItem('chessSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('chessSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.ai.setDifficulty(settings.difficulty || 2);
                this.boardStyle = settings.boardStyle || 'classic';
                this.pieceStyle = settings.pieceStyle || 'classic';
                this.playerColor = settings.playerColor || 'white';
            } catch (e) {
                console.error('加载设置失败:', e);
            }
        }
    }
}

// 初始化应用
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new ChessApp();
});

