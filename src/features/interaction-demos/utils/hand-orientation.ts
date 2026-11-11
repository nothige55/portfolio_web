// SurgiAuth 가입 화면의 수집 규칙을 손 모델로 흉내 낸 데모. 카메라는 쓰지 않는다.
// 값은 SurgiAuth hand-orientation.ts와 같다: roll ±25°(칸 폭 10°)·pitch ±27°(칸 폭 18°)의 5×3 격자.
// 격자 밖은 가장자리 칸으로 몰리고, open_palm 인식이 풀리는 각도(roll ±54°·pitch ±30° 밖)에서는 담지 않는다.
export const ROLL_COLS = 5;
export const PITCH_ROWS = 3;
export const ROLL_RANGE = 50;
export const PITCH_RANGE = 54;
export const ROLL_LIMIT = 54;
export const PITCH_LIMIT = 30;
export const PER_CELL = 2;
export const TOTAL = ROLL_COLS * PITCH_ROWS * PER_CELL;
// 손이 움직이는 각도 범위(인식 한계보다 조금 넓게 둬서 풀리는 구간을 보여 준다).
export const SHOW_ROLL = 70;
export const SHOW_PITCH = 45;

export type Angle = { roll: number; pitch: number };

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const bucket = (v: number, range: number, count: number) =>
  clamp(Math.floor(((v + range / 2) / range) * count), 0, count - 1);

export function judge({ roll, pitch }: Angle) {
  if (Math.abs(roll) > ROLL_LIMIT || Math.abs(pitch) > PITCH_LIMIT) {
    return { kind: "lost" as const, key: "" };
  }
  const r = bucket(roll, ROLL_RANGE, ROLL_COLS);
  const p = bucket(pitch, PITCH_RANGE, PITCH_ROWS);
  const clamped = Math.abs(roll) > ROLL_RANGE / 2 || Math.abs(pitch) > PITCH_RANGE / 2;
  return { kind: clamped ? ("edge" as const) : ("ok" as const), key: `${p}-${r}` };
}

// 격자 안에서 손의 위치(0~1). x는 왼쪽이 0, y는 위쪽이 0이고 pitch가 클수록 위다.
export function handPosition({ roll, pitch }: Angle) {
  return {
    x: (clamp(roll, -ROLL_RANGE / 2, ROLL_RANGE / 2) + ROLL_RANGE / 2) / ROLL_RANGE,
    y: (PITCH_RANGE / 2 - clamp(pitch, -PITCH_RANGE / 2, PITCH_RANGE / 2)) / PITCH_RANGE,
  };
}
