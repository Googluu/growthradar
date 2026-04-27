type Status = "GOOD" | "NEEDS IMPROVEMENT" | "POOR";

const STATUS_COLOR: Record<Status, string> = {
  GOOD: "#5DB848",
  "NEEDS IMPROVEMENT": "#F5C842",
  POOR: "#E53935",
};
const STATUS_ICON: Record<Status, string> = {
  GOOD: "●",
  "NEEDS IMPROVEMENT": "▲",
  POOR: "●",
};

interface Props {
  label: string;
  value: string;
  status: Status;
}

export function MetricRow({ label, value, status }: Props) {
  return (
    <div
      className="flex items-center justify-between py-2.5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span className="text-[13px]" style={{ color: "var(--txt-muted)" }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-semibold text-[14px]" style={{ color: "var(--txt)" }}>{value}</span>
        <span className="text-[11px] font-bold" style={{ color: STATUS_COLOR[status] }}>
          {STATUS_ICON[status]} {status}
        </span>
      </div>
    </div>
  );
}
