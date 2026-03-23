# 🚿 스프링클러설비 펌프 용량 계산서 PWA

> **Developer MANMIN** | 대성건축사사무소  
> Blueprint Engineering Theme · Ver 3.1

## 📦 파일 구성

```
sprinkler-pwa/
├── index.html          ← 메인 앱 (React 포함, Ver 3.1)
├── manifest.json       ← PWA 매니페스트
├── sw.js               ← 서비스 워커 (오프라인 지원)
├── README.md
└── icons/
    ├── favicon.ico
    ├── favicon-16.png
    ├── favicon-32.png
    ├── apple-touch-icon.png  ← iOS 홈 화면 아이콘
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-180.png
    ├── icon-192.png     ← Android 기본 아이콘
    ├── icon-384.png
    └── icon-512.png     ← Splash Screen / 마스커블
```

## 🚀 GitHub Pages 배포 방법

1. 이 폴더 전체를 GitHub 저장소에 업로드
2. `Settings` → `Pages` → `Source: main branch / root` 선택
3. 배포된 URL(예: `https://username.github.io/repo/`)로 접속 (**HTTPS 필수**)
4. 우하단 **📲 앱 설치** FAB 버튼 클릭 → 즉시 설치

## 📱 PWA 설치 지원 환경

| 환경 | 설치 방법 |
|------|----------|
| Android Chrome | 📲 앱 설치 FAB 버튼 또는 하단 배너 |
| Android Edge | 📲 앱 설치 FAB 버튼 또는 하단 배너 |
| Windows Chrome/Edge | 주소창 우측 설치 아이콘(⊕) |
| macOS Chrome | 주소창 우측 설치 아이콘(⊕) |
| iOS Safari | 공유 버튼 → "홈 화면에 추가" *(FAB 미지원)* |

> ⚠️ **iOS Safari** 는 `beforeinstallprompt` 이벤트를 지원하지 않아  
> FAB 버튼이 표시되지 않습니다. Safari 공유 메뉴를 이용해 주세요.

## 🆕 Ver 3.1 변경사항

| 항목 | 내용 |
|------|------|
| **📲 설치 FAB 버튼** | 우하단 파란색 고정 버튼 — `beforeinstallprompt` 이벤트 발생 시 자동 표시 |
| **🔴 NEW 뱃지** | FAB 위에 펄싱 빨간 뱃지로 설치 유도 강화 |
| **📐 계산식 FAB** | 설치 FAB와 겹치지 않도록 위치 상향 조정 |
| **아이콘 세트** | 스프링클러 이미지 기반 13종 사이즈 자동 생성 |
| **manifest.json** | 앱 바로가기(shortcuts) 포함 |
| **sw.js** | Network-First 전략, 구버전 캐시 자동 정리 |

## ⚙️ 기술 스택

- **React 18** (UMD, CDN)
- **Service Worker** (오프라인 캐싱, 자동 업데이트 감지)
- **Web App Manifest** (설치, 아이콘, 바로가기)
- **Hazen-Williams 공식** 기반 배관 마찰손실 계산
- **NFPC 103 / NFTC 103 / NFTC 604** 기준 적용

## 📐 적용 법령

- 화재안전기준 NFPC 103
- 화재안전기술기준 NFTC 103 (국립소방연구원공고 제2026-8호, 시행 2026. 3. 1.)
- 화재안전기술기준 NFTC 604 (고층건축물)

---
*MANMIN · Blueprint Engineering Theme · Ver 3.1*
