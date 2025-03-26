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
    
    // 检查是否已有测试对象名称
    testSubject = localStorage.getItem('testSubject') || "";
    
    // 加载保存的测试结果
    loadSavedResults();
    
    // 设置事件监听器
    setupEventListeners();
    
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
    const continueButton = document.getElementById('continue-test-btn');
    const subjectInput = document.getElementById('test-subject');
    const existingTests = document.getElementById('existing-tests');
    const testSubjectsList = document.getElementById('test-subjects-list');
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 输入框获取焦点
    subjectInput.focus();
    
    // 清除之前的事件监听器（通过克隆和替换元素）
    const newSubjectInput = subjectInput.cloneNode(true);
    subjectInput.parentNode.replaceChild(newSubjectInput, subjectInput);
    
    const newStartButton = startButton.cloneNode(true);
    startButton.parentNode.replaceChild(newStartButton, startButton);
    
    const newContinueButton = continueButton.cloneNode(true);
    continueButton.parentNode.replaceChild(newContinueButton, continueButton);
    
    // 重新获取元素引用
    const refreshedSubjectInput = document.getElementById('test-subject');
    const refreshedStartButton = document.getElementById('start-test-btn');
    const refreshedContinueButton = document.getElementById('continue-test-btn');
    
    // 检查是否有已存在的测试对象
    try {
        const allResults = JSON.parse(localStorage.getItem('allTestResults')) || {};
        const existingSubjects = Object.keys(allResults);
        
        if (existingSubjects.length > 0) {
            // 显示继续按钮和已有测试列表
            refreshedContinueButton.style.display = 'block';
            existingTests.style.display = 'block';
            
            // 清空并重新填充测试对象列表
            testSubjectsList.innerHTML = '';
            existingSubjects.forEach(subject => {
                const li = document.createElement('li');
                li.textContent = subject;
                li.addEventListener('click', function() {
                    refreshedSubjectInput.value = subject;
                    refreshedStartButton.disabled = false;
                });
                testSubjectsList.appendChild(li);
            });
        } else {
            refreshedContinueButton.style.display = 'none';
            existingTests.style.display = 'none';
        }
    } catch (error) {
        console.error('获取已有测试对象时出错:', error);
        refreshedContinueButton.style.display = 'none';
        existingTests.style.display = 'none';
    }
    
    // 检查输入并启用/禁用开始按钮
    refreshedSubjectInput.addEventListener('input', function() {
        refreshedStartButton.disabled = !this.value.trim();
    });
    
    // 开始新测试按钮点击事件
    refreshedStartButton.addEventListener('click', function() {
        const subject = refreshedSubjectInput.value.trim();
        if (subject) {
            // 保存测试对象名称
            testSubject = subject;
            localStorage.setItem('testSubject', subject);
            
            // 清空当前测试结果（如果是已存在的测试对象，则会重新开始）
            testResults = {};
            saveTestResults();
            
            // 隐藏模态框
            modal.style.display = 'none';
            
            // 初始化测试
            updateDimensionNav();
            loadTestCard();
            updateTestProgress();
        }
    });
    
    // 继续测试按钮点击事件
    refreshedContinueButton.addEventListener('click', function() {
        const subject = refreshedSubjectInput.value.trim();
        if (subject) {
            // 保存测试对象名称
            testSubject = subject;
            localStorage.setItem('testSubject', subject);
            
            // 加载该测试对象的结果
            loadSavedResults();
            
            // 隐藏模态框
            modal.style.display = 'none';
            
            // 初始化测试
            updateDimensionNav();
            loadTestCard();
            updateTestProgress();
        }
    });
    
    // 测试对象列表项点击事件（在上面已添加）
    
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
    saveTestResults();
    
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
    try {
        // 获取所有测试结果
        const allResults = JSON.parse(localStorage.getItem('allTestResults')) || {};
        
        // 如果当前测试对象有保存的结果，则加载它
        if (testSubject && allResults[testSubject]) {
            testResults = allResults[testSubject];
        } else {
            testResults = {};
        }
    } catch (error) {
        console.error('加载保存的测试结果时出错:', error);
        testResults = {};
    }
}

// 保存测试结果
function saveTestResults() {
    try {
        // 获取所有测试结果
        const allResults = JSON.parse(localStorage.getItem('allTestResults')) || {};
        
        // 更新当前测试对象的结果
        if (testSubject) {
            allResults[testSubject] = testResults;
            localStorage.setItem('allTestResults', JSON.stringify(allResults));
        }
    } catch (error) {
        console.error('保存测试结果时出错:', error);
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
                    
                    // 获取测试卡片路径和信息
                    const cardPath = getCardPath(level, cardId);
                    const cardInfo = getTestCardInfo(cardPath, level, cardId, testResults[level][cardId].score);
                    
                    // 添加到结果表格
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${cardId}</td>
                        <td>${cardInfo.testName || '-'}</td>
                        <td>${testResults[level][cardId].score}</td>
                        <td>${cardInfo.scoreDescription || '-'}</td>
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
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
            <style>
                body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                .container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
                h1, h2, h3 { color: #1976D2; }
                .table-container { overflow-x: auto; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; table-layout: fixed; }
                th, td { border: 1px solid #ddd; padding: 12px 15px; text-align: left; }
                th { background-color: #f5f5f5; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                tr:hover { background-color: #f0f7ff; }
                th:nth-child(1) { width: 10%; }
                th:nth-child(2) { width: 25%; }
                th:nth-child(3) { width: 8%; }
                th:nth-child(4) { width: 32%; }
                th:nth-child(5) { width: 25%; }
                .progress-bar { height: 20px; background-color: #f5f5f5; border-radius: 10px; overflow: hidden; margin: 5px 0; }
                .progress-fill { height: 100%; background-color: #4CAF50; }
                
                /* 维度评分卡片样式 */
                .dimension-scores { 
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .dimension-score-card { 
                    padding: 15px; 
                    background-color: #f9f9f9; 
                    border-radius: 8px; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
                    text-align: center;
                }
                .dimension-icon { 
                    width: 60px; 
                    height: 60px; 
                    background-color: #1976D2; 
                    color: white; 
                    border-radius: 50%; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    margin: 0 auto 15px;
                    font-size: 24px;
                }
                .dimension-info h4 { 
                    margin: 0 0 10px; 
                    color: #333; 
                }
                .dimension-average { 
                    font-size: 2rem; 
                    font-weight: bold; 
                    color: #4CAF50; 
                }
                @media (max-width: 900px) {
                    .dimension-scores {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (max-width: 600px) {
                    .dimension-scores {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>AI视觉能力测试报告</h1>
                <p>测试对象: <strong>${testSubject}</strong></p>
                <p>测试日期: ${new Date().toLocaleDateString('zh-CN')}</p>
                
                <h2>维度评分</h2>
                <div class="dimension-scores">
    `;
    
    // 计算每个维度的平均分
    const dimensionAverages = {};
    const dimensionCounts = {};
    
    // 初始化维度计数和总分
    Object.keys(dimensionNames).forEach(dimension => {
        dimensionAverages[dimension] = 0;
        dimensionCounts[dimension] = 0;
    });
    
    // 计算每个维度的总分和计数
    Object.keys(testResults).forEach(level => {
        Object.keys(testResults[level]).forEach(cardId => {
            // 解析cardId，例如"L1-P-01"
            const parts = cardId.split('-');
            if (parts.length >= 3) {
                const dimensionCode = parts[1].toLowerCase();
                const dimensionMap = {
                    'p': 'perception',
                    's': 'social',
                    'm': 'memory',
                    't': 'temporal',
                    'c': 'cognitive'
                };
                
                const dimension = dimensionMap[dimensionCode];
                if (dimension && testResults[level][cardId].score) {
                    dimensionAverages[dimension] += parseInt(testResults[level][cardId].score);
                    dimensionCounts[dimension]++;
                }
            }
        });
    });
    
    // 计算每个维度的平均分
    Object.keys(dimensionNames).forEach(dimension => {
        if (dimensionCounts[dimension] > 0) {
            dimensionAverages[dimension] = (dimensionAverages[dimension] / dimensionCounts[dimension]).toFixed(1);
        }
    });
    
    // 添加维度评分卡片
    Object.keys(dimensionNames).forEach(dimension => {
        if (dimensionCounts[dimension] > 0) {
            const iconClass = dimensionIcons[dimension];
            resultsHTML += `
                <div class="dimension-score-card">
                    <div class="dimension-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="dimension-info">
                        <h4>${dimensionNames[dimension]}</h4>
                        <div class="dimension-average">${dimensionAverages[dimension]}</div>
                    </div>
                </div>
            `;
        }
    });
    
    resultsHTML += `
            </div>
            
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
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>测试卡ID</th>
                        <th>测试用例名称</th>
                        <th>评分</th>
                        <th>评分标准描述</th>
                        <th>观察笔记</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 添加所有已评分的测试卡
    Object.keys(testResults).forEach(level => {
        Object.keys(testResults[level]).forEach(cardId => {
            // 获取测试卡片路径和信息
            const cardPath = getCardPath(level, cardId);
            const cardInfo = getTestCardInfo(cardPath, level, cardId, testResults[level][cardId].score);
            
            resultsHTML += `
                <tr>
                    <td>${cardId}</td>
                    <td>${cardInfo.testName || '-'}</td>
                    <td>${testResults[level][cardId].score}</td>
                    <td>${cardInfo.scoreDescription || '-'}</td>
                    <td>${testResults[level][cardId].notes || '-'}</td>
                </tr>
            `;
        });
    });
    
    resultsHTML += `
            </tbody>
        </table>
        </div>
        </div>
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

// 获取测试卡片路径
function getCardPath(level, cardId) {
    // 解析cardId，例如"L1-P-01"
    const parts = cardId.split('-');
    if (parts.length < 3) return '';
    
    const cardLevel = parts[0]; // L1
    const dimensionCode = parts[1].toLowerCase(); // p
    
    // 映射维度代码到维度名称
    const dimensionMap = {
        'p': 'perception',
        's': 'social',
        'm': 'memory',
        't': 'temporal',
        'c': 'cognitive'
    };
    
    const dimension = dimensionMap[dimensionCode] || '';
    if (!dimension) return '';
    
    // 构建路径
    return `data/test_cases/${cardLevel}/${dimension}/${cardId}.html`;
}

// 获取测试卡片信息
function getTestCardInfo(cardPath, level, cardId, score) {
    let testName = '';
    let scoreDescription = '';
    
    try {
        // 使用XMLHttpRequest同步获取测试卡片内容
        const xhr = new XMLHttpRequest();
        xhr.open('GET', cardPath, false); // 第三个参数false表示同步请求
        xhr.send();
        
        if (xhr.status === 200) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xhr.responseText, 'text/html');
            
            // 获取测试用例名称
            const h2 = doc.querySelector('h2');
            if (h2) {
                // 处理两种可能的标题格式
                // 1. "测试卡 L2-P-01: 文字内容识别" - 带冒号
                // 2. "测试卡 L2-P-01 文字内容识别" - 不带冒号
                const titleText = h2.textContent.trim();
                
                if (titleText.includes(':')) {
                    // 处理带冒号的格式
                    const titleParts = titleText.split(':');
                    if (titleParts.length > 1) {
                        testName = titleParts[1].trim();
                    }
                } else {
                    // 处理不带冒号的格式，提取卡片ID后面的内容
                    const idPattern = new RegExp(`${cardId}\\s+(.+)$`);
                    const match = titleText.match(idPattern);
                    if (match && match[1]) {
                        testName = match[1].trim();
                    }
                }
            }
            
            // 获取评分标准描述
            const scoringCriteria = doc.querySelector('.scoring-criteria');
            if (scoringCriteria) {
                const scoreItems = scoringCriteria.querySelectorAll('li');
                scoreItems.forEach(item => {
                    if (item.textContent.startsWith(`${score}分`)) {
                        scoreDescription = item.textContent.substring(3).trim();
                    }
                });
            }
        }
    } catch (error) {
        console.error(`获取测试卡片内容出错 (${cardId}):`, error);
    }
    
    return { testName, scoreDescription };
}

// 导出并重新开始测试
function exportAndRestart() {
    exportResults();
    restartTest();
}

// 重新开始测试
function restartTest() {
    // 清空当前测试结果
    testResults = {};
    
    // 如果有当前测试对象，从allTestResults中移除它的结果
    if (testSubject) {
        try {
            const allResults = JSON.parse(localStorage.getItem('allTestResults')) || {};
            if (allResults[testSubject]) {
                delete allResults[testSubject];
                localStorage.setItem('allTestResults', JSON.stringify(allResults));
            }
        } catch (error) {
            console.error('清除测试结果时出错:', error);
        }
    }
    
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
