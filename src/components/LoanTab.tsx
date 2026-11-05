import React, { useState } from 'react';
import { AssetLoan, UserRole } from '../types';
import { formatDateIndonesian } from '../utils/dateUtils';
import { Plus, ArrowLeftRight, Clock, AlertTriangle, CheckCircle, User, Calendar, FileText } from 'lucide-react';

interface LoanTabProps {
  loans: AssetLoan[];
  userRole: UserRole;
  onOpenNewLoanDrawer: () => void;
  onOpenReturnLoanDrawer: (loan: AssetLoan) => void;
}

export const LoanTab: React.FC<LoanTabProps> = ({
  loans,
  userRole,
  onOpenNewLoanDrawer,
  onOpenReturnLoanDrawer,
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Dipinjam' | 'Overdue' | 'Dikembalikan'>('Dipinjam');

  const filteredLoans = loans.filter((l) => {
    if (filterStatus === 'Dipinjam') return l.Status_Pinjam === 'Dipinjam';
    if (filterStatus === 'Overdue') return l.Status_Pinjam === 'Overdue';
    if (filterStatus === 'Dikembalikan') return l.Status_Pinjam === 'Dikembalikan';
    return true;
  });

  const activeCount = loans.filter((l) => l.Status_Pinjam === 'Dipinjam').length;
  const overdueCount = loans.filter((l) => l.Status_Pinjam === 'Overdue').length;

  return (
    <div className="space-y-4 pb-24 pt-2 animate-in fade-in text-xs text-[#2C3E50]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#2C3E50] tracking-tight">Log Peminjaman & Pemakaian</h2>
          <p className="text-[11px] text-[#7F8C8D]">Peminjaman Aset Sementara & Penanggung Jawab</p>
        </div>

        <button
          onClick={onOpenNewLoanDrawer}
          className="flex items-center gap-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Pinjam </span>
        </button>
      </div>

      {/* Status Segment Filter Bar */}
      <div className="flex rounded-xl p-1 bg-[#F2F4F3] border border-[#e2e6e4] text-xs font-semibold">
        <button
          onClick={() => setFilterStatus('Dipinjam')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            filterStatus === 'Dipinjam' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
          }`}
        >
          <span>Active ({activeCount})</span>
        </button>
        <button
          onClick={() => setFilterStatus('Overdue')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            filterStatus === 'Overdue' ? 'bg-amber-600 text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
          }`}
        >
          <span>Overdue ({overdueCount})</span>
        </button>
        <button
          onClick={() => setFilterStatus('Dikembalikan')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            filterStatus === 'Dikembalikan' ? 'bg-white text-[#2C3E50] border border-[#e2e6e4]' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
          }`}
        >
          <span>Selesai</span>
        </button>
        <button
          onClick={() => setFilterStatus('All')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            filterStatus === 'All' ? 'bg-white text-[#2C3E50] border border-[#e2e6e4]' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
          }`}
        >
          <span>Semua ({loans.length})</span>
        </button>
      </div>

      {/* Loan List Cards */}
      <div className="space-y-3">
        {filteredLoans.length === 0 ? (
          <div className="p-8 text-center bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl text-[#7F8C8D]">
            Belum ada data peminjaman aset pada status ini.
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div
              key={loan.ID_Pinjam}
              className="bg-[#F2F4F3] border border-[#e2e6e4] rounded-2xl p-4 shadow-xs space-y-3 hover:border-[#2D7D62]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-[#2D7D62] text-xs">
                    {loan.ID_Asset}
                  </span>
                  <h3 className="text-sm font-bold text-[#2C3E50] mt-0.5">{loan.Nama_Asset}</h3>
                  <div className="text-[11px] text-[#7F8C8D] flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#2D7D62]" />
                    <span>Peminjam: <strong className="text-[#2C3E50]">{loan.Nama_Peminjam}</strong> ({loan.Unit_Peminjam})</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    loan.Status_Pinjam === 'Dipinjam'
                      ? 'bg-[#A8E6CF] text-[#2D7D62]'
                      : loan.Status_Pinjam === 'Overdue'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {loan.Status_Pinjam}
                </span>
              </div>

              {/* Dates & Purpose info */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-white border border-[#e2e6e4] rounded-xl text-[11px]">
                <div>
                  <span className="text-[#7F8C8D] block">Tgl Pinjam:</span>
                  <span className="text-[#2C3E50] font-medium">{formatDateIndonesian(loan.Tanggal_Pinjam)}</span>
                </div>
                <div>
                  <span className="text-[#7F8C8D] block">Target Kembali:</span>
                  <span className="text-amber-700 font-bold">{formatDateIndonesian(loan.Target_Kembali)}</span>
                </div>
              </div>

              {loan.Keperluan && (
                <p className="text-[11px] text-[#7F8C8D] italic bg-white p-2 rounded-lg border border-[#e2e6e4]">
                  Keperluan: "{loan.Keperluan}"
                </p>
              )}

              {/* Footer Return Action */}
              {loan.Status_Pinjam !== 'Dikembalikan' && (
                <div className="pt-2 border-t border-[#e2e6e4] flex justify-end">
                  <button
                    onClick={() => onOpenReturnLoanDrawer(loan)}
                    className="flex items-center gap-1.5 bg-[#2D7D62] hover:bg-[#23634e] text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Proses Pengembalian Aset</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
