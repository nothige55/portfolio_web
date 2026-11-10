// 데모용 단순 지도. 좌표는 제주 북서쪽 해안을 대충 본뜬 값이고 거리는 그 좌표로 어림한 것이다.
type Place = { x: number; y: number; short: string };

const places: Record<string, Place> = {
  공항: { x: 226, y: 62, short: "공항" },
  이호테우: { x: 186, y: 88, short: "이호" },
  협재해수욕장: { x: 24, y: 118, short: "협재" },
  동문시장: { x: 262, y: 44, short: "동문" },
};

const KM_PER_PX = 0.133;

function km(order: readonly string[]) {
  let total = 0;
  for (let i = 1; i < order.length; i++) {
    const a = places[order[i - 1]];
    const b = places[order[i]];
    total += Math.hypot(a.x - b.x, a.y - b.y) * KM_PER_PX;
  }
  return total;
}

const line = (order: readonly string[]) => order.map((l) => `${places[l].x},${places[l].y}`).join(" ");

export function JejuMap({
  order,
  preview,
}: {
  order: readonly string[];
  preview: { order: readonly string[]; label: string } | null;
}) {
  const shown = preview?.order ?? order;
  const before = km(order);
  const after = km(shown);
  const diff = after - before;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border bg-sky-50">
        <svg viewBox="0 0 300 150" className="block w-full" role="img" aria-label="제주 북서쪽 지도. 일정 순서대로 장소가 선으로 이어져요">
          <path d="M0,96 C60,110 120,86 190,76 C245,66 280,40 300,34 L300,150 L0,150 Z" fill="oklch(0.95 0.02 130)" />
          <polyline
            points={line(order)}
            fill="none"
            stroke="oklch(0.55 0 0)"
            strokeWidth="2"
            strokeLinejoin="round"
            opacity={preview ? 0.35 : 1}
          />
          {preview && (
            <polyline
              points={line(shown)}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinejoin="round"
            />
          )}
          {shown.map((label, i) => {
            const p = places[label];
            const active = preview?.label === label;
            return (
              <g key={label} className="transition-transform duration-200">
                {active && <circle cx={p.x} cy={p.y} r="13" fill="var(--primary)" opacity="0.25" />}
                <circle cx={p.x} cy={p.y} r="8" fill={active ? "var(--primary)" : "white"} stroke="oklch(0.3 0 0)" strokeWidth="1.5" />
                <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="600" fill={active ? "white" : "black"}>
                  {i + 1}
                </text>
                <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize="8" fill="oklch(0.35 0 0)">
                  {p.short}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-sm" aria-live="polite">
        {preview && Math.abs(diff) > 0.05 ? (
          <>
            놓으면 총 이동 <b>{before.toFixed(1)}</b> → <b className="text-primary">{after.toFixed(1)} km</b>{" "}
            <span className="text-muted-foreground">({diff < 0 ? "" : "+"}{diff.toFixed(1)})</span>
          </>
        ) : (
          <>총 이동 <b>{after.toFixed(1)} km</b></>
        )}
        <span className="ml-2 text-xs text-muted-foreground">데모 좌표 기준</span>
      </p>
    </div>
  );
}
