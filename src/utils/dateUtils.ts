/**
 * Formats ISO or YYYY-MM-DD date strings into human-readable Indonesian format
 */
export function formatDateIndonesian(dateStr?: string | null): string {
  if (!dateStr || dateStr === '-' || dateStr === 'Sebelumnya') return dateStr || '-';

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

  try {
    const trimmed = String(dateStr).trim();

    // Check simple YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = days[dateObj.getDay()];
      const monthName = months[m - 1];
      return `${dayName}, ${d} ${monthName} ${y}`;
    }

    // Check YYYY-MM-DD HH:mm or HH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(trimmed)) {
      const [datePart, timePart] = trimmed.split(/\s+/);
      const [y, m, d] = datePart.split('-').map(Number);
      const timeClean = timePart.substring(0, 5); // HH:mm
      const dateObj = new Date(y, m - 1, d);
      const dayName = days[dateObj.getDay()];
      const monthName = months[m - 1];
      return `${dayName}, ${d} ${monthName} ${y} jam ${timeClean}`;
    }

    // Standard Date parse for ISO string
    const dObj = new Date(trimmed);
    if (!isNaN(dObj.getTime())) {
      const dayName = days[dObj.getDay()];
      const dateNum = dObj.getDate();
      const monthName = months[dObj.getMonth()];
      const year = dObj.getFullYear();
      const hours = String(dObj.getHours()).padStart(2, '0');
      const mins = String(dObj.getMinutes()).padStart(2, '0');

      if (trimmed.includes('T') || trimmed.includes(':')) {
        return `${dayName}, ${dateNum} ${monthName} ${year} ${hours}:${mins}`;
      }
      return `${dayName}, ${dateNum} ${monthName} ${year}`;
    }

    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatRupiah(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function calculateDepreciation(
  hargaPerolehan: number = 0,
  tahunBeli: number | string = new Date().getFullYear(),
  masaManfaat: number = 4
): { nilaiBuku: number; depresiasiPerTahun: number; umurAsetTahun: number } {
  const currentYear = new Date().getFullYear();
  const yearAcquired = Number(tahunBeli) || currentYear;
  const umurAsetTahun = Math.max(0, currentYear - yearAcquired);

  const depresiasiPerTahun = masaManfaat > 0 ? hargaPerolehan / masaManfaat : 0;
  const akumulasiDepresiasi = Math.min(hargaPerolehan, depresiasiPerTahun * umurAsetTahun);
  const nilaiBuku = Math.max(0, hargaPerolehan - akumulasiDepresiasi);

  return {
    nilaiBuku,
    depresiasiPerTahun,
    umurAsetTahun,
  };
}
