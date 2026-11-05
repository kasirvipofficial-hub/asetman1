import React, { useState, useEffect } from 'react';
import { Asset, ConditionType, RincianKondisi } from '../types';
import {
  X,
  Minus,
  Plus,
  Building2,
  User,
  FileText,
  CheckCircle2,
  History,
  AlertTriangle,
  ShieldAlert,
  Flame,
  MapPin,
  Calendar,
} from 'lucide-react';
import { getActiveAuditor } from '../services/apiService';

interface QuickAuditModalProps {
  asset: Asset | null;
  defaultAuditor?: string;
  onClose: () => void;
  onSave: (payload: {
    ID_Asset: string;
    Kondisi: ConditionType;
    Jumlah: number;
    Rincian_Kondisi: RincianKondisi;
    Petugas_SO: string;
    Keterangan_SO: string;
  }) => void;
  isSaving: boolean;
}

export const QuickAuditModal: React.FC<QuickAuditModalProps> = ({
  asset,
  defaultAuditor,
  onClose,
  onSave,
  isSaving,
}) => {
  const [rincian, setRincian] = useState<RincianKondisi>({
    Baik: 0,
    Rusak_Ringan: 0,
    Rusak_Berat: 0,
    Hilang: 0,
    Musnah: 0,
  });
  const [petugas, setPetugas] = useState<string>(defaultAuditor || getActiveAuditor() || 'Admin');
  const [keterangan, setKeterangan] = useState<string>('');
  const [isPrevAuditExpanded, setIsPrevAuditExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (asset) {
      if (asset.Rincian_Kondisi) {
        setRincian({ ...asset.Rincian_Kondisi });
      } else {
        const jml = asset.Jumlah || 1;
        setRincian({
          Baik: asset.Kondisi === 'Baik' ? jml : 0,
          Rusak_Ringan: asset.Kondisi === 'Rusak Ringan' ? jml : 0,
          Rusak_Berat: asset.Kondisi === 'Rusak Berat' ? jml : 0,
          Hilang: asset.Kondisi === 'Hilang' ? jml : 0,
          Musnah: asset.Kondisi === 'Musnah' ? jml : 0,
        });
      }
      setPetugas(defaultAuditor || getActiveAuditor() || 'Admin');
      setKeterangan(asset.Keterangan_SO || '');
    }
  }, [asset, defaultAuditor]);

  if (!asset) return null;

  const handleCounterChange = (field: keyof RincianKondisi, delta: number) => {
    setRincian((prev) => {
      const val = Math.max(0, (prev[field] || 0) + delta);
      return {
        ...prev,
        [field]: val,
      };
    });
  };

  const totalCalculated =
    rincian.Baik + rincian.Rusak_Ringan + rincian.Rusak_Berat + rincian.Hilang + rincian.Musnah;

  const determineDominantCondition = (): ConditionType => {
    if (rincian.Baik >= rincian.Rusak_Ringan && rincian.Baik >= rincian.Rusak_Berat && rincian.Baik >= rincian.Hilang && rincian.Baik >= rincian.Musnah && rincian.Baik > 0) return 'Baik';
    if (rincian.Rusak_Ringan >= rincian.Rusak_Berat && rincian.Rusak_Ringan >= rincian.Hilang && rincian.Rusak_Ringan >= rincian.Musnah && rincian.Rusak_Ringan > 0) return 'Rusak Ringan';
    if (rincian.Rusak_Berat >= rincian.Hilang && rincian.Rusak_Berat >= rincian.Musnah && rincian.Rusak_Berat > 0) return 'Rusak Berat';
    if (rincian.Musnah >= rincian.Hilang && rincian.Musnah > 0) return 'Musnah';
    if (rincian.Hilang > 0) return 'Hilang';
    return 'Baik';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dominantKondisi = determineDominantCondition();
    onSave({
      ID_Asset: asset.ID_Asset,
      Kondisi: dominantKondisi,
      Jumlah: totalCalculated,
      Rincian_Kondisi: rincian,
      Petugas_SO: petugas,
      Keterangan_SO: keterangan,
    });
  };

  const prevAudit = asset.Audit_Sebelumnya;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2C3E50]/60 backdrop-blur-xs animate-in fade-in transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white text-[#2C3E50] rounded-t-3xl shadow-2xl overflow-hidden border-t border-[#e2e6e4] z-10 max-h-[95vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Top sheet handle pill */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-start justify-between px-5 pb-3 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600 tracking-tight">
                {asset.ID_Asset}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {asset.Kategori}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 line-clamp-1 mt-0.5">
              {asset.Nama_Asset}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shrink-0"
            title="Tutup Form"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Card 1: Asset Metadata & Auditor */}
          <div className="p-3.5 rounded-2xl bg-[#f8fbff] border border-blue-100 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">Unit: <strong className="text-slate-900">{asset.Unit_Kerja}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">PIC: <strong className="text-slate-900">{asset.Penanggung_Jawab}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-blue-100/60">
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Lokasi: <strong className="text-slate-900">{asset.Lokasi || '-'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">Thn Beli: <strong className="text-slate-900">{asset.Tahun_Beli || '-'}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-blue-100/60 font-medium">
              <span className="text-slate-700">
                Jumlah Asal: <strong className="text-slate-900">{asset.Jumlah_Asal !== undefined ? asset.Jumlah_Asal : asset.Jumlah} Unit</strong>
              </span>
              <span className="text-blue-600 font-bold">
                Auditor: {petugas}
              </span>
            </div>
          </div>

          {/* Card 2: HASIL AUDIT SESI SEBELUMNYA */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                HASIL AUDIT SESI SEBELUMNYA
              </span>
              <button
                type="button"
                onClick={() => setIsPrevAuditExpanded(!isPrevAuditExpanded)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-1"
              >
                {isPrevAuditExpanded ? '−' : '+'}
              </button>
            </div>

            {isPrevAuditExpanded && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Kondisi Lalu:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {prevAudit?.Kondisi || asset.Kondisi || 'Baik'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-medium">Total Lalu:</span>
                    <span className="font-bold text-slate-900 text-sm tabular-nums">
                      {prevAudit?.Jumlah !== undefined ? prevAudit.Jumlah : (asset.Jumlah || 1)} Unit
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                  <span className="text-slate-500 italic block">
                    Catatan Lalu: "{prevAudit?.Keterangan_SO || asset.Keterangan_SO || 'Kondisi fisik sesuai data master.'}"
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: INPUT RINCIAN FISIK SESI INI */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                INPUT RINCIAN FISIK SESI INI
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
                Total: {totalCalculated} Unit
              </span>
            </div>

            {/* 5 Physical Condition Counter Rows */}
            <div className="space-y-2">
              {/* Row 1: Kondisi Baik */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#f6fdf9] border border-emerald-300 shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Kondisi Baik
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Baik', -1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 w-7 text-center tabular-nums">
                    {rincian.Baik}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Baik', 1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 2: Rusak Ringan */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#fefdf6] border border-amber-300 shadow-2xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Rusak Ringan
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Rusak_Ringan', -1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 w-7 text-center tabular-nums">
                    {rincian.Rusak_Ringan}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Rusak_Ringan', 1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 3: Rusak Berat */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#fffaf5] border border-orange-300 shadow-2xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Rusak Berat
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Rusak_Berat', -1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 w-7 text-center tabular-nums">
                    {rincian.Rusak_Berat}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Rusak_Berat', 1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 4: Hilang */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#fff7f7] border border-rose-300 shadow-2xs">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Hilang
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Hilang', -1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 w-7 text-center tabular-nums">
                    {rincian.Hilang}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Hilang', 1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 5: Musnah */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#faf6ff] border border-purple-300 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Musnah
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Musnah', -1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 w-7 text-center tabular-nums">
                    {rincian.Musnah}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Musnah', 1)}
                    className="w-9 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: CATATAN HASIL SO SEKARANG */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              CATATAN HASIL SO SEKARANG
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Kondisi fisik barang sesuai atau dalam perbaikan..."
              rows={2}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none shadow-2xs"
            />
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all min-h-[48px]"
          >
            {isSaving ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Simpan SO (Petugas: {petugas})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
