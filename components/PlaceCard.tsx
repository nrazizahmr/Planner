
import React from 'react';
import { Place, PlaceCategory } from '../types';

interface PlaceCardProps {
  place: Place;
  onEdit: (place: Place) => void;
  onDelete: (id: string) => void;
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

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full group">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {place.placePhotoUrl ? (
          <img 
            src={place.placePhotoUrl} 
            alt={place.name} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-xl text-[10px] font-black border backdrop-blur-md bg-white/80 uppercase tracking-widest ${getCategoryColor(place.category)}`}>
            {place.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-1">{place.name}</h3>
          {place.rating && (
            <div className="flex items-center text-yellow-500 font-black text-sm bg-yellow-50 px-2 py-1 rounded-xl border border-yellow-100">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {place.rating}
            </div>
          )}
        </div>
        
        <p className="text-slate-500 text-xs mb-4 flex items-start">
          <svg className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="line-clamp-2">{place.address}</span>
        </p>
        
        <p className="text-slate-600 text-sm mb-5 line-clamp-2 italic leading-relaxed">
          "{place.description}"
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {place.tags.map((tag, idx) => (
            <span key={idx} className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border border-indigo-100">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex gap-2">
          <a 
            href={place.referenceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-grow flex items-center justify-center py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            Buka Maps
          </a>
          {place.menuPhotoUrl && (
            <a 
              href={place.menuPhotoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 flex items-center justify-center bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-indigo-200 hover:bg-indigo-50 transition-all"
            >
              Menu
            </a>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button 
            onClick={() => onEdit(place)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(place.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
