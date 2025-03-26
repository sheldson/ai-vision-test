# AI视觉能力测试网站重构方案

## 背景

基于标准化测试用例的结构化特点，本文档提出一套完整的网站重构方案，旨在提高代码可维护性、用户体验和功能扩展性。

## 整体架构调整

### 1. 整体架构

采用模块化的设计，将网站分为以下几个主要部分：

1. **导航系统**：基于测试级别和维度创建双层导航
2. **测试卡片展示区**：动态加载测试卡片内容
3. **评分记录系统**：记录和展示测试结果
4. **总结报告区**：汇总所有测试结果并生成报告

### 2. 文件结构重组

```
测试网站/
├── index.html            # 主页面
├── css/
│   ├── main.css          # 基础样式
│   ├── cards.css         # 卡片样式
│   └── results.css       # 结果页面样式
├── js/
│   ├── main.js           # 主要逻辑
│   ├── cards.js          # 卡片交互逻辑
│   ├── navigation.js     # 导航逻辑
│   └── results.js        # 结果处理逻辑
├── data/
│   └── test_cases/       # 测试卡片数据（HTML模板）
│       ├── L1/
│       │   ├── perception/
│       │   │   ├── L1-P-01.html
│       │   │   ├── L1-P-02.html
│       │   │   └── ...
│       │   ├── social/
│       │   └── memory/
│       ├── L2/
│       └── L3/
└── templates/            # HTML模板
    ├── card_template.html
    └── report_template.html
```

## 具体实现方案

### 1. HTML结构改造

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI视觉能力分级标准化测试</title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/cards.css">
    <link rel="stylesheet" href="css/results.css">
</head>
<body>
    <!-- 顶部导航 - 级别选择 -->
    <nav class="level-nav">
        <ul>
            <li><a href="#" data-level="L1" class="active">L1 基础级</a></li>
            <li><a href="#" data-level="L2">L2 进阶级</a></li>
            <li><a href="#" data-level="L3">L3 高级</a></li>
        </ul>
    </nav>
    
    <!-- 二级导航 - 维度选择 -->
    <nav class="dimension-nav">
        <ul id="dimensions">
            <!-- 动态生成维度选项 -->
        </ul>
    </nav>
    
    <!-- 测试卡片容器 -->
    <div class="card-container">
        <div class="card-navigation">
            <button id="prev-card">上一个</button>
            <span id="card-indicator">1/10</span>
            <button id="next-card">下一个</button>
        </div>
        
        <div id="current-card" class="test-card">
            <!-- 测试卡片内容将通过JS动态加载 -->
        </div>
        
        <!-- 评分输入区 -->
        <div class="scoring-section">
            <div class="score-selector">
                <span>评分：</span>
                <div class="score-buttons">
                    <button data-score="1">1</button>
                    <button data-score="2">2</button>
                    <button data-score="3">3</button>
                    <button data-score="4">4</button>
                    <button data-score="5">5</button>
                </div>
            </div>
            <div class="notes-input">
                <label for="observation-notes">观察笔记：</label>
                <textarea id="observation-notes" rows="4"></textarea>
            </div>
            <button id="save-score">保存评分</button>
        </div>
    </div>
    
    <!-- 结果汇总面板 -->
    <div class="results-panel" style="display: none;">
        <h2>测试结果汇总</h2>
        <div class="dimension-results">
            <!-- 各维度结果将在这里显示 -->
        </div>
        <div class="overall-score">
            <h3>总体评分</h3>
            <div class="score-chart"></div>
        </div>
        <button id="export-results">导出报告</button>
    </div>
    
    <script src="js/main.js"></script>
    <script src="js/cards.js"></script>
    <script src="js/navigation.js"></script>
    <script src="js/results.js"></script>
</body>
</html>
```

### 2. 测试卡片模板化

每个测试卡片使用HTML模板存储，例如 `L1-P-01.html`：

```html
<div class="test-card" id="L1-P-01">
    <h2>测试卡 L1-P-01: 基础物品识别</h2>
    <div class="card-metadata">
        <p><strong>级别/维度:</strong> L1 / 感知维度</p>
        <p><strong>测试目的:</strong> 评估玩偶识别常见物品的基本能力</p>
    </div>
    
    <div class="card-content">
        <div class="materials">
            <h3>所需材料:</h3>
            <ul>
                <li>5-8种不同类别的常见物品（书籍、玩具、文具、食物模型等）</li>
            </ul>
        </div>
        
        <div class="steps">
            <h3>执行步骤:</h3>
            <ol>
                <li>准备测试物品，确保玩偶视野良好</li>
                <li>逐一向玩偶展示物品，每次询问"这是什么？"</li>
                <li>记录玩偶对每个物品的识别结果</li>
            </ol>
        </div>
        
        <div class="scoring-criteria">
            <h3>评分标准:</h3>
            <ul>
                <li><strong>1分:</strong> 无法识别大多数物品(0-20%正确率)</li>
                <li><strong>2分:</strong> 能识别部分物品但错误率高(21-50%正确率)</li>
                <li><strong>3分:</strong> 能正确识别大部分物品(51-80%正确率)</li>
                <li><strong>4分:</strong> 几乎能识别所有物品(81-95%正确率)</li>
                <li><strong>5分:</strong> 完美识别所有物品且描述准确(96-100%正确率)</li>
            </ul>
        </div>
        
        <div class="observation-points">
            <h3>观察要点:</h3>
            <ul>
                <li>是否能识别不同类别的物品</li>
                <li>识别速度和准确性</li>
                <li>对不确定物品的处理方式</li>
            </ul>
        </div>
    </div>
</div>
```

## JavaScript实现核心功能

### 1. main.js - 主要逻辑

```javascript
// 全局变量
const testData = {
    L1: {
        perception: ["L1-P-01", "L1-P-02", "L1-P-03", "L1-P-04"],
        social: ["L1-S-01", "L1-S-02", "L1-S-03"],
        memory: []
    },
    L2: {
        perception: ["L2-P-01", "L2-P-02", "L2-P-03", "L2-P-04"],
        social: ["L2-S-01", "L2-S-02", "L2-S-03", "L2-S-04"],
        memory: ["L2-M-01", "L2-M-02", "L2-M-03", "L2-M-04"]
    },
    L3: {
        perception: ["L3-P-01", "L3-P-02", "L3-P-03"],
        social: [],
        memory: [],
        temporal: ["L3-T-01"],
        cognitive: []
    }
};

let currentLevel = "L1";
let currentDimension = "perception";
let currentCardIndex = 0;
let testResults = {};

// 初始化函数
function init() {
    // 设置默认级别和维度
    updateDimensionNav(currentLevel);
    loadCard();
    
    // 绑定事件监听器
    document.querySelectorAll('.level-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.level-nav a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            currentLevel = this.getAttribute('data-level');
            updateDimensionNav(currentLevel);
            currentDimension = Object.keys(testData[currentLevel])[0];
            currentCardIndex = 0;
            loadCard();
        });
    });
    
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
}

// 更新维度导航
function updateDimensionNav(level) {
    const dimensionsNav = document.getElementById('dimensions');
    dimensionsNav.innerHTML = '';
    
    const dimensions = Object.keys(testData[level]);
    dimensions.forEach(dim => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.setAttribute('data-dimension', dim);
        
        // 设置显示名称
        let displayName = '';
        switch(dim) {
            case 'perception': displayName = '感知维度'; break;
            case 'social': displayName = '社交维度'; break;
            case 'memory': displayName = '记忆维度'; break;
            case 'temporal': displayName = '时序维度'; break;
            case 'cognitive': displayName = '认知维度'; break;
        }
        
        a.textContent = displayName;
        if(dim === currentDimension) a.classList.add('active');
        
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
    const cards = testData[currentLevel][currentDimension];
    if(cards.length === 0) {
        document.getElementById('current-card').innerHTML = '<p>此维度暂无测试卡片</p>';
        document.getElementById('card-indicator').textContent = '0/0';
        return;
    }
    
    const cardId = cards[currentCardIndex];
    
    // 使用fetch加载卡片HTML
    fetch(`data/test_cases/${currentLevel}/${currentDimension}/${cardId}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('current-card').innerHTML = html;
            document.getElementById('card-indicator').textContent = `${currentCardIndex + 1}/${cards.length}`;
            
            // 如果有保存的评分，恢复显示
            if(testResults[cardId]) {
                const score = testResults[cardId].score;
                const notes = testResults[cardId].notes;
                
                document.querySelectorAll('.score-buttons button').forEach(button => {
                    if(parseInt(button.getAttribute('data-score')) === score) {
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
            document.getElementById('current-card').innerHTML = '<p>加载卡片失败</p>';
        });
}

// 上一个卡片
function prevCard() {
    const cards = testData[currentLevel][currentDimension];
    if(cards.length === 0) return;
    
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    loadCard();
}

// 下一个卡片
function nextCard() {
    const cards = testData[currentLevel][currentDimension];
    if(cards.length === 0) return;
    
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    loadCard();
}

// 保存当前评分
function saveCurrentScore() {
    const cards = testData[currentLevel][currentDimension];
    if(cards.length === 0) return;
    
    const cardId = cards[currentCardIndex];
    const selectedScore = document.querySelector('.score-buttons button.selected');
    const notes = document.getElementById('observation-notes').value;
    
    if(!selectedScore) {
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
    
    alert('评分已保存');
    
    // 自动前进到下一卡片
    nextCard();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
```

### 2. 数据存储与导出

为了保存测试结果，使用localStorage进行本地存储，并提供导出功能：

```javascript
// results.js

// 保存所有测试结果
function saveAllResults() {
    localStorage.setItem('testResults', JSON.stringify(testResults));
}

// 加载保存的测试结果
function loadSavedResults() {
    const saved = localStorage.getItem('testResults');
    if(saved) {
        testResults = JSON.parse(saved);
    }
}

// 导出测试报告
function exportReport() {
    // 计算各维度平均分
    const dimensionScores = {};
    const levelScores = {L1: 0, L2: 0, L3: 0};
    let totalCards = 0;
    
    for(const cardId in testResults) {
        const result = testResults[cardId];
        const dimension = result.dimension;
        const level = result.level;
        
        if(!dimensionScores[dimension]) {
            dimensionScores[dimension] = {total: 0, count: 0};
        }
        
        dimensionScores[dimension].total += result.score;
        dimensionScores[dimension].count++;
        
        levelScores[level] += result.score;
        totalCards++;
    }
    
    // 生成报告HTML
    let reportHTML = `
        <h1>AI视觉能力测试报告</h1>
        <p>测试日期: ${new Date().toLocaleDateString()}</p>
        
        <h2>维度评分</h2>
        <ul>
    `;
    
    for(const dim in dimensionScores) {
        const avg = dimensionScores[dim].total / dimensionScores[dim].count;
        let dimName = '';
        switch(dim) {
            case 'perception': dimName = '感知维度'; break;
            case 'social': dimName = '社交维度'; break;
            case 'memory': dimName = '记忆维度'; break;
            case 'temporal': dimName = '时序维度'; break;
            case 'cognitive': dimName = '认知维度'; break;
        }
        reportHTML += `<li>${dimName}: ${avg.toFixed(1)}/5</li>`;
    }
    
    reportHTML += `
        </ul>
        
        <h2>级别达成情况</h2>
        <p>L1 基础级: ${(levelScores.L1 / (Object.keys(testData.L1).flatMap(dim => testData.L1[dim]).length * 5) * 100).toFixed(1)}%</p>
        <p>L2 进阶级: ${(levelScores.L2 / (Object.keys(testData.L2).flatMap(dim => testData.L2[dim]).length * 5) * 100).toFixed(1)}%</p>
        <p>L3 高级: ${(levelScores.L3 / (Object.keys(testData.L3).flatMap(dim => testData.L3[dim]).length * 5) * 100).toFixed(1)}%</p>
        
        <h2>详细测试记录</h2>
        <table border="1">
            <tr>
                <th>测试卡ID</th>
                <th>评分</th>
                <th>观察笔记</th>
            </tr>
    `;
    
    for(const cardId in testResults) {
        reportHTML += `
            <tr>
                <td>${cardId}</td>
                <td>${testResults[cardId].score}</td>
                <td>${testResults[cardId].notes}</td>
            </tr>
        `;
    }
    
    reportHTML += `
        </table>
        
        <h2>总结评价</h2>
        <p>测试完成度: ${(totalCards / Object.values(testData).flatMap(level => Object.values(level).flat()).length * 100).toFixed(1)}%</p>
    `;
    
    // 创建下载链接
    const blob = new Blob([reportHTML], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI视觉能力测试报告.html';
    a.click();
}

// 初始化时加载保存的结果
document.addEventListener('DOMContentLoaded', loadSavedResults);
```

### 3. 响应式设计

为了确保在不同设备上都能良好显示，CSS部分需要添加响应式设计：

```css
/* main.css */
body {
    font-family: 'Microsoft YaHei', Arial, sans-serif;
    margin: 0;
    padding: 0;
    color: #333;
}

.level-nav, .dimension-nav {
    background-color: #f5f5f5;
    padding: 10px 0;
}

.level-nav ul, .dimension-nav ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    justify-content: center;
}

.level-nav li, .dimension-nav li {
    margin: 0 15px;
}

.level-nav a, .dimension-nav a {
    text-decoration: none;
    color: #666;
    padding: 5px 10px;
    border-radius: 4px;
}

.level-nav a.active, .dimension-nav a.active {
    background-color: #4CAF50;
    color: white;
}

.card-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.card-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.test-card {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 20px;
}

.scoring-section {
    margin-top: 20px;
}

.score-buttons {
    display: flex;
    gap: 10px;
    margin: 10px 0;
}

.score-buttons button {
    width: 40px;
    height: 40px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
}

.score-buttons button.selected {
    background: #4CAF50;
    color: white;
}

.notes-input textarea {
    width: 100%;
    margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .level-nav ul, .dimension-nav ul {
        flex-direction: column;
    }
    
    .card-container {
        padding: 10px;
    }
    
    .test-card {
        padding: 15px;
    }
}

/* 适配平板 */
@media (min-width: 769px) and (max-width: 1024px) {
    .card-container {
        padding: 20px;
    }
}
```

## 实施计划

### 1. 分阶段实施

1. **第一阶段：创建基础框架和导航系统**
   - 创建文件夹结构
   - 实现基本HTML框架
   - 设计CSS样式
   - 实现级别和维度导航功能

2. **第二阶段：实现测试卡片的动态加载**
   - 将测试卡片内容转换为HTML模板
   - 实现卡片加载和切换功能
   - 添加卡片导航控制

3. **第三阶段：添加评分和结果存储功能**
   - 实现评分界面
   - 添加本地存储功能
   - 开发结果汇总视图

4. **第四阶段：完善报告导出和数据可视化**
   - 实现测试报告生成
   - 添加数据可视化图表
   - 优化用户界面和交互体验

### 2. 测试卡片转换

将Markdown格式的测试卡片转换为HTML模板可以通过以下步骤完成：

1. 编写一个简单的转换脚本，将每个测试卡片的内容提取并转换为HTML格式
2. 按级别和维度组织文件夹结构
3. 为每个测试卡片创建单独的HTML文件

可以使用Python或Node.js编写转换脚本，例如：

```javascript
// convert_cards.js
const fs = require('fs');
const path = require('path');
const markdown = fs.readFileSync('test_case.md', 'utf8');

// 提取测试卡片
const cardRegex = /---\n测试卡 (L\d-[A-Z]-\d\d): (.+?)\n级别\/维度: (L\d) \/ (.+?)\n测试目的: (.+?)\n所需材料:\n([\s\S]+?)执行步骤:\n([\s\S]+?)评分标准:\n([\s\S]+?)观察要点:\n([\s\S]+?)结果记录:/g;

let match;
while ((match = cardRegex.exec(markdown)) !== null) {
    const [_, cardId, title, level, dimension, purpose, materials, steps, criteria, observations] = match;
    
    // 确定维度文件夹
    let dimensionFolder = '';
    if (dimension.includes('感知')) dimensionFolder = 'perception';
    else if (dimension.includes('社交')) dimensionFolder = 'social';
    else if (dimension.includes('记忆')) dimensionFolder = 'memory';
    else if (dimension.includes('时序')) dimensionFolder = 'temporal';
    else if (dimension.includes('认知')) dimensionFolder = 'cognitive';
    
    // 创建目录
    const dir = path.join('data', 'test_cases', level, dimensionFolder);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    // 创建HTML内容
    const html = `<div class="test-card" id="${cardId}">
    <h2>测试卡 ${cardId}: ${title}</h2>
    <div class="card-metadata">
        <p><strong>级别/维度:</strong> ${level} / ${dimension}</p>
        <p><strong>测试目的:</strong> ${purpose}</p>
    </div>
    
    <div class="card-content">
        <div class="materials">
            <h3>所需材料:</h3>
            ${formatList(materials)}
        </div>
        
        <div class="steps">
            <h3>执行步骤:</h3>
            ${formatOrderedList(steps)}
        </div>
        
        <div class="scoring-criteria">
            <h3>评分标准:</h3>
            ${formatList(criteria)}
        </div>
        
        <div class="observation-points">
            <h3>观察要点:</h3>
            ${formatList(observations)}
        </div>
    </div>
</div>`;
    
    // 写入文件
    fs.writeFileSync(path.join(dir, `${cardId}.html`), html);
    console.log(`Created ${cardId}.html`);
}

function formatList(text) {
    // 简单的列表格式化
    return text.trim().split('\n').map(line => {
        line = line.trim();
        if (line.startsWith('-')) {
            return `<li>${line.substring(1).trim()}</li>`;
        } else if (line.match(/^\d+\./)) {
            return `<li>${line.substring(line.indexOf('.')+1).trim()}</li>`;
        }
        return line;
    }).join('\n');
}

function formatOrderedList(text) {
    // 有序列表格式化
    const items = text.trim().split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => `<li>${line.substring(line.indexOf('.')+1).trim()}</li>`);
    
    return `<ol>${items.join('\n')}</ol>`;
}
```

### 3. 优先级和实施顺序

1. **首要任务**：
   - 创建基本目录结构
   - 实现核心HTML和CSS框架
   - 开发导航系统

2. **次要任务**：
   - 实现测试卡片加载系统
   - 添加评分功能
   - 开发本地存储功能

3. **最终任务**：
   - 实现报告生成和导出
   - 添加数据可视化
   - 优化用户体验和界面设计

## 总结

本重构方案充分利用了测试用例的结构化特点，使网站更加模块化和易于维护。通过将测试卡片内容与展示逻辑分离，未来添加或修改测试卡片将变得非常简单，只需添加相应的HTML模板文件即可。

模块化的设计也使得代码更加清晰，便于团队协作和后续功能扩展。响应式设计确保了在不同设备上的良好体验，而本地存储功能则解决了数据持久化的需求。
