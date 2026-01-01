import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(localStorage.getItem('trip_sync_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Initial Data
  useEffect(() => {
    const initLoad = async () => {
      if (spreadsheetUrl) {
        await fetchFromCloud();
      } else {
        const saved = localStorage.getItem('trip_planner_pro_v1');
        if (saved) {
          try { setPlaces(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
      }
    };
    initLoad();
  }, [spreadsheetUrl]);

  // Local Storage Backup
  useEffect(() => {
    localStorage.setItem('trip_planner_pro_v1', JSON.stringify(places));
  }, [places]);

  const fetchFromCloud = async () => {
    if (!spreadsheetUrl) return;
    setIsSyncing(true);
    try {
      const response = await fetch(spreadsheetUrl);
      const data = await response.json();
      if (Array.isArray(data)) {
        setPlaces(data);
      }
    } catch (e) {
      console.error("Gagal mengambil data dari Cloud", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncToCloud = async (newData: Place[]) => {
    if (!spreadsheetUrl) return;
    setIsSyncing(true);
    try {
      await fetch(spreadsheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      // Karena no-cors, kita asumsikan berhasil jika tidak ada error lemparan
    } catch (e) {
      console.error("Gagal sinkronisasi ke Cloud", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSavePlace = async (placeData: Partial<Place>) => {
    let updatedPlaces: Place[];
    if (editingPlace) {
      updatedPlaces = places.map(p => p.id === editingPlace.id ? { ...p, ...placeData } as Place : p);
    } else {
      const newPlace: Place = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        ...placeData,
      } as Place;
      updatedPlaces = [newPlace, ...places];
    }
    setPlaces(updatedPlaces);
    if (spreadsheetUrl) await syncToCloud(updatedPlaces);
    setEditingPlace(undefined);
  };

  const handleDeletePlace = async (id: string) => {
    if (confirm("Hapus tempat ini?")) {
      const updatedPlaces = places.filter(p => p.id !== id);
      setPlaces(updatedPlaces);
      if (spreadsheetUrl) await syncToCloud(updatedPlaces);
      if (viewingPlace?.id === id) setViewingPlace(null);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (places.length === 0) return alert("Data kosong.");
    let content = '', fileName = `Trip_Backup_${Date.now()}`, mimeType = '';
    if (format === 'csv') {
      const headers = ["Nama", "Kategori", "Alamat", "Deskripsi", "Link Maps", "Rating", "Tags"];
      const rows = places.map(p => [`"${p.name}"`, p.category, `"${p.address}"`, `"${p.description}"`, p.referenceUrl, p.rating || 0, `"${p.tags.join(', ')}"`]);
      content = [headers, ...rows].map(e => e.join(",")).join("\n");
      fileName += '.csv'; mimeType = 'text/csv';
    } else {
      content = JSON.stringify(places, null, 2);
      fileName += '.json'; mimeType = 'application/json';
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = fileName;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const merged = [...imported, ...places].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          setPlaces(merged);
          if (spreadsheetUrl) await syncToCloud(merged);
          alert("Berhasil diimpor!");
        }
      } catch (err) { alert("Format salah."); }
    };
    reader.readAsText(file);
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

  const appsScriptCode = `function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getRange(2, 1).getValue();
  return ContentService.createTextOutput(data || "[]").setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(2, 1).setValue(e.postData.contents);
  return ContentService.createTextOutput("Success");
}`;

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
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Smart Travel Assistant</p>
            </div>
          </div>

          <div className="flex flex-grow max-w-2xl w-full relative">
            <input type="text" placeholder="Cari tempat..." className="w-full pl-14 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-[1.5rem] text-sm focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <svg className="w-6 h-6 absolute left-5 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSyncModalOpen(true)}
              className={`p-4 rounded-[1.5rem] border-2 transition-all flex items-center justify-center shadow-sm ${spreadsheetUrl ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}
              title="Cloud Sync Settings"
            >
              <svg className={`w-6 h-6 ${isSyncing ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </button>
            <div className="relative group">
              <button className="p-4 bg-white border-2 border-slate-100 text-slate-400 hover:text-indigo-600 rounded-[1.5rem] transition-all shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50 animate-modal-in">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-[10px] font-black uppercase text-slate-600">Ekspor Excel (CSV)</button>
                <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-[10px] font-black uppercase text-slate-600">Ekspor Backup (JSON)</button>
                <hr className="my-2 border-slate-100" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-[10px] font-black uppercase text-indigo-600">Impor Backup</button>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
            <button onClick={() => { setEditingPlace(undefined); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Tambah
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-8">
        <div className="flex overflow-x-auto pb-8 gap-3 no-scrollbar">
          {['Semua', ...Object.values(PlaceCategory)].map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 flex-shrink-0 ${filterCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'}`}>
              {cat}
            </button>
          ))}
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm px-10">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Belum Ada Rencana</h2>
            <p className="text-slate-400 max-w-md mb-6 font-bold">Data saat ini tersimpan di {spreadsheetUrl ? 'Google Sheets' : 'Browser ini'}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPlaces.map(place => (
              <PlaceCard key={place.id} place={place} onEdit={(p) => { setEditingPlace(p); setIsModalOpen(true); }} onDelete={handleDeletePlace} onClick={() => setViewingPlace(place)} />
            ))}
          </div>
        )}
      </main>

      {/* Cloud Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl animate-modal-in overflow-hidden p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Cloud Database Sync</h2>
              <button onClick={() => setIsSyncModalOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 leading-relaxed">
                  Gunakan Google Spreadsheet sebagai database agar data muncul di semua perangkat/akun Google Anda.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Apps Script Web App URL</label>
                <input 
                  type="url" 
                  placeholder="https://script.google.com/macros/s/.../exec" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                  value={spreadsheetUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSpreadsheetUrl(val);
                    localStorage.setItem('trip_sync_url', val);
                  }}
                />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cara Setup (Google Spreadsheet):</p>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal ml-4 font-medium">
                  <li>Buka Spreadsheet > Extensions > Apps Script.</li>
                  <li>Hapus kode lama, tempel kode di bawah ini.</li>
                  <li>Deploy > New Deployment > Web App.</li>
                  <li>Set "Who has access" ke "Anyone".</li>
                  <li>Salin URL hasil deploy ke kotak di atas.</li>
                </ol>
                <textarea 
                  readOnly 
                  className="w-full h-40 p-4 bg-slate-900 text-indigo-300 rounded-2xl font-mono text-[10px] outline-none"
                  value={appsScriptCode}
                />
                <button 
                  onClick={() => { navigator.clipboard.writeText(appsScriptCode); alert("Kode disalin!"); }}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Salin Kode Script
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal (Existing) */}
      {viewingPlace && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl overflow-y-auto" onClick={() => setViewingPlace(null)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl my-auto animate-modal-in overflow-hidden flex flex-col lg:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="w-full lg:w-1/2 bg-slate-100 overflow-y-auto no-scrollbar">
              {viewingPlace.placePhotoUrl && <div className="p-4"><img src={viewingPlace.placePhotoUrl} className="w-full rounded-[2rem] shadow-lg mb-6" alt="Foto" /></div>}
              {viewingPlace.menuPhotoUrl && <div className="p-4 pt-0"><p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Foto Menu</p><img src={viewingPlace.menuPhotoUrl} className="w-full rounded-[2rem] shadow-lg" alt="Menu" /></div>}
            </div>
            <div className="w-full lg:w-1/2 p-10 lg:p-14 overflow-y-auto flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase border border-indigo-100">{viewingPlace.category}</span>
                <button onClick={() => setViewingPlace(null)} className="text-slate-300 hover:text-slate-600"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tighter">{viewingPlace.name}</h2>
              <div className="flex items-center gap-4 mb-8">
                {viewingPlace.rating && <div className="text-yellow-500 font-black bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100 text-sm">★ {viewingPlace.rating}</div>}
                <div className="text-slate-400 text-sm font-medium">{viewingPlace.address}</div>
              </div>
              <div className="space-y-4 mb-10 flex-grow">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Deskripsi</p>
                <p className="text-slate-600 leading-relaxed font-medium text-lg whitespace-pre-wrap">{viewingPlace.description || "..."}</p>
              </div>
              <div className="flex gap-4">
                <a href={viewingPlace.referenceUrl} target="_blank" className="flex-grow py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl text-center shadow-2xl hover:bg-indigo-700 transition-all">Buka Maps</a>
                <button onClick={() => { setEditingPlace(viewingPlace); setIsModalOpen(true); setViewingPlace(null); }} className="p-5 bg-white border-2 border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-8 text-center bg-white border-t border-slate-100 mt-auto">
         <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em]">© 2026 TRIPPLANNER AI • PREMIUM TRAVEL MANAGER</p>
      </footer>
      <PlaceModal isOpen={isModalOpen} place={editingPlace} onClose={() => setIsModalOpen(false)} onSave={handleSavePlace} />
    </div>
  );
};

export default App;