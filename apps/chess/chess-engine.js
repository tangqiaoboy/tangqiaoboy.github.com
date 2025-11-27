// 国际象棋引擎 - 游戏逻辑和规则

class ChessEngine {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.gameOver = false;
        this.winner = null;
        // 跟踪王和车的移动状态（用于王车易位）
        this.hasMoved = {
            whiteKing: false,
            whiteRookKingSide: false,  // h1的车
            whiteRookQueenSide: false, // a1的车
            blackKing: false,
            blackRookKingSide: false,  // h8的车
            blackRookQueenSide: false  // a8的车
        };
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // 放置黑方棋子
        board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        board[1] = ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'];
        
        // 放置白方棋子
        board[6] = ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'];
        board[7] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        
        return board;
    }

    getPiece(row, col) {
        if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
        return this.board[row][col];
    }

    isWhite(piece) {
        return piece && piece === piece.toUpperCase();
    }

    isBlack(piece) {
        return piece && piece === piece.toLowerCase();
    }

    isEmpty(row, col) {
        return this.getPiece(row, col) === null;
    }

    getPossibleMoves(row, col, checkCheck = true) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        const isWhitePiece = this.isWhite(piece);
        const pieceType = piece.toLowerCase();
        const moves = [];

        switch (pieceType) {
            case 'p':
                moves.push(...this.getPawnMoves(row, col, isWhitePiece));
                break;
            case 'r':
                moves.push(...this.getRookMoves(row, col, isWhitePiece));
                break;
            case 'n':
                moves.push(...this.getKnightMoves(row, col, isWhitePiece));
                break;
            case 'b':
                moves.push(...this.getBishopMoves(row, col, isWhitePiece));
                break;
            case 'q':
                moves.push(...this.getQueenMoves(row, col, isWhitePiece));
                break;
            case 'k':
                moves.push(...this.getKingMoves(row, col, isWhitePiece));
                break;
        }

        // 过滤掉会导致自己被将军的走法（仅在需要时检查）
        if (checkCheck) {
            return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, isWhitePiece));
        }
        return moves;
    }

    getPawnMoves(row, col, isWhite) {
        const moves = [];
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        // 向前移动一格
        if (this.isEmpty(row + direction, col)) {
            moves.push({ row: row + direction, col: col });
            
            // 起始位置可以向前移动两格
            if (row === startRow && this.isEmpty(row + 2 * direction, col)) {
                moves.push({ row: row + 2 * direction, col: col });
            }
        }

        // 吃子（斜向）
        for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            const newRow = row + direction;
            const targetPiece = this.getPiece(newRow, newCol);
            
            if (targetPiece && this.isWhite(targetPiece) !== isWhite) {
                moves.push({ row: newRow, col: newCol });
            }
        }

        return moves;
    }

    getRookMoves(row, col, isWhite) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dRow, dCol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dRow * i;
                const newCol = col + dCol * i;
                
                if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
                
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.isWhite(targetPiece) !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }

        return moves;
    }

    getKnightMoves(row, col, isWhite) {
        const moves = [];
        const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

        for (const [dRow, dCol] of offsets) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) continue;
            
            const targetPiece = this.getPiece(newRow, newCol);
            if (!targetPiece || this.isWhite(targetPiece) !== isWhite) {
                moves.push({ row: newRow, col: newCol });
            }
        }

        return moves;
    }

    getBishopMoves(row, col, isWhite) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

        for (const [dRow, dCol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dRow * i;
                const newCol = col + dCol * i;
                
                if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
                
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.isWhite(targetPiece) !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }

        return moves;
    }

    getQueenMoves(row, col, isWhite) {
        return [...this.getRookMoves(row, col, isWhite), ...this.getBishopMoves(row, col, isWhite)];
    }

    getKingMoves(row, col, isWhite) {
        const moves = [];
        const offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        for (const [dRow, dCol] of offsets) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) continue;
            
            const targetPiece = this.getPiece(newRow, newCol);
            if (!targetPiece || this.isWhite(targetPiece) !== isWhite) {
                moves.push({ row: newRow, col: newCol });
            }
        }

        // 添加王车易位
        const castlingMoves = this.getCastlingMoves(row, col, isWhite);
        moves.push(...castlingMoves);

        return moves;
    }

    getCastlingMoves(kingRow, kingCol, isWhite) {
        const moves = [];
        
        // 王必须在初始位置（白方e1，黑方e8）
        const expectedKingRow = isWhite ? 7 : 0;
        const expectedKingCol = 4; // e列
        
        if (kingRow !== expectedKingRow || kingCol !== expectedKingCol) {
            return moves;
        }

        // 检查王是否被将军（使用isSquareAttacked避免递归）
        if (this.isSquareAttacked(kingRow, kingCol, isWhite)) {
            return moves;
        }

        // 检查王是否移动过
        const kingMoved = isWhite ? this.hasMoved.whiteKing : this.hasMoved.blackKing;
        if (kingMoved) {
            return moves;
        }

        // 检查王侧易位（短易位，向h方向）
        const kingSideRookMoved = isWhite ? this.hasMoved.whiteRookKingSide : this.hasMoved.blackRookKingSide;
        if (!kingSideRookMoved) {
            const rookCol = 7; // h列
            const rook = this.getPiece(kingRow, rookCol);
            
            // 检查车是否存在且未移动
            if (rook && ((isWhite && rook === 'R') || (!isWhite && rook === 'r'))) {
                // 检查王和车之间是否有棋子
                let pathClear = true;
                for (let col = kingCol + 1; col < rookCol; col++) {
                    if (!this.isEmpty(kingRow, col)) {
                        pathClear = false;
                        break;
                    }
                }
                
                if (pathClear) {
                    // 检查王经过的格子（f和g列）是否被攻击
                    let squaresSafe = true;
                    for (let col = kingCol + 1; col <= kingCol + 2; col++) {
                        if (this.isSquareAttacked(kingRow, col, isWhite)) {
                            squaresSafe = false;
                            break;
                        }
                    }
                    
                    if (squaresSafe) {
                        moves.push({ 
                            row: kingRow, 
                            col: kingCol + 2, 
                            castling: 'kingside' 
                        });
                    }
                }
            }
        }

        // 检查后侧易位（长易位，向a方向）
        const queenSideRookMoved = isWhite ? this.hasMoved.whiteRookQueenSide : this.hasMoved.blackRookQueenSide;
        if (!queenSideRookMoved) {
            const rookCol = 0; // a列
            const rook = this.getPiece(kingRow, rookCol);
            
            // 检查车是否存在且未移动
            if (rook && ((isWhite && rook === 'R') || (!isWhite && rook === 'r'))) {
                // 检查王和车之间是否有棋子
                let pathClear = true;
                for (let col = rookCol + 1; col < kingCol; col++) {
                    if (!this.isEmpty(kingRow, col)) {
                        pathClear = false;
                        break;
                    }
                }
                
                if (pathClear) {
                    // 检查王经过的格子（d和c列）是否被攻击
                    let squaresSafe = true;
                    for (let col = kingCol - 1; col >= kingCol - 2; col--) {
                        if (this.isSquareAttacked(kingRow, col, isWhite)) {
                            squaresSafe = false;
                            break;
                        }
                    }
                    
                    if (squaresSafe) {
                        moves.push({ 
                            row: kingRow, 
                            col: kingCol - 2, 
                            castling: 'queenside' 
                        });
                    }
                }
            }
        }

        return moves;
    }

    isSquareAttacked(row, col, byWhite) {
        // 检查这个格子是否被对方攻击（不包含王车易位，避免递归）
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.getPiece(r, c);
                if (piece && this.isWhite(piece) !== byWhite) {
                    const pieceType = piece.toLowerCase();
                    let moves = [];
                    
                    // 直接获取移动，不通过getPossibleMoves（避免递归）
                    switch (pieceType) {
                        case 'p':
                            moves = this.getPawnMoves(r, c, !byWhite);
                            break;
                        case 'r':
                            moves = this.getRookMoves(r, c, !byWhite);
                            break;
                        case 'n':
                            moves = this.getKnightMoves(r, c, !byWhite);
                            break;
                        case 'b':
                            moves = this.getBishopMoves(r, c, !byWhite);
                            break;
                        case 'q':
                            moves = this.getQueenMoves(r, c, !byWhite);
                            break;
                        case 'k':
                            // 对于王，只获取普通移动，不包括王车易位
                            moves = this.getKingMovesWithoutCastling(r, c, !byWhite);
                            break;
                    }
                    
                    for (const move of moves) {
                        if (move.row === row && move.col === col) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    getKingMovesWithoutCastling(row, col, isWhite) {
        // 获取王的移动，但不包括王车易位（用于攻击检查，避免递归）
        const moves = [];
        const offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        for (const [dRow, dCol] of offsets) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) continue;
            
            const targetPiece = this.getPiece(newRow, newCol);
            if (!targetPiece || this.isWhite(targetPiece) !== isWhite) {
                moves.push({ row: newRow, col: newCol });
            }
        }

        return moves;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, isWhite) {
        // 临时执行移动
        const originalPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;

        // 检查是否被将军
        const inCheck = this.isInCheck(isWhite);

        // 恢复棋盘
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = originalPiece;

        return inCheck;
    }

    isInCheck(isWhite) {
        // 找到王的位置
        const king = isWhite ? 'K' : 'k';
        let kingRow = -1, kingCol = -1;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === king) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
            if (kingRow !== -1) break;
        }

        if (kingRow === -1) return false;

        // 使用isSquareAttacked检查王是否被攻击（避免递归）
        return this.isSquareAttacked(kingRow, kingCol, isWhite);
    }

    isCheckmate(isWhite) {
        if (!this.isInCheck(isWhite)) return false;

        // 检查是否有任何合法走法
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && this.isWhite(piece) === isWhite) {
                    const moves = this.getPossibleMoves(row, col, true);
                    if (moves.length > 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    isStalemate(isWhite) {
        if (this.isInCheck(isWhite)) return false;

        // 检查是否有任何合法走法
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && this.isWhite(piece) === isWhite) {
                    const moves = this.getPossibleMoves(row, col, true);
                    if (moves.length > 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;

        const moves = this.getPossibleMoves(fromRow, fromCol);
        const move = moves.find(m => m.row === toRow && m.col === toCol);
        
        if (!move) return false;

        // 检查是否是王车易位
        const isCastling = move.castling !== undefined;
        let castlingType = null;
        let rookFromRow = null, rookFromCol = null, rookToRow = null, rookToCol = null;

        if (isCastling) {
            castlingType = move.castling;
            const isWhite = this.isWhite(piece);
            const kingRow = fromRow;
            
            if (castlingType === 'kingside') {
                // 王侧易位：王移动到g列，车从h列移动到f列
                rookFromRow = kingRow;
                rookFromCol = 7; // h列
                rookToRow = kingRow;
                rookToCol = 5; // f列
            } else {
                // 后侧易位：王移动到c列，车从a列移动到d列
                rookFromRow = kingRow;
                rookFromCol = 0; // a列
                rookToRow = kingRow;
                rookToCol = 3; // d列
            }
        }

        // 记录被吃的棋子
        const capturedPiece = this.getPiece(toRow, toCol);
        if (capturedPiece) {
            const isWhitePiece = this.isWhite(capturedPiece);
            this.capturedPieces[isWhitePiece ? 'white' : 'black'].push(capturedPiece);
        }

        // 执行移动
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // 如果是王车易位，移动车
        if (isCastling) {
            const rook = this.getPiece(rookFromRow, rookFromCol);
            this.board[rookToRow][rookToCol] = rook;
            this.board[rookFromRow][rookFromCol] = null;
        }

        // 更新移动状态
        this.updateMoveStatus(piece, fromRow, fromCol);

        // 记录走棋历史
        const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece, isCastling);
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece,
            notation: moveNotation,
            castling: isCastling ? {
                type: castlingType,
                rookFrom: { row: rookFromRow, col: rookFromCol },
                rookTo: { row: rookToRow, col: rookToCol }
            } : null
        });

        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // 检查游戏结束条件
        const isWhite = this.currentPlayer === 'white';
        if (this.isCheckmate(!isWhite)) {
            this.gameOver = true;
            this.winner = isWhite ? 'white' : 'black';
        } else if (this.isStalemate(!isWhite)) {
            this.gameOver = true;
            this.winner = 'draw';
        }

        return true;
    }

    updateMoveStatus(piece, row, col) {
        const isWhite = this.isWhite(piece);
        const pieceType = piece.toLowerCase();

        // 更新王的移动状态
        if (pieceType === 'k') {
            if (isWhite) {
                this.hasMoved.whiteKing = true;
            } else {
                this.hasMoved.blackKing = true;
            }
        }

        // 更新车的移动状态
        if (pieceType === 'r') {
            if (isWhite) {
                if (row === 7 && col === 7) { // h1
                    this.hasMoved.whiteRookKingSide = true;
                } else if (row === 7 && col === 0) { // a1
                    this.hasMoved.whiteRookQueenSide = true;
                }
            } else {
                if (row === 0 && col === 7) { // h8
                    this.hasMoved.blackRookKingSide = true;
                } else if (row === 0 && col === 0) { // a8
                    this.hasMoved.blackRookQueenSide = true;
                }
            }
        }
    }

    getMoveNotation(fromRow, fromCol, toRow, toCol, captured, isCastling = false) {
        if (isCastling) {
            const files = 'abcdefgh';
            const toColFile = files[toCol];
            // 王侧易位用O-O，后侧易位用O-O-O
            if (toColFile === 'g') {
                return 'O-O'; // 王侧易位
            } else {
                return 'O-O-O'; // 后侧易位
            }
        }
        
        const piece = this.getPiece(toRow, toCol);
        const pieceSymbol = piece ? piece.toUpperCase() : '';
        const files = 'abcdefgh';
        const fromSquare = files[fromCol] + (8 - fromRow);
        const toSquare = files[toCol] + (8 - toRow);
        const capture = captured ? 'x' : '';
        
        return `${pieceSymbol}${fromSquare}${capture}${toSquare}`;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return false;

        const lastMove = this.moveHistory.pop();
        const { from, to, piece, captured, castling } = lastMove;

        // 恢复棋子
        this.board[from.row][from.col] = piece;
        this.board[to.row][to.col] = captured || null;

        // 如果是王车易位，恢复车的位置
        if (castling) {
            const rook = this.getPiece(castling.rookTo.row, castling.rookTo.col);
            this.board[castling.rookFrom.row][castling.rookFrom.col] = rook;
            this.board[castling.rookTo.row][castling.rookTo.col] = null;
        }

        // 恢复被吃的棋子
        if (captured) {
            const isWhitePiece = this.isWhite(captured);
            this.capturedPieces[isWhitePiece ? 'white' : 'black'].pop();
        }

        // 恢复移动状态（简化处理：如果回到初始位置，重置移动状态）
        this.restoreMoveStatus(piece, from.row, from.col);

        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.gameOver = false;
        this.winner = null;

        return true;
    }

    restoreMoveStatus(piece, row, col) {
        // 这是一个简化的实现：通过检查历史记录来确定移动状态
        // 更准确的方法是在moveHistory中记录移动状态的变化
        // 这里为了简化，我们检查是否回到了初始位置
        const isWhite = this.isWhite(piece);
        const pieceType = piece.toLowerCase();

        if (pieceType === 'k') {
            const expectedRow = isWhite ? 7 : 0;
            const expectedCol = 4;
            if (row === expectedRow && col === expectedCol) {
                // 检查历史记录中是否有这个王的移动
                let hasMoved = false;
                for (const move of this.moveHistory) {
                    if (move.piece === piece && 
                        (move.from.row !== expectedRow || move.from.col !== expectedCol)) {
                        hasMoved = true;
                        break;
                    }
                }
                if (!hasMoved) {
                    if (isWhite) {
                        this.hasMoved.whiteKing = false;
                    } else {
                        this.hasMoved.blackKing = false;
                    }
                }
            }
        }

        if (pieceType === 'r') {
            if (isWhite) {
                if (row === 7 && col === 7) { // h1
                    let hasMoved = false;
                    for (const move of this.moveHistory) {
                        if (move.piece === 'R' && move.from.row === 7 && move.from.col === 7) {
                            hasMoved = true;
                            break;
                        }
                    }
                    if (!hasMoved) {
                        this.hasMoved.whiteRookKingSide = false;
                    }
                } else if (row === 7 && col === 0) { // a1
                    let hasMoved = false;
                    for (const move of this.moveHistory) {
                        if (move.piece === 'R' && move.from.row === 7 && move.from.col === 0) {
                            hasMoved = true;
                            break;
                        }
                    }
                    if (!hasMoved) {
                        this.hasMoved.whiteRookQueenSide = false;
                    }
                }
            } else {
                if (row === 0 && col === 7) { // h8
                    let hasMoved = false;
                    for (const move of this.moveHistory) {
                        if (move.piece === 'r' && move.from.row === 0 && move.from.col === 7) {
                            hasMoved = true;
                            break;
                        }
                    }
                    if (!hasMoved) {
                        this.hasMoved.blackRookKingSide = false;
                    }
                } else if (row === 0 && col === 0) { // a8
                    let hasMoved = false;
                    for (const move of this.moveHistory) {
                        if (move.piece === 'r' && move.from.row === 0 && move.from.col === 0) {
                            hasMoved = true;
                            break;
                        }
                    }
                    if (!hasMoved) {
                        this.hasMoved.blackRookQueenSide = false;
                    }
                }
            }
        }
    }

    getAllPossibleMoves(isWhite, checkCheck = true) {
        const allMoves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && this.isWhite(piece) === isWhite) {
                    const moves = this.getPossibleMoves(row, col, checkCheck);
                    for (const move of moves) {
                        allMoves.push({
                            from: { row, col },
                            to: move
                        });
                    }
                }
            }
        }

        return allMoves;
    }

    clone() {
        const cloned = new ChessEngine();
        cloned.board = this.board.map(row => [...row]);
        cloned.currentPlayer = this.currentPlayer;
        cloned.moveHistory = [...this.moveHistory];
        cloned.capturedPieces = {
            white: [...this.capturedPieces.white],
            black: [...this.capturedPieces.black]
        };
        cloned.gameOver = this.gameOver;
        cloned.winner = this.winner;
        cloned.hasMoved = { ...this.hasMoved };
        return cloned;
    }
}

