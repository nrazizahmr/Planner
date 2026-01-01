
import React, { useState, useEffect, useRef } from 'react';
import { Place, PlaceCategory } from '../types';
import { extractPlaceInfo } from '../services/geminiService';

interface PlaceModalProps {
  place?: Place;
  isOpen: boolean;
  onClose: () => void;
  onSave: (place: Partial<Place>) => void;
}

export const PlaceModal: React.FC<PlaceModalProps> = ({ place, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Place>>({
    name: '',
    category: PlaceCategory.OTHER,
    address: '',
    description: '',
    referenceUrl: '',
    placePhotoUrl: '',
    menuPhotoUrl: '',
    tags: [],
    rating: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const placePhotoInputRef = useRef<HTMLInputElement>(null);
  const menuPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (place) {
      setFormData(place);
    } else {
      setFormData({
        name: '',
        category: PlaceCategory.OTHER,
        address: '',
        description: '',
        referenceUrl: '',
        placePhotoUrl: '',
        menuPhotoUrl: '',
        tags: [],
        rating: 0
      });
    }
  }, [place, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'placePhotoUrl' | 'menuPhotoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File terlalu besar. Gunakan gambar di bawah 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiExtract = async () => {
    if (!formData.referenceUrl) {
      setError("Paste link Google Maps terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const info = await extractPlaceInfo(formData.referenceUrl);
      setFormData(prev => ({
        ...prev,
        ...info
      }));
    } catch (err: any) {
      setError("AI gagal mengambil data. Coba cek link atau isi manual.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.referenceUrl) return;
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 bg-white z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{place ? 'Edit Tempat' : 'Tambah Tempat'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Link Google Maps</label>
            <div className="flex gap-3">
              <input
                type="url"
                required
                placeholder="https://maps.google.com/..."
                className="flex-grow px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-sm font-medium"
                value={formData.referenceUrl || ''}
                onChange={e => setFormData({ ...formData, referenceUrl: e.target.value })}
              />
              <button
                type="button"
                onClick={handleAiExtract}
                disabled={isLoading}
                className="px-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-indigo-300 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95"
              >
                {isLoading ? <span className="animate-spin">⏳</span> : '✨'}
                {isLoading ? 'Ekstrak...' : 'Auto-Fill'}
              </button>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Foto Tempat</label>
              <div 
                onClick={() => placePhotoInputRef.current?.click()}
                className="relative group h-44 w-full border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all bg-slate-50/50"
              >
                {formData.placePhotoUrl ? (
                  <>
                    <img src={formData.placePhotoUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black tracking-widest uppercase transition-opacity">
                      Ubah Foto
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                      <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Foto</span>
                  </div>
                )}
              </div>
              <input type="file" ref={placePhotoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'placePhotoUrl')} />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Foto Menu</label>
              <div 
                onClick={() => menuPhotoInputRef.current?.click()}
                className="relative group h-44 w-full border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all bg-slate-50/50"
              >
                {formData.menuPhotoUrl ? (
                  <>
                    <img src={formData.menuPhotoUrl} className="w-full h-full object-cover" alt="Menu Preview" />
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black tracking-widest uppercase transition-opacity">
                      Ubah Menu
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                      <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Menu</span>
                  </div>
                )}
              </div>
              <input type="file" ref={menuPhotoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'menuPhotoUrl')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Nama Tempat</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-medium"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Kategori</label>
              <select
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none cursor-pointer font-medium"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as PlaceCategory })}
              >
                {Object.values(PlaceCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Alamat</label>
            <textarea
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none h-20 resize-none font-medium"
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Deskripsi</label>
            <textarea
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none h-24 resize-none font-medium"
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Tags</label>
              <input
                type="text"
                placeholder="Hits, Kopi, Murah"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-medium"
                value={formData.tags?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(s => s.trim()) })}
              />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Rating (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-medium"
                value={formData.rating || 0}
                onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-10 flex justify-end gap-4 sticky bottom-0 bg-white py-6 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-10 py-4 text-slate-400 font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-12 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95"
            >
              {place ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
