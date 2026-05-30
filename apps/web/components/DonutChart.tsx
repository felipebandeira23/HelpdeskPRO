'use client';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * Donut chart em SVG puro (sem dependências externas).
 * Tema dark com legenda lateral.
 */
export function DonutChart({
  slices,
  size = 180,
  thickness = 28,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={thickness}
          />
          {total > 0 &&
            slices.map((slice, i) => {
              const fraction = slice.value / total;
              const dash = fraction * circumference;
              const gap = circumference - dash;
              const circle = (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += dash;
              return circle;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{total}</span>
          <span className="text-xs text-slate-400">total</span>
        </div>
      </div>

      <div className="space-y-2">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-slate-300">{slice.label}</span>
            <span className="text-sm text-slate-500 ml-auto">
              {slice.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
