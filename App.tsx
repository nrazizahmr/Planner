import React, { useState, useEffect, useMemo } from 'react';
import { Place, PlaceCategory } from './types.ts';
import { PlaceCard } from './components/PlaceCard.tsx';
import { PlaceModal } from './components/PlaceModal.tsx';

const App: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [viewingPlace, setViewingPlace] = useState<Place | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('trip_planner_pro_v1');
    if (saved) {
      try {
        setPlaces(JSON.parse(saved));
      } catch (e) {
        console.error("Gagal memuat data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trip_planner_pro_v1', JSON.stringify(places));
  }, [places]);

  const handleSavePlace = (placeData: Partial<Place>) => {
    if (editingPlace) {
      setPlaces(prev => prev.map(p => p.id === editingPlace.id ? { ...p, ...placeData } as Place : p));
    } else {
      const newPlace: Place = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        ...placeData,
      } as Place;
      setPlaces(prev => [newPlace, ...prev]);
    }
    setEditingPlace(undefined);
  };

  const handleDeletePlace = (id: string) => {
    if (confirm("Hapus tempat ini dari rencana perjalanan Anda?")) {
      setPlaces(prev => prev.filter(p => p.id !== id));
      if (viewingPlace?.id === id) setViewingPlace(null);
    }
  };

  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'Semua' || place.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [places, searchQuery, filterCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd]">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-600 w-14 h-14 rounded-[1.5rem] text-white flex items-center justify-center shadow-2xl shadow-indigo-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">TripPlanner <span className="text-indigo-600">AI</span></h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Smart Travel Assistant</p>
            </div>
          </div>

          <div className="flex flex-grow max-w-2xl w-full relative">
            <input
              type="text"
              placeholder="Cari tempat atau tag..."
              className="w-full pl-14 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-[1.5rem] text-sm focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <svg className="w-6 h-6 absolute left-5 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button 
            onClick={() => { setEditingPlace(undefined); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah Tempat
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-8">
        <div className="flex overflow-x-auto pb-8 gap-3 no-scrollbar">
          {['Semua', ...Object.values(PlaceCategory)].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border-2 flex-shrink-0 ${
                filterCategory === cat 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                  : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm px-10">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Belum Ada Rencana</h2>
            <p className="text-slate-400 max-w-md mb-10 font-bold">Mulai tambahkan tempat impian Anda dengan fitur Auto-Fill AI.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPlaces.map(place => (
              <PlaceCard 
                key={place.id} 
                place={place} 
                onEdit={(p) => { setEditingPlace(p); setIsModalOpen(true); }} 
                onDelete={handleDeletePlace} 
                onClick={() => setViewingPlace(place)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail View Modal */}
      {viewingPlace && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl overflow-y-auto" onClick={() => setViewingPlace(null)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl my-auto animate-modal-in overflow-hidden flex flex-col lg:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="w-full lg:w-1/2 bg-slate-100 overflow-y-auto no-scrollbar">
              {viewingPlace.placePhotoUrl && (
                <div className="p-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Foto Tempat</p>
                  <img src={viewingPlace.placePhotoUrl} className="w-full rounded-[2rem] shadow-lg mb-6" alt="Foto Tempat" />
                </div>
              )}
              {viewingPlace.menuPhotoUrl && (
                <div className="p-4 pt-0">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Foto Menu</p>
                  <img src={viewingPlace.menuPhotoUrl} className="w-full rounded-[2rem] shadow-lg" alt="Menu" />
                </div>
              )}
              {!viewingPlace.placePhotoUrl && !viewingPlace.menuPhotoUrl && (
                <div className="h-full flex items-center justify-center p-20 text-slate-300">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/2 p-10 lg:p-14 overflow-y-auto flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  {viewingPlace.category}
                </span>
                <button onClick={() => setViewingPlace(null)} className="text-slate-300 hover:text-slate-600 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tighter">{viewingPlace.name}</h2>
              
              <div className="flex items-center gap-4 mb-8">
                {viewingPlace.rating && (
                  <div className="flex items-center text-yellow-500 font-black bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100 text-sm">
                    ★ {viewingPlace.rating}
                  </div>
                )}
                <div className="text-slate-400 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  {viewingPlace.address}
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Deskripsi Lengkap</p>
                <p className="text-slate-600 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                  {viewingPlace.description || "Tidak ada deskripsi tersedia."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-10">
                {viewingPlace.tags.map((tag, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">#{tag}</span>
                ))}
              </div>

              <div className="flex gap-4">
                <a 
                  href={viewingPlace.referenceUrl} 
                  target="_blank" 
                  className="flex-grow py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl text-center shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                >
                  Buka di Google Maps
                </a>
                <button 
                  onClick={() => { setEditingPlace(viewingPlace); setIsModalOpen(true); setViewingPlace(null); }}
                  className="p-5 bg-white border-2 border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PlaceModal isOpen={isModalOpen} place={editingPlace} onClose={() => setIsModalOpen(false)} onSave={handleSavePlace} />
    </div>
  );
};

export default App;