import { splitMonthYear } from './specific-account-page';

describe('splitMonthYear', () => {
  it('should correctly split a valid monthYear string', () => {
    expect(splitMonthYear('012024')).toEqual(['01', '2024']);
    expect(splitMonthYear('121999')).toEqual(['12', '1999']);
  });

  it('should handle cases with monthYear string where year is less than 4 digits', () => {
    expect(splitMonthYear('032023')).toEqual(['03', '2023']);
    expect(splitMonthYear('0719')).toEqual(['07', '19']);
  });

  it('should handle cases where month is a single digit', () => {
    // This test assumes the function is only used with strings where the month is always two digits
    expect(splitMonthYear('092022')).toEqual(['09', '2022']);
    expect(splitMonthYear('012001')).toEqual(['01', '2001']);
  });

  it('should handle an empty string', () => {
    expect(splitMonthYear('')).toEqual(['', '']);
  });

  it('should handle a string shorter than expected length', () => {
    expect(splitMonthYear('01')).toEqual(['01', '']);
    expect(splitMonthYear('1')).toEqual(['1', '']);
  });

  it('should handle a string longer than expected length', () => {
    expect(splitMonthYear('01123456')).toEqual(['01', '123456']);
  });
});