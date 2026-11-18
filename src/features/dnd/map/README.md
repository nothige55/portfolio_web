/dnd 데모 옆 지도를 Trego 원본(trego-web-portfolio `src/features/planner/map`, `use-planner-map-instance`, `planner-map`)과 같은 Mapbox GL 코드로 그린다.

- 원본 파일을 거의 그대로 옮겼고, 원본과 달라진 곳에는 `수정:` 주석을 단다.
- 가장 큰 차이: 원본은 전역 view store로 일정 패널과 선택·hover를 공유했지만, 데모는 지도 안의 로컬 상태로만 둔다.
- 토큰은 `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`(`src/config/env.ts`)으로 받고 커밋하지 않는다. 없으면 `components/route-map.tsx`의 SVG 지도가 대신 나온다.
- 금지: 이 폴더에서 stage-a/b/c의 상태나 컴포넌트를 import하지 않는다(타입과 `build-planner-tree`만 쓴다).
