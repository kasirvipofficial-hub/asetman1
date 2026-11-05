import React, { useState } from 'react';
import { Asset, ConditionType, StatusAuditType, RincianKondisi, SesiSO } from '../types';
import { QuickAuditModal } from './QuickAuditModal';
import {
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Building2,
  History,
  MapPin,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDateIndonesian } from '../utils/dateUtils';
import { getActiveAuditor } from '../services/apiService';

interface AuditTabProps {
  assets: Asset[];
  activeSessionId: string;
  sessions: SesiSO[];
  searchQuery: string;
  onSaveAudit: (payload: {
    ID_Asset: string;
    Kondisi: ConditionType;
    Jumlah: number;
    Rincian_Kondisi: RincianKondisi;
    Petugas_SO: string;
    Keterangan_SO: string;
  }) => Promise<void>;
  isSaving: boolean;
  onBackToDashboard: () => void;
  onOpenSessionManagement?: () => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  assets,
  activeSessionId,
  sessions,
  searchQuery,
  onSaveAudit,
  isSaving,
  onBackToDashboard,
  onOpenSessionManagement,
}) => {
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Belum SO' | 'Sudah SO'>('Semua');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const activeSession = sessions.find((s) => s.ID_Sesi === activeSessionId) || sessions[0];
  const auditorName = activeSession?.Petugas_Utama || getActiveAuditor() || 'Admin';

  // Scope filter based on active session
  const targetUnit = activeSession?.Target_Unit_Kerja || 'Semua';
  const scopeKategori = activeSession?.Scope_Kategori || 'Semua';
  const scopeLokasi = activeSession?.Scope_Lokasi || 'Semua';

  const sessionScopedAssets = assets.filter((a) => {
    if (targetUnit !== 'Semua' && a.Unit_Kerja !== targetUnit) return false;
    if (scopeKategori !== 'Semua' && a.Kategori !== scopeKategori) return false;
    if (scopeLokasi !== 'Semua' && a.Lokasi !== scopeLokasi) return false;
    return true;
  });

  // Effective list considering top header search query
  const q = (searchQuery || '').trim().toLowerCase();
  const searchFilteredAssets = sessionScopedAssets.filter((a) => {
    if (!q) return true;
    return (
      (a.ID_Asset && a.ID_Asset.toLowerCase().includes(q)) ||
      (a.Nama_Asset && a.Nama_Asset.toLowerCase().includes(q)) ||
      (a.Kategori && a.Kategori.toLowerCase().includes(q)) ||
      (a.Unit_Kerja && a.Unit_Kerja.toLowerCase().includes(q)) ||
      (a.Lokasi && a.Lokasi.toLowerCase().includes(q)) ||
      (a.Penanggung_Jawab && a.Penanggung_Jawab.toLowerCase().includes(q)) ||
      (a.Nomor_Seri && a.Nomor_Seri.toLowerCase().includes(q))
    );
  });

  const countSemua = searchFilteredAssets.length;
  const countBelum = searchFilteredAssets.filter((a) => a.Status_Audit === 'Belum SO').length;
  const countSudah = searchFilteredAssets.filter((a) => a.Status_Audit === 'Sudah SO').length;

  const displayAssets = searchFilteredAssets.filter((a) => {
    if (statusFilter === 'Belum SO') return a.Status_Audit === 'Belum SO';
    if (statusFilter === 'Sudah SO') return a.Status_Audit === 'Sudah SO';
    return true;
  });

  const totalAuditItems = searchFilteredAssets.length;
  const auditPercent = totalAuditItems > 0 ? Math.round((countSudah / totalAuditItems) * 100) : 0;

  const getConditionBadge = (kondisi: ConditionType, status: StatusAuditType) => {
    if (status === 'Belum SO') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Belum SO
        </span>
      );
    }

    const badgeConfig: Record<ConditionType, { bg: string; icon: React.ComponentType<{ className?: string }> }> = {
      Baik: {
        bg: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        icon: CheckCircle2,
      },
      'Rusak Ringan': {
        bg: 'bg-amber-100 text-amber-800 border border-amber-200',
        icon: AlertTriangle,
      },
      'Rusak Berat': {
        bg: 'bg-orange-100 text-orange-800 border border-orange-200',
        icon: AlertTriangle,
      },
      Hilang: {
        bg: 'bg-rose-100 text-rose-800 border border-rose-200',
        icon: ShieldAlert,
      },
      Musnah: {
        bg: 'bg-purple-100 text-purple-800 border border-purple-200',
        icon: Flame,
      },
    };

    const cfg = badgeConfig[kondisi] || badgeConfig['Baik'];
    const IconComp = cfg.icon;

    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.bg}`}>
        <IconComp className="w-3.5 h-3.5" />
        {kondisi}
      </span>
    );
  };

  const handleSaveModal = async (payload: {
    ID_Asset: string;
    Kondisi: ConditionType;
    Jumlah: number;
    Rincian_Kondisi: RincianKondisi;
    Petugas_SO: string;
    Keterangan_SO: string;
  }) => {
    await onSaveAudit(payload);
    setSelectedAsset(null);
  };

  return (
    <div className="space-y-3 pb-24 pt-1 animate-in fade-in text-[#2C3E50]">
      {/* Sesi SO Executive Header with Integrated Back Navigation, ID Sesi & Progress Meter */}
      <div className="bg-[#2D7D62] text-white rounded-2xl p-4 shadow-sm space-y-3">
        {/* Top Header Row inside Card: Back Button, Session Title & Session ID */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/15">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBackToDashboard}
              title="Kembali ke Dashboard Utama"
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#A8E6CF] uppercase tracking-wider block leading-none">
                Kegiatan Stock Opname
              </span>
              <h1 className="text-sm font-extrabold text-white truncate mt-0.5">
                {activeSession?.Nama_Sesi || 'Sesi Audit Terjadwal'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenSessionManagement && (
              <button
                type="button"
                onClick={onOpenSessionManagement}
                title="Kelola & Daftar Sesi SO"
                className="text-[11px] font-semibold px-2 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 active:scale-95 flex items-center gap-1"
              >
                <History className="w-3.5 h-3.5 text-[#A8E6CF]" />
                <span className="hidden sm:inline">Daftar Sesi</span>
              </button>
            )}
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-black/20 text-[#A8E6CF] border border-white/10 shrink-0">
              {activeSession?.ID_Sesi || activeSessionId}
            </span>
          </div>
        </div>

        {/* Auditor & Percentage Row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <p className="text-[11px] text-[#A8E6CF]">
            Petugas: <strong className="text-white">{auditorName}</strong> · Mulai: {formatDateIndonesian(activeSession?.Tanggal_Mulai || new Date().toISOString())}
          </p>
          <div className="text-right shrink-0">
            <span className="text-xl font-black text-white tabular-nums tracking-tight">
              {auditPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/25 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#A8E6CF] h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${auditPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-[#A8E6CF] font-medium tabular-nums pt-0.5">
          <span>{countSudah} Selesai Diverifikasi</span>
          <span>{countBelum} Belum Diperiksa</span>
        </div>

        {/* Scope Badges */}
        <div className="pt-2 border-t border-white/15 flex items-center gap-1.5 flex-wrap text-[10px]">
          <span className="text-white/70 font-semibold">Cakupan Audit:</span>
          <span className="bg-white/15 px-2 py-0.5 rounded-md font-medium text-white">
            Unit: {targetUnit}
          </span>
          {scopeKategori !== 'Semua' && (
            <span className="bg-white/15 px-2 py-0.5 rounded-md font-medium text-white">
              Kategori: {scopeKategori}
            </span>
          )}
          {scopeLokasi !== 'Semua' && (
            <span className="bg-white/15 px-2 py-0.5 rounded-md font-medium text-white">
              Ruang: {scopeLokasi}
            </span>
          )}
        </div>
      </div>

      {/* 2. Status Horizontal Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {(['Semua', 'Belum SO', 'Sudah SO'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              statusFilter === st
                ? 'bg-[#2D7D62] text-white border-[#2D7D62] shadow-xs'
                : 'bg-[#F2F4F3] text-[#2C3E50] border-[#e2e6e4] hover:bg-white'
            }`}
          >
            {st === 'Semua' && `Semua (${countSemua})`}
            {st === 'Belum SO' && `Belum SO (${countBelum})`}
            {st === 'Sudah SO' && `Sudah SO (${countSudah})`}
          </button>
        ))}
      </div>

      {/* 3. List Data Barang dengan Info Hasil SO Sebelumnya */}
      <div className="space-y-3 pt-1">
        {displayAssets.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#F2F4F3] rounded-2xl border border-[#e2e6e4]">
            <Filter className="w-8 h-8 mx-auto text-[#7F8C8D] mb-2" />
            <h3 className="text-sm font-bold text-[#2C3E50]">
              {sessionScopedAssets.length === 0
                ? 'Tidak Ada Barang dalam Cakupan Sesi Ini'
                : 'Tidak Ada Barang yang Cocok dengan Pencarian atau Filter'}
            </h3>
            <p className="text-xs text-[#7F8C8D] mt-1 max-w-xs mx-auto">
              Periksa kembali kata kunci pencarian di header atau filter status di atas.
            </p>
          </div>
        ) : (
          displayAssets.map((asset, idx) => {
            const prev = asset.Audit_Sebelumnya;
            const prevRincian = prev?.Rincian || {
              Baik: prev?.Kondisi === 'Baik' ? (prev.Jumlah ?? asset.Jumlah ?? 1) : (asset.Kondisi === 'Baik' ? (asset.Rincian_Kondisi?.Baik ?? asset.Jumlah ?? 1) : 0),
              Rusak_Ringan: prev?.Kondisi === 'Rusak Ringan' ? (prev.Jumlah ?? asset.Jumlah ?? 1) : (asset.Kondisi === 'Rusak Ringan' ? (asset.Rincian_Kondisi?.Rusak_Ringan ?? 0) : 0),
              Rusak_Berat: prev?.Kondisi === 'Rusak Berat' ? (prev.Jumlah ?? asset.Jumlah ?? 1) : (asset.Kondisi === 'Rusak Berat' ? (asset.Rincian_Kondisi?.Rusak_Berat ?? 0) : 0),
              Hilang: prev?.Kondisi === 'Hilang' ? (prev.Jumlah ?? asset.Jumlah ?? 1) : (asset.Kondisi === 'Hilang' ? (asset.Rincian_Kondisi?.Hilang ?? 0) : 0),
              Musnah: prev?.Kondisi === 'Musnah' ? (prev.Jumlah ?? asset.Jumlah ?? 1) : (asset.Kondisi === 'Musnah' ? (asset.Rincian_Kondisi?.Musnah ?? 0) : 0),
            };
            const prevTotal = prev?.Jumlah !== undefined ? prev.Jumlah : (prev?.Rincian ? (prev.Rincian.Baik + prev.Rincian.Rusak_Ringan + prev.Rincian.Rusak_Berat + prev.Rincian.Hilang + prev.Rincian.Musnah) : (asset.Jumlah || 1));
            const rincian = asset.Rincian_Kondisi;
            const isAuditedNow = asset.Status_Audit === 'Sudah SO';
            const prevNote = prev?.Keterangan_SO || asset.Keterangan_SO;

            return (
              <div
                key={`${asset.ID_Asset}-${idx}`}
                onClick={() => setSelectedAsset(asset)}
                className="bg-white rounded-2xl p-3 border border-[#e2e6e4] hover:border-[#2D7D62] transition-all cursor-pointer shadow-2xs active:scale-[0.99] group space-y-2 relative"
              >
                {/* Header: ID, Category, Name & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-blue-600 tracking-tight">
                        {asset.ID_Asset}
                      </span>
                      <span className="text-[10px] text-slate-600 font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                        {asset.Kategori}
                      </span>
                      <span className="text-[11px] text-[#7F8C8D]">·</span>
                      <span className="text-[11px] text-[#7F8C8D] font-medium truncate">
                        {asset.Unit_Kerja} {asset.Lokasi ? `(${asset.Lokasi})` : ''}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#2C3E50] truncate group-hover:text-[#2D7D62] transition-colors mt-0.5">
                      {asset.Nama_Asset}
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    {getConditionBadge(asset.Kondisi, asset.Status_Audit)}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2D7D62] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Hasil SO Lalu: Compact Breakdown Strip with direct counts */}
                <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#e2e6e4] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <History className="w-3 h-3 text-[#2D7D62]" />
                      SO Lalu:
                    </span>
                    <span className="font-extrabold text-[#2C3E50] font-mono tabular-nums">
                      Total: {prevTotal} Unit
                    </span>
                  </div>

                  {/* 5 Physical Condition Badges/Values */}
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-mono font-bold text-center">
                    <div className="p-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      <span className="text-[9px] text-emerald-600 font-sans block font-semibold">Baik</span>
                      <span className="tabular-nums">{prevRincian.Baik}</span>
                    </div>
                    <div className="p-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60">
                      <span className="text-[9px] text-amber-600 font-sans block font-semibold">RR</span>
                      <span className="tabular-nums">{prevRincian.Rusak_Ringan}</span>
                    </div>
                    <div className="p-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200/60">
                      <span className="text-[9px] text-orange-600 font-sans block font-semibold">RB</span>
                      <span className="tabular-nums">{prevRincian.Rusak_Berat}</span>
                    </div>
                    <div className="p-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200/60">
                      <span className="text-[9px] text-rose-600 font-sans block font-semibold">Hilang</span>
                      <span className="tabular-nums">{prevRincian.Hilang}</span>
                    </div>
                    <div className="p-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200/60">
                      <span className="text-[9px] text-purple-600 font-sans block font-semibold">Musnah</span>
                      <span className="tabular-nums">{prevRincian.Musnah}</span>
                    </div>
                  </div>

                  {prevNote && (
                    <p className="text-[10px] text-[#7F8C8D] italic truncate pt-0.5">
                      Catatan: "{prevNote}"
                    </p>
                  )}
                </div>

                {/* Sesi Ini (if already audited) */}
                {isAuditedNow && rincian && (
                  <div className="p-1.5 px-2 rounded-lg bg-emerald-50 text-[10px] text-emerald-900 border border-emerald-200 flex items-center justify-between font-mono font-semibold">
                    <span className="font-bold font-sans flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sesi Ini:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>B: {rincian.Baik}</span>
                      <span>·</span>
                      <span>RR: {rincian.Rusak_Ringan}</span>
                      <span>·</span>
                      <span>RB: {rincian.Rusak_Berat}</span>
                      <span>·</span>
                      <span>H: {rincian.Hilang}</span>
                      <span>·</span>
                      <span>M: {rincian.Musnah}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Audit Modal */}
      <QuickAuditModal
        asset={selectedAsset}
        defaultAuditor={auditorName}
        onClose={() => setSelectedAsset(null)}
        onSave={handleSaveModal}
        isSaving={isSaving}
      />
    </div>
  );
};
