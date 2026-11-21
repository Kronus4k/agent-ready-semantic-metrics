import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({ data, height = 44 }: { data: number[]; height?: number }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }} className="w-full text-primary">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            type="monotone"
            dataKey="v"
            stroke="currentColor"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
