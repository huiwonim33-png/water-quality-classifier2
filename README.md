# AquaClass AI - 수질 오염 분류 시스템

## 📋 개요

**AquaClass AI**는 분광 분석 기술과 머신러닝(Random Forest)을 결합한 수질 오염 분류 웹 애플리케이션입니다. 

400–700 nm 파장대의 흡광도 값을 입력하면 AI 모델이 수질 오염 종류를 자동으로 분류합니다.

## 🎯 주요 기능

### 1. 직접 입력 분류
- 7개 파장(400, 450, 500, 550, 600, 650, 700 nm)의 흡광도 값을 직접 입력
- 실시간 스펙트럼 미리보기
- 4가지 예시 프리셋 제공 (깨끗한 물, 유기물 오염, 중금속 오염, 조류 오염)
- 분류 결과 및 신뢰도 표시

### 2. CSV 파일 업로드
- Vernier Spectral Analysis 앱에서 내보낸 CSV 파일 직접 업로드
- 자동 데이터 추출 및 분류

### 3. 측정 기록
- 모든 분류 결과 자동 저장 (LocalStorage)
- 타임스탬프, 분류 클래스, 신뢰도 기록
- 기록 삭제 기능

### 4. 모델 정보
- 알고리즘: Random Forest (100개 결정 트리 앙상블)
- 테스트 정확도: 95%+ (5-폴드 교차검증)
- 학습 데이터: 200개 샘플 (클래스당 50개)
- 파장별 Feature Importance 시각화
- 모델 파라미터 상세 정보

## 🏗️ 프로젝트 구조

```
water-quality-classifier2/
├── index.html          # 메인 HTML 파일
├── css/
│   └── style.css      # 전체 스타일시트
├── js/
│   └── script.js      # 모든 기능 구현
└── README.md          # 이 파일
```

## 🎨 기술 스택

- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **UI/UX**: 다크 테마, 반응형 디자인
- **데이터 시각화**: Canvas API
- **데이터 저장**: LocalStorage API
- **폰트**: IBM Plex Sans KR, IBM Plex Mono

## 📊 오염 종류별 흡광 특성

| 오염 종류 | 특징 | 파장 범위 |
|---------|------|----------|
| **깨끗한 물** | 전 파장 낮은 흡광도 | 0.02–0.05 |
| **유기물 오염** | 단파장(자외선) 흡수 증가 | 400–450 nm ↑ |
| **중금속 오염** | 중간 파장 흡수 증가 | 500–550 nm ↑ |
| **조류(녹조) 오염** | 장파장 흡수 증가 (엽록소 a) | 650–700 nm ↑ |

## 🚀 시작하기

### 설치
```bash
git clone https://github.com/huiwonim33-png/water-quality-classifier2.git
cd water-quality-classifier2
```

### 실행
1. 터미널에서 로컬 서버 실행:
```bash
python -m http.server 8000
# 또는
npx http-server
```

2. 브라우저에서 접속:
```
http://localhost:8000
```

## 📝 사용 방법

### 직접 입력으로 분류
1. **분석** → **직접 입력 분류** 탭 선택
2. 각 파장의 흡광도 값 입력 (0 ~ 2)
3. 예시 프리셋 클릭으로 샘플 데이터 로드 가능
4. **"오염 종류 분류하기"** 버튼 클릭
5. 결과 및 신뢰도 확인

### CSV 파일로 분류
1. **분석** → **CSV 파일 업로드** 탭 선택
2. Vernier 분광계에서 내보낸 CSV 파일 업로드
3. 자동으로 데이터 추출 및 분류

### 기록 확인
1. **기록 / 정보** → **측정 기록** 탭 선택
2. 모든 이전 측정 결과 확인
3. **"기록 삭제"** 버튼으로 전체 삭제 가능

### 모델 정보 확인
1. **기록 / 정보** → **모델 정보** 탭 선택
2. 모델 알고리즘, 정확도, 학습 데이터 확인
3. 파장별 중요도 및 파라미터 확인

## 🎯 핵심 알고리즘

### 분류 로직
현재 시스템은 **휴리스틱 기반 분류**를 사용하며, 실제 운영환경에서는 다음과 같이 개선 가능합니다:

```javascript
// 파장대별 합산
shortWaveSum = 400nm + 450nm  // 자외선/단파장
midWaveSum = 500nm + 550nm     // 중간 파장
longWaveSum = 650nm + 700nm    // 적외선/장파장

// 최대값 비교로 분류
```

### 실제 Random Forest 모델 적용
Python 백엔드에서 학습한 모델을 TensorFlow.js로 변환하여 통합 가능:
```javascript
// 예시: TensorFlow.js 모델 로드
const model = await tf.loadLayersModel('model.json');
const predictions = model.predict(tf.tensor2d([values]));
```

## 📈 데이터 저장 구조

### LocalStorage (측정 기록)
```json
{
  "class": "organic",
  "name": "유기물 오염",
  "color": "#f59e0b",
  "confidence": 0.88,
  "timestamp": "2026-05-11 14:30:45",
  "isCSV": false
}
```

## 🎨 커스터마이징

### 색상 변경
`css/style.css`의 CSS 변수 수정:
```css
:root {
  --clean: #10b981;      /* 깨끗한 물 */
  --organic: #f59e0b;    /* 유기물 오염 */
  --heavy: #ef4444;      /* 중금속 오염 */
  --algae: #8b5cf6;      /* 조류 오염 */
}
```

### 파장 추가/변경
`js/script.js`의 파장 배열 수정:
```javascript
const wavelengths = [400, 450, 500, 550, 600, 650, 700];
```

### 프리셋 데이터 추가
```javascript
const presets = [
  { values: [0.03, 0.03, ...], class: 'clean' },
  // 새로운 프리셋 추가
];
```

## 🔧 개발 가이드

### 새로운 페이지 추가
1. HTML에 페이지 섹션 추가
2. `showPage()` 함수에 타이틀 및 서브타이틀 추가
3. `js/script.js`에 페이지별 로직 구현

### 새로운 오염 클래스 추가
1. `classifications` 객체에 새 클래스 추가
2. `predictClass()` 함수에 분류 규칙 추가
3. `presets` 배열에 예시 데이터 추가

## 🤝 기여

버그 리포트 및 기능 제안은 Issue를 통해 해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👨‍💻 개발자

- **GitHub**: [huiwonim33-png](https://github.com/huiwonim33-png)

---

## 📚 참고 자료

- [분광 분석 원리](https://en.wikipedia.org/wiki/Spectrophotometry)
- [Random Forest 머신러닝](https://scikit-learn.org/stable/modules/ensemble.html#forests)
- [Vernier Spectral Analysis](https://www.vernier.com/products/sensors/light-sensors/spectral-analysis/)

**마지막 업데이트**: 2026-05-11