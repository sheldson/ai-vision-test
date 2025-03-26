/**
 * AI视觉能力分级标准化测试工具
 * 主要JavaScript文件
 */

// 测试数据结构 - 包含各级别和维度的测试卡片ID
const testData = {
    L1: {
        perception: ["L1-P-01", "L1-P-02", "L1-P-03", "L1-P-04"],
        social: ["L1-S-01", "L1-S-02", "L1-S-03"]
    },
    L2: {
        perception: ["L2-P-01", "L2-P-02", "L2-P-03", "L2-P-04"],
        social: ["L2-S-01", "L2-S-02", "L2-S-03", "L2-S-04"],
        memory: ["L2-M-01", "L2-M-02", "L2-M-03", "L2-M-04"]
    },
    L3: {
        perception: ["L3-P-01", "L3-P-02", "L3-P-03"],
        social: ["L3-S-01", "L3-S-02", "L3-S-03", "L3-S-04"],
        memory: ["L3-M-01", "L3-M-02", "L3-M-03", "L3-M-04"],
        temporal: ["L3-T-01", "L3-T-02", "L3-T-03", "L3-T-04"],
        cognitive: ["L3-C-01", "L3-C-02", "L3-C-03", "L3-C-04"]
    }
};

// 维度名称映射
const dimensionNames = {
    perception: "感知维度",
    social: "社交维度",
    memory: "记忆维度",
    temporal: "时序维度",
    cognitive: "认知维度"
};

// 全局变量
let currentLevel = "L1";
let currentDimension = "perception";
let currentCardIndex = 0;
let testResults = {};

// 初始化函数
function init() {
    console.log("初始化测试工具...");
    
    // 加载保存的测试结果
    loadSavedResults();
    
    // 设置默认级别和维度
    updateDimensionNav(currentLevel);
    loadCard();
    
    // 设置当前日期
    document.getElementById('test-date').textContent = new Date().toLocaleDateString();
    
    // 绑定事件监听器
    bindEventListeners();
}

// 绑定所有事件监听器
function bindEventListeners() {
    // 级别导航事件
    document.querySelectorAll('.level-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const level = this.getAttribute('data-level');
            
            // 如果点击的是结果页面
            if (level === 'results') {
                showResultsPage();
                return;
            }
            
            // 切换到测试卡片页面
            document.getElementById('test-card-container').style.display = 'block';
            document.getElementById('results-container').style.display = 'none';
            
            // 更新导航状态
            document.querySelectorAll('.level-nav a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 更新当前级别和维度
            currentLevel = level;
            updateDimensionNav(currentLevel);
            
            // 默认选择第一个维度
            const firstDimension = Object.keys(testData[currentLevel])[0];
            currentDimension = firstDimension;
            document.querySelector(`[data-dimension="${firstDimension}"]`).classList.add('active');
            
            // 重置卡片索引并加载卡片
            currentCardIndex = 0;
            loadCard();
        });
    });
    
    // 卡片导航按钮
    document.getElementById('prev-card').addEventListener('click', prevCard);
    document.getElementById('next-card').addEventListener('click', nextCard);
    document.getElementById('save-score').addEventListener('click', saveCurrentScore);
    
    // 评分按钮事件
    document.querySelectorAll('.score-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.score-buttons button').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', exportReport);
}

// 更新维度导航
function updateDimensionNav(level) {
    console.log(`更新维度导航，当前级别: ${level}`);
    
    const dimensionsNav = document.getElementById('dimensions');
    dimensionsNav.innerHTML = '';
    
    const dimensions = Object.keys(testData[level]);
    dimensions.forEach(dim => {
        // 跳过空维度
        if (testData[level][dim].length === 0) return;
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.setAttribute('data-dimension', dim);
        
        // 设置显示名称
        a.textContent = dimensionNames[dim] || dim;
        
        // 如果是当前维度，添加active类
        if (dim === currentDimension) {
            a.classList.add('active');
        }
        
        // 添加点击事件
        a.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('#dimensions a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            currentDimension = this.getAttribute('data-dimension');
            currentCardIndex = 0;
            loadCard();
        });
        
        li.appendChild(a);
        dimensionsNav.appendChild(li);
    });
}

// 加载测试卡片
function loadCard() {
    console.log(`加载卡片，当前级别: ${currentLevel}, 维度: ${currentDimension}, 索引: ${currentCardIndex}`);
    
    const cards = testData[currentLevel][currentDimension];
    if (cards.length === 0) {
        document.getElementById('current-card').innerHTML = '<p class="no-cards-message">此维度暂无测试卡片</p>';
        document.getElementById('card-indicator').textContent = '0/0';
        
        // 禁用导航按钮
        document.getElementById('prev-card').disabled = true;
        document.getElementById('next-card').disabled = true;
        return;
    }
    
    // 启用导航按钮
    document.getElementById('prev-card').disabled = false;
    document.getElementById('next-card').disabled = false;
    
    const cardId = cards[currentCardIndex];
    
    // 使用fetch加载卡片HTML
    const cardUrl = `data/test_cases/${currentLevel}/${currentDimension}/${cardId}.html`;
    console.log(`尝试加载卡片: ${cardUrl}`);
    
    fetch(cardUrl)
        .then(response => {
            console.log(`卡片加载响应状态: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log(`成功加载卡片: ${cardId}`);
            document.getElementById('current-card').innerHTML = html;
            document.getElementById('card-indicator').textContent = `${currentCardIndex + 1}/${cards.length}`;
            
            // 如果有保存的评分，恢复显示
            if (testResults[cardId]) {
                const score = testResults[cardId].score;
                const notes = testResults[cardId].notes;
                
                document.querySelectorAll('.score-buttons button').forEach(button => {
                    if (parseInt(button.getAttribute('data-score')) === score) {
                        button.classList.add('selected');
                    }
                });
                
                document.getElementById('observation-notes').value = notes;
            } else {
                // 清空评分
                document.querySelectorAll('.score-buttons button').forEach(button => {
                    button.classList.remove('selected');
                });
                document.getElementById('observation-notes').value = '';
            }
        })
        .catch(error => {
            console.error('加载卡片失败:', error);
            console.error('尝试加载的URL:', cardUrl);
            document.getElementById('current-card').innerHTML = `
                <div class="error-message">
                    <h3>加载卡片失败</h3>
                    <p>无法加载卡片 ${cardId}，请确保卡片文件存在。</p>
                    <p>路径: ${cardUrl}</p>
                    <p>错误信息: ${error.message}</p>
                </div>
            `;
        });
}

// 上一个卡片
function prevCard() {
    const cards = testData[currentLevel][currentDimension];
    if (cards.length === 0) return;
    
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    loadCard();
}

// 下一个卡片
function nextCard() {
    const cards = testData[currentLevel][currentDimension];
    if (cards.length === 0) return;
    
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    loadCard();
}

// 保存当前评分
function saveCurrentScore() {
    const cards = testData[currentLevel][currentDimension];
    if (cards.length === 0) return;
    
    const cardId = cards[currentCardIndex];
    const selectedScore = document.querySelector('.score-buttons button.selected');
    const notes = document.getElementById('observation-notes').value;
    
    if (!selectedScore) {
        alert('请选择评分');
        return;
    }
    
    const score = parseInt(selectedScore.getAttribute('data-score'));
    
    testResults[cardId] = {
        score: score,
        notes: notes,
        level: currentLevel,
        dimension: currentDimension
    };
    
    // 保存到本地存储
    saveAllResults();
    
    alert('评分已保存');
    
    // 自动前进到下一卡片
    nextCard();
}

// 保存所有测试结果到本地存储
function saveAllResults() {
    localStorage.setItem('testResults', JSON.stringify(testResults));
    console.log('测试结果已保存到本地存储');
}

// 从本地存储加载测试结果
function loadSavedResults() {
    const saved = localStorage.getItem('testResults');
    if (saved) {
        try {
            testResults = JSON.parse(saved);
            console.log('从本地存储加载了测试结果');
        } catch (e) {
            console.error('解析保存的测试结果时出错:', e);
            testResults = {};
        }
    }
}

// 显示结果页面
function showResultsPage() {
    console.log('显示结果页面');
    
    // 切换显示
    document.getElementById('test-card-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    
    // 更新导航状态
    document.querySelectorAll('.level-nav a').forEach(l => l.classList.remove('active'));
    document.querySelector('.level-nav a[data-level="results"]').classList.add('active');
    
    // 更新维度评分
    updateDimensionScores();
    
    // 更新级别进度
    updateLevelProgress();
    
    // 更新详细记录表格
    updateResultsTable();
}

// 更新维度评分卡片
function updateDimensionScores() {
    const dimensionScores = {};
    let totalCards = 0;
    
    // 计算各维度平均分
    for (const cardId in testResults) {
        const result = testResults[cardId];
        const dimension = result.dimension;
        
        if (!dimensionScores[dimension]) {
            dimensionScores[dimension] = {total: 0, count: 0};
        }
        
        dimensionScores[dimension].total += result.score;
        dimensionScores[dimension].count++;
        totalCards++;
    }
    
    // 生成评分卡片HTML
    const dimensionScoresContainer = document.getElementById('dimension-scores');
    dimensionScoresContainer.innerHTML = '';
    
    for (const dim in dimensionScores) {
        const avg = dimensionScores[dim].total / dimensionScores[dim].count;
        const dimName = dimensionNames[dim] || dim;
        
        const scoreCard = document.createElement('div');
        scoreCard.className = 'dimension-score-card';
        scoreCard.innerHTML = `
            <h4>${dimName}</h4>
            <div class="score">${avg.toFixed(1)}</div>
            <div class="score-label">平均分 (满分5分)</div>
        `;
        
        dimensionScoresContainer.appendChild(scoreCard);
    }
    
    // 如果没有评分数据
    if (Object.keys(dimensionScores).length === 0) {
        dimensionScoresContainer.innerHTML = '<p>暂无评分数据</p>';
    }
}

// 更新级别进度条
function updateLevelProgress() {
    const levelScores = {L1: 0, L2: 0, L3: 0};
    const levelCounts = {L1: 0, L2: 0, L3: 0};
    
    // 计算各级别总分和卡片数
    for (const level in testData) {
        for (const dim in testData[level]) {
            testData[level][dim].forEach(cardId => {
                levelCounts[level]++;
                if (testResults[cardId]) {
                    levelScores[level] += testResults[cardId].score;
                }
            });
        }
    }
    
    // 计算进度百分比
    for (const level in levelCounts) {
        if (levelCounts[level] === 0) continue;
        
        const maxScore = levelCounts[level] * 5; // 每张卡片满分5分
        const percent = (levelScores[level] / maxScore) * 100;
        
        document.getElementById(`${level.toLowerCase()}-progress-bar`).style.width = `${percent}%`;
        document.getElementById(`${level.toLowerCase()}-progress-percent`).textContent = `${percent.toFixed(1)}%`;
    }
}

// 更新详细结果表格
function updateResultsTable() {
    const tableBody = document.querySelector('#results-table tbody');
    tableBody.innerHTML = '';
    
    // 按级别和维度排序
    const sortedResults = Object.entries(testResults).sort((a, b) => {
        const levelA = a[1].level;
        const levelB = b[1].level;
        
        if (levelA !== levelB) {
            return levelA.localeCompare(levelB);
        }
        
        const dimA = a[1].dimension;
        const dimB = b[1].dimension;
        
        if (dimA !== dimB) {
            return dimA.localeCompare(dimB);
        }
        
        return a[0].localeCompare(b[0]);
    });
    
    // 生成表格行
    sortedResults.forEach(([cardId, result]) => {
        const row = document.createElement('tr');
        
        const idCell = document.createElement('td');
        idCell.textContent = cardId;
        
        const scoreCell = document.createElement('td');
        scoreCell.textContent = result.score;
        
        const notesCell = document.createElement('td');
        notesCell.textContent = result.notes;
        
        row.appendChild(idCell);
        row.appendChild(scoreCell);
        row.appendChild(notesCell);
        
        tableBody.appendChild(row);
    });
    
    // 如果没有评分数据
    if (sortedResults.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.textContent = '暂无评分数据';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tableBody.appendChild(row);
    }
}

// 导出测试报告
function exportReport() {
    console.log('导出测试报告');
    
    // 计算各维度平均分
    const dimensionScores = {};
    const levelScores = {L1: 0, L2: 0, L3: 0};
    const levelCounts = {L1: 0, L2: 0, L3: 0};
    let totalCards = 0;
    
    // 计算各级别总分和卡片数
    for (const level in testData) {
        for (const dim in testData[level]) {
            testData[level][dim].forEach(cardId => {
                levelCounts[level]++;
                if (testResults[cardId]) {
                    levelScores[level] += testResults[cardId].score;
                }
            });
        }
    }
    
    // 计算各维度平均分
    for (const cardId in testResults) {
        const result = testResults[cardId];
        const dimension = result.dimension;
        
        if (!dimensionScores[dimension]) {
            dimensionScores[dimension] = {total: 0, count: 0};
        }
        
        dimensionScores[dimension].total += result.score;
        dimensionScores[dimension].count++;
        totalCards++;
    }
    
    // 生成报告HTML
    let reportHTML = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI视觉能力测试报告</title>
            <style>
                body {
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1, h2 {
                    color: #2c3e50;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th {
                    background-color: #f5f5f5;
                }
                .progress-bar {
                    height: 20px;
                    background-color: #f1f1f1;
                    border-radius: 10px;
                    margin: 5px 0 15px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background-color: #4CAF50;
                    border-radius: 10px;
                }
            </style>
        </head>
        <body>
            <h1>AI视觉能力测试报告</h1>
            <p>测试日期: ${new Date().toLocaleDateString()}</p>
            
            <h2>维度评分</h2>
            <ul>
    `;
    
    for (const dim in dimensionScores) {
        const avg = dimensionScores[dim].total / dimensionScores[dim].count;
        const dimName = dimensionNames[dim] || dim;
        reportHTML += `<li>${dimName}: ${avg.toFixed(1)}/5</li>`;
    }
    
    reportHTML += `
            </ul>
            
            <h2>级别达成情况</h2>
    `;
    
    for (const level in levelCounts) {
        if (levelCounts[level] === 0) continue;
        
        const maxScore = levelCounts[level] * 5;
        const percent = (levelScores[level] / maxScore) * 100;
        
        let levelName = '';
        switch (level) {
            case 'L1': levelName = '基础级'; break;
            case 'L2': levelName = '进阶级'; break;
            case 'L3': levelName = '高级'; break;
        }
        
        reportHTML += `
            <p>${level} ${levelName}: ${percent.toFixed(1)}%</p>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${percent}%"></div>
            </div>
        `;
    }
    
    reportHTML += `
            <h2>详细测试记录</h2>
            <table>
                <thead>
                    <tr>
                        <th>测试卡ID</th>
                        <th>级别</th>
                        <th>维度</th>
                        <th>评分</th>
                        <th>观察笔记</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 按级别和维度排序
    const sortedResults = Object.entries(testResults).sort((a, b) => {
        const levelA = a[1].level;
        const levelB = b[1].level;
        
        if (levelA !== levelB) {
            return levelA.localeCompare(levelB);
        }
        
        const dimA = a[1].dimension;
        const dimB = b[1].dimension;
        
        if (dimA !== dimB) {
            return dimA.localeCompare(dimB);
        }
        
        return a[0].localeCompare(b[0]);
    });
    
    for (const [cardId, result] of sortedResults) {
        const dimName = dimensionNames[result.dimension] || result.dimension;
        
        reportHTML += `
            <tr>
                <td>${cardId}</td>
                <td>${result.level}</td>
                <td>${dimName}</td>
                <td>${result.score}</td>
                <td>${result.notes}</td>
            </tr>
        `;
    }
    
    reportHTML += `
                </tbody>
            </table>
            
            <h2>总结评价</h2>
            <p>测试完成度: ${(totalCards / Object.values(testData).flatMap(level => Object.values(level).flat()).length * 100).toFixed(1)}%</p>
            
            <p>注：本报告由AI视觉能力分级标准化测试工具自动生成。</p>
        </body>
        </html>
    `;
    
    // 创建下载链接
    const blob = new Blob([reportHTML], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI视觉能力测试报告.html';
    a.click();
    
    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
