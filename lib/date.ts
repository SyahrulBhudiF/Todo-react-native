import type { CompletedByDay } from '@/types';

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseISODate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatIndonesianDate(isoDate: string) {
  const date = parseISODate(isoDate);
  return `${String(date.getDate()).padStart(2, '0')} ${INDONESIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatTodayLong() {
  const date = new Date();
  return `${INDONESIAN_DAYS[date.getDay()]}, ${date.getDate()} ${INDONESIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function getLastSevenDays(): CompletedByDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    return {
      date: toISODate(date),
      label: INDONESIAN_DAYS[date.getDay()].slice(0, 3),
      count: 0,
    };
  });
}
