'use client';

import { useMemo, useState } from 'react';

import {
  formatIsoToJalaliLabel,
  getJalaliMonthLength,
  isoDateToJalali,
  jalaliToGregorian,
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

const WEEKDAY_LABELS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

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

function resolveMonthShift(year: number, month: number, shift: number): { year: number; month: number } {
  let shiftedYear = year;
  let shiftedMonth = month + shift;

  while (shiftedMonth < 1) {
    shiftedMonth += 12;
    shiftedYear -= 1;
  }

  while (shiftedMonth > 12) {
    shiftedMonth -= 12;
    shiftedYear += 1;
  }

  return {
    year: shiftedYear,
    month: shiftedMonth,
  };
}

function getJalaliMonthStartOffset(year: number, month: number): number {
  const gregorianDate = jalaliToGregorian(year, month, 1);
  const jsWeekday = new Date(
    Date.UTC(gregorianDate.year, gregorianDate.month - 1, gregorianDate.day),
  ).getUTCDay();

  return (jsWeekday + 1) % 7;
}

export function JalaliDateField({ name, defaultIsoDate, required = false }: JalaliDateFieldProps) {
  const initialDate = parseInitialDate(defaultIsoDate);
  const [selectedDate, setSelectedDate] = useState<JalaliDateParts>(initialDate);
  const [calendarView, setCalendarView] = useState<{ year: number; month: number }>({
    year: initialDate.year,
    month: initialDate.month,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const monthLength = useMemo(
    () => getJalaliMonthLength(calendarView.year, calendarView.month),
    [calendarView.year, calendarView.month],
  );
  const monthStartOffset = useMemo(
    () => getJalaliMonthStartOffset(calendarView.year, calendarView.month),
    [calendarView.year, calendarView.month],
  );
  const dayOptions = useMemo(
    () => Array.from({ length: monthLength }, (_, index) => index + 1),
    [monthLength],
  );
  const calendarCells = useMemo(
    () => [...Array.from({ length: monthStartOffset }, () => null), ...dayOptions],
    [dayOptions, monthStartOffset],
  );
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let year = calendarView.year - 10; year <= calendarView.year + 10; year += 1) {
      years.push(year);
    }

    return years;
  }, [calendarView.year]);

  const isoValue = useMemo(
    () => jalaliToIsoStartOfDayUtc(selectedDate.year, selectedDate.month, selectedDate.day),
    [selectedDate.year, selectedDate.month, selectedDate.day],
  );

  function changeMonth(shift: number): void {
    setCalendarView((previousView) => resolveMonthShift(previousView.year, previousView.month, shift));
  }

  function onYearChange(nextYear: number): void {
    setCalendarView((previousView) => ({
      year: nextYear,
      month: previousView.month,
    }));
  }

  function onMonthChange(nextMonth: number): void {
    setCalendarView((previousView) => ({
      year: previousView.year,
      month: nextMonth,
    }));
  }

  function onDaySelect(day: number): void {
    setSelectedDate({
      year: calendarView.year,
      month: calendarView.month,
      day,
    });
    setIsCalendarOpen(false);
  }

  function onTodaySelect(): void {
    const today = todayJalali();
    setSelectedDate(today);
    setCalendarView({
      year: today.year,
      month: today.month,
    });
    setIsCalendarOpen(false);
  }

  const selectedDateLabel = `${toFarsiNumber(selectedDate.day)} ${MONTH_LABELS[selectedDate.month - 1]} ${toFarsiNumber(selectedDate.year)}`;

  return (
    <div className="jalali-date-field">
      <input type="hidden" name={name} value={isoValue} required={required} />

      <button
        type="button"
        className="jalali-date-field__trigger"
        onClick={() => setIsCalendarOpen((open) => !open)}
        aria-label="انتخاب تاریخ شمسی"
        aria-expanded={isCalendarOpen}
      >
        <span>{selectedDateLabel}</span>
        <span className="jalali-date-field__trigger-icon" aria-hidden="true">
          {isCalendarOpen ? '▴' : '▾'}
        </span>
      </button>

      {isCalendarOpen ? (
        <div className="jalali-date-field__popover">
          <div className="jalali-date-field__header">
            <button
              type="button"
              className="jalali-date-field__month-nav"
              onClick={() => changeMonth(-1)}
              aria-label="ماه قبل"
            >
              ماه قبل
            </button>
            <div className="jalali-date-field__header-center">
              <label className="jalali-date-field__month-field">
                <span className="jalali-date-field__month-label">ماه</span>
                <select
                  className="jalali-date-field__month-select"
                  value={calendarView.month}
                  onChange={(event) => onMonthChange(Number(event.target.value))}
                  aria-label="انتخاب ماه"
                >
                  {MONTH_LABELS.map((monthLabel, monthIndex) => (
                    <option key={monthLabel} value={monthIndex + 1}>
                      {monthLabel}
                    </option>
                  ))}
                </select>
              </label>

              <label className="jalali-date-field__year-field">
                <span className="jalali-date-field__year-label">سال</span>
                <select
                  className="jalali-date-field__year-select"
                  value={calendarView.year}
                  onChange={(event) => onYearChange(Number(event.target.value))}
                  aria-label="انتخاب سال"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {toFarsiNumber(year)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              className="jalali-date-field__month-nav"
              onClick={() => changeMonth(1)}
              aria-label="ماه بعد"
            >
              ماه بعد
            </button>
          </div>

          <div className="jalali-date-field__weekday-row">
            {WEEKDAY_LABELS.map((weekday) => (
              <span key={weekday} className="jalali-date-field__weekday">
                {weekday}
              </span>
            ))}
          </div>

          <div className="jalali-date-field__days-grid">
            {calendarCells.map((day, index) =>
              day === null ? (
                <span key={`empty-${index}`} className="jalali-date-field__empty-day" />
              ) : (
                <button
                  key={`${calendarView.year}-${calendarView.month}-${day}`}
                  type="button"
                  className={`jalali-date-field__day-button${
                    selectedDate.year === calendarView.year &&
                    selectedDate.month === calendarView.month &&
                    selectedDate.day === day
                      ? ' jalali-date-field__day-button--active'
                      : ''
                  }`}
                  onClick={() => onDaySelect(day)}
                >
                  {toFarsiNumber(day)}
                </button>
              ),
            )}
          </div>

          <button type="button" className="jalali-date-field__today-button" onClick={onTodaySelect}>
            امروز
          </button>
        </div>
      ) : null}

      <p className="jalali-date-field__preview">تاریخ انتخاب شده: {formatIsoToJalaliLabel(isoValue)}</p>
    </div>
  );
}