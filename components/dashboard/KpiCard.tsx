import React from 'react';
import Card from '../ui/Card';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColorClass?: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, iconColorClass = 'text-slate-500', change, changeType }) => {
  const changeColor = changeType === 'increase' ? 'text-green-600' : 'text-red-600';

  return (
    <Card>
      <div className="flex items-center">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${iconColorClass.replace('text-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
      {change && (
        <div className="mt-2 flex items-center text-sm">
          <p className={`${changeColor} font-semibold`}>
            {change}
          </p>
        </div>
      )}
    </Card>
  );
};

export default KpiCard;
