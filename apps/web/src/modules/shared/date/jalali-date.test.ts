import assert from 'node:assert/strict';

import {
  formatIsoToJalaliLabel,
  getJalaliMonthLength,
  gregorianToJalali,
  jalaliToGregorian,
  jalaliToIsoStartOfDayUtc,
} from './jalali-date.ts';

const farvardin1405 = jalaliToGregorian(1405, 1, 1);
assert.deepEqual(farvardin1405, {
  year: 2026,
  month: 3,
  day: 21,
});

const gregorianNowruz = gregorianToJalali(2026, 3, 21);
assert.deepEqual(gregorianNowruz, {
  year: 1405,
  month: 1,
  day: 1,
});

assert.equal(jalaliToIsoStartOfDayUtc(1405, 1, 1), '2026-03-21T00:00:00.000Z');
assert.equal(formatIsoToJalaliLabel('2026-03-21T00:00:00.000Z'), '۱۴۰۵/۰۱/۰۱');

assert.equal(getJalaliMonthLength(1403, 12), 30);
assert.equal(getJalaliMonthLength(1404, 12), 29);

console.log('jalali-date tests passed');
