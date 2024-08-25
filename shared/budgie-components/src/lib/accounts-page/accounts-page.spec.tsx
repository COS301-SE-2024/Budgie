// rollingYears.test.ts
import { 
  getCurrentMonthYear, 
  rollingYears,
  getRollingMonthYears,
  splitMonthYear,
  getMonthName,
} from './accounts-page';

describe('rollingYears', () => {
  it('should return an array with the correct years for a given month and year', () => {
    expect(rollingYears('032024')).toEqual([2023, 2024]);
  });

  it('should handle when the month is at the start of the year', () => {
    expect(rollingYears('012024')).toEqual([2023, 2024]);
  });

  it('should handle when the month is at the end of the year', () => {
    expect(rollingYears('122024')).toEqual([2024]);
  });

  describe('getCurrentMonthYear', () => {
    it('should return the current month and year in MMYYYY format', () => {
      const now = new Date();
      const expectedMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
      const expectedYear = now.getFullYear().toString();
      const expected = `${expectedMonth}${expectedYear}`;
  
      expect(getCurrentMonthYear()).toBe(expected);
    });
  });

  it('should return a sorted list of unique years', () => {
    // This tests if the function properly handles cases with overlapping years
    const years = rollingYears('052024');
    expect(years).toEqual([2023, 2024]);
  });

});


describe('getRollingMonthYears', () => {
  it('should return the rolling month-years for a given monthYear string', () => {
    // Define a test case
    const input = '082024'; // August 2024
    const expected = [
      '09 2023',
      '10 2023',
      '11 2023',
      '12 2023',
      '01 2024',
      '02 2024',
      '03 2024',
      '04 2024',
      '05 2024',
      '06 2024',
      '07 2024',
      '08 2024',
    ];

    // Call the function with the input
    const result = getRollingMonthYears(input);

    // Convert results to match expected format
    const formattedResult = result.map(m => `${m.slice(0, 2)} ${m.slice(2)}`);

    // Assert that the result matches the expected output
    expect(formattedResult).toEqual(expected);
  });


  it('should handle edge case of rolling from December', () => {
    const input = '122024'; // December 2024
    const expected = [
      '01 2024',
      '02 2024',
      '03 2024',
      '04 2024',
      '05 2024',
      '06 2024',
      '07 2024',
      '08 2024',
      '09 2024',
      '10 2024',
      '11 2024',
      '12 2024',
    ];

    const result = getRollingMonthYears(input);
    const formattedResult = result.map(m => `${m.slice(0, 2)} ${m.slice(2)}`);

    expect(formattedResult).toEqual(expected);
  });
});


describe('splitMonthYear', () => {
  it('should correctly split a valid month-year string', () => {
    const input = '082024'; // August 2024
    const expected: [string, string] = ['08', '2024'];

    const result = splitMonthYear(input);

    expect(result).toEqual(expected);
  });


  it('should handle a month-year string with a single-digit month', () => {
    const input = '12345'; // December 345
    const expected: [string, string] = ['12', '345'];

    const result = splitMonthYear(input);

    expect(result).toEqual(expected);
  });

  it('should handle a month-year string with a single-digit year', () => {
    const input = '0123'; // January 23
    const expected: [string, string] = ['01', '23'];

    const result = splitMonthYear(input);

    expect(result).toEqual(expected);
  });

  it('should handle an empty input string', () => {
    const input = ''; // Edge case with empty string
    const expected: [string, string] = ['', ''];

    const result = splitMonthYear(input);

    expect(result).toEqual(expected);
  });
});

describe('getMonthName', () => {
  it('should return the correct month name for valid input', () => {
    expect(getMonthName('01')).toBe('january');
    expect(getMonthName('02')).toBe('february');
    expect(getMonthName('03')).toBe('march');
    expect(getMonthName('04')).toBe('april');
    expect(getMonthName('05')).toBe('may');
    expect(getMonthName('06')).toBe('june');
    expect(getMonthName('07')).toBe('july');
    expect(getMonthName('08')).toBe('august');
    expect(getMonthName('09')).toBe('september');
    expect(getMonthName('10')).toBe('october');
    expect(getMonthName('11')).toBe('november');
    expect(getMonthName('12')).toBe('december');
  });

  it('should return an empty string for invalid month input', () => {
    expect(getMonthName('00')).toBe('');
    expect(getMonthName('13')).toBe('');
    expect(getMonthName('15')).toBe('');
    expect(getMonthName('abc')).toBe('');
    expect(getMonthName('')).toBe('');
  });

  it('should handle single-digit months without leading zero', () => {
    expect(getMonthName('1')).toBe('january');
    expect(getMonthName('2')).toBe('february');
    expect(getMonthName('3')).toBe('march');
    expect(getMonthName('4')).toBe('april');
    expect(getMonthName('5')).toBe('may');
    expect(getMonthName('6')).toBe('june');
    expect(getMonthName('7')).toBe('july');
    expect(getMonthName('8')).toBe('august');
    expect(getMonthName('9')).toBe('september');
    expect(getMonthName('10')).toBe('october');
    expect(getMonthName('11')).toBe('november');
    expect(getMonthName('12')).toBe('december');
  });
});
