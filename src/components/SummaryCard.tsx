interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'accent' | 'accent-2' | 'success';
}

export default function SummaryCard({ title, value, icon, color = 'accent' }: SummaryCardProps) {
  const colorMap = {
    accent: 'bg-accent/15 text-accent border-accent/30',
    'accent-2': 'bg-accent-2/15 text-accent-2 border-accent-2/30',
    success: 'bg-success/15 text-success border-success/30',
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold font-display text-text truncate">{value}</p>
    </div>
  );
}
