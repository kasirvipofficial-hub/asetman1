import React, { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { SesiSO, Asset } from '../types';
import {
  Calendar,
  UserCheck,
  Building2,
  Tag,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Plus,
  Play,
  Clock,
  Sparkles,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { formatDateIndonesian } from '../utils/dateUtils';

interface SessionManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SesiSO[];
  activeSessionId: string;
  assets: Asset[];
  categories: string[];
  units: string[];
  onSelectActiveSession: (sessionId: string) => void;
  onGoToAudit: (sessionId: string) => void;
  onOpenReport: (session: SesiSO) => void;
  onOpenCreateSession: () => void;
  onUpdateSession: (updatedSession: SesiSO) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionManagementDrawer: React.FC<SessionManagementDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  assets,
  categories,
  units,
  onSelectActiveSession,
  onGoToAudit,
  onOpenReport,
  onOpenCreateSession,
  onUpdateSession,
  onDeleteSession,
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState<string>('');
  const [editAuditor, setEditAuditor] = useState<string>('');
  const [editTanggal, setEditTanggal] = useState<string>('');
  const [editUnit, setEditUnit] = useState<string>('Semua');
  const [editKategori, setEditKategori] = useState<string>('Semua');
  const [editLokasi, setEditLokasi] = useState<string>('Semua');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startEditing = (s: SesiSO) => {
    setEditingSessionId(s.ID_Sesi);
    setEditNama(s.Nama_Sesi);
    setEditAuditor(s.Petugas_Utama);
    setEditTanggal(s.Tanggal_Mulai);
    setEditUnit(s.Target_Unit_Kerja || 'Semua');
    setEditKategori(s.Scope_Kategori || 'Semua');
    setEditLokasi(s.Scope_Lokasi || 'Semua');
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
  };

  const handleSaveEdit = (s: SesiSO) => {
    if (!editNama.trim() || !editAuditor.trim()) return;
    onUpdateSession({
      ...s,
      Nama_Sesi: editNama.trim(),
      Petugas_Utama: editAuditor.trim(),
      Tanggal_Mulai: editTanggal,
      Target_Unit_Kerja: editUnit,
      Scope_Kategori: editKategori,
      Scope_Lokasi: editLokasi,
    });
    setEditingSessionId(null);
  };

  // Helper to compute progress per session
  const getSessionStats = (s: SesiSO) => {
    const targetUnit = s.Target_Unit_Kerja || 'Semua';
    const scopeCat = s.Scope_Kategori || 'Semua';
    const scopeLoc = s.Scope_Lokasi || 'Semua';

    const scopedAssets = assets.filter((a) => {
      if (targetUnit !== 'Semua' && a.Unit_Kerja !== targetUnit) return false;
      if (scopeCat !== 'Semua' && a.Kategori !== scopeCat) return false;
      if (scopeLoc !== 'Semua' && a.Lokasi !== scopeLoc) return false;
      return true;
    });

    const total = scopedAssets.length;
    const verified = scopedAssets.filter((a) => a.Status_Audit === 'Sudah SO').length;
    const percent = total > 0 ? Math.round((verified / total) * 100) : 0;

    return { total, verified, percent };
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Daftar & Manajemen Sesi Stock Opname"
      subtitle="Kelola status aktif, edit, hapus, dan lihat rekapitulasi pelaporan audit"
      maxHeightClass="max-h-[92vh]"
    >
      <div className="space-y-2.5 pt-0.5 pb-5 text-xs text-[#2C3E50]">
        {/* Top Action Shortcut: Add New Session */}
        <div className="flex items-center justify-between pb-0.5">
          <span className="text-[11px] font-bold text-[#7F8C8D]">
            {sessions.length} Sesi Terdaftar
          </span>

          <button
            onClick={() => {
              onClose();
              onOpenCreateSession();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-[11px] rounded-lg shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Buat Sesi Baru</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="space-y-2">
          {sessions.map((session) => {
            const isActive = session.ID_Sesi === activeSessionId;
            const isEditing = editingSessionId === session.ID_Sesi;
            const stats = getSessionStats(session);

            return (
              <div
                key={session.ID_Sesi}
                className={`p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-white border-[#2D7D62] ring-1.5 ring-[#2D7D62]/20 shadow-xs'
                    : 'bg-[#F8FAFC] border-[#e2e6e4] hover:border-[#2D7D62]/40'
                }`}
              >
                {/* Editing Form Inline (Compact) */}
                {isEditing ? (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-[#e2e6e4] pb-1.5">
                      <span className="text-[11px] font-bold text-[#2D7D62] flex items-center gap-1">
                        <Edit2 className="w-3 h-3" />
                        Edit Sesi: <span className="font-mono">{session.ID_Sesi}</span>
                      </span>
                      <button
                        onClick={cancelEditing}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                        Nama Sesi SO
                      </label>
                      <input
                        type="text"
                        value={editNama}
                        onChange={(e) => setEditNama(e.target.value)}
                        className="w-full bg-white text-slate-900 border border-[#e2e6e4] rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D7D62]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Auditor
                        </label>
                        <input
                          type="text"
                          value={editAuditor}
                          onChange={(e) => setEditAuditor(e.target.value)}
                          className="w-full bg-white text-slate-900 border border-[#e2e6e4] rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D7D62]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Tanggal Mulai
                        </label>
                        <input
                          type="date"
                          value={editTanggal}
                          onChange={(e) => setEditTanggal(e.target.value)}
                          className="w-full bg-white text-slate-900 border border-[#e2e6e4] rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D7D62]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Scope Unit
                        </label>
                        <select
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          className="w-full bg-white text-slate-900 border border-[#e2e6e4] rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
                        >
                          <option value="Semua">Semua Unit</option>
                          {units.filter((u) => u && u.trim() !== 'Semua').map((u, idx) => (
                            <option key={`edit-unit-${u}-${idx}`} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                          Scope Kategori
                        </label>
                        <select
                          value={editKategori}
                          onChange={(e) => setEditKategori(e.target.value)}
                          className="w-full bg-white text-slate-900 border border-[#e2e6e4] rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
                        >
                          <option value="Semua">Semua Kategori</option>
                          {categories.filter((c) => c && c.trim() !== 'Semua').map((c, idx) => (
                            <option key={`edit-cat-${c}-${idx}`} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-[#e2e6e4]">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-2.5 py-1 rounded-lg border border-[#e2e6e4] text-[#7F8C8D] font-bold text-[11px] hover:bg-[#F2F4F3]"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(session)}
                        className="px-3 py-1 rounded-lg bg-[#2D7D62] hover:bg-[#23634e] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Simpan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Compact Session Card */
                  <div className="space-y-1.5">
                    {/* Header Row: ID Badge, Name, Active Indicator, & Stat */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-1.5 flex-1">
                        <span className="font-mono font-bold text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">
                          {session.ID_Sesi}
                        </span>

                        <h4 className="text-xs font-bold text-[#2C3E50] truncate">
                          {session.Nama_Sesi}
                        </h4>

                        {isActive && (
                          <span className="shrink-0 text-[9px] font-bold bg-[#A8E6CF]/70 text-[#2D7D62] border border-[#2D7D62]/30 px-1.5 py-0.2 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2D7D62] animate-pulse" />
                            Aktif
                          </span>
                        )}
                      </div>

                      {/* Stat % and count */}
                      <div className="shrink-0 flex items-baseline gap-1">
                        <span className="text-xs font-black text-[#2D7D62] font-mono tabular-nums">
                          {stats.percent}%
                        </span>
                        <span className="text-[10px] text-[#7F8C8D] font-mono tabular-nums">
                          ({stats.verified}/{stats.total})
                        </span>
                      </div>
                    </div>

                    {/* Slim Progress Bar */}
                    <div className="w-full bg-[#e2e6e4] rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-[#2D7D62] h-full rounded-full transition-all duration-300"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>

                    {/* Metadata Strip: Auditor, Scope, Date */}
                    <div className="flex items-center justify-between text-[10px] text-[#7F8C8D] gap-1 truncate pt-0.5">
                      <div className="flex items-center gap-1 truncate">
                        <UserCheck className="w-3 h-3 text-[#2D7D62] shrink-0" />
                        <span className="truncate">Auditor: <strong className="text-[#2C3E50] font-semibold">{session.Petugas_Utama}</strong></span>
                        <span className="text-slate-300">·</span>
                        <span className="truncate">Unit: {session.Target_Unit_Kerja || 'Semua'}</span>
                        {session.Scope_Kategori && session.Scope_Kategori !== 'Semua' && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="truncate">Kat: {session.Scope_Kategori}</span>
                          </>
                        )}
                      </div>
                      <span className="shrink-0 font-mono text-[9px]">
                        {session.Tanggal_Mulai}
                      </span>
                    </div>

                    {/* Delete Confirmation Alert if triggered */}
                    {confirmDeleteId === session.ID_Sesi && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5 animate-in fade-in text-xs">
                        <p className="text-[11px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Hapus sesi {session.Nama_Sesi}?
                        </p>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 rounded border border-rose-200 text-[11px] font-bold hover:bg-white"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => {
                              onDeleteSession(session.ID_Sesi);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold"
                          >
                            Ya, Hapus
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Compact Action Strip */}
                    <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-[#e2e6e4]/80">
                      <div className="flex items-center gap-1">
                        {/* Laporan Sesi */}
                        <button
                          onClick={() => {
                            onClose();
                            onOpenReport(session);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 text-[#2C3E50] border border-[#e2e6e4] font-bold text-[10px] rounded-lg transition-all shadow-2xs"
                          title="Lihat Laporan & Ekspor Excel"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                          <span>Laporan & Excel</span>
                        </button>

                        {/* Edit Sesi */}
                        <button
                          onClick={() => startEditing(session)}
                          className="p-1 rounded-lg hover:bg-white text-[#7F8C8D] hover:text-[#2C3E50] border border-transparent hover:border-[#e2e6e4] transition-all"
                          title="Edit Info Sesi SO"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        {/* Hapus Sesi */}
                        <button
                          onClick={() => setConfirmDeleteId(session.ID_Sesi)}
                          disabled={sessions.length <= 1}
                          className="p-1 rounded-lg hover:bg-rose-50 text-[#7F8C8D] hover:text-rose-600 border border-transparent hover:border-rose-200 transition-all disabled:opacity-25"
                          title={sessions.length <= 1 ? 'Minimal 1 sesi' : 'Hapus Sesi'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Right Action: Lanjutkan Audit / Jadikan Aktif */}
                      <button
                        onClick={() => {
                          onClose();
                          onGoToAudit(session.ID_Sesi);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all active:scale-95 shadow-2xs ${
                          isActive
                            ? 'bg-[#2D7D62] hover:bg-[#23634e] text-white'
                            : 'bg-white hover:bg-[#A8E6CF]/25 text-[#2D7D62] border border-[#2D7D62]/40'
                        }`}
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{isActive ? 'Buka Audit' : 'Pilih Sesi'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
};
