"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ConsensusRadarProps {
  valueScore: number;
  interestScore: number;
  size?: number;
}

export function ConsensusRadar({
  valueScore,
  interestScore,
  size = 200,
}: ConsensusRadarProps) {
  const data = [
    {
      subject: "价值观",
      value: Math.round((valueScore / 40) * 100),
      fullMark: 100,
    },
    {
      subject: "兴趣",
      value: Math.round((interestScore / 30) * 100),
      fullMark: 100,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="共识度"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`${typeof value === "number" ? value : 0}%`, "匹配度"]}
          contentStyle={{ borderRadius: "8px" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
