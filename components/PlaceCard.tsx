import React from 'react';
import { Place, PlaceCategory } from '../types.ts';

interface PlaceCardProps {
  place: Place;
  onEdit: (place: Place) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

const getCategoryColor = (category: PlaceCategory) => {
  switch (category) {
    case PlaceCategory.RESTAURANT: return 'bg-orange-100 text-orange-700 border-orange-200';
    case PlaceCategory.CAFE: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case PlaceCategory.SIGHTSEEING: return 'bg-blue-100 text-blue-700 border-blue-200';
    case PlaceCategory.HOTEL: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case PlaceCategory.SHOPPING: return 'bg-pink-100 text-pink-700 border-pink-200';
    case PlaceCategory.ACTIVITY: return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onEdit, onDelete, onClick }) => {
  // Mapping fallback for Supabase snake_case
  const photoUrl = place.place_photo_url || place.placePhotoUrl;
  const menuUrl = place.menu_photo_url || place.menuPhotoUrl;
  const refUrl = place.reference_url || place.referenceUrl;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col h-full group"
    >
      <div className="relative h-48 bg-slate-50 overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-xl text-[9px] font-black border backdrop-blur-md bg-white/70 uppercase tracking-widest ${getCategoryColor(place.category)}`}>
            {place.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-1">{place.name}</h3>
          {place.rating && (
            <div className="flex items-center text-yellow-500 font-bold text-xs shrink-0">★ {place.rating}</div>
          )}
        </div>
        <p className="text-slate-400 text-[10px] mb-3 line-clamp-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
          {place.address}
        </p>
        <p className="text-slate-600 text-xs mb-5 line-clamp-2 leading-relaxed italic">"{place.description}"</p>
        <div className="flex flex-wrap gap-1.5">
          {place.tags && place.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">#{tag}</span>
          ))}
          {place.tags && place.tags.length > 3 && <span className="text-[9px] text-slate-400 font-bold self-center">+{place.tags.length - 3}</span>}
        </div>
      </div>
      
      <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex gap-2" onClick={e => e.stopPropagation()}>
        <a href={refUrl} target="_blank" className="flex-grow py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl text-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Maps</a>
        {menuUrl && (
          <button onClick={onClick} className="px-4 bg-white text-indigo-600 border border-indigo-200 rounded-xl font-black text-[9px] uppercase tracking-widest">Menu</button>
        )}
        <button onClick={() => onEdit(place)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
        <button onClick={() => onDelete(place.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
      </div>
    </div>
  );
};