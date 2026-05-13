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
    <div class="flex-shrink-0 w-[160px] sm:w-[180px] md:w-auto md:flex-1 bg-surface rounded-xl border border-border p-4">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</span>
        <div class={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p class="text-xl font-bold font-display text-text truncate">{value}</p>
    </div>
  );
}
