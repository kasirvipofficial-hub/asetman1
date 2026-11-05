import React from 'react';
import { LayoutDashboard, Boxes, Zap, QrCode, Settings } from 'lucide-react';

export type TabType = 'dashboard' | 'assets' | 'audit' | 'settings';

interface BottomNavProps {
  activeTab: TabType | string;
  isAuditViewActive?: boolean;
  onTabChange: (tab: TabType) => void;
  onOpenActionHub: () => void;
  pendingAuditCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  isAuditViewActive = false,
  onTabChange,
  onOpenActionHub,
  pendingAuditCount,
}) => {
  const isDashboardActive = activeTab === 'dashboard' && !isAuditViewActive;
  const isAssetsActive = activeTab === 'assets' && !isAuditViewActive;
  const isAuditActive = isAuditViewActive || activeTab === 'audit';
  const isSettingsActive = activeTab === 'settings' && !isAuditViewActive;

  return (
    <nav className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border-t border-[#F2F4F3] transition-colors pb-safe shadow-lg">
      <div className="grid grid-cols-5 items-center w-full h-16 px-1 max-w-xl mx-auto relative">
        {/* 1. Dashboard Tab */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center relative h-full transition-all ${
            isDashboardActive ? 'text-[#2D7D62] font-bold' : 'text-[#7F8C8D] hover:text-[#2C3E50] font-medium'
          }`}
        >
          {isDashboardActive && (
            <span className="absolute top-0 w-6 h-1 bg-[#2D7D62] rounded-b-full transition-all" />
          )}
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Dashboard</span>
        </button>

        {/* 2. Katalog Aset Tab */}
        <button
          onClick={() => onTabChange('assets')}
          className={`flex flex-col items-center justify-center relative h-full transition-all ${
            isAssetsActive ? 'text-[#2D7D62] font-bold' : 'text-[#7F8C8D] hover:text-[#2C3E50] font-medium'
          }`}
        >
          {isAssetsActive && (
            <span className="absolute top-0 w-6 h-1 bg-[#2D7D62] rounded-b-full transition-all" />
          )}
          <Boxes className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Aset</span>
        </button>

        {/* 3. Center Prominent Floating Action Hub Button */}
        <div className="flex items-center justify-center relative -top-3">
          <button
            onClick={onOpenActionHub}
            className="w-13 h-13 rounded-2xl bg-[#2D7D62] hover:bg-[#23634e] text-white flex flex-col items-center justify-center shadow-lg shadow-[#2D7D62]/30 hover:scale-105 active:scale-95 transition-all border-2 border-white ring-2 ring-[#A8E6CF]"
            title="Menu Aksi Aset"
          >
            <Zap className="w-6 h-6 fill-white text-white" />
          </button>
        </div>

        {/* 4. Stock Opname / Audit Tab */}
        <button
          onClick={() => onTabChange('audit')}
          className={`flex flex-col items-center justify-center relative h-full transition-all ${
            isAuditActive ? 'text-[#2D7D62] font-bold' : 'text-[#7F8C8D] hover:text-[#2C3E50] font-medium'
          }`}
        >
          {isAuditActive && (
            <span className="absolute top-0 w-6 h-1 bg-[#2D7D62] rounded-b-full transition-all" />
          )}
          <div className="relative">
            <QrCode className="w-5 h-5" />
            {pendingAuditCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white font-mono font-bold text-[9px] min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center border border-white shadow-xs">
                {pendingAuditCount > 99 ? '99+' : pendingAuditCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Audit</span>
        </button>

        {/* 5. Pengaturan Tab */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center relative h-full transition-all ${
            isSettingsActive ? 'text-[#2D7D62] font-bold' : 'text-[#7F8C8D] hover:text-[#2C3E50] font-medium'
          }`}
        >
          {isSettingsActive && (
            <span className="absolute top-0 w-6 h-1 bg-[#2D7D62] rounded-b-full transition-all" />
          )}
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Setelan</span>
        </button>
      </div>
    </nav>
  );
};
