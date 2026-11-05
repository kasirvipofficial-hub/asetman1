import React, { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { Asset } from '../types';
import {
  Calendar,
  UserCheck,
  Building2,
  Tag,
  MapPin,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { getActiveAuditor, setActiveAuditor } from '../services/apiService';

interface CreateSessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  units: string[];
  assets: Asset[];
  onCreateSession: (payload: {
    Nama_Sesi: string;
    Tanggal_Mulai: string;
    Target_Unit_Kerja: string;
    Scope_Kategori: string;
    Scope_Lokasi: string;
    Petugas_Utama: string;
    autoReset: boolean;
  }) => Promise<void>;
  isSaving: boolean;
}

export const CreateSessionDrawer: React.FC<CreateSessionDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  units,
  assets,
  onCreateSession,
  isSaving,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long' });

  const [namaSesi, setNamaSesi] = useState(`SO_${currentMonth}_${currentYear}`);
  const [petugasUtama, setPetugasUtama] = useState(getActiveAuditor());
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().substring(0, 10));
  const [targetUnit, setTargetUnit] = useState<string>('Semua');
  const [scopeKategori, setScopeKategori] = useState<string>('Semua');
  const [scopeLokasi, setScopeLokasi] = useState<string>('Semua');

  // Extract all distinct locations from assets
  const availableLocations = Array.from(
    new Set(assets.map((a) => a.Lokasi).filter((loc): loc is string => Boolean(loc?.trim())))
  );

  useEffect(() => {
    if (isOpen) {
      setPetugasUtama(getActiveAuditor());
      if (!namaSesi) {
        setNamaSesi(`SO_${currentMonth}_${currentYear}`);
      }
    }
  }, [isOpen]);

  // Calculate matching assets count preview based on selected scope
  const matchingAssetsCount = assets.filter((a) => {
    if (targetUnit !== 'Semua' && a.Unit_Kerja !== targetUnit) return false;
    if (scopeKategori !== 'Semua' && a.Kategori !== scopeKategori) return false;
    if (scopeLokasi !== 'Semua' && a.Lokasi !== scopeLokasi) return false;
    return true;
  }).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSesi.trim() || !petugasUtama.trim()) return;

    setActiveAuditor(petugasUtama.trim());
    await onCreateSession({
      Nama_Sesi: namaSesi.trim(),
      Tanggal_Mulai: tanggalMulai,
      Target_Unit_Kerja: targetUnit,
      Scope_Kategori: scopeKategori,
      Scope_Lokasi: scopeLokasi,
      Petugas_Utama: petugasUtama.trim(),
      autoReset: true,
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Sesi Stock Opname"
      subtitle="Inisiasi sesi audit lapangan & tentukan cakupan barang yang akan diperiksa"
      maxHeightClass="max-h-[92vh]"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 pb-6 text-xs text-[#2C3E50]">
        {/* Nama Sesi & Tanggal */}
        <div className="space-y-3 p-3.5 bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl">
          <div>
            <label className="block text-xs font-bold text-[#2C3E50] mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2D7D62]" />
              Nama Sesi Stock Opname *
            </label>
            <input
              type="text"
              required
              value={namaSesi}
              onChange={(e) => setNamaSesi(e.target.value)}
              placeholder="Contoh: SO_Ciminyak_Semester_1"
              className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#2D7D62]" />
                Petugas / Auditor Penanggung Jawab *
              </label>
              <input
                type="text"
                required
                value={petugasUtama}
                onChange={(e) => setPetugasUtama(e.target.value)}
                placeholder="Nama auditor / tim pemeriksa"
                className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2D7D62]" />
                Tanggal Pelaksanaan *
              </label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              />
            </div>
          </div>
        </div>

        {/* Cakupan Audit (Scope Form) */}
        <div className="p-3.5 bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#2D7D62] uppercase tracking-wider flex items-center gap-1.5">
              Cakupan Barang yang Akan di-SO
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#A8E6CF] text-[#2D7D62]">
              {matchingAssetsCount} Barang Terpilih
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Unit Kerja Scope */}
            <div>
              <label className="block text-[11px] font-bold text-[#7F8C8D] mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#2D7D62]" />
                Cakupan Unit Kerja
              </label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              >
                <option value="Semua">Semua Unit Kerja</option>
                {units.filter((u) => u && u.trim() !== 'Semua').map((u, idx) => (
                  <option key={`create-unit-${u}-${idx}`} value={u}>
                    Unit: {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori Scope */}
            <div>
              <label className="block text-[11px] font-bold text-[#7F8C8D] mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2D7D62]" />
                Cakupan Kategori Aset
              </label>
              <select
                value={scopeKategori}
                onChange={(e) => setScopeKategori(e.target.value)}
                className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              >
                <option value="Semua">Semua Kategori</option>
                {categories.filter((c) => c && c.trim() !== 'Semua').map((c, idx) => (
                  <option key={`create-cat-${c}-${idx}`} value={c}>
                    Kategori: {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Lokasi / Ruangan Scope */}
            <div>
              <label className="block text-[11px] font-bold text-[#7F8C8D] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2D7D62]" />
                Cakupan Lokasi / Ruangan Tertentu
              </label>
              <select
                value={scopeLokasi}
                onChange={(e) => setScopeLokasi(e.target.value)}
                className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D7D62]"
              >
                <option value="Semua">Semua Tempat / Ruangan</option>
                {availableLocations.filter((loc) => loc && loc.trim() !== 'Semua').map((loc, idx) => (
                  <option key={`create-loc-${loc}-${idx}`} value={loc}>
                    Tempat: {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 bg-white border border-[#e2e6e4] rounded-xl text-[11px] text-[#7F8C8D]">
            <Info className="w-4 h-4 text-[#2D7D62] shrink-0 mt-0.5" />
            <p>
              Halaman kegiatan Stock Opname akan otomatis memfilter dan menampilkan daftar barang sesuai cakupan di atas, lengkap dengan catatan dan hasil audit fisik dari sesi sebelumnya.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving || matchingAssetsCount === 0}
          className="w-full py-3.5 px-4 rounded-xl bg-[#2D7D62] hover:bg-[#23634e] active:scale-[0.99] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all min-h-[48px] disabled:opacity-50"
        >
          {isSaving ? (
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Mulai Sesi Stock Opname ({matchingAssetsCount} Barang)</span>
            </>
          )}
        </button>
      </form>
    </BottomSheet>
  );
};
