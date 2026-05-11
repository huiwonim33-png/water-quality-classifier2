// ════════════════════════════════════════════════════════════
//  AquaClass AI - 수질 오염 분류 시스템
// ════════════════════════════════════════════════════════════

const wavelengths = [400, 450, 500, 550, 600, 650, 700];

const classifications = {
  clean: {
    name: '깨끗한 물',
    color: '#10b981',
    description: '전 파장 낮은 흡광도'
  },
  organic: {
    name: '유기물 오염',
    color: '#f59e0b',
    description: '400–450nm 단파장 흡수 증가'
  },
  heavy: {
    name: '중금속 오염',
    color: '#ef4444',
    description: '500–550nm 중간 파장 흡수 증가'
  },
  algae: {
    name: '조류(녹조) 오염',
    color: '#8b5cf6',
    description: '650–700nm 장파장 흡수 증가'
  }
};

const presets = [
  { values: [0.03, 0.02, 0.02, 0.03, 0.03, 0.04, 0.05], class: 'clean' },
  { values: [0.45, 0.52, 0.28, 0.15, 0.12, 0.10, 0.08], class: 'organic' },
  { values: [0.15, 0.18, 0.65, 0.58, 0.35, 0.20, 0.10], class: 'heavy' },
  { values: [0.12, 0.10, 0.18, 0.20, 0.25, 0.85, 0.92], class: 'algae' }
];

const featureImportance = [
  { wl: 400, imp: 0.18 },
  { wl: 450, imp: 0.16 },
  { wl: 500, imp: 0.15 },
  { wl: 550, imp: 0.17 },
  { wl: 600, imp: 0.14 },
  { wl: 650, imp: 0.12 },
  { wl: 700, imp: 0.08 }
];

// 초기화
window.addEventListener('DOMContentLoaded', () => {
  initWavelengthGrid();
  renderFeatureImportance();
});

// ════ WAVELENGTH GRID ════
function initWavelengthGrid() {
  const grid = document.getElementById('wl-grid');
  grid.innerHTML = '';
  
  wavelengths.forEach(wl => {
    const group = document.createElement('div');
    group.className = 'wl-input-group';
    group.innerHTML = `
      <label class="wl-label">${wl} nm</label>
      <input type="number" class="wl-input" id="wl-${wl}" 
             min="0" max="2" step="0.01" value="0" 
             onchange="updateSpectrum()">
    `;
    grid.appendChild(group);
  });
}

function getWavelengthValues() {
  return wavelengths.map(wl => {
    const input = document.getElementById(`wl-${wl}`);
    return parseFloat(input.value) || 0;
  });
}

function setWavelengthValues(values) {
  wavelengths.forEach((wl, idx) => {
    const input = document.getElementById(`wl-${wl}`);
    input.value = (values[idx] || 0).toFixed(2);
  });
  updateSpectrum();
}

// ════ SPECTRUM VISUALIZATION ════
function updateSpectrum() {
  const canvas = document.getElementById('spectrum-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const values = getWavelengthValues();
  
  // Canvas 크기 설정
  canvas.width = canvas.offsetWidth;
  canvas.height = 200;
  
  const width = canvas.width;
  const height = canvas.height;
  const padding = 30;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  
  // 배경
  ctx.fillStyle = 'rgba(15, 20, 25, 0.5)';
  ctx.fillRect(0, 0, width, height);
  
  // 격자
  ctx.strokeStyle = 'rgba(58, 65, 81, 0.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + (graphHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  // 축
  ctx.strokeStyle = 'rgba(107, 141, 214, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();
  
  // 데이터 라인
  ctx.strokeStyle = 'rgb(107, 141, 214)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  
  values.forEach((val, idx) => {
    const x = padding + (graphWidth / (wavelengths.length - 1)) * idx;
    const normalized = Math.max(0, Math.min(2, val));
    const y = height - padding - (normalized / 2) * graphHeight;
    
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  
  // 포인트
  ctx.fillStyle = 'rgb(107, 141, 214)';
  values.forEach((val, idx) => {
    const x = padding + (graphWidth / (wavelengths.length - 1)) * idx;
    const normalized = Math.max(0, Math.min(2, val));
    const y = height - padding - (normalized / 2) * graphHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ════ CLASSIFICATION ════
function predictClass(values) {
  const shortWave = values[0] + values[1];
  const midWave = values[2] + values[3];
  const longWave = values[5] + values[6];
  
  let predictions = {
    clean: 0.2,
    organic: 0.2,
    heavy: 0.2,
    algae: 0.2
  };
  
  // 샘플 휴리스틱 (실제로는 Random Forest 모델 사용)
  const sum = shortWave + midWave + longWave;
  
  if (sum < 0.2) {
    predictions.clean = 0.85;
    predictions.organic = 0.1;
    predictions.heavy = 0.03;
    predictions.algae = 0.02;
  } else if (shortWave > midWave * 1.5) {
    predictions.organic = 0.75;
    predictions.clean = 0.1;
    predictions.heavy = 0.1;
    predictions.algae = 0.05;
  } else if (midWave > shortWave && midWave > longWave * 1.2) {
    predictions.heavy = 0.8;
    predictions.organic = 0.08;
    predictions.clean = 0.07;
    predictions.algae = 0.05;
  } else if (longWave > midWave * 1.5) {
    predictions.algae = 0.82;
    predictions.heavy = 0.08;
    predictions.organic = 0.06;
    predictions.clean = 0.04;
  }
  
  // 정규화
  const total = Object.values(predictions).reduce((a, b) => a + b, 0);
  Object.keys(predictions).forEach(key => {
    predictions[key] = predictions[key] / total;
  });
  
  return predictions;
}

function classify() {
  const values = getWavelengthValues();
  
  // 값 검증
  if (values.every(v => v === 0)) {
    alert('흡광도 값을 입력해주세요');
    return;
  }
  
  const predictions = predictClass(values);
  const sorted = Object.entries(predictions)
    .sort((a, b) => b[1] - a[1]);
  const topClass = sorted[0][0];
  const topConfidence = sorted[0][1];
  
  displayResult(topClass, topConfidence, sorted, false);
  saveToHistory(topClass, topConfidence, false);
}

function displayResult(classKey, confidence, allPredictions, isCSV) {
  const panel = document.getElementById(isCSV ? 'csv-result-panel' : 'result-panel');
  const nameEl = document.getElementById(isCSV ? 'csv-res-name' : 'res-name');
  const confEl = document.getElementById(isCSV ? 'csv-res-conf' : 'res-conf');
  const textEl = document.getElementById(isCSV ? 'csv-conf-text' : 'conf-text');
  const arcEl = document.getElementById(isCSV ? 'csv-conf-arc' : 'conf-arc');
  const probListEl = document.getElementById(isCSV ? 'csv-prob-list' : 'prob-list');
  
  const classInfo = classifications[classKey];
  const confPercent = Math.round(confidence * 100);
  
  nameEl.textContent = classInfo.name;
  nameEl.style.color = classInfo.color;
  confEl.textContent = `신뢰도: ${confPercent}%`;
  confEl.style.color = classInfo.color;
  textEl.textContent = `${confPercent}%`;
  
  // 신뢰도 원형 표시
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (confidence * circumference);
  arcEl.style.strokeDashoffset = offset;
  arcEl.style.stroke = classInfo.color;
  
  // 확률 리스트
  probListEl.innerHTML = '';
  allPredictions.forEach(([key, prob]) => {
    const probPercent = Math.round(prob * 100);
    const item = document.createElement('div');
    item.className = 'prob-item';
    item.innerHTML = `
      <div class="prob-label">
        <div class="prob-dot" style="background-color: ${classifications[key].color}"></div>
        ${classifications[key].name}
      </div>
      <div class="prob-value">${probPercent}%</div>
    `;
    probListEl.appendChild(item);
  });
  
  panel.classList.add('show');
}

// ════ PRESETS ════
function loadPreset(idx) {
  const preset = presets[idx];
  setWavelengthValues(preset.values);
}

function resetAll() {
  setWavelengthValues(wavelengths.map(() => 0));
  document.getElementById('result-panel').classList.remove('show');
  document.getElementById('csv-result-panel').classList.remove('show');
}

// ════ PAGE NAVIGATION ════
function showPage(pageName) {
  // 페이지 숨기기
  document.querySelectorAll('.page-section').forEach(el => {
    el.classList.remove('active');
  });
  
  // 네비 업데이트
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
  });
  
  // 선택 페이지 표시
  const pageId = `page-${pageName}`;
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  
  // 네비 활성화
  event.target.closest('.nav-item').classList.add('active');
  
  // 타이틀 업데이트
  const titles = {
    analyze: { title: '직접 입력 분류', sub: '흡광도 값을 입력하고 오염 종류를 분류합니다' },
    csv: { title: 'CSV 파일 업로드', sub: 'Vernier 분광계 데이터를 업로드하세요' },
    history: { title: '측정 기록', sub: '이전 측정 결과를 확인합니다' },
    about: { title: '모델 정보', sub: '수질 분류 AI 모델의 상세 정보' }
  };
  
  const titleInfo = titles[pageName];
  if (titleInfo) {
    document.getElementById('topbar-title').textContent = titleInfo.title;
    document.querySelector('.page-sub').textContent = titleInfo.sub;
  }
}

// ════ CSV UPLOAD ════
function handleCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const csv = e.target.result;
      const lines = csv.trim().split('\n');
      
      // CSV 파싱 (간단한 예시)
      let values = [];
      lines.forEach(line => {
        const parts = line.split(',');
        parts.forEach(part => {
          const num = parseFloat(part);
          if (!isNaN(num) && num >= 0 && num <= 2) {
            values.push(num);
          }
        });
      });
      
      // 파장 개수와 맞는지 확인
      if (values.length !== wavelengths.length) {
        // 평균값으로 조정
        if (values.length > wavelengths.length) {
          values = values.slice(0, wavelengths.length);
        } else {
          while (values.length < wavelengths.length) {
            values.push(0);
          }
        }
      }
      
      // CSV 데이터 표시
      const csvDisplay = document.getElementById('csv-wl-display');
      csvDisplay.innerHTML = '';
      wavelengths.forEach((wl, idx) => {
        const group = document.createElement('div');
        group.className = 'wl-input-group';
        group.innerHTML = `
          <label class="wl-label">${wl} nm</label>
          <input type="text" class="wl-input" value="${values[idx].toFixed(3)}" readonly>
        `;
        csvDisplay.appendChild(group);
      });
      
      // 스펙트럼 그래프 그리기
      drawCSVSpectrum(values);
      
      // 분류
      const predictions = predictClass(values);
      const sorted = Object.entries(predictions)
        .sort((a, b) => b[1] - a[1]);
      const topClass = sorted[0][0];
      const topConfidence = sorted[0][1];
      
      displayResult(topClass, topConfidence, sorted, true);
      saveToHistory(topClass, topConfidence, true);
      
      document.getElementById('csv-preview').classList.add('show');
    } catch (err) {
      alert('CSV 파일 처리 중 오류 발생: ' + err.message);
    }
  };
  
  reader.readAsText(file);
}

function drawCSVSpectrum(values) {
  const canvas = document.getElementById('csv-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 200;
  
  const width = canvas.width;
  const height = canvas.height;
  const padding = 30;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  
  // 배경
  ctx.fillStyle = 'rgba(15, 20, 25, 0.5)';
  ctx.fillRect(0, 0, width, height);
  
  // 격자
  ctx.strokeStyle = 'rgba(58, 65, 81, 0.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + (graphHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  // 축
  ctx.strokeStyle = 'rgba(107, 141, 214, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();
  
  // 데이터 라인
  ctx.strokeStyle = 'rgb(245, 158, 11)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  
  values.forEach((val, idx) => {
    const x = padding + (graphWidth / (values.length - 1)) * idx;
    const normalized = Math.max(0, Math.min(2, val));
    const y = height - padding - (normalized / 2) * graphHeight;
    
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  
  // 포인트
  ctx.fillStyle = 'rgb(245, 158, 11)';
  values.forEach((val, idx) => {
    const x = padding + (graphWidth / (values.length - 1)) * idx;
    const normalized = Math.max(0, Math.min(2, val));
    const y = height - padding - (normalized / 2) * graphHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ════ HISTORY ════
function saveToHistory(classKey, confidence, isCSV) {
  let history = JSON.parse(localStorage.getItem('aquaclass-history') || '[]');
  
  const timestamp = new Date().toLocaleString('ko-KR');
  history.push({
    class: classKey,
    name: classifications[classKey].name,
    color: classifications[classKey].color,
    confidence: confidence,
    timestamp: timestamp,
    isCSV: isCSV
  });
  
  // 최대 50개 기록 유지
  if (history.length > 50) {
    history = history.slice(-50);
  }
  
  localStorage.setItem('aquaclass-history', JSON.stringify(history));
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const history = JSON.parse(localStorage.getItem('aquaclass-history') || '[]');
  const list = document.getElementById('history-list');
  
  if (history.length === 0) {
    list.innerHTML = `
      <div class="empty-hist">
        <svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M9 9l3 3 4-4"/></svg>
        아직 측정 기록이 없습니다
      </div>
    `;
    return;
  }
  
  list.innerHTML = '';
  [...history].reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-info">
        <div class="history-class">
          <div class="history-dot" style="background-color: ${item.color}"></div>
          ${item.name}
        </div>
        <div class="history-time">${item.timestamp}</div>
      </div>
      <div class="history-conf">${Math.round(item.confidence * 100)}%</div>
    `;
    list.appendChild(div);
  });
}

function clearHistory() {
  if (confirm('모든 측정 기록을 삭제하시겠습니까?')) {
    localStorage.removeItem('aquaclass-history');
    updateHistoryDisplay();
  }
}

// ════ FEATURE IMPORTANCE ════
function renderFeatureImportance() {
  const container = document.getElementById('imp-bars');
  if (!container) return;
  
  container.innerHTML = '';
  const maxImp = Math.max(...featureImportance.map(f => f.imp));
  
  featureImportance.forEach(item => {
    const div = document.createElement('div');
    div.className = 'imp-bar';
    const percentage = (item.imp / maxImp) * 100;
    div.innerHTML = `
      <div class="imp-label">${item.wl} nm</div>
      <div class="imp-bar-bg">
        <div class="imp-bar-fill" style="width: ${percentage}%">
          <div class="imp-value">${(item.imp * 100).toFixed(1)}%</div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

// 페이지 로드 시 기록 표시
window.addEventListener('load', () => {
  updateHistoryDisplay();
});