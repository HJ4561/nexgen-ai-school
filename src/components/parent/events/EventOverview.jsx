// src/components/parent/events/EventOverview.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Trophy, Award, Calendar, Star, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { selectEvents, selectCertificates } from '@/modules/parent/store/parentSlice';

const EventOverview = () => {
  const events = useSelector(selectEvents);
  const certificates = useSelector(selectCertificates);

  const stats = useMemo(() => {
    const totalParticipations = events.length;
    const totalCertificates = certificates.length;
    const upcoming = events.filter(e => e.is_upcoming).length;
    const completed = events.filter(e => !e.is_upcoming).length;
    
    return {
      totalParticipations,
      totalCertificates,
      upcoming,
      completed,
    };
  }, [events, certificates]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="p-3 md:p-4 border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Participations</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800 mt-0.5 md:mt-1">{stats.totalParticipations}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Total events</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Trophy className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-0.5 md:mt-1">{stats.upcoming}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Registered events</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600 mt-0.5 md:mt-1">{stats.completed}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Past events</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Certificates</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600 mt-0.5 md:mt-1">{stats.totalCertificates}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Awards earned</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventOverview;