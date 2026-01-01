import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Place, PlaceCategory } from './types.ts';
import { PlaceCard } from './components/PlaceCard.tsx';
import { PlaceModal } from './components/PlaceModal.tsx';

/**
 * PENTING: MASUKKAN CREDENTIALS SUPABASE ANDA DI SINI
 * Dengan mengisi ini, aplikasi akan otomatis terhubung di semua perangkat.
 */
const SUPABASE_URL = "https://bzwwoxwxssfcaduuoiww.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_XUzeccuHEeP9hU6flhmE5Q_RfG8qi8X"; 

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

const App: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [viewingPlace, setViewingPlace] = useState<Place | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load data dari Supabase saat startup
  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapping database (snake_case) ke frontend (camelCase) jika perlu
      // Tapi kita usahakan field di SQL sama dengan interface Place
      setPlaces(data as Place[]);
    } catch (err) {
      console.error("Gagal mengambil data Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlace = async (placeData: Partial<Place>) => {
    if (!supabase) return alert("Supabase belum dikonfigurasi di App.tsx!");
    
    setIsLoading(true);
    try {
      if (editingPlace) {
        // UPDATE
        const { error } = await supabase
          .from('places')
          .update({
            name: placeData.name,
            category: placeData.category,
            address: placeData.address,
            description: placeData.description,
            reference_url: placeData.referenceUrl, // sesuaikan mapping
            place_photo_url: placeData.placePhotoUrl,
            menu_photo_url: placeData.menuPhotoUrl,
            rating: placeData.rating,
            tags: placeData.tags
          })
          .eq('id', editingPlace.id);
        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from('places')
          .insert([{
            name: placeData.name,
            category: placeData.category,
            address: placeData.address,
            description: placeData.description,
            reference_url: placeData.referenceUrl,
            place_photo_url: placeData.placePhotoUrl,
            menu_photo_url: placeData.menuPhotoUrl,
            rating: placeData.rating,
            tags: placeData.tags
          }]);
        if (error) throw error;
      }
      await fetchPlaces(); // Refresh data
      setEditingPlace(undefined);
    } catch (err) {
      console.error("Gagal menyimpan ke Supabase:", err);
      alert("Error saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlace = async (id: string) => {
    if (!supabase) return;
    if (confirm("Hapus tempat ini secara permanen dari Supabase?")) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('places')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setPlaces(places.filter(p => p.id !== id));
        if (viewingPlace?.id === id) setViewingPlace(null);
      } catch (err) {
        console.error("Gagal menghapus dari Supabase:", err);
      } finally {
        setIsLoading(false);
      }
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
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">TripPlanner <span className="text-indigo-600">AI</span></h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${supabase ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></span>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  {supabase ? 'Supabase Database Connected' : 'Supabase Not Configured'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-grow max-w-2xl w-full relative">
            <input 
              type="text" 
              placeholder="Cari tempat tujuan..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-[1.5rem] text-sm focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
            <svg className="w-6 h-6 absolute left-5 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSyncModalOpen(true)}
              className={`flex items-center gap-3 px-5 py-4 rounded-[1.5rem] border-2 transition-all shadow-sm ${supabase ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-red-50 border-red-100 text-red-400'}`}
            >
              <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
                {isLoading ? 'Loading...' : 'Database'}
              </span>
            </button>

            <button 
              onClick={() => { setEditingPlace(undefined); setIsModalOpen(true); }} 
              className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Tambah
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-8">
        <div className="flex overflow-x-auto pb-8 gap-3 no-scrollbar">
          {['Semua', ...Object.values(PlaceCategory)].map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilterCategory(cat)} 
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 flex-shrink-0 ${filterCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {places.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm px-10">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
              {supabase ? 'Belum Ada Rencana' : 'Database Kosong'}
            </h2>
            <p className="text-slate-400 max-w-md mb-6 font-bold">
              {supabase ? 'Aplikasi sudah terhubung ke Supabase. Mulai tambahkan tempat tujuan Anda!' : 'Masukkan Credential Supabase di App.tsx untuk mulai menyimpan data ke database cloud.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPlaces.map(place => (
              <PlaceCard key={place.id} place={place} onEdit={(p) => { setEditingPlace(p); setIsModalOpen(true); }} onDelete={handleDeletePlace} onClick={() => setViewingPlace(place)} />
            ))}
          </div>
        )}
      </main>

      {/* Supabase Config Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl animate-modal-in overflow-hidden p-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Supabase Configuration</h2>
              <button onClick={() => setIsSyncModalOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div className="space-y-8">
              <div className={`p-8 rounded-[2rem] text-center ${supabase ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${supabase ? 'bg-white/20' : 'bg-red-100'}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={supabase ? "M5 13l4 4L19 7" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"} /></svg>
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tighter mb-2">{supabase ? 'Supabase Connected' : 'Action Required'}</h3>
                 <p className="text-xs font-bold opacity-80 leading-relaxed">
                   {supabase 
                     ? 'Aplikasi ini sudah terhubung secara global ke Supabase Anda. Semua data disimpan di Cloud secara real-time.' 
                     : 'Isi SUPABASE_URL dan SUPABASE_ANON_KEY di dalam kode App.tsx untuk mengaktifkan database.'}
                 </p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Langkah Setup Supabase:</p>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                   <p className="text-xs font-medium text-slate-700 leading-relaxed">
                     1. Buat project di <a href="https://supabase.com" target="_blank" className="text-indigo-600 underline">supabase.com</a>.<br/>
                     2. Jalankan perintah SQL di SQL Editor untuk membuat tabel <b>places</b>.<br/>
                     3. Masukkan Project URL dan Anon Key ke variabel di <b>App.tsx</b>.
                   </p>
                   <div className="bg-slate-900 rounded-xl p-4">
                      <p className="text-[9px] text-indigo-300 font-mono">
                        CREATE TABLE places ( ... );
                      </p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`create table places (\n  id uuid primary key default gen_random_uuid(),\n  name text not null,\n  category text,\n  address text,\n  description text,\n  reference_url text,\n  place_photo_url text,\n  menu_photo_url text,\n  rating numeric,\n  tags text[],\n  created_at timestamptz default now()\n);`);
                          alert("SQL query disalin!");
                        }}
                        className="mt-2 text-[9px] font-black uppercase text-white/50 hover:text-white"
                      >
                        Salin SQL Lengkap
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Details */}
      {viewingPlace && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl overflow-y-auto" onClick={() => setViewingPlace(null)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl my-auto animate-modal-in overflow-hidden flex flex-col lg:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="w-full lg:w-1/2 bg-slate-100 overflow-y-auto no-scrollbar">
              {viewingPlace.placePhotoUrl && <div className="p-4"><img src={viewingPlace.placePhotoUrl} className="w-full rounded-[2rem] shadow-lg mb-6" alt="Foto" /></div>}
              {viewingPlace.menuPhotoUrl && <div className="p-4 pt-0"><p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest px-4">Foto Menu</p><img src={viewingPlace.menuPhotoUrl} className="w-full rounded-[2rem] shadow-lg" alt="Menu" /></div>}
            </div>
            <div className="w-full lg:w-1/2 p-10 lg:p-14 overflow-y-auto flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase border border-indigo-100">{viewingPlace.category}</span>
                <button onClick={() => setViewingPlace(null)} className="text-slate-300 hover:text-slate-600 transition-colors"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tighter">{viewingPlace.name}</h2>
              <div className="flex items-center gap-4 mb-8">
                {viewingPlace.rating && <div className="text-yellow-500 font-black bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100 text-sm">★ {viewingPlace.rating}</div>}
                <div className="text-slate-400 text-sm font-medium">{viewingPlace.address}</div>
              </div>
              <div className="space-y-4 mb-10 flex-grow">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Deskripsi</p>
                <p className="text-slate-600 leading-relaxed font-medium text-lg whitespace-pre-wrap">{viewingPlace.description || "Tidak ada deskripsi."}</p>
              </div>
              <div className="flex gap-4">
                <a href={viewingPlace.referenceUrl} target="_blank" className="flex-grow py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl text-center shadow-2xl hover:bg-indigo-700 transition-all">Buka Google Maps</a>
                <button onClick={() => { setEditingPlace(viewingPlace); setIsModalOpen(true); setViewingPlace(null); }} className="p-5 bg-white border-2 border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-8 text-center bg-white border-t border-slate-100 mt-auto">
         <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em]">© 2026 TRIPPLANNER AI • POWERED BY SUPABASE CLOUD</p>
      </footer>
      <PlaceModal isOpen={isModalOpen} place={editingPlace} onClose={() => setIsModalOpen(false)} onSave={handleSavePlace} />
    </div>
  );
};

export default App;