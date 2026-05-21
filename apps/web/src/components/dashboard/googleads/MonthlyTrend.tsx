"use client";

import { G, fmtPct, Badge, Card, SectionTitle, AreaChart, IconArrowUp, IconArrowDown } from "./shared";

export function MonthlyTrend({ data }: { data: Array<{ year_month: string; search_volume: number }> }) {
  const first = data[0]?.search_volume;
  const last  = data[data.length - 1]?.search_volume;
  const delta = (first && last) ? (last - first) / first : 0;

  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle
        title="Tendencia mensual agregada"
        sub="Volumen total de búsqueda, últimos 12 meses"
        right={
          first && last ? (
            <Badge tone={delta >= 0 ? "green" : "red"} style={{ fontSize: 12, padding: "4px 10px" }}>
              {delta >= 0 ? <IconArrowUp size={11}/> : <IconArrowDown size={11}/>}
              {fmtPct(delta)} YoY
            </Badge>
          ) : undefined
        }
      />
      <AreaChart data={data} gradId="gads-monthly-area"/>
    </Card>
  );
}
