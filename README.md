 # 📈 Stock Diary

  Next.js와 Tauri를 활용한 주식 거래 일지 및 포트폴리오 관리 플랫폼입니다.

  ## ✨ 주요 기능

  ### 📊 거래 대시보드
  - 실시간 주식 가격 조회
  - 포트폴리오 수익률 분석
  - 거래 내역 시각화
  - 손익 계산 및 통계

  ### 🔍 주식 검색 및 추적
  - 실시간 주식 검색 기능
  - Yahoo Finance API 연동
  - 관심 종목 관리
  - 가격 알림 설정

  ### 📝 거래 일지
  - 매매 기록 관리 (매수/매도)
  - 거래 사유 및 메모 기록
  - 이미지 첨부 지원
  - 거래 패턴 분석

  ### 📱 크로스 플랫폼 지원
  - 웹 애플리케이션 (Next.js)
  - 데스크톱 앱 (Tauri)
  - 반응형 디자인
  - 오프라인 데이터 저장

  ### 🎨 시각적 요소
  - 3D 시각화 컴포넌트
  - 애니메이션 효과
  - 모던 UI/UX (Shadcn/ui)
  - 다크/라이트 테마

  ## 🚀 시작하기

  ### 필수 요구사항
  - Node.js (v18 이상)
  - Rust (Tauri 데스크톱 앱용)
  - npm 또는 yarn

  ### 개발 환경 설정

  ```bash
  # 저장소 클론
  git clone https://github.com/ke2007/stockDiary.git
  cd stockDiary

  # 의존성 설치
  npm install

  # 웹 개발 서버 시작
  npm run dev

  # Tauri 데스크톱 앱 개발
  npm run tauri dev

  빌드 및 배포

  # Next.js 웹 애플리케이션 빌드
  npm run build

  # 정적 사이트 생성 (배포용)
  npm run export

  # Tauri 데스크톱 앱 빌드
  npm run tauri build

  📂 프로젝트 구조

  stockDiary/
  ├── src/
  │   ├── app/                 # Next.js App Router
  │   │   ├── api/            # API 라우트
  │   │   │   ├── stocks/     # 주식 데이터 API
  │   │   │   └── trades/     # 거래 관리 API
  │   │   ├── globals.css     # 글로벌 스타일
  │   │   ├── layout.tsx      # 루트 레이아웃
  │   │   └── page.tsx        # 홈 페이지
  │   ├── components/         # React 컴포넌트
  │   │   ├── ui/            # Shadcn/ui 컴포넌트
  │   │   ├── TradingDashboard.tsx
  │   │   ├── StockSearchInput.tsx
  │   │   ├── TradeFormModal.tsx
  │   │   ├── Current.tsx
  │   │   └── ...
  │   ├── data/              # 로컬 데이터
  │   │   ├── trades.json    # 거래 내역
  │   │   ├── sites.json     # 사이트 정보
  │   │   └── comments.json  # 코멘트 데이터
  │   ├── hooks/             # 커스텀 훅
  │   │   └── useStockPrice.ts
  │   ├── lib/               # 유틸리티 라이브러리
  │   │   ├── yahoo-finance.ts # 주식 API 연동
  │   │   ├── storage.ts      # 로컬 스토리지
  │   │   └── utils.ts        # 공통 유틸
  │   └── types/             # TypeScript 타입 정의
  ├── src-tauri/             # Tauri 설정
  │   ├── src/
  │   │   └── main.rs        # Rust 메인 코드
  │   ├── Cargo.toml         # Rust 의존성
  │   └── tauri.conf.json    # Tauri 설정
  ├── public/                # 정적 파일
  ├── next.config.ts         # Next.js 설정
  └── package.json           # 프로젝트 설정

  🛠️ 기술 스택

  프론트엔드

  - Next.js 15 - React 풀스택 프레임워크
  - TypeScript - 정적 타입 체크
  - Tailwind CSS - 유틸리티 우선 CSS 프레임워크
  - Shadcn/ui - 재사용 가능한 UI 컴포넌트

  백엔드 & API

  - Next.js API Routes - 서버리스 API
  - Yahoo Finance API - 실시간 주식 데이터
  - JSON 기반 로컬 스토리지 - 클라이언트 사이드 데이터

  데스크톱 앱

  - Tauri - Rust 기반 크로스 플랫폼 프레임워크
  - Rust - 시스템 레벨 프로그래밍

  개발 도구

  - ESLint - 코드 품질 관리
  - PostCSS - CSS 후처리기
  - TypeScript - 타입 안전성

  🎯 주요 컴포넌트

  TradingDashboard

  - 포트폴리오 개요 및 성과 지표
  - 수익률 차트 및 통계
  - 최근 거래 내역

  StockSearchInput

  - 실시간 주식 검색
  - 자동완성 기능
  - 즐겨찾기 관리

  TradeFormModal

  - 매매 기록 입력 폼
  - 이미지 업로드 지원
  - 거래 상세 정보 관리

  CurrentPrice

  - 실시간 주가 표시
  - 가격 변동률 시각화
  - 알림 설정

  📈 사용법

  1. 거래 기록 추가

  - "거래 추가" 버튼 클릭
  - 종목명, 거래 유형(매수/매도), 수량, 가격 입력
  - 거래 사유 및 메모 작성
  - 스크린샷 등 이미지 첨부 가능

  2. 포트폴리오 관리

  - 대시보드에서 전체 포트폴리오 현황 확인
  - 종목별 수익률 및 비중 분석
  - 손익 계산 및 세금 정보

  3. 주식 검색 및 추적

  - 검색창에서 종목명 또는 심볼 입력
  - 실시간 가격 및 차트 확인
  - 관심종목에 추가하여 지속 모니터링

  4. 데스크톱 앱 사용

  # 데스크톱 앱 실행
  npm run tauri dev

  # 앱 빌드 및 설치
  npm run tauri build

  🔧 개발 스크립트

  # 개발 서버 시작
  npm run dev

  # 프로덕션 빌드
  npm run build

  # 정적 사이트 생성
  npm run export

  # Tauri 개발 모드
  npm run tauri dev

  # Tauri 앱 빌드
  npm run tauri build

  # 타입 체크
  npm run type-check

  # 린트 검사
  npm run lint

  # 코드 포맷팅
  npm run format

  🌟 특별한 기능

  3D 시각화

  - Three.js 기반 포트폴리오 3D 표현
  - 인터랙티브 차트 및 그래프
  - 실시간 데이터 애니메이션

  애니메이션 효과

  - Framer Motion 기반 페이지 전환
  - 마이크로 인터랙션
  - 부드러운 사용자 경험

  오프라인 지원

  - PWA (Progressive Web App) 지원
  - 로컬 데이터 캐싱
  - 오프라인 상태에서도 기본 기능 사용 가능

  📊 데이터 관리

  로컬 스토리지

  - JSON 파일 기반 데이터 저장
  - 실시간 데이터 동기화
  - 백업 및 복원 기능

  API 연동

  - Yahoo Finance API를 통한 실시간 데이터
  - 환율 정보 자동 업데이트
  - 뉴스 및 기업 정보 제공

  🔒 보안 및 프라이버시

  - 개인 거래 정보는 로컬에만 저장
  - API 키 보안 관리
  - HTTPS 통신 강제
  - 민감 정보 암호화

  🚀 배포

  웹 애플리케이션

  - Vercel, Netlify 등 정적 호스팅 서비스 지원
  - GitHub Pages 배포 가능

  데스크톱 앱

  - Windows (.exe)
  - macOS (.dmg)
  - Linux (AppImage)

  🤝 기여하기

  1. 이 저장소를 포크합니다
  2. 새로운 기능 브랜치를 생성합니다 (git checkout -b feature/새기능)
  3. 변경사항을 커밋합니다 (git commit -am '새 기능 추가')
  4. 브랜치에 푸시합니다 (git push origin feature/새기능)
  5. Pull Request를 생성합니다

  📝 개발 로드맵

  - 실시간 포트폴리오 동기화
  - 모바일 앱 개발
  - 소셜 거래 공유 기능
  - AI 기반 투자 분석
  - 다중 브로커 연동
  - 세금 신고 자동화

  🐛 알려진 이슈

  현재 알려진 주요 이슈가 없습니다. 버그를 발견하시면 이슈를 등록해 주세요.

  📄 라이선스

  이 프로젝트는 MIT 라이선스 하에 배포됩니다.

  🙋‍♂️ 문의 및 지원

  - 이슈 리포팅: GitHub Issues 탭에서 버그 신고 및 기능 제안
  - 기능 요청: Discussion 탭에서 새로운 아이디어 공유
  - 개발 문의: 프로젝트 관련 질문은 이슈로 등록

  ⚠️ 면책조항

  이 앱은 개인 투자 기록 관리 목적으로만 사용되어야 합니다. 투자 결정에 대한 책임은 사용자에게 있으며, 개발자는 투자
   손실에 대해 책임지지 않습니다.

  ---
  "체계적인 투자 기록으로 더 나은 투자 결정을" - Stock Diary
