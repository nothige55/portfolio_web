# portfolio_web

드래그 하나를 세 번 다시 만든 과정을 직접 만져 보는 인터랙션 중심 포트폴리오예요. Next.js, TypeScript, Tailwind, shadcn/ui로 만들어요.

```bash
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
```

배포는 Vercel을 쓸 예정이에요.

## 직접 만져볼 것

- 홈 `trego-drag`: 드래그 세 단계(V1~V6)를 스크롤하며 직접 끌어 봐요.
- 홈 `trego-nav`: 깊은 트리에서 조상 경로가 이어받는 breadcrumb이에요.
- 홈 `trego-state`: 트리 인덱스 3개와 이웃 사이 중간값으로 위치를 정하는 규칙이에요.
- 홈 `trego-sync`: 실시간 협업은 본 앱 기능이라 이 사이트에는 데모가 없고, trego-web-portfolio 링크로 이어져요.
- `/trego`: 버전별 과정과 챕터별 「Trego에서의 설계」, 맨 아래 「그 밖에 Trego에서」이 있어요.

## 담긴 프로젝트

- Trego: 드래그 인터랙션, 스크롤 중 위치 breadcrumb, 트리 상태 설계(원본 배열 하나에서 인덱스 세 개 파생, 분수 위치).
  실시간 동시 편집(SignalR 연결 하나, 작업 단위 undo)은 본 앱 기능이라 [trego-web-portfolio](https://github.com/nothige55/trego-web-portfolio)에서 확인해요.
- SurgiAuth: 수술실 비접촉 제스처 인증.
