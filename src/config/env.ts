// 환경변수는 여기서만 읽는다. Next는 NEXT_PUBLIC_ 값을 빌드 때 그대로 박아 넣으므로 process.env.X를 글자 그대로 써야 한다.
// 원본(trego-web-portfolio src/config/env.ts)의 VITE_MAPBOX_ACCESS_TOKEN을 Next 이름으로 바꿨다.

export function parseMapboxAccessToken(value: string | undefined): string | undefined {
  const accessToken = value?.trim();
  return accessToken || undefined;
}

export const env = {
  mapboxAccessToken: parseMapboxAccessToken(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN),
};
