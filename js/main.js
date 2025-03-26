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

// 维度图标映射
const dimensionIcons = {
    perception: "fa-eye",
    social: "fa-users",
    memory: "fa-brain",
    temporal: "fa-clock",
    cognitive: "fa-lightbulb"
};

// 全局变量
let currentLevel = "L1";
let currentDimension = "perception";
let currentCardIndex = 0;
let testResults = {};
let testSubject = ""; // 测试对象名称

// 初始化函数
function init() {
    console.log("初始化测试工具...");
    
    // 加载保存的测试结果
    loadSavedResults();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 检查是否已有测试对象名称
    testSubject = localStorage.getItem('testSubject') || "";
    
    // 如果没有测试对象名称，显示欢迎对话框
    if (!testSubject) {
        showWelcomeModal();
    } else {
        // 初始化维度导航
        updateDimensionNav();
        
        // 加载第一个测试卡片
        loadTestCard();
        
        // 更新测试进度
        updateTestProgress();
    }
}

// 显示欢迎对话框
function showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    const startButton = document.getElementById('start-test-btn');
    const subjectInput = document.getElementById('test-subject');
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 输入框获取焦点
    subjectInput.focus();
    
    // 清除之前的事件监听器（通过克隆和替换元素）
    const newSubjectInput = subjectInput.cloneNode(true);
    subjectInput.parentNode.replaceChild(newSubjectInput, subjectInput);
    
    const newStartButton = startButton.cloneNode(true);
    startButton.parentNode.replaceChild(newStartButton, startButton);
    
    // 重新获取元素引用
    const refreshedSubjectInput = document.getElementById('test-subject');
    const refreshedStartButton = document.getElementById('start-test-btn');
    
    // 检查输入并启用/禁用开始按钮
    refreshedSubjectInput.addEventListener('input', function() {
        refreshedStartButton.disabled = !this.value.trim();
    });
    
    // 开始按钮点击事件
    refreshedStartButton.addEventListener('click', function() {
        const subject = refreshedSubjectInput.value.trim();
        if (subject) {
            // 保存测试对象名称
            testSubject = subject;
            localStorage.setItem('testSubject', subject);
            
            // 隐藏模态框
            modal.style.display = 'none';
            
            // 初始化测试
            updateDimensionNav();
            loadTestCard();
            updateTestProgress();
        }
    });
    
    // 回车键提交
    refreshedSubjectInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            refreshedStartButton.click();
        }
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 级别导航点击事件
    document.querySelectorAll('.level-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const level = this.getAttribute('data-level');
            
            // 切换到结果页面
            if (level === 'results') {
                showResultsPage();
                return;
            }
            
            // 更新当前级别
            currentLevel = level;
            currentDimension = Object.keys(testData[currentLevel])[0];
            currentCardIndex = 0;
            
            // 更新UI
            updateActiveLevelNav();
            updateDimensionNav();
            loadTestCard();
            updateTestProgress();
            
            // 显示测试卡片容器和维度导航面板
            document.getElementById('test-card-container').style.display = 'block';
            document.getElementById('results-container').style.display = 'none';
            document.querySelector('.dimension-panel').style.display = 'flex';
        });
    });
    
    // 上一个/下一个按钮点击事件
    document.getElementById('prev-card').addEventListener('click', navigateToPrevCard);
    document.getElementById('next-card').addEventListener('click', navigateToNextCard);
    
    // 评分按钮点击事件
    document.querySelectorAll('.score-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按钮的选中状态
            document.querySelectorAll('.score-buttons button').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // 添加当前按钮的选中状态
            this.classList.add('selected');
        });
    });
    
    // 保存评分按钮点击事件
    document.getElementById('save-score').addEventListener('click', saveCurrentScore);
    
    // 导出按钮点击事件
    document.getElementById('export-btn').addEventListener('click', exportResults);
    
    // 导出并重新开始按钮点击事件
    document.getElementById('export-restart-btn').addEventListener('click', exportAndRestart);
    
    // 移动端菜单切换
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // 左箭头 - 上一个卡片
        if (e.key === 'ArrowLeft') {
            navigateToPrevCard();
        }
        // 右箭头 - 下一个卡片
        else if (e.key === 'ArrowRight') {
            navigateToNextCard();
        }
        // 数字键1-5 - 评分
        else if (['1', '2', '3', '4', '5'].includes(e.key)) {
            const scoreButton = document.querySelector(`.score-buttons button[data-score="${e.key}"]`);
            if (scoreButton) {
                // 移除其他按钮的选中状态
                document.querySelectorAll('.score-buttons button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // 添加当前按钮的选中状态
                scoreButton.classList.add('selected');
            }
        }
    });
}

// 更新维度导航
function updateDimensionNav() {
    const dimensionsContainer = document.getElementById('dimensions');
    dimensionsContainer.innerHTML = '';
    
    // 获取当前级别的维度
    const dimensions = Object.keys(testData[currentLevel]);
    
    // 为每个维度创建导航项
    dimensions.forEach(dimension => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.innerHTML = `<i class="fas ${dimensionIcons[dimension]}"></i> ${dimensionNames[dimension]}`;
        a.setAttribute('data-dimension', dimension);
        
        // 设置当前维度为活动状态
        if (dimension === currentDimension) {
            a.classList.add('active');
        }
        
        // 添加点击事件
        a.addEventListener('click', function(e) {
            e.preventDefault();
            currentDimension = this.getAttribute('data-dimension');
            currentCardIndex = 0;
            
            // 更新UI
            updateActiveDimensionNav();
            loadTestCard();
        });
        
        li.appendChild(a);
        dimensionsContainer.appendChild(li);
    });
}

// 更新活动级别导航
function updateActiveLevelNav() {
    document.querySelectorAll('.level-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.level-nav a[data-level="${currentLevel}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// 更新活动维度导航
function updateActiveDimensionNav() {
    document.querySelectorAll('.dimension-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.dimension-nav a[data-dimension="${currentDimension}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// 加载测试卡片
function loadTestCard() {
    const cardContainer = document.getElementById('current-card');
    const cardTitle = document.getElementById('current-card-title');
    const cardIndicator = document.getElementById('card-indicator');
    
    // 获取当前卡片ID
    const currentCards = testData[currentLevel][currentDimension];
    const cardId = currentCards[currentCardIndex];
    
    // 更新卡片指示器
    cardIndicator.textContent = `${currentCardIndex + 1}/${currentCards.length}`;
    
    // 加载卡片内容
    fetch(`data/test_cases/${currentLevel}/${currentDimension}/${cardId}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            cardContainer.innerHTML = html;
            
            // 提取并设置卡片标题
            const titleElement = cardContainer.querySelector('h2');
            if (titleElement) {
                cardTitle.textContent = titleElement.textContent;
                titleElement.style.display = 'none'; // 隐藏原标题
            }
            
            // 更新按钮状态
            updateNavigationButtons();
            
            // 加载已保存的评分（如果有）
            loadSavedScore(cardId);
            
            // 添加淡入动画
            cardContainer.classList.add('fade-in');
            setTimeout(() => {
                cardContainer.classList.remove('fade-in');
            }, 300);
        })
        .catch(error => {
            console.error('加载测试卡片出错:', error);
            cardContainer.innerHTML = `<div class="error-message">加载测试卡片失败: ${cardId}</div>`;
        });
}

// 更新导航按钮状态
function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-card');
    const nextButton = document.getElementById('next-card');
    const currentCards = testData[currentLevel][currentDimension];
    
    // 禁用/启用上一个按钮
    prevButton.disabled = currentCardIndex === 0;
    
    // 禁用/启用下一个按钮
    nextButton.disabled = currentCardIndex === currentCards.length - 1;
}

// 导航到上一个卡片
function navigateToPrevCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        loadTestCard();
    }
}

// 导航到下一个卡片
function navigateToNextCard() {
    const currentCards = testData[currentLevel][currentDimension];
    if (currentCardIndex < currentCards.length - 1) {
        currentCardIndex++;
        loadTestCard();
    }
}

// 保存当前评分
function saveCurrentScore() {
    const selectedScore = document.querySelector('.score-buttons button.selected');
    const notes = document.getElementById('observation-notes').value;
    const cardId = testData[currentLevel][currentDimension][currentCardIndex];
    
    if (!selectedScore) {
        alert('请先选择一个评分!');
        return;
    }
    
    const score = parseInt(selectedScore.getAttribute('data-score'));
    
    // 保存评分
    if (!testResults[currentLevel]) {
        testResults[currentLevel] = {};
    }
    
    testResults[currentLevel][cardId] = {
        score: score,
        notes: notes,
        dimension: currentDimension
    };
    
    // 保存到本地存储
    localStorage.setItem('testResults', JSON.stringify(testResults));
    
    // 更新测试进度
    updateTestProgress();
    
    // 提供保存成功的反馈
    const saveButton = document.getElementById('save-score');
    const originalText = saveButton.textContent;
    saveButton.textContent = '已保存!';
    saveButton.style.backgroundColor = '#2E7D32';
    
    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.backgroundColor = '';
    }, 1500);
    
    // 自动导航到下一个卡片、维度或级别
    setTimeout(() => {
        const currentCards = testData[currentLevel][currentDimension];
        
        // 如果当前维度还有下一个卡片，导航到下一个卡片
        if (currentCardIndex < currentCards.length - 1) {
            navigateToNextCard();
        } 
        // 如果当前维度的卡片已测试完，尝试切换到下一个维度
        else {
            const dimensions = Object.keys(testData[currentLevel]);
            const currentDimensionIndex = dimensions.indexOf(currentDimension);
            
            // 如果还有下一个维度
            if (currentDimensionIndex < dimensions.length - 1) {
                // 切换到下一个维度的第一个卡片
                currentDimension = dimensions[currentDimensionIndex + 1];
                currentCardIndex = 0;
                
                // 更新UI
                updateActiveDimensionNav();
                loadTestCard();
            } 
            // 如果当前级别的所有维度都测试完了，尝试切换到下一个级别
            else {
                const levels = ["L1", "L2", "L3"];
                const currentLevelIndex = levels.indexOf(currentLevel);
                
                // 如果还有下一个级别
                if (currentLevelIndex < levels.length - 1) {
                    // 切换到下一个级别的第一个维度的第一个卡片
                    currentLevel = levels[currentLevelIndex + 1];
                    currentDimension = Object.keys(testData[currentLevel])[0];
                    currentCardIndex = 0;
                    
                    // 更新UI
                    updateActiveLevelNav();
                    updateDimensionNav();
                    loadTestCard();
                } 
                // 如果所有级别都测试完了，显示结果页面
                else {
                    // 可选：自动显示结果页面
                    // showResultsPage();
                    
                    // 或者提示用户已完成所有测试
                    alert('恭喜！您已完成所有测试。可以点击"测试结果"查看详细报告。');
                }
            }
        }
    }, 500);
}

// 加载已保存的评分
function loadSavedScore(cardId) {
    // 重置评分UI
    document.querySelectorAll('.score-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('observation-notes').value = '';
    
    // 检查是否有已保存的评分
    if (testResults[currentLevel] && testResults[currentLevel][cardId]) {
        const result = testResults[currentLevel][cardId];
        
        // 设置评分按钮
        const scoreButton = document.querySelector(`.score-buttons button[data-score="${result.score}"]`);
        if (scoreButton) {
            scoreButton.classList.add('selected');
        }
        
        // 设置观察笔记
        document.getElementById('observation-notes').value = result.notes || '';
    }
}

// 加载保存的测试结果
function loadSavedResults() {
    const savedResults = localStorage.getItem('testResults');
    if (savedResults) {
        testResults = JSON.parse(savedResults);
    }
}

// 更新测试进度
function updateTestProgress() {
    // 计算已完成的测试卡片数量
    let completedCount = 0;
    let totalCount = 0;
    
    // 计算当前级别的已完成和总数
    Object.keys(testData[currentLevel]).forEach(dimension => {
        testData[currentLevel][dimension].forEach(cardId => {
            totalCount++;
            if (testResults[currentLevel] && testResults[currentLevel][cardId]) {
                completedCount++;
            }
        });
    });
    
    // 更新进度条
    const progressFill = document.getElementById('test-progress');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill && progressText) {
        const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        progressFill.style.width = `${progressPercent}%`;
        progressText.textContent = `${completedCount}/${totalCount} 完成`;
    }
}

// 显示结果页面
function showResultsPage() {
    // 隐藏测试卡片容器，显示结果容器
    document.getElementById('test-card-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    
    // 隐藏维度导航面板
    document.querySelector('.dimension-panel').style.display = 'none';
    
    // 更新结果页面
    updateResultsPage();
    
    // 更新活动导航
    document.querySelectorAll('.level-nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.level-nav a[data-level="results"]').classList.add('active');
}

// 更新结果页面
function updateResultsPage() {
    // 设置测试对象名称和日期
    document.getElementById('test-subject-display').textContent = testSubject;
    document.getElementById('test-date').textContent = new Date().toLocaleDateString('zh-CN');
    
    // 清空维度评分容器
    const dimensionScores = document.getElementById('dimension-scores');
    dimensionScores.innerHTML = '';
    
    // 清空结果表格
    const resultsTable = document.getElementById('results-table').querySelector('tbody');
    resultsTable.innerHTML = '';
    
    // 计算各级别的完成情况
    const levelProgress = {
        L1: { completed: 0, total: 0 },
        L2: { completed: 0, total: 0 },
        L3: { completed: 0, total: 0 }
    };
    
    // 计算维度平均分
    const dimensionAverages = {};
    
    // 处理所有测试结果
    Object.keys(testData).forEach(level => {
        Object.keys(testData[level]).forEach(dimension => {
            // 初始化维度平均分
            if (!dimensionAverages[dimension]) {
                dimensionAverages[dimension] = { sum: 0, count: 0 };
            }
            
            testData[level][dimension].forEach(cardId => {
                // 更新级别总数
                levelProgress[level].total++;
                
                // 检查是否有评分
                if (testResults[level] && testResults[level][cardId]) {
                    // 更新级别已完成数
                    levelProgress[level].completed++;
                    
                    // 更新维度平均分
                    dimensionAverages[dimension].sum += testResults[level][cardId].score;
                    dimensionAverages[dimension].count++;
                    
                    // 添加到结果表格
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${cardId}</td>
                        <td>${testResults[level][cardId].score}</td>
                        <td>${testResults[level][cardId].notes || '-'}</td>
                    `;
                    resultsTable.appendChild(tr);
                }
            });
        });
    });
    
    // 创建维度评分卡片
    Object.keys(dimensionAverages).forEach(dimension => {
        if (dimensionAverages[dimension].count > 0) {
            const average = (dimensionAverages[dimension].sum / dimensionAverages[dimension].count).toFixed(1);
            
            const dimensionCard = document.createElement('div');
            dimensionCard.className = 'dimension-score-card';
            dimensionCard.innerHTML = `
                <div class="dimension-icon">
                    <i class="fas ${dimensionIcons[dimension]}"></i>
                </div>
                <div class="dimension-info">
                    <h4>${dimensionNames[dimension]}</h4>
                    <div class="dimension-average">${average}</div>
                </div>
            `;
            dimensionScores.appendChild(dimensionCard);
        }
    });
    
    // 更新级别进度条
    Object.keys(levelProgress).forEach(level => {
        const percent = levelProgress[level].total > 0 
            ? Math.round((levelProgress[level].completed / levelProgress[level].total) * 100) 
            : 0;
        
        document.getElementById(`${level.toLowerCase()}-progress-bar`).style.width = `${percent}%`;
        document.getElementById(`${level.toLowerCase()}-progress-percent`).textContent = `${percent}%`;
    });
}

// 导出测试结果
function exportResults() {
    // 创建结果HTML
    let resultsHTML = `
        <html>
        <head>
            <title>AI视觉能力测试报告</title>
            <style>
                body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                h1, h2, h3 { color: #1976D2; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .progress-bar { height: 20px; background-color: #f5f5f5; border-radius: 10px; overflow: hidden; margin: 5px 0; }
                .progress-fill { height: 100%; background-color: #4CAF50; }
            </style>
        </head>
        <body>
            <h1>AI视觉能力测试报告</h1>
            <p>测试对象: <strong>${testSubject}</strong></p>
            <p>测试日期: ${new Date().toLocaleDateString('zh-CN')}</p>
            
            <h2>级别达成情况</h2>
    `;
    
    // 添加级别进度
    Object.keys(testData).forEach(level => {
        let completed = 0;
        let total = 0;
        
        Object.keys(testData[level]).forEach(dimension => {
            testData[level][dimension].forEach(cardId => {
                total++;
                if (testResults[level] && testResults[level][cardId]) {
                    completed++;
                }
            });
        });
        
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        resultsHTML += `
            <h3>${level} ${level === 'L1' ? '基础级' : level === 'L2' ? '进阶级' : '高级'}</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
            <p>${completed}/${total} 完成 (${percent}%)</p>
        `;
    });

    // 添加详细结果表格
    resultsHTML += `
        <h2>详细测试记录</h2>
        <table>
            <thead>
                <tr>
                    <th>测试卡ID</th>
                    <th>评分</th>
                    <th>观察笔记</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // 添加所有已评分的测试卡
    Object.keys(testResults).forEach(level => {
        Object.keys(testResults[level]).forEach(cardId => {
            resultsHTML += `
                <tr>
                    <td>${cardId}</td>
                    <td>${testResults[level][cardId].score}</td>
                    <td>${testResults[level][cardId].notes || '-'}</td>
                </tr>
            `;
        });
    });
    
    resultsHTML += `
            </tbody>
        </table>
        </body>
        </html>
    `;
    
    // 创建Blob并下载
    const blob = new Blob([resultsHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI视觉能力测试报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// 导出并重新开始测试
function exportAndRestart() {
    exportResults();
    restartTest();
}

// 重新开始测试
function restartTest() {
    // 清空测试结果
    testResults = {};
    localStorage.removeItem('testResults');
    
    // 清空测试对象名称
    testSubject = "";
    localStorage.removeItem('testSubject');
    
    // 重置测试进度
    updateTestProgress();
    
    // 切换到第一个级别和维度
    currentLevel = "L1";
    currentDimension = Object.keys(testData[currentLevel])[0];
    currentCardIndex = 0;
    
    // 更新UI
    updateActiveLevelNav();
    
    // 显示欢迎对话框
    showWelcomeModal();
}

// 切换侧边栏（移动端）
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
