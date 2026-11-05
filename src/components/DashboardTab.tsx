import React, { useState } from 'react';
import { Asset, SesiSO, AssetLoan, BeritaAcaraDoc } from '../types';
import { AssetVisualSummaryCard } from './AssetVisualSummaryCard';
import {
  Banknote,
  Layers,
  CheckCircle2,
  ArrowLeftRight,
  AlertTriangle,
  ShieldAlert,
  Building2,
  Calendar,
  ArrowRight,
  FileSpreadsheet,
  Link,
  History,
  FileCheck2,
  Plus,
} from 'lucide-react';
import { formatDateIndonesian, formatRupiah } from '../utils/dateUtils';

interface DashboardTabProps {
  assets: Asset[];
  sessions: SesiSO[];
  loans: AssetLoan[];
  beritaAcaraDocs?: BeritaAcaraDoc[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onGoToAudit: () => void;
  onGoToLoans: () => void;
  onGoToBeritaAcara: () => void;
  onGoToManage: () => void;
  onOpenGasModal: () => void;
  gasUrl?: string;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  assets,
  sessions,
  loans,
  beritaAcaraDocs = [],
  activeSessionId,
  onSelectSession,
  onGoToAudit,
  onGoToLoans,
  onGoToBeritaAcara,
  onGoToManage,
  onOpenGasModal,
  gasUrl,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('Semua');

  const isConnected = Boolean(gasUrl && gasUrl.trim().length > 0);
  const unitList = ['Semua', ...Array.from(new Set(assets.map((a) => a.Unit_Kerja).filter((u) => u && u.trim() !== 'Semua')))];

  const filteredAssets = assets.filter((a) => {
    if (selectedUnit !== 'Semua' && a.Unit_Kerja !== selectedUnit) return false;
    return true;
  });

  const totalAssets = filteredAssets.length;
  const totalValuation = filteredAssets.reduce((sum, a) => sum + (a.Harga_Perolehan || 0) * a.Jumlah, 0);

  // Active Loans & Overdue Loans
  const activeLoans = loans.filter((l) => l.Status_Pinjam === 'Dipinjam');
  const overdueLoans = loans.filter((l) => l.Status_Pinjam === 'Overdue');

  // Damaged Assets needing Berita Acara
  const damagedForDisposal = filteredAssets.filter(
    (a) => a.Kondisi === 'Rusak Berat' || a.Kondisi === 'Hilang'
  );

  // Recent activity stream (combining recent loans & BA documents)
  const recentLoans = loans.slice(0, 3);
  const recentBAs = beritaAcaraDocs.slice(0, 3);

  return (
    <div className="space-y-3.5 pb-20 pt-2 animate-in fade-in text-[#2C3E50]">
      {/* Onboarding Callout if database is empty */}
      {assets.length === 0 && !isConnected && (
        <div className="bg-[#2C3E50] text-white rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#2D7D62] text-white shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Database Assets Management Masih Kosong</h3>
              <p className="text-xs text-[#A8E6CF] mt-1 leading-relaxed">
                Silakan hubungkan aplikasi dengan Google Spreadsheet Anda atau tambahkan aset kantor pertama via Katalog.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onGoToManage}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs rounded-xl shadow transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Katalog Assets</span>
            </button>
            <button
              onClick={onOpenGasModal}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F2F4F3] text-[#2C3E50] font-semibold text-xs rounded-xl border border-[#e2e6e4] shadow transition-all"
            >
              <Link className="w-3.5 h-3.5 text-[#2D7D62]" />
              <span>Google Sheet</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. EXECUTIVE ASSET PORTFOLIO CARD                            */}
      {/* ============================================================ */}
      <div className="bg-[#2D7D62] text-white rounded-2xl p-4 sm:p-5 shadow-md shadow-[#2D7D62]/15 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold text-[#A8E6CF] uppercase tracking-wider flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5" /> Total Nilai Aset
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 font-mono tabular-nums">
              {formatRupiah(totalValuation)}
            </h2>
          </div>
          <button
            onClick={onGoToManage}
            className="flex items-center gap-1 bg-white text-[#2D7D62] text-xs font-bold px-3 py-2 rounded-xl shadow-xs hover:bg-[#A8E6CF] active:scale-95 transition-all shrink-0"
          >
            <span>Katalog Aset</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quiet Inline Metric Strip */}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-white/90 font-mono tabular-nums">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#A8E6CF]" />
            <strong>{totalAssets}</strong> <span className="text-[11px] font-sans text-white/70">Total Barang</span>
          </span>
          <span className="text-white/30">·</span>
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#A8E6CF]" />
            <strong>{unitList.length - 1}</strong> <span className="text-[11px] font-sans text-white/70">Unit Kerja</span>
          </span>
          <span className="text-white/30">·</span>
          <span className="flex items-center gap-1">
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-300" />
            <strong>{activeLoans.length}</strong> <span className="text-[11px] font-sans text-white/70">Dipinjam</span>
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PHYSICAL CONDITION & OPERATIONAL AVAILABILITY CARD        */}
      {/* ============================================================ */}
      <AssetVisualSummaryCard assets={assets} loans={loans} selectedUnit={selectedUnit} />

      {/* ============================================================ */}
      {/* 3. OPERATIONAL ALERTS (Overdue loans & damaged assets)       */}
      {/* ============================================================ */}
      {(overdueLoans.length > 0 || damagedForDisposal.length > 0) && (
        <div className="bg-[#F2F4F3] rounded-2xl p-4 shadow-xs border border-[#e2e6e4] space-y-2.5">
          <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Perlu Perhatian 
          </h3>

          <div className="space-y-1.5">
            {overdueLoans.length > 0 && (
              <div className="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span><strong>{overdueLoans.length} Peminjaman Aset</strong> telah melewati target waktu kembali.</span>
                </div>
                <button
                  onClick={onGoToLoans}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 underline shrink-0 ml-2"
                >
                  Lihat Log
                </button>
              </div>
            )}

            {damagedForDisposal.length > 0 && (
              <div className="p-2.5 bg-white border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span><strong>{damagedForDisposal.length} Aset Rusak / Hilang</strong> siap diajukan Berita Acara.</span>
                </div>
                <button
                  onClick={onGoToBeritaAcara}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 underline shrink-0 ml-2"
                >
                  Buat BA
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. RECENT ACTIVITY WIDGET (Recent Loans & Berita Acara)      */}
      {/* ============================================================ */}
      <div className="bg-[#F2F4F3] rounded-2xl p-4 shadow-xs border border-[#e2e6e4] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#2D7D62]" />
            <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">
              Aktivitas Aset Terbaru
            </h3>
          </div>
          <span className="text-[10px] text-[#7F8C8D]">Transaksi Terkini</span>
        </div>

        <div className="space-y-2">
          {/* Recent Loans */}
          {recentLoans.map((loan, idx) => (
            <div
              key={`recent-loan-${loan.ID_Pinjam}-${idx}`}
              className="p-2.5 bg-white rounded-xl border border-[#e2e6e4] flex items-center justify-between text-xs shadow-2xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-bold text-[#2C3E50] truncate">{loan.Nama_Asset}</span>
                </div>
                <p className="text-[11px] text-[#7F8C8D] mt-0.5">
                  Dipinjam oleh <strong className="text-[#2C3E50]">{loan.Nama_Peminjam}</strong> ({loan.Unit_Peminjam})
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#7F8C8D] shrink-0">
                {formatDateIndonesian(loan.Tanggal_Pinjam)}
              </span>
            </div>
          ))}

          {/* Recent BA Documents */}
          {recentBAs.map((ba, idx) => (
            <div
              key={`recent-ba-${ba.ID_BA}-${idx}`}
              className="p-2.5 bg-white rounded-xl border border-[#e2e6e4] flex items-center justify-between text-xs shadow-2xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-bold text-[#2C3E50] truncate">{ba.Jenis_BA}</span>
                  <span className="text-[10px] font-mono text-[#7F8C8D] truncate">({ba.Nomor_BA})</span>
                </div>
                <p className="text-[11px] text-[#7F8C8D] mt-0.5 truncate">
                  {ba.Alasan_Keterangan || 'Dokumen Berita Acara resmi instansi'}
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#7F8C8D] shrink-0">
                {formatDateIndonesian(ba.Tanggal_BA)}
              </span>
            </div>
          ))}

          {recentLoans.length === 0 && recentBAs.length === 0 && (
            <div className="p-3 text-center bg-white rounded-xl border border-[#e2e6e4] text-[#7F8C8D] text-xs">
              Belum ada transaksi peminjaman atau Berita Acara yang tercatat.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. UNIT KERJA FILTER STRIP                                   */}
      {/* ============================================================ */}
      <div className="bg-[#F2F4F3] rounded-2xl p-3 border border-[#e2e6e4] space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-[#7F8C8D] uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-[#2D7D62]" /> Filter Berdasarkan Unit Kerja:
          </span>
          <span className="font-semibold text-[#2C3E50]">{selectedUnit}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {unitList.map((unit, idx) => (
            <button
              key={`${unit}-${idx}`}
              onClick={() => setSelectedUnit(unit)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedUnit === unit
                  ? 'bg-[#2D7D62] text-white border-[#2D7D62] shadow-xs'
                  : 'bg-white text-[#2C3E50] border-[#e2e6e4] hover:bg-[#A8E6CF]/30'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
