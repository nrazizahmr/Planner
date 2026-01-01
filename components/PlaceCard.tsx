
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Photo Header */}
      <div className="relative h-40 bg-slate-200 overflow-hidden">
        {place.placePhotoUrl ? (
          <img 
            src={place.placePhotoUrl} 
            alt={place.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${getCategoryColor(place.category)}`}>
            {place.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-1">{place.name}</h3>
          {place.rating && (
            <div className="flex items-center text-yellow-500 font-bold text-sm ml-2">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {place.rating}
            </div>
          )}
        </div>
        
        <p className="text-slate-500 text-xs mb-3 flex items-center">
          <svg className="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{place.address}</span>
        </p>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {place.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {place.tags.map((tag, idx) => (
            <span key={idx} className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>

        {place.menuPhotoUrl && (
          <a 
            href={place.menuPhotoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors mb-2"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            VIEW MENU
          </a>
        )}
      </div>
      
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
        <div className="flex flex-col gap-2 mb-3">
          {place.references.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {place.references.map((ref, i) => (
                <a 
                  key={i}
                  href={ref.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                  </svg>
                  {ref.title || 'Link'}
                </a>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 italic">No reference links</span>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button 
            onClick={() => onEdit(place)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(place.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
