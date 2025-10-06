// 盤面のサイズを定義 (例: 縦8マス、横17マス)
const ROWS = 8;
const COLS = 17;

// 牌の種類を定義（例: 1から34など。ここでは簡単に1から10とする）
const TILE_TYPES = 10;
const TOTAL_TILES = ROWS * COLS;

// 盤面データを格納する二次元配列
let board = []; 

// 選択中の牌の座標を格納
let selectedTile = null;

// ----------------------------------------------------

/**
 * 盤面を初期化し、ランダムに牌を配置する関数
 */
function initializeBoard() {
    // 牌を生成（ペアにするため偶数個）
    const tiles = [];
    for (let i = 1; i <= TILE_TYPES; i++) {
        // 各種類4枚ずつ（麻雀牌の標準的な枚数）
        for (let j = 0; j < 4; j++) { 
            tiles.push(i);
            tiles.push(i); // 合計8枚にするために調整が必要な場合も
        }
    }
    
    // 必要に応じて、総牌数を調整・シャッフル
    // ... (シャッフルロジック) ...
    
    // 盤面に配置
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            // tiles配列から取り出して配置
            // 例: board[r][c] = tiles.pop(); 
            // 実際は、手詰まりにならない配置ロジックも必要
            board[r][c] = Math.floor(Math.random() * TILE_TYPES) + 1; 
        }
    }

    // 牌が0の場所は空きマスとする
    // 外枠（周囲1マス）は空きマス(0)として使うと、経路探索がしやすくなります
}
/**
 * 牌がクリックされた時の処理
 * @param {number} r 行インデックス
 * @param {number} c 列インデックス
 */
 function handleTileClick(r, c) {
    // 既に消されているマス（board[r][c] === 0）は無視
    if (board[r][c] === 0) {
        return;
    }

    if (!selectedTile) {
        // 1枚目の選択
        selectedTile = { r: r, c: c };
        // UIで1枚目の牌をハイライト表示する処理をここに追加
    } else {
        // 2枚目の選択
        const r1 = selectedTile.r;
        const c1 = selectedTile.c;
        const r2 = r;
        const c2 = c;

        // 1. 同じ牌であること、かつ、同じ位置ではないこと
        if (board[r1][c1] === board[r2][c2] && (r1 !== r2 || c1 !== c2)) {
            // 2. 2角以内で繋がっているか判定
            if (canConnect(r1, c1, r2, c2)) {
                // 消去処理
                board[r1][c1] = 0; // 0は空きマス
                board[r2][c2] = 0;
                // UIで牌を消す処理をここに追加
                
                // ゲームクリア判定
                // ...
            } else {
                // 繋がらない場合のUIフィードバック
            }
        } else {
            // 牌が異なる、または同じ牌を2度押した
        }
        
        // 選択をリセット
        selectedTile = null;
        // UIのハイライトを解除する処理をここに追加
    }
}

/**
 * 2つの座標 (r1, c1) と (r2, c2) が直線で結べるかを判定
 */
 function isStraightPath(r1, c1, r2, c2) {
    if (r1 === r2) { // 同じ行 (水平)
        const start = Math.min(c1, c2) + 1;
        const end = Math.max(c1, c2);
        for (let c = start; c < end; c++) {
            if (board[r1][c] !== 0) return false; // 間に牌がある
        }
        return true;
    } else if (c1 === c2) { // 同じ列 (垂直)
        const start = Math.min(r1, r2) + 1;
        const end = Math.max(r1, r2);
        for (let r = start; r < end; r++) {
            if (board[r][c1] !== 0) return false; // 間に牌がある
        }
        return true;
    }
    return false; // 行も列も同じでない = 直線ではない
}

/**
 * 2つの座標 (r1, c1) と (r2, c2) が1角で結べるかを判定
 */
 function isOneCornerPath(r1, c1, r2, c2) {
    // パターン1: (r1, c2) を経由 (r1, c1) -> (r1, c2) -> (r2, c2)
    if (board[r1][c2] === 0 || (r1 === r2 && c1 !== c2) || (c1 === c2 && r1 !== r2)) {
        // (r1, c2) が空きマス、または2つの牌が隣接している場合
        if (isStraightPath(r1, c1, r1, c2) && isStraightPath(r1, c2, r2, c2)) {
            return true;
        }
    }
    
    // パターン2: (r2, c1) を経由 (r1, c1) -> (r2, c1) -> (r2, c2)
    if (board[r2][c1] === 0 || (r1 === r2 && c1 !== c2) || (c1 === c2 && r1 !== r2)) {
         // (r2, c1) が空きマス、または2つの牌が隣接している場合
        if (isStraightPath(r1, c1, r2, c1) && isStraightPath(r2, c1, r2, c2)) {
            return true;
        }
    }

    return false;
}

/**
 * 2つの座標 (r1, c1) と (r2, c2) が2角以内で結べるかを判定
 */
 function canConnect(r1, c1, r2, c2) {
    // 0角判定
    if (isStraightPath(r1, c1, r2, c2)) {
        return true;
    }

    // 1角判定
    if (isOneCornerPath(r1, c1, r2, c2)) {
        return true;
    }

    // 2角判定 (中間点 (r_mid, c_mid) を経由)
    
    // 中間点を探索（行 r_mid での直線）
    for (let r_mid = 0; r_mid < ROWS; r_mid++) {
        // (r1, c1) -> (r_mid, c1) -> (r_mid, c2) -> (r2, c2) の経路をチェック
        // (r_mid, c1) と (r_mid, c2) のどちらかが空きマス（または始点・終点）
        if (isStraightPath(r1, c1, r_mid, c1) && isStraightPath(r_mid, c1, r_mid, c2) && isStraightPath(r_mid, c2, r2, c2)) {
            return true;
        }
    }

    // 中間点を探索（列 c_mid での直線）
    for (let c_mid = 0; c_mid < COLS; c_mid++) {
        // (r1, c1) -> (r1, c_mid) -> (r2, c_mid) -> (r2, c2) の経路をチェック
        // (r1, c_mid) と (r2, c_mid) のどちらかが空きマス（または始点・終点）
        if (isStraightPath(r1, c1, r1, c_mid) && isStraightPath(r1, c_mid, r2, c_mid) && isStraightPath(r2, c_mid, r2, c2)) {
            return true;
        }
    }

    return false;
}