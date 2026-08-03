import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Award, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';

const BehaviorStatsNew = ({ logs = [] }) => {
    const stats = {
        total: logs.length,
        positive: logs.filter(l => l.type === 'positive').length,
        negative: logs.filter(l => l.type === 'negative').length,
        neutral: logs.filter(l => l.type === 'neutral' || !l.type).length,
    };

    const statItems = [
        {
            label: 'Total Logs',
            value: stats.total,
            icon: Activity,
            color: 'blue',
        },
        {
            label: 'Positive',
            value: stats.positive,
            icon: Award,
            color: 'emerald',
        },
        {
            label: 'Negative',
            value: stats.negative,
            icon: AlertCircle,
            color: 'rose',
        },
        {
            label: 'Neutral',
            value: stats.neutral,
            icon: Minus,
            color: 'gray',
        },
    ];

    const colorMap = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        gray: 'bg-gray-50 text-gray-600',
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg ${colorMap[item.color]} flex items-center justify-center`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default BehaviorStatsNew;