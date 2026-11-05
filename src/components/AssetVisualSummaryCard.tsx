import React, { useState } from 'react';
import { Asset, AssetLoan, ConditionType } from '../types';
import { PieChart, BarChart3, CheckCircle2, AlertTriangle, ShieldAlert, Clock, ArrowLeftRight, Activity } from 'lucide-react';

interface AssetVisualSummaryCardProps {
  assets: Asset[];
  loans: AssetLoan[];
  selectedUnit?: string;
}

export const AssetVisualSummaryCard: React.FC<AssetVisualSummaryCardProps> = ({
  assets,
  loans,
  selectedUnit = 'Semua',
}) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [activeHoverCondition, setActiveHoverCondition] = useState<ConditionType | null>(null);

  // Filter assets by selected unit
  const filteredAssets = assets.filter((a) => {
    if (selectedUnit !== 'Semua' && a.Unit_Kerja !== selectedUnit) return false;
    return true;
  });

  const totalCount = filteredAssets.length;

  // Condition counts
  const conditionCounts: Record<ConditionType, number> = {
    Baik: filteredAssets.filter((a) => a.Kondisi === 'Baik').length,
    'Rusak Ringan': filteredAssets.filter((a) => a.Kondisi === 'Rusak Ringan').length,
    'Rusak Berat': filteredAssets.filter((a) => a.Kondisi === 'Rusak Berat').length,
    Hilang: filteredAssets.filter((a) => a.Kondisi === 'Hilang').length,
    Musnah: filteredAssets.filter((a) => a.Kondisi === 'Musnah').length,
  };

  // Operational Loan status counts
  const tersediaCount = filteredAssets.filter(
    (a) => a.Status_Pinjam === 'Tersedia' || !a.Status_Pinjam
  ).length;
  const dipinjamCount = filteredAssets.filter((a) => a.Status_Pinjam === 'Dipinjam').length;
  const overdueCount = loans.filter((l) => l.Status_Pinjam === 'Overdue').length;

  // Color map for physical conditions
  const conditionConfig: Record<
    ConditionType,
    { label: string; color: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    Baik: {
      label: 'Baik',
      color: '#2D7D62',
      bg: 'bg-[#2D7D62]/10',
      text: 'text-[#2D7D62]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#2D7D62]" />,
    },
    'Rusak Ringan': {
      label: 'Rusak Ringan',
      color: '#D97706',
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    },
    'Rusak Berat': {
      label: 'Rusak Berat',
      color: '#EA580C',
      bg: 'bg-orange-500/10',
      text: 'text-orange-600',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />,
    },
    Hilang: {
      label: 'Hilang',
      color: '#DC2626',
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
    },
    Musnah: {
      label: 'Musnah',
      color: '#475569',
      bg: 'bg-slate-500/10',
      text: 'text-slate-600',
      icon: <Clock className="w-3.5 h-3.5 text-slate-600" />,
    },
  };

  // SVG Donut calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89

  let accumulatedPercent = 0;
  const donutSegments = (Object.keys(conditionCounts) as ConditionType[]).map((cond) => {
    const count = conditionCounts[cond];
    const percent = totalCount > 0 ? (count / totalCount) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;

    return {
      condition: cond,
      count,
      percent: Math.round(percent),
      strokeDasharray,
      strokeDashoffset,
      config: conditionConfig[cond],
    };
  });

  return (
    <div className="bg-[#F2F4F3] rounded-2xl p-4 border border-[#e2e6e4] shadow-xs space-y-4 text-xs text-[#2C3E50]">
      {/* Module Header & Chart Type Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#2D7D62]" />
          <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">
            Kondisi Aset
          </h3>
        </div>

        {/* View Segmented Switcher */}
        <div className="flex bg-white rounded-lg p-0.5 border border-[#e2e6e4] text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              chartType === 'donut' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Lingkar</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              chartType === 'bar' ? 'bg-[#2D7D62] text-white shadow-xs' : 'text-[#7F8C8D] hover:text-[#2C3E50]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span> Batang</span>
          </button>
        </div>
      </div>

      {/* Primary Visual Canvas */}
      {chartType === 'donut' ? (
        /* Donut Chart View */
        <div className="bg-white rounded-xl p-4 border border-[#e2e6e4] grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* SVG Donut Ring */}
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-36 h-36 transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#F2F4F3"
                strokeWidth="12"
              />
              {totalCount > 0 &&
                donutSegments.map((seg) => (
                  <circle
                    key={seg.condition}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={seg.config.color}
                    strokeWidth={activeHoverCondition === seg.condition ? "15" : "12"}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setActiveHoverCondition(seg.condition)}
                    onMouseLeave={() => setActiveHoverCondition(null)}
                  />
                ))}
            </svg>

            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] text-[#7F8C8D] font-bold uppercase tracking-wide">
                Total Aset
              </span>
              <span className="text-xl font-extrabold text-[#2C3E50] font-mono tabular-nums">
                {totalCount}
              </span>
              <span className="text-[9px] text-[#2D7D62] font-semibold">
                {selectedUnit === 'Semua' ? 'Seluruh Unit' : selectedUnit}
              </span>
            </div>
          </div>

          {/* Condition Breakdown Legend List */}
          <div className="space-y-1.5">
            {donutSegments.map((seg) => (
              <div
                key={seg.condition}
                onMouseEnter={() => setActiveHoverCondition(seg.condition)}
                onMouseLeave={() => setActiveHoverCondition(null)}
                className={`p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                  activeHoverCondition === seg.condition
                    ? 'bg-[#A8E6CF]/20 border-[#2D7D62] shadow-xs scale-[1.02]'
                    : 'bg-[#F2F4F3]/50 border-transparent hover:bg-[#F2F4F3]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.config.color }}
                  />
                  <span className="text-xs font-semibold text-[#2C3E50]">{seg.condition}</span>
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                  <span className="font-bold text-[#2C3E50]">{seg.count} Aset</span>
                  <span className="text-[10px] text-[#7F8C8D] bg-white px-1.5 py-0.5 rounded-md border border-[#e2e6e4]">
                    {seg.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Stacked Horizontal Bar Chart View */
        <div className="bg-white rounded-xl p-4 border border-[#e2e6e4] space-y-3">
          <div className="flex justify-between items-center text-[11px] text-[#7F8C8D] font-semibold">
            <span>Proporsi Fisik Terdistribusi:</span>
            <span className="font-mono">{totalCount} Total Barang</span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="w-full h-5 rounded-xl bg-[#F2F4F3] flex overflow-hidden border border-[#e2e6e4] p-0.5">
            {donutSegments.map(
              (seg) =>
                seg.count > 0 && (
                  <div
                    key={seg.condition}
                    style={{
                      width: `${seg.percent}%`,
                      backgroundColor: seg.config.color,
                    }}
                    title={`${seg.condition}: ${seg.count} unit (${seg.percent}%)`}
                    onMouseEnter={() => setActiveHoverCondition(seg.condition)}
                    onMouseLeave={() => setActiveHoverCondition(null)}
                    className="h-full first:rounded-l-lg last:rounded-r-lg transition-all hover:opacity-90 cursor-pointer"
                  />
                )
            )}
          </div>

          {/* Individual Detailed Progress Meters */}
          <div className="space-y-2 pt-1">
            {donutSegments.map((seg) => (
              <div key={seg.condition} className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold text-[#2C3E50]">
                    {seg.config.icon} {seg.condition}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-[#2C3E50]">
                    {seg.count} Aset ({seg.percent}%)
                  </span>
                </div>
                <div className="w-full bg-[#F2F4F3] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${seg.percent}%`,
                      backgroundColor: seg.config.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operational Loan Status Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-[10px] text-emerald-800 font-bold block">Tersedia</span>
          <span className="text-sm font-extrabold text-[#2D7D62] font-mono tabular-nums">
            {tersediaCount} Aset
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <span className="text-[10px] text-amber-800 font-bold block">Dipinjam</span>
          <span className="text-sm font-extrabold text-amber-700 font-mono tabular-nums">
            {dipinjamCount} Aset
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
          <span className="text-[10px] text-rose-800 font-bold block">Overdue</span>
          <span className="text-sm font-extrabold text-rose-700 font-mono tabular-nums">
            {overdueCount} Aset
          </span>
        </div>
      </div>
    </div>
  );
};
