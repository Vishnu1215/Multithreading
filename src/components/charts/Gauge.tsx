import React from 'react';

interface GaugeProps {
  value: number; // 0 to 100
  title: string;
  unit?: string;
  color?: string;
  subtitle?: string;
  size?: number;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  title,
  unit = '%',
  color = '#6366F1',
  subtitle,
  size = 130,
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 240 degree gauge arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/40 border border-border/40 relative">
      <div className="relative" style={{ width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-[135deg] overflow-visible"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-border/40"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.4s ease-out, stroke 0.3s ease',
              filter: `drop-shadow(0 0 6px ${color}66)`,
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-xl font-bold font-mono tracking-tight text-foreground">
            {typeof value === 'number' ? (value % 1 === 0 ? value : value.toFixed(1)) : value}
            <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>
          </span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        </div>
      </div>
      {subtitle && <span className="text-[10px] text-muted-foreground mt-1 text-center">{subtitle}</span>}
    </div>
  );
};
