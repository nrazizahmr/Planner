import React, { useState, useEffect, useRef } from 'react';
import { Place, PlaceCategory } from '../types.ts';
import { extractPlaceInfo } from '../services/geminiService.ts';

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
    if (place && isOpen) {
      // Normalisasi data dari database (snake_case) ke state form (camelCase)
      setFormData({
        ...place,
        name: place.name || '',
        category: place.category || PlaceCategory.OTHER,
        address: place.address || '',
        description: place.description || '',
        referenceUrl: place.referenceUrl || place.reference_url || '',
        placePhotoUrl: place.placePhotoUrl || place.place_photo_url || '',
        menuPhotoUrl: place.menuPhotoUrl || place.menu_photo_url || '',
        tags: place.tags || [],
        rating: place.rating || 0
      });
    } else if (isOpen) {
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiExtract = async () => {
    if (!formData.referenceUrl) {
      setError("Masukkan link Maps dulu.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const info = await extractPlaceInfo(formData.referenceUrl);
      setFormData(prev => ({ ...prev, ...info }));
    } catch (err) {
      setError("Gagal mengambil data AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-modal-in">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{place ? 'Edit' : 'Tambah'} Tempat</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link Google Maps</label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://maps.google.com/..."
                className="flex-grow px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                value={formData.referenceUrl || ''}
                onChange={e => setFormData({ ...formData, referenceUrl: e.target.value })}
              />
              <button
                type="button"
                onClick={handleAiExtract}
                disabled={isLoading}
                className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? '...' : 'Auto-Fill'}
              </button>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div onClick={() => placePhotoInputRef.current?.click()} className="h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative group">
                {formData.placePhotoUrl ? (
                  <img src={formData.placePhotoUrl} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black uppercase text-slate-400">Foto Tempat</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase">Ganti</div>
                <input type="file" ref={placePhotoInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'placePhotoUrl')} />
             </div>
             <div onClick={() => menuPhotoInputRef.current?.click()} className="h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative group">
                {formData.menuPhotoUrl ? (
                  <img src={formData.menuPhotoUrl} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black uppercase text-slate-400">Foto Menu</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase">Ganti</div>
                <input type="file" ref={menuPhotoInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'menuPhotoUrl')} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Tempat"
              required
              className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <select
              className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as PlaceCategory })}
            >
              {Object.values(PlaceCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <textarea
            placeholder="Alamat"
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm h-20"
            value={formData.address || ''}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />

          <textarea
            placeholder="Deskripsi"
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm h-20"
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Batal</button>
            <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};