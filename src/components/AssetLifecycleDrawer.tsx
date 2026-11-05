import React from 'react';
import { Asset, AssetLoan, BeritaAcaraDoc } from '../types';
import { BottomSheet } from './BottomSheet';
import { formatDateIndonesian, formatRupiah } from '../utils/dateUtils';
import { calculateAssetDepreciation } from '../utils/depreciation';
import {
  History,
  Calendar,
  Building2,
  User,
  Banknote,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  FileCheck2,
  ShieldCheck,
  Tag,
  Flame,
  TrendingDown,
} from 'lucide-react';

interface AssetLifecycleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  loans: AssetLoan[];
  beritaAcaraDocs: BeritaAcaraDoc[];
}

export const AssetLifecycleDrawer: React.FC<AssetLifecycleDrawerProps> = ({
  isOpen,
  onClose,
  asset,
  loans,
  beritaAcaraDocs,
}) => {
  if (!asset) return null;

  // Calculate book value & straight-line depreciation using standard depreciation engine
  const calc = calculateAssetDepreciation(asset);
  const currentBookValue = asset.Nilai_Buku !== undefined ? asset.Nilai_Buku : calc.nilaiBukuSaatIni;

  // Match related loans
  const relatedLoans = loans.filter(
    (l) => l.ID_Asset === asset.ID_Asset || (l.ID_Asset_List && l.ID_Asset_List.includes(asset.ID_Asset))
  );

  // Match related Berita Acara documents
  const relatedBAs = beritaAcaraDocs.filter(
    (b) =>
      b.ID_Asset === asset.ID_Asset ||
      (b.Aset_List && b.Aset_List.some((item) => item.ID_Asset === asset.ID_Asset))
  );

  const logs = asset.Log_Penyusutan || [];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Kartu Riwayat Hidup & Nilai Buku Aset"
      subtitle={`${asset.Nama_Asset} (${asset.ID_Asset})`}
      maxHeightClass="max-h-[92vh]"
    >
      <div className="space-y-4 text-xs text-[#2C3E50]">
        {/* Financial Valuation & Book Value Summary Card */}
        <div className="p-4 bg-[#2D7D62] text-white rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#A8E6CF] uppercase tracking-wider flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" /> Nilai Buku Saat Ini (Depresiasi)
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
              Sisa {calc.persentaseNilaiTersisa}% · Umur {calc.masaManfaatTahun} Thn
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight">
                {formatRupiah(currentBookValue)}
              </span>
              <p className="text-[11px] text-[#A8E6CF] mt-0.5 font-mono">
                Beban: {formatRupiah(calc.bebanPenyusutanBulan)} / bln ({formatRupiah(calc.bebanPenyusutanTahun)} / thn)
              </p>
            </div>
            <div className="text-right text-[11px] text-white/80">
              <span className="block text-[10px] text-white/60">Harga Perolehan Awal</span>
              <strong className="text-white font-mono">{formatRupiah(calc.hargaPerolehan)}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-white/20 grid grid-cols-3 gap-2 text-[11px] text-white/90">
            <div>
              <span className="text-white/60 block text-[10px]">Tgl Perolehan:</span>
              <strong className="font-mono">{asset.Tanggal_Perolehan || asset.Tahun_Beli || '-'}</strong>
            </div>
            <div>
              <span className="text-white/60 block text-[10px]">Penyusutan Berjalan:</span>
              <strong className="font-mono">{calc.bulanBerjalan} Bulan</strong>
            </div>
            <div>
              <span className="text-white/60 block text-[10px]">Nilai Residu (Sisa):</span>
              <strong className="text-[#A8E6CF] font-mono">{formatRupiah(calc.nilaiSisa)}</strong>
            </div>
          </div>
        </div>

        {/* Master Identity Card */}
        <div className="p-3.5 bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-[#7F8C8D] block">Kategori / Jenis</span>
            <strong className="text-[#2C3E50]">{asset.Kategori} ({asset.Jenis || '-'})</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#7F8C8D] block">Unit Kerja Pengguna</span>
            <strong className="text-[#2C3E50]">{asset.Unit_Kerja}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#7F8C8D] block">Penanggung Jawab (PIC)</span>
            <strong className="text-[#2C3E50]">{asset.Penanggung_Jawab}</strong>
          </div>
          <div>
            <span className="text-[10px] text-[#7F8C8D] block">Lokasi & Nomor Seri</span>
            <strong className="text-[#2C3E50]">{asset.Lokasi || 'Kantor'} {asset.Nomor_Seri ? `· S/N: ${asset.Nomor_Seri}` : ''}</strong>
          </div>
        </div>

        {/* Depreciation Logs Table / Section */}
        {logs.length > 0 && (
          <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <h4 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-[#2D7D62]" />
              Riwayat Penyusutan
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.ID_Log} className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-[#2C3E50]">{log.Keterangan}</span>
                    <span className="text-[10px] text-[#7F8C8D] block">{formatDateIndonesian(log.Tanggal_Log)} · Oleh: {log.Executor}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-rose-600 font-bold block">- {formatRupiah(log.Beban_Penyusutan)}</span>
                    <span className="text-[10px] text-[#7F8C8D]">Sisa: {formatRupiah(log.Nilai_Buku_Sesudah)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chronological Provenance & Activity Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#2D7D62]" />
            <h4 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">
              Linimasa Riwayat & Rekam Jejak Aset
            </h4>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e6e4]">
            {/* 1. Event: Tanggal Perolehan */}
            <div className="relative group">
              <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#2D7D62] ring-4 ring-white" />
              <div className="p-3 bg-white border border-[#e2e6e4] rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2C3E50] text-xs">Pengadaan / Perolehan Barang</span>
                  <span className="text-[10px] text-[#7F8C8D]">{asset.Tahun_Beli || 'Tahun Awal'}</span>
                </div>
                <p className="text-[11px] text-[#7F8C8D]">
                  Barang dicatat pertama kali dengan harga perolehan {formatRupiah(calc.hargaPerolehan)}.
                </p>
              </div>
            </div>

            {/* 2. Events: Berita Acara yang Pernah Terbit */}
            {relatedBAs.map((ba) => (
              <div key={ba.ID_BA} className="relative group">
                <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                <div className="p-3 bg-white border border-[#e2e6e4] rounded-xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2C3E50] text-xs flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3 text-indigo-600" />
                      {ba.Jenis_BA} ({ba.Nomor_BA})
                    </span>
                    <span className="text-[10px] text-[#7F8C8D]">{formatDateIndonesian(ba.Tanggal_BA)}</span>
                  </div>
                  <p className="text-[11px] text-[#7F8C8D]">
                    {ba.Alasan_Keterangan || 'Penerbitan dokumen resmi Berita Acara.'}
                  </p>
                  <div className="text-[10px] text-[#2C3E50] font-medium pt-0.5">
                    Pihak 1: {ba.Nama_Pihak_1} · Pihak 2: {ba.Nama_Pihak_2}
                  </div>
                </div>
              </div>
            ))}

            {/* 3. Events: Riwayat Peminjaman & Pengembalian */}
            {relatedLoans.map((loan) => (
              <div key={loan.ID_Pinjam} className="relative group">
                <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white" />
                <div className="p-3 bg-white border border-[#e2e6e4] rounded-xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2C3E50] text-xs flex items-center gap-1">
                      <ArrowLeftRight className="w-3 h-3 text-amber-600" />
                      Peminjaman: {loan.Nama_Peminjam}
                    </span>
                    <span className="text-[10px] text-[#7F8C8D]">{formatDateIndonesian(loan.Tanggal_Pinjam)}</span>
                  </div>
                  <p className="text-[11px] text-[#7F8C8D]">
                    Keperluan: "{loan.Keperluan}" ({loan.Unit_Peminjam})
                  </p>
                  <div className="flex items-center justify-between text-[10px] pt-0.5 text-[#2C3E50]">
                    <span>Status: <strong>{loan.Status_Pinjam}</strong></span>
                    {loan.Kondisi_Saat_Kembali && (
                      <span className="text-[#2D7D62]">Kondisi Kembali: <strong>{loan.Kondisi_Saat_Kembali}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 4. Event: Audit Stock Opname Terakhir */}
            <div className="relative group">
              <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white" />
              <div className="p-3 bg-white border border-[#e2e6e4] rounded-xl space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2C3E50] text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verifikasi Stock Opname Terakhir
                  </span>
                  <span className="text-[10px] text-[#7F8C8D]">{asset.Tanggal_SO ? formatDateIndonesian(asset.Tanggal_SO) : 'Belum SO'}</span>
                </div>
                <p className="text-[11px] text-[#7F8C8D]">
                  Kondisi fisik diverifikasi: <strong className="text-[#2C3E50]">{asset.Kondisi}</strong> oleh {asset.Petugas_SO || 'Petugas SO'}.
                </p>
                {asset.Keterangan_SO && (
                  <p className="text-[10px] italic text-[#7F8C8D]">
                    Catatan SO: "{asset.Keterangan_SO}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
