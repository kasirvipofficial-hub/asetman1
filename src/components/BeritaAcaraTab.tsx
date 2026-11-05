import React, { useState } from 'react';
import { BeritaAcaraDoc, JenisBeritaAcara, UserRole } from '../types';
import { formatDateIndonesian } from '../utils/dateUtils';
import { Plus, FileCheck2, Printer, Search, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BeritaAcaraTabProps {
  docs: BeritaAcaraDoc[];
  userRole: UserRole;
  onOpenNewBADrawer: () => void;
  onViewDocDrawer: (doc: BeritaAcaraDoc) => void;
}

export const BeritaAcaraTab: React.FC<BeritaAcaraTabProps> = ({
  docs,
  userRole,
  onOpenNewBADrawer,
  onViewDocDrawer,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Semua');

  const filteredDocs = docs.filter((d) => {
    if (selectedFilter !== 'Semua' && d.Jenis_BA !== selectedFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 pt-2 animate-in fade-in text-xs text-[#2C3E50]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#2C3E50] tracking-tight">Vault Berita Acara Digital</h2>
          <p className="text-[11px] text-[#7F8C8D]">Dokumen BAST, Mutasi, Penghapusan, & Pelelangan</p>
        </div>

        <button
          onClick={onOpenNewBADrawer}
          className="flex items-center gap-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Buat BA Baru</span>
        </button>
      </div>

      {/* Filter Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {['Semua', 'BAST Penerimaan', 'BAST Peminjaman', 'BA Mutasi', 'BA Penghapusan', 'BA Pelelangan'].map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all border ${
                selectedFilter === filter
                  ? 'bg-[#2D7D62] text-white border-[#2D7D62] shadow-xs'
                  : 'bg-[#F2F4F3] text-[#7F8C8D] border-[#e2e6e4] hover:bg-white'
              }`}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {/* Document Cards Repository */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="p-8 text-center bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl text-[#7F8C8D]">
            Belum ada arsip Berita Acara digital yang tersimpan.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.ID_BA}
              className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 shadow-xs space-y-3 hover:border-[#2D7D62]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#2D7D62] font-mono tracking-wider uppercase block">
                    {doc.Jenis_BA}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#2C3E50] mt-0.5">{doc.Nomor_BA}</h3>
                  <p className="text-[11px] text-[#7F8C8D] mt-0.5">
                    Aset: <strong className="text-[#2C3E50]">{doc.Nama_Asset}</strong> ({doc.ID_Asset})
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#A8E6CF] text-[#2D7D62]">
                  {doc.Status_BA}
                </span>
              </div>

              {/* Pihak Terkait Bar */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-white border border-[#e2e6e4] rounded-xl text-[11px]">
                <div>
                  <span className="text-[#7F8C8D] block">Pihak 1 (Petugas):</span>
                  <strong className="text-[#2C3E50]">{doc.Nama_Pihak_1 || '-'}</strong>
                </div>
                <div>
                  <span className="text-[#7F8C8D] block">Pihak 2 (Penerima):</span>
                  <strong className="text-[#2C3E50]">{doc.Nama_Pihak_2 || '-'}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7F8C8D] pt-1 border-t border-[#e2e6e4]">
                <span>Tanggal: {formatDateIndonesian(doc.Tanggal_BA)}</span>
                <button
                  onClick={() => onViewDocDrawer(doc)}
                  className="flex items-center gap-1 text-[#2D7D62] hover:underline font-bold"
                >
                  <FileText className="w-3.5 h-3.5" /> Lihat / Cetak BA
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
