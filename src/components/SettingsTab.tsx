import React, { useState, useRef } from 'react';
import { Asset, SesiSO, UserRole } from '../types';
import { downloadExcelTemplate, exportAuditReportToExcel, parseUploadedExcel } from '../services/excelService';
import { getStoredGasUrl, setStoredGasUrl } from '../services/apiService';
import {
  Settings,
  UserCheck,
  Building2,
  Code2,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCcw,
  CheckCircle2,
  Save,
  Link,
  ShieldCheck,
} from 'lucide-react';

interface SettingsTabProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  assignedUnit: string;
  onAssignedUnitChange: (unit: string) => void;
  units: string[];
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
  onOpenGasModal: () => void;
  assets: Asset[];
  sessions: SesiSO[];
  onImportExcel: (importedAssets: Asset[], importedSessions?: SesiSO[], importedCategories?: string[], importedUnits?: string[]) => void;
  onResetDemo: () => void;
  onRunDepreciationBatch?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  userRole,
  onRoleChange,
  assignedUnit,
  onAssignedUnitChange,
  units,
  gasUrl,
  onSaveGasUrl,
  onOpenGasModal,
  assets,
  sessions,
  onImportExcel,
  onResetDemo,
  onRunDepreciationBatch,
}) => {
  const [inputUrl, setInputUrl] = useState(gasUrl);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGasUrl(inputUrl);
    onSaveGasUrl(inputUrl.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Membaca file Excel...');
    try {
      const parsed = await parseUploadedExcel(file);
      if (parsed.assets && parsed.assets.length > 0) {
        onImportExcel(parsed.assets, parsed.sessions, parsed.categories, parsed.units);
        setUploadStatus(`Berhasil mengimpor ${parsed.assets.length} aset dari Excel!`);
      } else {
        setUploadStatus('File Excel tidak berisi data aset yang valid.');
      }
    } catch (err: any) {
      setUploadStatus(err.message || 'Gagal mengimpor file Excel.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-2 animate-in fade-in text-xs text-[#2C3E50]">
      {/* Title Header */}
      <div>
        <h2 className="text-base font-bold text-[#2C3E50] tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#2D7D62]" />
          Pengaturan Pengguna & Integrasi
        </h2>
        <p className="text-[11px] text-[#7F8C8D] mt-0.5">
          Otorisasi Peran, Profil Unit Kerja, Google Sheets API, & Excel Utility
        </p>
      </div>

      {/* 1. Profil Pengguna & Unit Scoping Card */}
      <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-[#2D7D62]" /> Profil Pengguna & Unit Scoping
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[#7F8C8D] block mb-1">Peran Otorisasi (RBAC)</label>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2D7D62]"
            >
              <option value="Admin">Admin Utama (Akses Semua Unit)</option>
              <option value="Auditor">Auditor SO (Terkunci Per Unit)</option>
              <option value="Staf">Staf Peminjam (Terkunci Per Unit)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#7F8C8D] block mb-1">Unit Kerja Terdaftar (Scope Data)</label>
            <select
              value={assignedUnit}
              onChange={(e) => onAssignedUnitChange(e.target.value)}
              className="w-full bg-white text-[#2C3E50] border border-[#e2e6e4] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2D7D62]"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  Unit: {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 bg-white border border-[#e2e6e4] rounded-xl text-[11px]">
          {userRole === 'Admin' ? (
            <span className="text-[#2D7D62] font-semibold">
              ✓ Sebagai Admin, Anda memiliki wewenang penuh untuk melihat dan mengelola aset seluruh unit kerja.
            </span>
          ) : (
            <span className="text-amber-800 font-semibold">
              🔒 Tampilan aset Anda dibatasi secara otomatis khusus untuk unit <strong>{assignedUnit}</strong>.
            </span>
          )}
        </div>
      </div>

      {/* 2. Google Sheets API Connection Card */}
      <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
            <Link className="w-4 h-4 text-[#2D7D62]" /> Integrasi Google Spreadsheet API
          </h3>
          <button
            type="button"
            onClick={onOpenGasModal}
            className="flex items-center gap-1 text-[11px] text-[#2D7D62] hover:underline font-bold"
          >
            <Code2 className="w-3.5 h-3.5" /> Lihat Code.gs
          </button>
        </div>

        <form onSubmit={handleUrlSubmit} className="space-y-2">
          <label className="text-[11px] text-[#7F8C8D] block">URL Web App Apps Script (Deployment URL)</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 bg-white border border-[#e2e6e4] text-[#2C3E50] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2D7D62] font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs rounded-xl shadow-xs transition-all shrink-0"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>

      {/* 3. Excel Utilities Card */}
      <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-[#2D7D62]" /> Utilitas Excel Import & Export
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="p-3 bg-white hover:bg-[#A8E6CF]/20 border border-[#e2e6e4] rounded-xl text-left transition-all flex items-start gap-2.5"
          >
            <Download className="w-4 h-4 text-[#2D7D62] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#2C3E50] text-xs block">Download Template Excel</strong>
              <span className="text-[10px] text-[#7F8C8D]">File format .xlsx multi-tab resmi</span>
            </div>
          </button>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="settingsExcelUpload"
            />
            <label
              htmlFor="settingsExcelUpload"
              className="p-3 bg-white hover:bg-[#A8E6CF]/20 border border-[#e2e6e4] rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer block"
            >
              <Upload className="w-4 h-4 text-[#2D7D62] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#2C3E50] text-xs block">Upload & Impor Excel</strong>
                <span className="text-[10px] text-[#7F8C8D]">Membaca otomatis file data aset</span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={() => exportAuditReportToExcel(assets, sessions)}
          className="w-full py-2.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mt-1"
        >
          <FileSpreadsheet className="w-4 h-4" /> Ekspor Seluruh Laporan Aset Ke Excel (.xlsx)
        </button>

        {uploadStatus && (
          <div className="p-2.5 bg-[#A8E6CF]/40 border border-[#2D7D62]/30 text-[#2D7D62] text-[11px] font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D7D62] shrink-0" /> {uploadStatus}
          </div>
        )}
      </div>

      {/* 4. Periodic Depreciation Batch Run Card */}
      <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCcw className="w-4 h-4 text-[#2D7D62]" /> Rekam Beban Penyusutan Nilai Buku Periodik
          </h3>
          <span className="text-[10px] bg-emerald-100 text-[#2D7D62] font-bold px-2 py-0.5 rounded-full">
            Log_Penyusutan
          </span>
        </div>

        <p className="text-[11px] text-[#7F8C8D] leading-relaxed">
          Proses kalkulasi penyusutan periodik (garis lurus) untuk seluruh aset aktif. Hasil penyusutan akan meng-update <strong>Nilai Buku Saat Ini</strong> di Master Assets dan mencatat riwayat pemotongan ke tab <strong>Log_Penyusutan</strong>.
        </p>

        <button
          type="button"
          onClick={onRunDepreciationBatch}
          className="w-full py-2.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" /> Jalankan Penyusutan Bulanan / Periodik Sekarang
        </button>
      </div>

      {/* 4. Reset Demo Data Card */}
      <div className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider flex items-center gap-1.5">
          <RefreshCcw className="w-4 h-4 text-rose-600" /> Reset & Pemulihan Sistem
        </h3>

        <div className="flex items-center justify-between p-3 bg-white border border-[#e2e6e4] rounded-xl">
          <div>
            <strong className="text-[#2C3E50] text-xs block">Reset Data Demo</strong>
            <span className="text-[10px] text-[#7F8C8D]">Hapus cache lokal dan kembalikan ke kondisi awal</span>
          </div>
          <button
            type="button"
            onClick={onResetDemo}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-all shrink-0"
          >
            Reset Demo
          </button>
        </div>
      </div>
    </div>
  );
};
