
import React, { useState, useEffect, useMemo } from 'react';
import { Place, PlaceCategory } from './types';
import { PlaceCard } from './components/PlaceCard';
import { PlaceModal } from './components/PlaceModal';

const App: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    const saved = localStorage.getItem('trip_planner_v5_streamlit');
    if (saved) {
      try {
        setPlaces(JSON.parse(saved));
      } catch (e) {
        console.error("Gagal memuat data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trip_planner_v5_streamlit', JSON.stringify(places));
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
    }
  };

  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setIsModalOpen(true);
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

  const exportAsCSV = () => {
    const headers = ['Nama', 'Kategori', 'Alamat', 'Deskripsi', 'Link Gmaps', 'Tags', 'Rating'];
    const rows = places.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      `"${p.description.replace(/"/g, '""')}"`,
      `"${p.referenceUrl}"`,
      `"${p.tags.join(', ')}"`,
      p.rating
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rencana_perjalanan_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`);
    link.click();
  };

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
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Asisten Visual Anda</p>
            </div>
          </div>

          <div className="flex flex-grow max-w-2xl w-full relative group">
            <input
              type="text"
              placeholder="Cari tempat atau tag favorit..."
              className="w-full pl-14 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-[1.5rem] text-sm focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 transition-all outline-none font-bold"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <svg className="w-6 h-6 absolute left-5 top-4.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{top: '1.1rem'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={exportAsCSV}
              className="p-4 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-[1.5rem] transition-all border border-slate-200 shadow-sm"
              title="Ekspor ke CSV"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button 
              onClick={() => { setEditingPlace(undefined); setIsModalOpen(true); }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="flex overflow-x-auto pb-3 md:pb-0 gap-3 no-scrollbar w-full md:w-auto">
            {['Semua', ...Object.values(PlaceCategory)].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border-2 ${
                  filterCategory === cat 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm self-end">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm px-10">
            <div className="bg-indigo-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3 shadow-inner">
              <svg className="w-16 h-16 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Mulai Petualangan Anda</h2>
            <p className="text-slate-400 max-w-md mb-10 font-bold leading-relaxed">
              Dapatkan detail tempat secara otomatis hanya dengan memasukkan link Google Maps. AI kami akan mengurus sisanya.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:scale-105 transition-all active:scale-95"
            >
              Buat Rencana Pertama
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredPlaces.map(place => (
              <PlaceCard key={place.id} place={place} onEdit={handleEditPlace} onDelete={handleDeletePlace} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempat</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kategori</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rating</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlaces.map(place => (
                  <tr key={place.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.2rem] bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                          {place.placePhotoUrl ? <img src={place.placePhotoUrl} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-lg leading-tight">{place.name}</div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-xs">{place.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                        {place.category}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-center font-black text-yellow-500 text-lg">{place.rating || '-'}</td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditPlace(place)} className="p-3 text-indigo-600 hover:bg-white rounded-2xl shadow-sm border border-transparent hover:border-slate-100">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeletePlace(place.id)} className="p-3 text-red-600 hover:bg-white rounded-2xl shadow-sm border border-transparent hover:border-slate-100">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-200 text-center">
        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">&copy; {new Date().getFullYear()} TRIPPLANNER AI • PREMIUM TRAVEL MANAGER</p>
      </footer>

      <PlaceModal isOpen={isModalOpen} place={editingPlace} onClose={() => setIsModalOpen(false)} onSave={handleSavePlace} />
    </div>
  );
};

export default App;
