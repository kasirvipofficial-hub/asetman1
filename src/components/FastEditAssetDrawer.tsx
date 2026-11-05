import React, { useState, useEffect } from 'react';
import { Asset } from '../types';
import { BottomSheet } from './BottomSheet';
import { Edit2, ShieldAlert, Lock, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface FastEditAssetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSaveEdit: (updatedAsset: Asset) => void;
  onDeleteAsset?: (assetId: string) => void;
}

export const FastEditAssetDrawer: React.FC<FastEditAssetDrawerProps> = ({
  isOpen,
  onClose,
  asset,
  onSaveEdit,
  onDeleteAsset,
}) => {
  const [namaAsset, setNamaAsset] = useState('');
  const [nomorSeri, setNomorSeri] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggalPerolehan, setTanggalPerolehan] = useState('');
  const [nilaiSisa, setNilaiSisa] = useState<number | ''>('');
  const [hargaPerolehan, setHargaPerolehan] = useState<number | ''>('');
  const [masaManfaat, setMasaManfaat] = useState<number>(4);
  const [keterangan, setKeterangan] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (asset) {
      setNamaAsset(asset.Nama_Asset || '');
      setNomorSeri(asset.Nomor_Seri || '');
      setLokasi(asset.Lokasi || '');
      const initHarga = asset.Harga_Perolehan !== undefined ? asset.Harga_Perolehan : (asset.Harga_Asal !== undefined ? asset.Harga_Asal : '');
      setHargaPerolehan(initHarga);
      setTanggalPerolehan(asset.Tanggal_Perolehan || (asset.Tahun_Beli ? `${asset.Tahun_Beli}-01-01` : ''));
      setMasaManfaat(asset.Masa_Manfaat || 4);
      setNilaiSisa(asset.Nilai_Sisa !== undefined ? asset.Nilai_Sisa : (initHarga ? Math.round(Number(initHarga) * 0.1) : 0));
      setKeterangan(asset.Keterangan_SO || '');
    }
  }, [asset, isOpen]);

  if (!asset) return null;

  // Live depreciation calculation preview
  const numHarga = hargaPerolehan !== '' ? Number(hargaPerolehan) || 0 : 0;
  const numSisa = nilaiSisa !== '' ? Number(nilaiSisa) || 0 : 0;
  const numMasa = Math.max(1, Number(masaManfaat) || 4);

  let liveCalcResult = null;
  if (numHarga > 0) {
    let acqDate = tanggalPerolehan ? new Date(tanggalPerolehan) : (asset.Tahun_Beli ? new Date(Number(asset.Tahun_Beli), 0, 1) : new Date());
    if (isNaN(acqDate.getTime())) acqDate = new Date();

    const now = new Date();
    const rawMonths = (now.getFullYear() - acqDate.getFullYear()) * 12 + (now.getMonth() - acqDate.getMonth());
    const monthDiff = Math.max(0, isNaN(rawMonths) ? 0 : rawMonths);
    const totalDepreciable = Math.max(0, numHarga - numSisa);
    const bebanBulan = Math.round(totalDepreciable / (numMasa * 12));
    const akumulasi = Math.min(totalDepreciable, Math.round(bebanBulan * monthDiff));
    const nilaiBukuSaatIni = Math.max(numSisa, numHarga - akumulasi);
    const sisaPercent = numHarga > 0 ? Math.round((nilaiBukuSaatIni / numHarga) * 100) : 100;

    liveCalcResult = {
      bebanBulan,
      monthDiff,
      akumulasi,
      nilaiBukuSaatIni,
      sisaPercent,
    };
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAsset.trim()) return;

    const updated: Asset = {
      ...asset,
      Nama_Asset: namaAsset.trim(),
      Nomor_Seri: nomorSeri.trim(),
      Lokasi: lokasi.trim(),
      Kondisi: asset.Kondisi || 'Baik',
      Harga_Perolehan: numHarga > 0 ? numHarga : undefined,
      Tanggal_Perolehan: tanggalPerolehan || undefined,
      Masa_Manfaat: numMasa,
      Nilai_Sisa: numSisa,
      Nilai_Buku: numHarga > 0 ? (liveCalcResult ? liveCalcResult.nilaiBukuSaatIni : (asset.Nilai_Buku !== undefined ? asset.Nilai_Buku : numHarga)) : undefined,
      Keterangan_SO: keterangan.trim(),
    };

    onSaveEdit(updated);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Atribut Master Aset"
      subtitle={`Tag ID: ${asset.ID_Asset} (${asset.Kategori})`}
      maxHeightClass="max-h-[90vh]"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#2C3E50]">
        {/* Rules & Policy Callout */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Aturan Tata Kelola & Otorisasi Edit Aset:</span>
          </div>
          <p className="leading-relaxed">
            ✓ <strong>Edit Langsung</strong>: Atribut fisik (Nama, S/N, Lokasi Ruang, Harga & Masa Manfaat). <br />
            🔒 <strong>Wajib Berita Acara (BA)</strong>: PIC & Unit Kerja (via BAST/Mutasi), Pemusnahan (via BA Penghapusan).
          </p>
        </div>

        {/* Readonly Info Bar */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#F2F4F3] border border-[#e2e6e4] rounded-xl text-[11px]">
          <div>
            <span className="text-[#7F8C8D] block">Unit Kerja Saat Ini:</span>
            <strong className="text-[#2C3E50]">{asset.Unit_Kerja}</strong>
          </div>
          <div>
            <span className="text-[#7F8C8D] block">Penanggung Jawab (PIC):</span>
            <strong className="text-[#2C3E50]">{asset.Penanggung_Jawab}</strong>
          </div>
        </div>

        {/* Direct Editable Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Nama Barang / Aset</label>
            <input
              type="text"
              required
              value={namaAsset}
              onChange={(e) => setNamaAsset(e.target.value)}
              className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Nomor Seri (Serial Number S/N)</label>
              <input
                type="text"
                value={nomorSeri}
                onChange={(e) => setNomorSeri(e.target.value)}
                placeholder="Contoh: S/N: PF-9821X"
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] font-mono focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Lokasi Ruang / Sub-Lokasi</label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Contoh: Ruang Server Lt.2"
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Harga Beli / Perolehan (Rp)</label>
              <input
                type="number"
                value={hargaPerolehan}
                onChange={(e) => setHargaPerolehan(e.target.value ? Number(e.target.value) : '')}
                placeholder="15000000"
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] font-mono focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Tanggal Perolehan (Beli)</label>
              <input
                type="date"
                value={tanggalPerolehan}
                onChange={(e) => setTanggalPerolehan(e.target.value)}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] font-mono focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Umur Ekonomis / Masa Manfaat (Tahun)</label>
              <input
                type="number"
                min={1}
                value={masaManfaat}
                onChange={(e) => setMasaManfaat(Number(e.target.value))}
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Nilai Sisa / Residu (Rp)</label>
              <input
                type="number"
                min={0}
                value={nilaiSisa}
                onChange={(e) => setNilaiSisa(e.target.value ? Number(e.target.value) : 0)}
                placeholder="0"
                className="w-full bg-white border border-[#e2e6e4] rounded-xl px-3 py-2 text-[#2C3E50] font-mono focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
          </div>

          {/* Live Depreciation Breakdown Card */}
          {liveCalcResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-[#2D7D62]">
                <span>Kalkulasi Garis Lurus (Straight-Line)</span>
                <span className="bg-[#2D7D62] text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
                  Sisa {liveCalcResult.sisaPercent}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[#7F8C8D] block text-[10px]">Beban Penyusutan / Bulan</span>
                  <strong className="text-[#2C3E50] font-mono">Rp {liveCalcResult.bebanBulan.toLocaleString('id-ID')}</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[#7F8C8D] block text-[10px]">Bulan Berjalan ({liveCalcResult.monthDiff} bln)</span>
                  <strong className="text-rose-600 font-mono">- Rp {liveCalcResult.akumulasi.toLocaleString('id-ID')}</strong>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
                <span className="font-semibold text-[#2C3E50]">Estimasi Nilai Buku Saat Ini:</span>
                <span className="font-bold font-mono text-[#2D7D62] text-sm">
                  Rp {liveCalcResult.nilaiBukuSaatIni.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#7F8C8D] block mb-1">Catatan Tambahan Master Aset</label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={2}
              placeholder="Catatan kondisi fisik, kelengkapan aksesoris, dll..."
              className="w-full bg-white border border-[#e2e6e4] rounded-xl p-3 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>
        </div>

        {showDeleteConfirm ? (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 animate-in fade-in">
            <p className="text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              Hapus permanen aset {asset.Nama_Asset} [{asset.ID_Asset}]?
            </p>
            <p className="text-[11px] text-rose-700">
              Aksi ini akan menghapus data aset dari Master Assets dan Google Spreadsheet.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold hover:bg-white text-rose-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteAsset) {
                    onDeleteAsset(asset.ID_Asset);
                    onClose();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Aset</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-2">
            {onDeleteAsset && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                title="Hapus Master Aset"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold py-3 rounded-xl shadow-xs text-xs transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Simpan Perubahan Aset
            </button>
          </div>
        )}
      </form>
    </BottomSheet>
  );
};
