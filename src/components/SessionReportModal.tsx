import React, { useState } from 'react';
import { SesiSO, Asset } from '../types';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Building2,
  Calendar,
  UserCheck,
  Tag,
  MapPin,
  FileCheck2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { formatDateIndonesian } from '../utils/dateUtils';
import { exportSingleSessionReportToExcel } from '../services/excelService';

interface SessionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SesiSO | null;
  allAssets: Asset[];
  onCreateBAForAsset?: (asset: Asset) => void;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  isOpen,
  onClose,
  session,
  allAssets,
  onCreateBAForAsset,
}) => {
  const [filterCondition, setFilterCondition] = useState<string>('Semua');

  if (!isOpen || !session) return null;

  const targetUnit = session.Target_Unit_Kerja || 'Semua';
  const scopeCat = session.Scope_Kategori || 'Semua';
  const scopeLoc = session.Scope_Lokasi || 'Semua';

  const scopedAssets = allAssets.filter((a) => {
    if (targetUnit !== 'Semua' && a.Unit_Kerja !== targetUnit) return false;
    if (scopeCat !== 'Semua' && a.Kategori !== scopeCat) return false;
    if (scopeLoc !== 'Semua' && a.Lokasi !== scopeLoc) return false;
    return true;
  });

  const totalAssets = scopedAssets.length;
  const verifiedAssets = scopedAssets.filter((a) => a.Status_Audit === 'Sudah SO').length;
  const pendingAssets = totalAssets - verifiedAssets;
  const percentComplete = totalAssets > 0 ? Math.round((verifiedAssets / totalAssets) * 100) : 0;

  let totalBaik = 0;
  let totalRR = 0;
  let totalRB = 0;
  let totalHilang = 0;
  let totalMusnah = 0;

  scopedAssets.forEach((a) => {
    if (a.Rincian_Kondisi) {
      totalBaik += a.Rincian_Kondisi.Baik || 0;
      totalRR += a.Rincian_Kondisi.Rusak_Ringan || 0;
      totalRB += a.Rincian_Kondisi.Rusak_Berat || 0;
      totalHilang += a.Rincian_Kondisi.Hilang || 0;
      totalMusnah += a.Rincian_Kondisi.Musnah || 0;
    } else {
      if (a.Kondisi === 'Baik') totalBaik += a.Jumlah || 1;
      else if (a.Kondisi === 'Rusak Ringan') totalRR += a.Jumlah || 1;
      else if (a.Kondisi === 'Rusak Berat') totalRB += a.Jumlah || 1;
      else if (a.Kondisi === 'Hilang') totalHilang += a.Jumlah || 1;
      else if (a.Kondisi === 'Musnah') totalMusnah += a.Jumlah || 1;
    }
  });

  const totalFisik = totalBaik + totalRR + totalRB + totalHilang + totalMusnah;

  // Problematic assets needing Berita Acara
  const criticalAssets = scopedAssets.filter(
    (a) => a.Kondisi === 'Rusak Berat' || a.Kondisi === 'Hilang' || a.Kondisi === 'Musnah'
  );

  const displayedAssets = scopedAssets.filter((a) => {
    if (filterCondition !== 'Semua' && a.Kondisi !== filterCondition) return false;
    return true;
  });

  const handleExport = () => {
    exportSingleSessionReportToExcel(session, allAssets);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2C3E50]/60 backdrop-blur-xs animate-in fade-in transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white text-[#2C3E50] rounded-3xl shadow-2xl overflow-hidden border border-[#e2e6e4] z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[#e2e6e4] bg-[#F8FAFC] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                {session.ID_Sesi}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  session.Status_Sesi === 'Aktif'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                Status: {session.Status_Sesi}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#2C3E50] mt-1 line-clamp-1">
              Laporan Hasil Stock Opname: {session.Nama_Sesi}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#7F8C8D] mt-0.5 flex-wrap">
              <span>Auditor: <strong className="text-[#2C3E50]">{session.Petugas_Utama}</strong></span>
              <span>·</span>
              <span>Pelaksanaan: {formatDateIndonesian(session.Tanggal_Mulai)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0"
            title="Tutup Laporan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Report Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-[#2C3E50]">
          {/* Executive Metrics Overview */}
          <div className="bg-[#2D7D62] text-white rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#A8E6CF] uppercase tracking-wider block">
                  Tingkat Ketercapaian Pemeriksaan
                </span>
                <span className="text-2xl font-black tabular-nums tracking-tight">
                  {percentComplete}%
                </span>
                <span className="text-xs text-[#A8E6CF] ml-2 font-medium">
                  ({verifiedAssets} dari {totalAssets} barang terverifikasi)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#A8E6CF] tabular-nums">
                {pendingAssets} Belum Selesai
              </span>
            </div>

            <div className="w-full bg-black/25 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#A8E6CF] h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${percentComplete}%` }}
              />
            </div>

            {/* Scope Recap */}
            <div className="pt-2 border-t border-white/15 flex items-center gap-2 flex-wrap text-[11px] text-[#A8E6CF]">
              <span>Scope:</span>
              <span className="bg-white/15 text-white px-2 py-0.5 rounded-md font-semibold">
                Unit: {targetUnit}
              </span>
              <span className="bg-white/15 text-white px-2 py-0.5 rounded-md font-semibold">
                Kategori: {scopeCat}
              </span>
              <span className="bg-white/15 text-white px-2 py-0.5 rounded-md font-semibold">
                Ruang: {scopeLoc}
              </span>
            </div>
          </div>

          {/* Physical Condition Breakdown Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center justify-between">
              <span>Distribusi Kondisi Fisik Sesi Ini</span>
              <span className="text-[11px] font-mono text-[#7F8C8D]">Total Fisik: {totalFisik} Unit</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Baik
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalBaik}
                </span>
                <span className="text-[10px] text-emerald-700">
                  {totalFisik > 0 ? Math.round((totalBaik / totalFisik) * 100) : 0}% dari total
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <span className="text-[10px] text-amber-700 font-bold block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Rusak Ringan
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalRR}
                </span>
                <span className="text-[10px] text-amber-700">
                  {totalFisik > 0 ? Math.round((totalRR / totalFisik) * 100) : 0}% dari total
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950">
                <span className="text-[10px] text-orange-700 font-bold block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Rusak Berat
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalRB}
                </span>
                <span className="text-[10px] text-orange-700">
                  {totalFisik > 0 ? Math.round((totalRB / totalFisik) * 100) : 0}% dari total
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
                <span className="text-[10px] text-rose-700 font-bold block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Hilang
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalHilang}
                </span>
                <span className="text-[10px] text-rose-700">
                  {totalFisik > 0 ? Math.round((totalHilang / totalFisik) * 100) : 0}% dari total
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950">
                <span className="text-[10px] text-purple-700 font-bold block flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Musnah
                </span>
                <span className="text-lg font-black font-mono tabular-nums mt-0.5 block">
                  {totalMusnah}
                </span>
                <span className="text-[10px] text-purple-700">
                  {totalFisik > 0 ? Math.round((totalMusnah / totalFisik) * 100) : 0}% dari total
                </span>
              </div>
            </div>
          </div>

          {/* Critical Assets Alert for Berita Acara */}
          {criticalAssets.length > 0 && (
            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Temuan Kritis: {criticalAssets.length} Aset Butuh Berita Acara
                </span>
                <span className="text-[10px] text-rose-700 font-medium">
                  Perlu Penghapusan / Mutasi
                </span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {criticalAssets.map((crit, idx) => (
                  <div
                    key={`crit-${crit.ID_Asset}-${idx}`}
                    className="p-2 bg-white rounded-xl border border-rose-200 flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-rose-700">{crit.ID_Asset}</span>
                        <span className="font-bold text-[#2C3E50] truncate">{crit.Nama_Asset}</span>
                      </div>
                      <p className="text-[10px] text-[#7F8C8D]">
                        Kondisi: <strong className="text-rose-800">{crit.Kondisi}</strong> · PIC: {crit.Penanggung_Jawab} ({crit.Unit_Kerja})
                      </p>
                    </div>

                    {onCreateBAForAsset && (
                      <button
                        onClick={() => {
                          onClose();
                          onCreateBAForAsset(crit);
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <FileCheck2 className="w-3 h-3" />
                        <span>Buat BA</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Item List with Filter */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">
                Daftar Barang Sesi Ini ({displayedAssets.length})
              </h3>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px]">
                {['Semua', 'Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang', 'Musnah'].map((cond, idx) => (
                  <button
                    key={`srm-cond-${cond}-${idx}`}
                    onClick={() => setFilterCondition(cond)}
                    className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                      filterCondition === cond
                        ? 'bg-[#2D7D62] text-white font-bold'
                        : 'bg-[#F2F4F3] text-[#7F8C8D] hover:bg-white border border-[#e2e6e4]'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-[#e2e6e4] rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F8FAFC] text-[#7F8C8D] border-b border-[#e2e6e4] text-[10px] uppercase font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5 pl-3">Aset</th>
                    <th className="p-2.5">Unit / Lokasi</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center">Kondisi</th>
                    <th className="p-2.5 text-right pr-3">Jml Fisik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e6e4]">
                  {displayedAssets.map((asset, idx) => (
                    <tr key={`srm-asset-${asset.ID_Asset}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 pl-3 min-w-[140px]">
                        <span className="font-mono font-bold text-blue-600 block text-[11px]">
                          {asset.ID_Asset}
                        </span>
                        <span className="font-semibold text-[#2C3E50] line-clamp-1">
                          {asset.Nama_Asset}
                        </span>
                      </td>
                      <td className="p-2.5 text-[11px] text-[#7F8C8D]">
                        <span className="font-medium text-[#2C3E50] block">{asset.Unit_Kerja}</span>
                        <span>{asset.Lokasi || '-'}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            asset.Status_Audit === 'Sudah SO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {asset.Status_Audit}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            asset.Kondisi === 'Baik'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : asset.Kondisi === 'Rusak Ringan'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {asset.Kondisi}
                        </span>
                      </td>
                      <td className="p-2.5 pr-3 text-right font-mono font-bold tabular-nums">
                        {asset.Jumlah} Unit
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#e2e6e4] bg-[#F8FAFC] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#e2e6e4] text-[#2C3E50] font-bold text-xs hover:bg-[#F2F4F3] transition-colors"
          >
            Tutup
          </button>

          <button
            onClick={handleExport}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Laporan Excel (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
