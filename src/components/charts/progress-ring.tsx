"use client";

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
};

export default function ProgressRing({
  value,
  size = 140,
  stroke = 12,
}: ProgressRingProps) {
  const normalizedRadius = (size - stroke) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <svg
      height={size}
      width={size}
      role="img"
      aria-label={`${value}% quarter progress`}
    >
      <g transform={`rotate(-90 ${center} ${center})`}>
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={center}
          cy={center}
        />
        <circle
          stroke="#1d4ed8"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.6s ease",
          }}
          r={normalizedRadius}
          cx={center}
          cy={center}
        />
      </g>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-900 text-2xl font-semibold dark:fill-slate-100"
      >
        {value}%
      </text>
    </svg>
  );
}
