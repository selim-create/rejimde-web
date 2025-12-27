interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconBgColor, 
  iconColor,
  trend 
}: SummaryCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold">{title}</p>
          <p className="text-2xl font-black text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <i className={`fa-solid fa-arrow-${trend.isPositive ? 'up' : 'down'} mr-1`}></i>
              {trend.value}
            </p>
          )}
          {subtitle && !trend && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
          <i className={`fa-solid ${icon} ${iconColor} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}
