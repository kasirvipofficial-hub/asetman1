import React, { useState, useEffect } from 'react';
import { Asset } from '../types';
import { BottomSheet } from './BottomSheet';
import { generateAutoAssetCode } from '../utils/barcodeUtils';
import { Sparkles, Camera, Plus, Check } from 'lucide-react';

interface AssetFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  units: string[];
  onAddAsset: (newAsset: Omit<Asset, 'Tanggal_SO' | 'Sesi_SO_Terakhir' | 'Status_Audit' | 'Rincian_Kondisi' | 'Petugas_SO'>) => void;
  existingAssetCount: number;
}

export const AssetFormDrawer: React.FC<AssetFormDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  units,
  onAddAsset,
  existingAssetCount,
}) => {
  const [idAsset, setIdAsset] = useState('');
  const [namaAsset, setNamaAsset] = useState('');
  const [kategori, setKategori] = useState(categories[0] || 'IT & Elektronik');
  const [unitKerja, setUnitKerja] = useState(units[0] || 'Office');
  const [jenis, setJenis] = useState('');
  const [pic, setPic] = useState('');
  const [tahunBeli, setTahunBeli] = useState(String(new Date().getFullYear()));
  const [lokasi, setLokasi] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [hargaPerolehan, setHargaPerolehan] = useState<number | ''>('');
  const [masaManfaat, setMasaManfaat] = useState<number>(4);
  const [nomorSeri, setNomorSeri] = useState('');
  const [fotoAsset, setFotoAsset] = useState('');

  useEffect(() => {
    if (isOpen) {
      handleGenerateCode();
    }
  }, [isOpen]);

  const handleGenerateCode = () => {
    const autoCode = generateAutoAssetCode(kategori, unitKerja, tahunBeli, existingAssetCount + 1);
    setIdAsset(autoCode);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoAsset(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAsset.trim() || !idAsset.trim()) return;

    onAddAsset({
      ID_Asset: idAsset,
      Nama_Asset: namaAsset,
      Kategori: kategori,
      Jenis: jenis || kategori,
      Penanggung_Jawab: pic || 'Admin Master',
      Unit_Kerja: unitKerja,
      Tahun_Beli: tahunBeli,
      Lokasi: lokasi || unitKerja,
      Jumlah: Number(jumlah) || 1,
      Kondisi: 'Baik',
      Keterangan_SO: '',
      Harga_Perolehan: hargaPerolehan ? Number(hargaPerolehan) : undefined,
      Masa_Manfaat: masaManfaat,
      Nomor_Seri: nomorSeri,
      Foto_Asset: fotoAsset,
      Status_Pinjam: 'Tersedia',
    });

    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Aset Baru Ke Master Data"
      subtitle="Penomoran Otomatis [KTG]-[UNIT]-[THN]-[NO] & Log Finansial"
      maxHeightClass="max-h-[92vh]"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-[#2C3E50]">
        {/* Asset Code & Auto Generate Button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-[#7F8C8D]">Nomor / Tag ID Aset Otomatis</label>
            <button
              type="button"
              onClick={handleGenerateCode}
              className="flex items-center gap-1 text-[11px] text-[#2D7D62] hover:underline font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Generate Code
            </button>
          </div>
          <input
            type="text"
            required
            value={idAsset}
            onChange={(e) => setIdAsset(e.target.value)}
            className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2.5 text-[#2C3E50] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#2D7D62] text-xs"
          />
        </div>

        {/* Name & Serial Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Nama Barang / Aset</label>
            <input
              type="text"
              required
              value={namaAsset}
              onChange={(e) => setNamaAsset(e.target.value)}
              placeholder="Laptop ThinkPad T14 / Meja Kerja"
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Nomor Seri (Serial Number S/N)</label>
            <input
              type="text"
              value={nomorSeri}
              onChange={(e) => setNomorSeri(e.target.value)}
              placeholder="S/N: PF-9821X"
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] font-mono focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Kategori Aset</label>
            <select
              value={kategori}
              onChange={(e) => {
                setKategori(e.target.value);
                const auto = generateAutoAssetCode(e.target.value, unitKerja, tahunBeli, existingAssetCount + 1);
                setIdAsset(auto);
              }}
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            >
              {categories.map((c, idx) => (
                <option key={`af-cat-${c}-${idx}`} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Unit Kerja / Divisi</label>
            <select
              value={unitKerja}
              onChange={(e) => {
                setUnitKerja(e.target.value);
                const auto = generateAutoAssetCode(kategori, e.target.value, tahunBeli, existingAssetCount + 1);
                setIdAsset(auto);
              }}
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            >
              {units.map((u, idx) => (
                <option key={`af-unit-${u}-${idx}`} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Quantity & PIC */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Lokasi Ruang</label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Ruang 201"
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Jumlah</label>
            <input
              type="number"
              min={1}
              value={jumlah}
              onChange={(e) => setJumlah(Number(e.target.value))}
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Penanggung Jawab</label>
            <input
              type="text"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              placeholder="PIC Barang"
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-2.5 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>
        </div>

        {/* Financial Details (Harga Perolehan & Masa Manfaat) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl">
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Harga Beli / Perolehan (Rp)</label>
            <input
              type="number"
              placeholder="15000000"
              value={hargaPerolehan}
              onChange={(e) => setHargaPerolehan(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-white border border-[#e2e6e4] rounded-lg px-2.5 py-1.5 text-[#2C3E50] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Tahun Beli</label>
            <input
              type="text"
              value={tahunBeli}
              onChange={(e) => setTahunBeli(e.target.value)}
              className="w-full bg-white border border-[#e2e6e4] rounded-lg px-2.5 py-1.5 text-[#2C3E50] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Masa Manfaat (Thn)</label>
            <input
              type="number"
              min={1}
              value={masaManfaat}
              onChange={(e) => setMasaManfaat(Number(e.target.value))}
              className="w-full bg-white border border-[#e2e6e4] rounded-lg px-2.5 py-1.5 text-[#2C3E50] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="p-3 bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#2D7D62]" />
            <span className="text-xs font-semibold text-[#2C3E50]">Foto Aset</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="text-xs text-[#7F8C8D] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-[#2D7D62] file:text-white hover:file:bg-[#23634e] cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold py-3 rounded-xl shadow-xs text-xs transition-all mt-2"
        >
          Simpan Aset Ke Master Data
        </button>
      </form>
    </BottomSheet>
  );
};
