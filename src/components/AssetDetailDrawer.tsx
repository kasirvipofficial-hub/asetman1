import React, { useState } from 'react';
import { Asset, AssetLoan, BeritaAcaraDoc } from '../types';
import { BottomSheet } from './BottomSheet';
import { formatDateIndonesian, formatRupiah } from '../utils/dateUtils';
import { calculateAssetDepreciation } from '../utils/depreciation';
import { generateCode128Svg, generateQrCodeSvg } from '../utils/barcodeUtils';
import {
  Info,
  Banknote,
  History,
  Tag,
  Building2,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ArrowLeftRight,
  FileCheck2,
  Edit2,
  Printer,
  TrendingDown,
  Layers,
  Lock,
} from 'lucide-react';

interface AssetDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  loans: AssetLoan[];
  beritaAcaraDocs: BeritaAcaraDoc[];
  onOpenEditDrawer?: (asset: Asset) => void;
  onOpenLoanDrawer?: (asset: Asset) => void;
  onOpenBarcodeDrawer?: (asset: Asset) => void;
  onOpenBADrawer?: (asset: Asset) => void;
}

export const AssetDetailDrawer: React.FC<AssetDetailDrawerProps> = ({
  isOpen,
  onClose,
  asset,
  loans,
  beritaAcaraDocs,
  onOpenEditDrawer,
  onOpenLoanDrawer,
  onOpenBarcodeDrawer,
  onOpenBADrawer,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'finance' | 'history'>('info');

  if (!asset) return null;

  // Depreciation calculations
  const calc = calculateAssetDepreciation(asset);
  const currentBookValue = asset.Nilai_Buku !== undefined && Number(asset.Nilai_Buku) >= 0 ? Number(asset.Nilai_Buku) : calc.nilaiBukuSaatIni;
  const valHarga = Number(asset.Harga_Perolehan || asset.Harga_Asal) || 0;

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
  const qrSvg = generateQrCodeSvg(asset.ID_Asset, 64);
  const code128Svg = generateCode128Svg(asset.ID_Asset, 32);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Aset"
      subtitle={`ID: ${asset.ID_Asset} · ${asset.Kategori}`}
      maxHeightClass="max-h-[92vh]"
    >
      <div className="space-y-4 text-xs text-[#2C3E50]">
        {/* Tab Switcher Header */}
        <div className="flex bg-[#F2F4F3] p-1 rounded-2xl border border-[#e2e6e4] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-[#2D7D62] text-white shadow-xs'
                : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'finance'
                ? 'bg-[#2D7D62] text-white shadow-xs'
                : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Keuangan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#2D7D62] text-white shadow-xs'
                : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat</span>
          </button>
        </div>

        {/* TAB 1: INFORMASI UTAMA & SPESIFIKASI FISIK */}
        {activeTab === 'info' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Asset Identity Card with QR/Photo */}
            <div className="p-4 bg-white border border-[#e2e6e4] rounded-2xl shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                {asset.Foto_Asset ? (
                  <img
                    src={asset.Foto_Asset}
                    alt={asset.Nama_Asset}
                    className="w-16 h-16 rounded-xl object-cover border border-[#e2e6e4] shrink-0"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#e2e6e4] p-1 shrink-0 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-[#2D7D62] text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {asset.ID_Asset}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        asset.Kondisi === 'Baik' || !asset.Kondisi
                          ? 'bg-[#A8E6CF]/60 text-[#2D7D62]'
                          : asset.Kondisi === 'Rusak Ringan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {asset.Kondisi || 'Baik'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        asset.Status_Pinjam === 'Dipinjam'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {asset.Status_Pinjam || 'Tersedia'}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#2C3E50] mt-1.5 leading-snug">
                    {asset.Nama_Asset}
                  </h3>
                  <p className="text-[11px] text-[#7F8C8D] mt-0.5">
                    {asset.Kategori} {asset.Jenis ? `· ${asset.Jenis}` : ''}
                  </p>
                </div>
              </div>

              {/* Barcode Strip */}
              <div className="pt-2 border-t border-[#F2F4F3]">
                <div className="h-8 w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: code128Svg }} />
              </div>
            </div>

            {/* Field Grid */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#7F8C8D] font-semibold block flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#2D7D62]" /> Unit Kerja
                </span>
                <strong className="text-[#2C3E50]">{asset.Unit_Kerja}</strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#7F8C8D] font-semibold block flex items-center gap-1">
                  <User className="w-3 h-3 text-[#2D7D62]" /> Penanggung Jawab (PIC)
                </span>
                <strong className="text-[#2C3E50]">{asset.Penanggung_Jawab}</strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#7F8C8D] font-semibold block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2D7D62]" /> Lokasi Ruang
                </span>
                <strong className="text-[#2C3E50]">{asset.Lokasi || 'Gudang Utama'}</strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#7F8C8D] font-semibold block flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#2D7D62]" /> Serial Number (S/N)
                </span>
                <strong className="text-[#2C3E50] font-mono">{asset.Nomor_Seri || '-'}</strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#7F8C8D] font-semibold block flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#2D7D62]" /> Jumlah Unit
                </span>
                <strong className="text-[#2C3E50]">{asset.Jumlah} Unit (Asal: {asset.Jumlah_Asal || asset.Jumlah})</strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#7F8C8D] font-semibold block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#2D7D62]" /> Status Audit SO
                </span>
                <strong className={asset.Status_Audit === 'Sudah SO' ? 'text-[#2D7D62]' : 'text-amber-700'}>
                  {asset.Status_Audit} {asset.Tanggal_SO ? `(${asset.Tanggal_SO})` : ''}
                </strong>
              </div>
            </div>

            {/* Rincian Kondisi Breakdown Box */}
            {asset.Rincian_Kondisi && (
              <div className="p-3 bg-white border border-[#e2e6e4] rounded-2xl space-y-1.5">
                <span className="text-[11px] font-bold text-[#7F8C8D] uppercase tracking-wider block">
                  Rincian Kondisi Fisik Unit ({asset.Jumlah} Unit):
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold font-mono">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-[#2D7D62] border border-emerald-200">
                    <span className="block text-[9px] font-sans">Baik</span>
                    <span>{asset.Rincian_Kondisi.Baik}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="block text-[9px] font-sans">RR</span>
                    <span>{asset.Rincian_Kondisi.Rusak_Ringan}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                    <span className="block text-[9px] font-sans">RB</span>
                    <span>{asset.Rincian_Kondisi.Rusak_Berat}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                    <span className="block text-[9px] font-sans">Hilang</span>
                    <span>{asset.Rincian_Kondisi.Hilang}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                    <span className="block text-[9px] font-sans">Musnah</span>
                    <span>{asset.Rincian_Kondisi.Musnah}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KEUANGAN & DEPRESIASI NILAI BUKU */}
        {activeTab === 'finance' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Financial Card */}
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
                  <strong className="text-white font-mono">{formatRupiah(valHarga)}</strong>
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

            {/* Log Penyusutan History Table */}
            <div className="space-y-2 p-3.5 bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl">
              <h4 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-[#2D7D62]" />
                Riwayat Penyusutan 
              </h4>
              {logs.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {logs.map((log, idx) => (
                    <div
                      key={`dep-log-${log.ID_Log}-${idx}`}
                      className="p-2.5 bg-white rounded-xl border border-[#e2e6e4] flex items-center justify-between text-[11px] shadow-2xs"
                    >
                      <div>
                        <span className="font-bold text-[#2C3E50] block">{log.Keterangan}</span>
                        <span className="text-[10px] text-[#7F8C8D]">
                          {formatDateIndonesian(log.Tanggal_Log)} · Oleh: {log.Executor}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-rose-600 font-bold block">- {formatRupiah(log.Beban_Penyusutan)}</span>
                        <span className="text-[10px] text-[#7F8C8D]">Sisa: {formatRupiah(log.Nilai_Buku_Sesudah)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center bg-white rounded-xl border border-[#e2e6e4] text-[#7F8C8D] text-xs">
                  Belum ada log penyusutan periodik yang tercatat untuk aset ini.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LINIMASA RIWAYAT & REKAM JEJAK */}
        {activeTab === 'history' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#2D7D62]" />
              <h4 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">
                Linimasa Riwayat & Rekam Jejak Aset
              </h4>
            </div>

            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e6e4]">
              {/* Event 1: Perolehan */}
              <div className="relative group">
                <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#2D7D62] ring-4 ring-white" />
                <div className="p-3 bg-white border border-[#e2e6e4] rounded-xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2C3E50] text-xs">Pengadaan / Perolehan Barang</span>
                    <span className="text-[10px] text-[#7F8C8D] font-mono">{asset.Tanggal_Perolehan || asset.Tahun_Beli || '-'}</span>
                  </div>
                  <p className="text-[11px] text-[#7F8C8D]">
                    Barang dicatat pertama kali dengan harga perolehan {formatRupiah(valHarga)}.
                  </p>
                </div>
              </div>

              {/* Event 2: Dokumen Berita Acara */}
              {relatedBAs.map((ba, idx) => (
                <div key={`ba-timeline-${ba.ID_BA}-${idx}`} className="relative group">
                  <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="p-3 bg-white border border-[#e2e6e4] rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2C3E50] text-xs flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                        {ba.Jenis_BA} ({ba.Nomor_BA})
                      </span>
                      <span className="text-[10px] text-[#7F8C8D] font-mono">{formatDateIndonesian(ba.Tanggal_BA)}</span>
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

              {/* Event 3: Riwayat Peminjaman */}
              {relatedLoans.map((loan, idx) => (
                <div key={`loan-timeline-${loan.ID_Pinjam}-${idx}`} className="relative group">
                  <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white" />
                  <div className="p-3 bg-white border border-[#e2e6e4] rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2C3E50] text-xs flex items-center gap-1">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
                        Peminjaman: {loan.Nama_Peminjam}
                      </span>
                      <span className="text-[10px] text-[#7F8C8D] font-mono">{formatDateIndonesian(loan.Tanggal_Pinjam)}</span>
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

              {/* Event 4: Verification SO */}
              <div className="relative group">
                <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                <div className="p-3 bg-white border border-[#e2e6e4] rounded-xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2C3E50] text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verifikasi Stock Opname Terakhir
                    </span>
                    <span className="text-[10px] text-[#7F8C8D] font-mono">
                      {asset.Tanggal_SO ? formatDateIndonesian(asset.Tanggal_SO) : 'Belum SO'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7F8C8D]">
                    Kondisi fisik diverifikasi: <strong className="text-[#2C3E50]">{asset.Kondisi || 'Baik'}</strong> oleh {asset.Petugas_SO || 'Petugas SO'}.
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
        )}

        {/* Quick Action Footer Strip */}
        <div className="pt-2 border-t border-[#F2F4F3] flex items-center gap-2">
          {onOpenEditDrawer && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEditDrawer(asset);
              }}
              className="flex-1 py-2.5 px-3 bg-[#F2F4F3] hover:bg-[#e2e6e4] text-[#2C3E50] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-[#e2e6e4]"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#2D7D62]" />
              <span>Edit Aset</span>
            </button>
          )}

          {onOpenLoanDrawer && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLoanDrawer(asset);
              }}
              className="flex-1 py-2.5 px-3 bg-[#F2F4F3] hover:bg-[#e2e6e4] text-[#2C3E50] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-[#e2e6e4]"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
              <span>Pinjam </span>
            </button>
          )}

          {onOpenBarcodeDrawer && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBarcodeDrawer(asset);
              }}
              className="flex-1 py-2.5 px-3 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Label</span>
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
