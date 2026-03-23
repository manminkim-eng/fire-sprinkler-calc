# 💧 스프링클러설비 펌프 용량 계산서 PWA

> **Developer MANMIN** | 대성건축사사무소  
> Blueprint Engineering Theme · Ver 3.1

## 📦 파일 구성

```
sprinkler2-pwa/
├── index.html          ← 메인 앱 (React 포함, Ver 3.1)
├── manifest.json       ← PWA 매니페스트
├── sw.js               ← 서비스 워커 (오프라인 지원 + 업데이트 감지)
├── README.md
└── icons/              ← 아이콘 13종 (스프링쿨러 이미지 기반)
    ├── favicon.ico / favicon-16.png / favicon-32.png
    ├── apple-touch-icon.png
    ├── icon-72 ~ 384.png
    └── icon-512.png     ← 마스커블 / 스플래시
```

## 🚀 GitHub Pages 배포 방법

1. 이 폴더 전체를 GitHub 저장소 루트에 업로드
2. `Settings` → `Pages` → `Source: main branch / (root)` 선택
3. 배포된 **HTTPS URL** 로 접속 *(HTTP에서는 PWA 설치 불가)*
4. 우하단 **📲 앱 설치** FAB 버튼 클릭 → 즉시 설치

## 📱 PWA 설치 지원 환경

| 환경 | 설치 방법 |
|------|----------|
| Android Chrome / Edge | 📲 앱 설치 FAB 버튼 또는 하단 배너 |
| Windows Chrome / Edge | 주소창 우측 설치 아이콘 ⊕ |
| macOS Chrome | 주소창 우측 설치 아이콘 ⊕ |
| iOS Safari | 공유 버튼 → "홈 화면에 추가" *(FAB 미지원)* |

## ✅ 이 앱의 PWA 구성 수준

이 앱은 이미 최신 Ver 3.1 기준을 완벽히 갖추고 있었습니다:

| 기능 | 상태 |
|------|------|
| 설치 FAB 버튼 | ✅ 이미 포함 (.pwa-install-fab, 팝-인 애니메이션) |
| NEW 펄싱 뱃지 | ✅ 이미 포함 |
| 계산식 FAB | ✅ 위치 조정 완료 (bottom:90px) |
| PWA 배너 | ✅ 그린 테마 배너 |
| SW 업데이트 감지 | ✅ Ver 3.1 완비 |
| 주기적 SW 업데이트 | ✅ 1시간마다 체크 |
| deferredPrompt 연결 | ✅ 이미 완비 |

## ⚙️ 기술 스택

- **React 18** (UMD, unpkg CDN)
- **Service Worker** (오프라인 캐싱, 자동 업데이트 감지)
- **Web App Manifest** (설치, 아이콘, 바로가기)
- **Hazen-Williams 공식** 기반 배관 마찰손실 계산
- **NFPC 103 / NFTC 103** (시행 2026.3.1.) + **NFTC 604** (고층건축물) 기준

## 🎨 MANMIN 시리즈 FAB 색상 가이드

| 앱 | 설치 FAB 색상 |
|----|-------------|
| **스프링클러** | **🔵 파랑 `#1d4ed8`** |
| 간이스프링클러 | 🔵 파랑 `#1d4ed8` |
| 겸용[옥내+스프] | 🟣 퍼플 `#7c3aed` |
| 겸용[옥내+간이] | 🟢 틸 `#0d9488` |
| 겸용[옥내+옥외] | 🌸 로즈 `#be185d` |
| 통합 포털 | 🟤 앰버 `#b45309` |
| 옥내소화전 | 🔴 레드 `#DC2626` |
| 옥외소화전 | 🔵 파랑 `#1d4ed8` |

---
*MANMIN · Blueprint Engineering Theme · Ver 3.1*
