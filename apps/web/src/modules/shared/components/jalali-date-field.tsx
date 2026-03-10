'use client';

import { useMemo, useState } from 'react';

import {
  buildJalaliYearOptions,
  formatIsoToJalaliLabel,
  getJalaliMonthLength,
  isoDateToJalali,
  jalaliToIsoStartOfDayUtc,
  todayJalali,
  type JalaliDateParts,
} from '../date/jalali-date';

type JalaliDateFieldProps = {
  name: string;
  defaultIsoDate?: string;
  required?: boolean;
};

const MONTH_LABELS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

function parseInitialDate(defaultIsoDate?: string): JalaliDateParts {
  if (!defaultIsoDate) {
    return todayJalali();
  }

  try {
    return isoDateToJalali(defaultIsoDate);
  } catch {
    return todayJalali();
  }
}

function toFarsiNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}

export function JalaliDateField({ name, defaultIsoDate, required = false }: JalaliDateFieldProps) {
  const initialDate = parseInitialDate(defaultIsoDate);
  const [selectedDate, setSelectedDate] = useState<JalaliDateParts>(initialDate);

  const yearOptions = useMemo(
    () => buildJalaliYearOptions(initialDate.year, 2, 2),
    [initialDate.year],
  );
  const dayOptions = useMemo(
    () => Array.from({ length: getJalaliMonthLength(selectedDate.year, selectedDate.month) }, (_, index) => index + 1),
    [selectedDate.year, selectedDate.month],
  );

  const isoValue = useMemo(
    () => jalaliToIsoStartOfDayUtc(selectedDate.year, selectedDate.month, selectedDate.day),
    [selectedDate.year, selectedDate.month, selectedDate.day],
  );

  function onYearChange(nextYear: number): void {
    setSelectedDate((previousDate) => {
      const monthLength = getJalaliMonthLength(nextYear, previousDate.month);
      return {
        year: nextYear,
        month: previousDate.month,
        day: Math.min(previousDate.day, monthLength),
      };
    });
  }

  function onMonthChange(nextMonth: number): void {
    setSelectedDate((previousDate) => {
      const monthLength = getJalaliMonthLength(previousDate.year, nextMonth);
      return {
        year: previousDate.year,
        month: nextMonth,
        day: Math.min(previousDate.day, monthLength),
      };
    });
  }

  function onDayChange(nextDay: number): void {
    setSelectedDate((previousDate) => ({
      year: previousDate.year,
      month: previousDate.month,
      day: nextDay,
    }));
  }

  return (
    <div className="jalali-date-field">
      <input type="hidden" name={name} value={isoValue} required={required} />

      <div className="jalali-date-field__inputs">
        <label className="jalali-date-field__part">
          <span className="jalali-date-field__part-label">روز</span>
          <select
            value={selectedDate.day}
            onChange={(event) => onDayChange(Number(event.target.value))}
            aria-label="روز تاریخ شمسی"
          >
            {dayOptions.map((day) => (
              <option key={day} value={day}>
                {toFarsiNumber(day)}
              </option>
            ))}
          </select>
        </label>

        <label className="jalali-date-field__part">
          <span className="jalali-date-field__part-label">ماه</span>
          <select
            value={selectedDate.month}
            onChange={(event) => onMonthChange(Number(event.target.value))}
            aria-label="ماه تاریخ شمسی"
          >
            {MONTH_LABELS.map((monthLabel, monthIndex) => (
              <option key={monthLabel} value={monthIndex + 1}>
                {monthLabel}
              </option>
            ))}
          </select>
        </label>

        <label className="jalali-date-field__part">
          <span className="jalali-date-field__part-label">سال</span>
          <select
            value={selectedDate.year}
            onChange={(event) => onYearChange(Number(event.target.value))}
            aria-label="سال تاریخ شمسی"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {toFarsiNumber(year)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="jalali-date-field__preview">تاریخ انتخاب شده: {formatIsoToJalaliLabel(isoValue)}</p>
    </div>
  );
}

