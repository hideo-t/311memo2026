/**
 * 3.11メモリークエスト：#9へ集合
 * ゲームロジック
 */

// ===================================
// グローバル状態
// ===================================
const gameState = {
    currentStage: 0,
    scores: {
        memory: 0,
        hope: 0,
        link: 0
    },
    mission1Complete: false,
    mission2Complete: false,
    mission3Complete: false,
    routeProgress: 0,
    scannedArtists: 0,
    quizCorrect: 0
};

// 出演者データ（ポスターから）
const artists = [
    'ラル', '斎藤弘人', '佐藤圭太', '岡田桂子', '橋本初子', '清水貴一', '伊藤和樹',
    'ベロワーズオブラブ', '大渕ひとみ', '前田誠司', 'KUSANO', 'ツパコシティ', '相田麻梨',
    'ペリカ', 'Lumiere', 'mone', '大雄', '舞踊合唱',
    '福島スポールアカデミー', 'STUDIO DANCE HEAD', '安楽拓磨'
];

// ===================================
// 初期化
// ===================================
function init() {
    console.log('3.11メモリークエスト起動');
    updateGauges();
}

// ===================================
// ゲーム開始
// ===================================
function startGame() {
    playSound('start');
    nextStage(1);
}

// ===================================
// ステージ遷移
// ===================================
function nextStage(stageNum) {
    playSound('transition');
    
    // 現在のステージを非表示
    const stages = document.querySelectorAll('.stage');
    stages.forEach(stage => stage.classList.remove('active'));
    
    // 次のステージを表示
    const nextStage = document.getElementById(`stage${stageNum}`);
    if (nextStage) {
        nextStage.classList.add('active');
        gameState.currentStage = stageNum;
        
        // ステージごとの初期化
        if (stageNum === 3) {
            initArtistGrid();
        }
    }
    
    // スクロールをトップに
    window.scrollTo(0, 0);
}

// ===================================
// Stage 1: ミッション選択
// ===================================
function selectChoice(missionNum, choiceNum, isCorrect) {
    const missionItem = document.getElementById(`mission${missionNum}`);
    const buttons = missionItem.querySelectorAll('.choice-btn');
    
    if (isCorrect) {
        // 正解
        playSound('correct');
        buttons[choiceNum - 1].classList.add('selected');
        
        // スコア加算
        gameState.scores.memory += 15;
        updateGauges();
        
        // ミッション完了フラグ
        if (missionNum === 1) gameState.mission1Complete = true;
        if (missionNum === 2) gameState.mission2Complete = true;
        if (missionNum === 3) gameState.mission3Complete = true;
        
        // 次のミッションをアンロック
        setTimeout(() => {
            if (missionNum < 3) {
                const nextMission = document.getElementById(`mission${missionNum + 1}`);
                nextMission.style.opacity = '1';
                nextMission.style.pointerEvents = 'auto';
            } else {
                // 全ミッション完了
                document.getElementById('stage1Next').style.display = 'block';
                gameState.scores.memory += 10; // ボーナス
                updateGauges();
            }
        }, 500);
    } else {
        // 不正解
        playSound('wrong');
        buttons[choiceNum - 1].classList.add('wrong');
        setTimeout(() => {
            buttons[choiceNum - 1].classList.remove('wrong');
        }, 500);
    }
}

// ===================================
// Stage 2: ルート選択
// ===================================
function selectPoint(pointNum) {
    if (pointNum !== gameState.routeProgress + 1) return;
    
    playSound('correct');
    
    const point = document.getElementById(`point${pointNum}`);
    point.style.opacity = '1';
    point.classList.add('active');
    
    gameState.routeProgress = pointNum;
    gameState.scores.memory += 10;
    updateGauges();
    
    // 次のポイントをアンロック
    if (pointNum < 3) {
        const nextPoint = document.getElementById(`point${pointNum + 1}`);
        setTimeout(() => {
            nextPoint.style.opacity = '1';
        }, 300);
    } else {
        // ルート完了
        setTimeout(() => {
            document.getElementById('venueInfo').style.display = 'block';
            document.getElementById('stage2Next').style.display = 'block';
            gameState.scores.memory += 10; // ボーナス
            updateGauges();
        }, 500);
    }
}

// ===================================
// Stage 3: 出演者スキャン
// ===================================
function initArtistGrid() {
    const grid = document.getElementById('artistGrid');
    grid.innerHTML = '';
    
    // 12枚のカードを生成（実際の出演者数に応じて調整可能）
    const displayCount = 12;
    for (let i = 0; i < displayCount; i++) {
        const card = document.createElement('div');
        card.className = 'artist-card';
        card.dataset.index = i;
        card.textContent = artists[i] || `アーティスト ${i + 1}`;
        card.onclick = () => scanArtist(card);
        grid.appendChild(card);
    }
}

function scanArtist(card) {
    if (card.classList.contains('scanned')) return;
    
    playSound('scan');
    card.classList.add('scanned');
    
    gameState.scannedArtists++;
    gameState.scores.hope += 10;
    updateGauges();
    
    document.getElementById('scanCount').textContent = gameState.scannedArtists;
    
    // 3枚スキャンでコンボ
    if (gameState.scannedArtists === 3) {
        playSound('combo');
        gameState.scores.hope += 20; // コンボボーナス
        updateGauges();
        
        setTimeout(() => {
            document.getElementById('stage3Next').style.display = 'block';
        }, 500);
    }
}

// ===================================
// Stage 4: 記憶テスト
// ===================================
let currentQuiz = 1;

function answerQuiz(quizNum, answerNum, isCorrect) {
    const quizItem = document.getElementById(`quiz${quizNum}`);
    const buttons = quizItem.querySelectorAll('.choice-btn');
    
    if (isCorrect) {
        playSound('correct');
        buttons[answerNum - 1].classList.add('selected');
        gameState.quizCorrect++;
        gameState.scores.memory += 10;
        updateGauges();
        
        setTimeout(() => {
            quizItem.style.display = 'none';
            
            if (quizNum < 3) {
                // 次の問題へ
                document.getElementById(`quiz${quizNum + 1}`).style.display = 'block';
                currentQuiz++;
            } else {
                // クイズ完了
                showQuizResult();
            }
        }, 500);
    } else {
        playSound('wrong');
        buttons[answerNum - 1].classList.add('wrong');
        setTimeout(() => {
            buttons[answerNum - 1].classList.remove('wrong');
        }, 500);
    }
}

function showQuizResult() {
    const resultDiv = document.getElementById('quizResult');
    resultDiv.style.display = 'block';
    
    if (gameState.quizCorrect === 3) {
        resultDiv.textContent = '🎉 PERFECT! 記憶完璧！';
        resultDiv.classList.add('perfect');
        gameState.scores.memory += 20; // パーフェクトボーナス
        playSound('perfect');
    } else {
        resultDiv.textContent = `正解: ${gameState.quizCorrect} / 3`;
    }
    
    updateGauges();
    
    setTimeout(() => {
        document.getElementById('stage4Next').style.display = 'block';
    }, 1000);
}

// ===================================
// Stage 5: エンディング
// ===================================
function showEnding() {
    // LINKゲージ満タン
    gameState.scores.link = 100;
    updateGauges();
    
    // 最終スコア表示
    document.getElementById('finalMemory').textContent = gameState.scores.memory;
    document.getElementById('finalHope').textContent = gameState.scores.hope;
    document.getElementById('finalLink').textContent = gameState.scores.link;
    
    // 合言葉生成
    const code = generateCode();
    document.getElementById('codeDisplay').textContent = code;
    
    playSound('ending');
}

function generateCode() {
    const date = '0308';
    const venue = '#9';
    const memory = Math.floor(gameState.scores.memory);
    const hope = Math.floor(gameState.scores.hope);
    
    return `FUKUSHIMA-311-${date}-${venue}-M${memory}H${hope}`;
}

// ===================================
// スコアゲージ更新
// ===================================
function updateGauges() {
    // 最大値を100に制限
    const memory = Math.min(100, gameState.scores.memory);
    const hope = Math.min(100, gameState.scores.hope);
    const link = Math.min(100, gameState.scores.link);
    
    document.getElementById('memoryGauge').style.width = memory + '%';
    document.getElementById('hopeGauge').style.width = hope + '%';
    document.getElementById('linkGauge').style.width = link + '%';
}

// ===================================
// シェア機能
// ===================================
function shareQuest() {
    const code = document.getElementById('codeDisplay').textContent;
    const text = `3.11メモリークエストをクリアしました！\n` +
                 `合言葉: ${code}\n` +
                 `3月8日（日）12:00〜 Koriyama #9で会いましょう！\n` +
                 `#福島の子供たちのために #あの日を忘れない #郡山`;
    
    // Web Share API対応チェック
    if (navigator.share) {
        navigator.share({
            title: '3.11メモリークエスト',
            text: text
        }).then(() => {
            console.log('共有成功');
            gameState.scores.link += 50;
            updateGauges();
        }).catch(err => {
            console.log('共有キャンセル', err);
        });
    } else {
        // フォールバック: クリップボードにコピー
        navigator.clipboard.writeText(text).then(() => {
            alert('メッセージをコピーしました！SNSで共有してください。');
            gameState.scores.link += 50;
            updateGauges();
        }).catch(err => {
            console.error('コピー失敗', err);
            alert(text);
        });
    }
}

// ===================================
// サウンドエフェクト（簡易）
// ===================================
function playSound(type) {
    // Web Audio APIで簡単な効果音を生成
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'start':
                oscillator.frequency.value = 523.25; // C5
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            
            case 'correct':
                oscillator.frequency.value = 659.25; // E5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            
            case 'wrong':
                oscillator.frequency.value = 220; // A3
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            
            case 'scan':
                oscillator.frequency.value = 784; // G5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
            
            case 'combo':
                // コンボ音（3音階）
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
                    osc.start(audioContext.currentTime + i * 0.1);
                    osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
                });
                break;
            
            case 'perfect':
                // パーフェクト音（アルペジオ）
                [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.25, audioContext.currentTime + i * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.4);
                    osc.start(audioContext.currentTime + i * 0.08);
                    osc.stop(audioContext.currentTime + i * 0.08 + 0.4);
                });
                break;
            
            case 'ending':
                // エンディングファンファーレ
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    osc.type = 'square';
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.5);
                    osc.start(audioContext.currentTime + i * 0.15);
                    osc.stop(audioContext.currentTime + i * 0.15 + 0.5);
                });
                break;
            
            case 'transition':
                oscillator.frequency.value = 440; // A4
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
        }
    } catch (e) {
        // サウンド失敗時は無視
        console.log('Sound not available');
    }
}

// ===================================
// Stage 5に到達時の処理
// ===================================
window.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Stage 5に遷移したときの処理
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const stage5 = document.getElementById('stage5');
            if (stage5 && stage5.classList.contains('active')) {
                showEnding();
                observer.disconnect();
            }
        });
    });
    
    observer.observe(document.getElementById('stage5'), {
        attributes: true,
        attributeFilter: ['class']
    });
});

// ===================================
// デバッグ用
// ===================================
window.gameState = gameState;
console.log('3.11メモリークエスト準備完了');
console.log('デバッグ: window.gameState でステート確認可能');
