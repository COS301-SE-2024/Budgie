// rollingYears.test.ts
import { 
  getCurrentMonthYear, 
  rollingYears,
  getRollingMonthYears,
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