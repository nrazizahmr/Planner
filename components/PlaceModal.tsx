
import React, { useState, useEffect, useRef } from 'react';
import { Place, PlaceCategory, ReferenceLink } from '../types';
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
    references: [{ title: 'Google Maps', url: '' }],
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
        references: [{ title: 'Google Maps', url: '' }],
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
        setError("File size too large. Please select an image under 2MB.");
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
    const mainUrl = formData.references?.[0]?.url;
    if (!mainUrl) {
      setError("Please enter the first reference URL (e.g. Google Maps) for AI to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const info = await extractPlaceInfo(mainUrl);
      setFormData(prev => ({
        ...prev,
        ...info
      }));
    } catch (err: any) {
      setError("Could not extract data automatically. Please fill manually.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...(prev.references || []), { title: '', url: '' }]
    }));
  };

  const handleRemoveReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references?.filter((_, i) => i !== index)
    }));
  };

  const handleReferenceChange = (index: number, field: keyof ReferenceLink, value: string) => {
    const newRefs = [...(formData.references || [])];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setFormData(prev => ({ ...prev, references: newRefs }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">{place ? 'Edit Place' : 'Add New Place'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photos Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Foto Tempat</label>
              <div 
                onClick={() => placePhotoInputRef.current?.click()}
                className="relative group h-32 w-full border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-slate-50 transition-all"
              >
                {formData.placePhotoUrl ? (
                  <>
                    <img src={formData.placePhotoUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      UBAH FOTO
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-8 h-8 text-slate-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-slate-400">Klik untuk upload foto</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={placePhotoInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'placePhotoUrl')} 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Foto Menu</label>
              <div 
                onClick={() => menuPhotoInputRef.current?.click()}
                className="relative group h-32 w-full border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-slate-50 transition-all"
              >
                {formData.menuPhotoUrl ? (
                  <>
                    <img src={formData.menuPhotoUrl} className="w-full h-full object-cover" alt="Menu Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      UBAH MENU
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-8 h-8 text-slate-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs text-slate-400">Klik untuk upload menu</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={menuPhotoInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'menuPhotoUrl')} 
              />
            </div>
          </div>

          {/* References Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-slate-700">Link Referensi</label>
              <button 
                type="button" 
                onClick={handleAddReference}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                + Tambah Link
              </button>
            </div>
            {formData.references?.map((ref, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input
                  type="text"
                  placeholder="Judul (Contoh: Gmaps)"
                  className="w-1/3 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={ref.title}
                  onChange={e => handleReferenceChange(idx, 'title', e.target.value)}
                />
                <div className="flex-grow flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    className="flex-grow px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={ref.url}
                    onChange={e => handleReferenceChange(idx, 'url', e.target.value)}
                  />
                  {idx === 0 && (
                     <button
                        type="button"
                        onClick={handleAiExtract}
                        disabled={isLoading}
                        className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                        title="Ekstrak info dari URL ini menggunakan AI"
                      >
                        {isLoading ? <span className="animate-spin inline-block">⏳</span> : '✨'}
                      </button>
                  )}
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReference(idx)}
                      className="px-3 py-2 text-red-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Tempat</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
              <select
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as PlaceCategory })}
              >
                {Object.values(PlaceCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
            <textarea
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (Pisahkan koma)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="pemandangan, murah, hits"
                value={formData.tags?.join(', ') || ''}
                onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(s => s.trim()) })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Rating</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.rating || 0}
                onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white py-2 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
            >
              {place ? 'Simpan Perubahan' : 'Tambah Tempat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
