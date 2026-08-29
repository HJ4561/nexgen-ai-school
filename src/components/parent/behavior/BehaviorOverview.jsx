// src/components/parent/behavior/BehaviorOverview.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Shield, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import { selectBehaviorLogs, selectBehaviorStats } from '@/modules/parent/store/parentSlice';

const BehaviorOverview = () => {
  const behaviorLogs = useSelector(selectBehaviorLogs);
  const behaviorStats = useSelector(selectBehaviorStats);

  const stats = useMemo(() => {
    const total = behaviorLogs.length;
    const positive = behaviorLogs.filter(log => log.type === 'positive').length;
    const negative = behaviorLogs.filter(log => log.type === 'negative').length;
    const low = behaviorLogs.filter(log => log.severity === 'low').length;
    const medium = behaviorLogs.filter(log => log.severity === 'medium').length;
    const high = behaviorLogs.filter(log => log.severity === 'high').length;

    return {
      total,
      positive,
      negative,
      low,
      medium,
      high,
    };
  }, [behaviorLogs]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800 mt-0.5 md:mt-1">{stats.total}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">All behaviors</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Positive</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-0.5 md:mt-1">{stats.positive}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
              {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Negative</p>
            <p className="text-xl md:text-2xl font-bold text-red-600 mt-0.5 md:mt-1">{stats.negative}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
              {stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">High Severity</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600 mt-0.5 md:mt-1">{stats.high}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Needs attention</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BehaviorOverview;