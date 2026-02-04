
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: string;
    color?: string; // e.g. "amber" | "blue" | "green"
}

export function StatsCard({ icon: Icon, label, value, trend, color = "amber" }: StatsCardProps) {
    const colorClasses = {
        amber: 'bg-amber-100 text-amber-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
    }[color] || 'bg-gray-100 text-gray-600';

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {trend && <p className="text-xs text-green-600 mt-2 font-medium">{trend}</p>}
            </div>
            <div className={`p-3 rounded-xl ${colorClasses}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}
