export type JalaliDateParts = {
  year: number;
  month: number;
  day: number;
};

type GregorianDateParts = {
  year: number;
  month: number;
  day: number;
};

const PERSIAN_DIGIT_MAP: Record<string, string> = {
  '0': '۰',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',
};

const JALALI_BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

function mod(a: number, b: number): number {
  return a - div(a, b) * b;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function toPersianDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => PERSIAN_DIGIT_MAP[digit] ?? digit);
}

function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const bl = JALALI_BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = JALALI_BREAKS[0];
  let jm = 0;
  let jump = 0;
  let n = 0;
  let leap = 0;

  if (jy < jp || jy >= JALALI_BREAKS[bl - 1]) {
    throw new Error(`invalid Jalali year: ${jy}`);
  }

  for (let i = 1; i < bl; i += 1) {
    jm = JALALI_BREAKS[i];
    jump = jm - jp;
    if (jy < jm) {
      break;
    }

    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }

  leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) {
    leap = 4;
  }

  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number): number {
  let dayNumber =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  dayNumber = dayNumber - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return dayNumber;
}

function d2g(dayNumber: number): GregorianDateParts {
  let j = 4 * dayNumber + 139361631;
  j = j + div(div(4 * dayNumber + 183187720, 146097) * 3, 4) * 4 - 3908;

  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);

  return {
    year: gy,
    month: gm,
    day: gd,
  };
}

function j2d(jy: number, jm: number, jd: number): number {
  const { gy, march } = jalCal(jy);
  return g2d(gy, 3, march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(dayNumber: number): JalaliDateParts {
  const gregorianDate = d2g(dayNumber);
  let jy = gregorianDate.year - 621;
  const calendar = jalCal(jy);
  const firstFarvardinDayNumber = g2d(gregorianDate.year, 3, calendar.march);
  let dayOffset = dayNumber - firstFarvardinDayNumber;

  if (dayOffset >= 0) {
    if (dayOffset <= 185) {
      return {
        year: jy,
        month: 1 + div(dayOffset, 31),
        day: mod(dayOffset, 31) + 1,
      };
    }

    dayOffset -= 186;
  } else {
    jy -= 1;
    dayOffset += 179;
    if (calendar.leap === 1) {
      dayOffset += 1;
    }
  }

  return {
    year: jy,
    month: 7 + div(dayOffset, 30),
    day: mod(dayOffset, 30) + 1,
  };
}

export function isLeapJalaliYear(jalaliYear: number): boolean {
  return jalCal(jalaliYear).leap === 0;
}

export function getJalaliMonthLength(jalaliYear: number, jalaliMonth: number): number {
  if (jalaliMonth <= 0 || jalaliMonth > 12) {
    throw new Error(`invalid Jalali month: ${jalaliMonth}`);
  }

  if (jalaliMonth <= 6) {
    return 31;
  }

  if (jalaliMonth <= 11) {
    return 30;
  }

  return isLeapJalaliYear(jalaliYear) ? 30 : 29;
}

export function jalaliToGregorian(jalaliYear: number, jalaliMonth: number, jalaliDay: number): GregorianDateParts {
  if (jalaliMonth <= 0 || jalaliMonth > 12) {
    throw new Error(`invalid Jalali month: ${jalaliMonth}`);
  }

  const monthLength = getJalaliMonthLength(jalaliYear, jalaliMonth);
  if (jalaliDay <= 0 || jalaliDay > monthLength) {
    throw new Error(`invalid Jalali day: ${jalaliDay}`);
  }

  return d2g(j2d(jalaliYear, jalaliMonth, jalaliDay));
}

export function gregorianToJalali(gregorianYear: number, gregorianMonth: number, gregorianDay: number): JalaliDateParts {
  return d2j(g2d(gregorianYear, gregorianMonth, gregorianDay));
}

export function todayJalali(): JalaliDateParts {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function jalaliToIsoStartOfDayUtc(jalaliYear: number, jalaliMonth: number, jalaliDay: number): string {
  const gregorianDate = jalaliToGregorian(jalaliYear, jalaliMonth, jalaliDay);
  return new Date(Date.UTC(gregorianDate.year, gregorianDate.month - 1, gregorianDate.day)).toISOString();
}

export function isoDateToJalali(isoDate: string): JalaliDateParts {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`invalid ISO date: ${isoDate}`);
  }

  return gregorianToJalali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function formatIsoToJalaliLabel(isoDate: string): string {
  const jalaliDate = isoDateToJalali(isoDate);
  const dateLabel = `${jalaliDate.year}/${pad2(jalaliDate.month)}/${pad2(jalaliDate.day)}`;
  return toPersianDigits(dateLabel);
}

export function buildJalaliYearOptions(centerYear: number, beforeYears = 2, afterYears = 2): number[] {
  const years: number[] = [];
  for (let year = centerYear - beforeYears; year <= centerYear + afterYears; year += 1) {
    years.push(year);
  }

  return years;
}
