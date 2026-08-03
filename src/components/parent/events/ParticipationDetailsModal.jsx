import React from 'react';
import { X, Calendar, MapPin, User, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const ParticipationDetailsModal = ({ participation, onClose, onEdit }) => {
  if (!participation) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]" onClick={onClose} />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Participation Details</h2>
                <p className="text-sm text-white/80 mt-0.5">{participation.event_name}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Event</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{participation.event_name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{participation.event_date}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{participation.event_location}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <Badge className={participation.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 mt-1' : 'bg-amber-50 text-amber-700 border-amber-200 mt-1'}>
                  {participation.status || 'Registered'}
                </Badge>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Student</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{participation.student}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">Close</button>
              <button onClick={onEdit} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-600/25">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipationDetailsModal;