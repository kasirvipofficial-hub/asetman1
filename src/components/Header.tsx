import React from 'react';
import { Database, RefreshCw, Search, X, Building2, Camera } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  gasUrl: string;
  onOpenGasModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  userRole: UserRole;
  assignedUnit: string;
  onOpenScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gasUrl,
  onOpenGasModal,
  onRefresh,
  isLoading,
  searchQuery,
  onSearchChange,
  userRole,
  assignedUnit,
  onOpenScanner,
}) => {
  const isConnected = Boolean(gasUrl && gasUrl.trim().length > 0);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#F2F4F3] px-4 py-2.5 transition-colors shadow-xs">
      <div className="flex flex-col gap-2 max-w-xl mx-auto">
        {/* Top Row: Brand & System Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Lockup */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8.5 h-8.5 rounded-xl bg-[#2D7D62] flex items-center justify-center text-white shadow-sm shadow-[#2D7D62]/20 shrink-0">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-[#2C3E50] truncate">
                Assets Management
              </h1>
              <p className="text-[10px] text-[#7F8C8D] font-medium truncate flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#2D7D62] shrink-0" />
                <span>{userRole === 'Admin' ? 'Semua Unit (Admin)' : assignedUnit}</span>
              </p>
            </div>
          </div>

          {/* Controls: Connection & Refresh */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-1 bg-[#A8E6CF] text-[#2D7D62] text-[10px] font-bold rounded-lg shrink-0">
              {userRole}
            </span>

            <button
              onClick={onOpenGasModal}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                isConnected
                  ? 'bg-[#A8E6CF]/40 text-[#2D7D62] border-[#2D7D62]/30'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isConnected ? 'Google Sheets: Tersambung' : 'Google Sheets: Belum tersambung (Klik untuk setel)'}
            >
              <Database className="w-3.5 h-3.5" />
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#2D7D62]' : 'bg-amber-500 animate-pulse'}`} />
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-1.5 rounded-lg text-[#2C3E50] hover:bg-[#F2F4F3] transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Muat ulang data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Search Bar with Camera Scanner Button */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7F8C8D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari kode aset, nama barang, kategori, unit, S/N..."
              className="w-full bg-[#F2F4F3] text-[#2C3E50] placeholder-[#7F8C8D] border border-[#e2e6e4] rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D7D62] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#7F8C8D] hover:text-[#2C3E50]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="p-2 bg-[#2D7D62] hover:bg-[#23634e] text-white rounded-xl shadow-xs shrink-0 flex items-center justify-center transition-all active:scale-95"
              title="Buka Kamera Barcode / QR Scanner"
            >
              <Camera className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
