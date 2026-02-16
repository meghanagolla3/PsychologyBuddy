'use client';
import * as React from 'react';
import { Clock, Trash2, Smile } from 'lucide-react';

interface ArtJournal {
  id: string;
  imageUrl: string;
  createdAt: string;
}

interface JournalHistoryProps {
  journals: ArtJournal[];
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function JournalHistory({ journals, onDelete, loading }: JournalHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/></svg>
        </div>
        <div>
           <h3 className="text-xl font-bold text-gray-800">Your Journals</h3>
           <p className="text-gray-500 text-sm">See Your Latest Journals</p>
        </div>
      </div>

      {journals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No art journals yet. Start creating your first masterpiece!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {journals.map((journal, idx) => (
            <div key={journal.id} className="relative group cursor-pointer">
              <div className={`h-40 w-full bg-white rounded-2xl border ${idx === 0 ? 'border-gray-400 shadow-lg' : 'border-blue-200'} overflow-hidden relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                <img 
                  src={journal.imageUrl} 
                  alt="Art journal entry" 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay for Active/First Item */}
                {idx === 0 && (
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                      <div className="flex items-center justify-between text-white/90 text-xs font-medium">
                         <div className="flex items-center gap-2">
                            <span>{formatDate(journal.createdAt)}</span>
                         </div>
                         <button 
                           onClick={() => onDelete(journal.id)}
                           disabled={loading}
                           className="hover:text-red-400 transition-colors disabled:opacity-50"
                         >
                           <Trash2 className="w-3 h-3" />
                         </button>
                      </div>
                   </div>
                )}
                
                {/* Delete button for other items */}
                {idx !== 0 && (
                  <button 
                    onClick={() => onDelete(journal.id)}
                    disabled={loading}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
