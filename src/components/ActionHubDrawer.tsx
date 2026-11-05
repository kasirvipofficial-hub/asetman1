import React from 'react';
import { BottomSheet } from './BottomSheet';
import {
  ArrowLeftRight,
  CheckCircle2,
  FileCheck2,
  Building2,
  Flame,
  QrCode,
  Printer,
  Plus,
  History,
} from 'lucide-react';

interface ActionHubDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onActionSelect: (actionKey: string) => void;
  userRole: string;
}

export const ActionHubDrawer: React.FC<ActionHubDrawerProps> = ({
  isOpen,
  onClose,
  onActionSelect,
  userRole,
}) => {
  const actions = [
    ...(userRole === 'Admin'
      ? [
          {
            key: 'add_asset',
            title: ' Aset',
            description: 'Input barang baru & nomor tag',
            icon: Plus,
            bg: 'bg-[#A8E6CF]/30 border-[#2D7D62]/30 text-[#2C3E50]',
            iconBg: 'bg-[#2D7D62] text-white',
          },
        ]
      : []),
    {
      key: 'new_loan',
      title: 'Pinjam Aset',
      description: 'Catat peminjaman & TTD digital',
      icon: ArrowLeftRight,
      bg: 'bg-[#F2F4F3] border-[#e2e6e4] text-[#2C3E50]',
      iconBg: 'bg-[#2D7D62] text-white',
    },
    {
      key: 'return_loan',
      title: 'Pengembalian',
      description: 'Verifikasi kondisi & bebaskan aset',
      icon: CheckCircle2,
      bg: 'bg-[#F2F4F3] border-[#e2e6e4] text-[#2C3E50]',
      iconBg: 'bg-[#2D7D62] text-white',
    },
    {
      key: 'bast_penerimaan',
      title: 'BAST Penerimaan',
      description: 'Serah terima barang baru',
      icon: FileCheck2,
      bg: 'bg-[#F2F4F3] border-[#e2e6e4] text-[#2C3E50]',
      iconBg: 'bg-blue-600 text-white',
    },
    {
      key: 'ba_mutasi',
      title: 'BA Mutasi',
      description: 'Pengalihan aset antar unit',
      icon: Building2,
      bg: 'bg-[#F2F4F3] border-[#e2e6e4] text-[#2C3E50]',
      iconBg: 'bg-indigo-600 text-white',
    },
    {
      key: 'ba_penghapusan',
      title: 'BA Penghapusan',
      description: 'Pemusnahan / apkir aset rusak',
      icon: Flame,
      bg: 'bg-[#F2F4F3] border-[#e2e6e4] text-[#2C3E50]',
      iconBg: 'bg-rose-600 text-white',
    },
    {
      key: 'audit_so',
      title: 'Mulai Stock Opname',
      description: 'Audit periodik & verifikasi fisik',
      icon: QrCode,
      bg: 'bg-[#F2F4F3] border-[#e2e6e4] text-[#2C3E50]',
      iconBg: 'bg-amber-600 text-white',
    },
    {
      key: 'manage_sessions',
      title: 'Laporan Sesi SO',
      description: 'Kelola sesi, rekap & ekspor Excel',
      icon: History,
      bg: 'bg-[#F2F4F3] border-[#e2e6e4] text-[#2C3E50]',
      iconBg: 'bg-[#2D7D62] text-white',
    },
    {
      key: 'print_barcode',
      title: 'Cetak Barcode',
      description: 'Stiker label thermal atau A4',
      icon: Printer,
      bg: 'bg-[#F2F4F3] border-[#e2e6e4] text-[#2C3E50]',
      iconBg: 'bg-purple-600 text-white',
    },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Menu Aksi Aset"
      subtitle="Pilih transaksi atau penerbitan dokumen"
      maxHeightClass="max-h-[85vh]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 pb-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.key}
              onClick={() => {
                onActionSelect(act.key);
                onClose();
              }}
              className={`p-3.5 rounded-2xl border ${act.bg} flex items-start gap-3.5 text-left transition-all active:scale-98 hover:brightness-95 shadow-xs`}
            >
              <div className={`w-10 h-10 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold tracking-tight text-[#2C3E50]">{act.title}</h4>
                <p className="text-[11px] text-[#7F8C8D] mt-0.5 leading-snug line-clamp-2">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};
