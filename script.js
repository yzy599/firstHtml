const CONFIG = {
    apiUrl: 'http://10.0.6.20:3000/api/leaders',
    carouselInterval: 3000,
    statusColors: {
        available: 'var(--success)',
        meeting: 'var(--warning)',
        busy: 'var(--danger)',
        away: 'var(--info)',
        break: 'var(--neutral)'
    }
};

const statusTranslations = {
    available: '在岗',
    meeting: '会议中',
    busy: '会议',
    away: '出差',
    break: '休息'
};

const state = {
    data: [],
    currentIndex: 0,
    isUpdating: false,
    lastUpdate: new Date(),
    visibleRows: 5
};

function createRow(item, index) {
    const row = document.createElement('div');
    row.className = 'table-row';
    
    const color = CONFIG.statusColors[item.status] || 'var(--success)';
    const translatedStatus = statusTranslations[item.status] || '未知状态';

    row.innerHTML = `
        <div class="row-number">${index + 1}</div>
        <div>
            <span class="status-indicator" style="background-color: ${color}"></span>
            ${translatedStatus}
        </div>
        <div>${item.name}</div>
        <div>${item.position}</div>
        <div>${item.locationDN}</div>
        <div>${item.destination || ''}</div>
    `;
    
    return row;
}

function updateTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    for (let i = 0; i < Math.min(state.data.length, state.visibleRows); i++) {
        const item = state.data[i];
        tableBody.appendChild(createRow(item, i));
    }
}

function updateTimestamp() {
    const now = new Date();
    document.getElementById('timestamp').textContent = 
        `最后更新：${now.toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })}`;
}

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent =
        `当前时间：${now.toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })}`;
}

async function refreshData() {
    if (state.isUpdating) return;
    
    state.isUpdating = true;
    const button = document.getElementById('refreshButton');
    button.disabled = true;

    try {
        const response = await fetch(CONFIG.apiUrl);
        if (!response.ok) throw new Error('网络响应不正常');
        
        const data = await response.json();
         data = [
            { name: '张三', position: '经理', locationDN: '北京', destination: '上海', status: 'available' },
            { name: '李四', position: '工程师', locationDN: '上海', destination: '', status: 'busy' },
            { name: '王五', position: '设计师', locationDN: '广州', destination: '', status: 'away' },
            { name: '赵六', position: '分析师', locationDN: '深圳', destination: '', status: 'break' },
            { name: '孙七', position: '测试员', locationDN: '北京', destination: '', status: 'available' },
            { name: '周八', position: '运维', locationDN: '上海', destination: '', status: 'busy' },
            { name: '吴九', position: 'HR', locationDN: '广州', destination: '', status: 'away' },
            { name: '郑十', position: '产品经理', locationDN: '深圳', destination: '', status: 'break' },
            { name: '钱十一', position: '前端开发', locationDN: '北京', destination: '', status: 'available' },
            { name: '王十二', position: '后端开发', locationDN: '上海', destination: '', status: 'busy' }
        ];
        state.data = data;
        state.lastUpdate = new Date();
        state.currentIndex = 0;
        
        updateTable();
        updateTimestamp();
        
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        state.isUpdating = false;
        button.disabled = false;
    }
}

function moveFirstRowToEnd() {
    if (state.isUpdating || state.data.length === 0) return;

    const firstItem = state.data.shift();
    state.data.push(firstItem);
    state.currentIndex++;

    // Refresh data only when we've cycled through all items back to the start
    if (state.currentIndex >= state.data.length) {
        state.currentIndex = 0;
        refreshData();
    } else {
        updateTable();
    }
}

document.getElementById('refreshButton').addEventListener('click', refreshData);
document.getElementById('rowCount').addEventListener('change', (e) => {
    let newRowCount = parseInt(e.target.value);
    if (newRowCount < 2) newRowCount = 2;
    if (newRowCount > 100) newRowCount = 100;
    state.visibleRows = newRowCount;
    updateTable();
});

const rowCountInput = document.getElementById('rowCount');
const decreaseButton = document.getElementById('decreaseRows');
const increaseButton = document.getElementById('increaseRows');

rowCountInput.addEventListener('change', handleRowCountChange);
decreaseButton.addEventListener('click', decreaseRowCount);
increaseButton.addEventListener('click', increaseRowCount);

function handleRowCountChange(e) {
    let newRowCount = parseInt(e.target.value);
    if (newRowCount < 2) {
        newRowCount = 2;
        e.target.value = 2;
    } else if (newRowCount > 100) {
        newRowCount = 100;
        e.target.value = 100;
    }
    state.visibleRows = newRowCount;
    updateTable();
}

function decreaseRowCount() {
    let currentCount = parseInt(rowCountInput.value);
    if (currentCount > 2) {
        rowCountInput.value = --currentCount;
        state.visibleRows = currentCount;
        updateTable();
    }
}

function increaseRowCount() {
    let currentCount = parseInt(rowCountInput.value);
    if (currentCount < 100) {
        rowCountInput.value = ++currentCount;
        state.visibleRows = currentCount;
        updateTable();
    }
}

setInterval(updateCurrentTime, 1000); // Update current time every second

setInterval(() => {
    if (document.visibilityState === 'visible') {
        moveFirstRowToEnd();
    }
}, CONFIG.carouselInterval);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        refreshData();
    }
});

function updateStats() {
    const counts = {
        available: 0,
        busy: 0,
        away: 0,
        break: 0
    };

    state.data.forEach(item => {
        if (counts[item.status] !== undefined) {
            counts[item.status]++;
        }
    });

    document.getElementById('availableCount').textContent = counts.available;
    document.getElementById('busyCount').textContent = counts.busy;
    document.getElementById('awayCount').textContent = counts.away;
    document.getElementById('breakCount').textContent = counts.break;
}

// Modify refreshData function to include updating stats
async function refreshData() {
    if (state.isUpdating) return;
    
    state.isUpdating = true;
    const button = document.getElementById('refreshButton');
    button.disabled = true;

    try {
        const response = await fetch(CONFIG.apiUrl);
        if (!response.ok) throw new Error('网络响应不正常');
        
        const data = await response.json();
        state.data = data;
        state.lastUpdate = new Date();
        state.currentIndex = 0;
        
        updateTable();
        updateTimestamp();
        updateStats(); // Add this line to update stats after refreshing data
        
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        state.isUpdating = false;
        button.disabled = false;
    }
}
function updateStats() {
    const counts = {
        available: 0,
        meeting: 0,
        busy: 0,
        away: 0,
        break: 0
    };

    state.data.forEach(item => {
        if (counts[item.status] !== undefined) {
            counts[item.status]++;
        }
    });

    document.getElementById('availableCount').textContent = counts.available;
    document.getElementById('busyCount').textContent = counts.busy;
    document.getElementById('awayCount').textContent = counts.away;
    document.getElementById('breakCount').textContent = counts.break;
}

// Modify refreshData function to include updating stats
async function refreshData() {
    if (state.isUpdating) return;
    
    state.isUpdating = true;
    const button = document.getElementById('refreshButton');
    button.disabled = true;

    try {
        const response = await fetch(CONFIG.apiUrl);
        if (!response.ok) throw new Error('网络响应不正常');
        
        const data = await response.json();
        state.data = data;
        state.lastUpdate = new Date();
        state.currentIndex = 0;
        
        updateTable();
        updateTimestamp();
        updateStats(); // Add this line to update stats after refreshing data
        
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        state.isUpdating = false;
        button.disabled = false;
    }
}


// Initial setup
refreshData();