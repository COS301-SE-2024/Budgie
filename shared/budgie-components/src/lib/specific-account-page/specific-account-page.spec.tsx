import { 
  splitMonthYear,
  getSeparateYearMonthsAsTransactionObjects,
  getUniqueYearMonths,
  getMonthName,
  isDuplicate
} from './specific-account-page';

interface Transaction {
  date: string;
  amount: number;
  balance: number;
  description: string;
  category: string;
}

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


describe('getSeparateYearMonthsAsTransactionObjects', () => {
  it('should correctly group transactions by year/month', () => {
    const dataLines = [
      '2023/01/15, 100.50, 2000.75, Grocery shopping',
      '2023/01/20, -50.00, 1950.75, Restaurant',
      '2023/02/05, 200.00, 2150.75, Salary',
      '2024/01/10, -30.00, 2120.75, Utilities',
    ];

    const expectedOutput: Record<string, Transaction[]> = {
      '2023/01': [
        {
          date: '2023/01/15',
          amount: 100.5,
          balance: 2000.75,
          description: 'Grocery shopping',
          category: '',
        },
        {
          date: '2023/01/20',
          amount: -50.0,
          balance: 1950.75,
          description: 'Restaurant',
          category: '',
        },
      ],
      '2023/02': [
        {
          date: '2023/02/05',
          amount: 200.0,
          balance: 2150.75,
          description: 'Salary',
          category: '',
        },
      ],
      '2024/01': [
        {
          date: '2024/01/10',
          amount: -30.0,
          balance: 2120.75,
          description: 'Utilities',
          category: '',
        },
      ],
    };

    const result = getSeparateYearMonthsAsTransactionObjects(dataLines);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle empty input', () => {
    const dataLines: string[] = [];

    const expectedOutput: Record<string, Transaction[]> = {};

    const result = getSeparateYearMonthsAsTransactionObjects(dataLines);
    expect(result).toEqual(expectedOutput);
  });

  it('should correctly parse amounts and balances as numbers', () => {
    const dataLines = ['2023/01/15, 100.50, 2000.75, Grocery shopping'];

    const expectedOutput: Record<string, Transaction[]> = {
      '2023/01': [
        {
          date: '2023/01/15',
          amount: 100.5,
          balance: 2000.75,
          description: 'Grocery shopping',
          category: '',
        },
      ],
    };

    const result = getSeparateYearMonthsAsTransactionObjects(dataLines);
    expect(result['2023/01'][0].amount).toBe(100.5);
    expect(result['2023/01'][0].balance).toBe(2000.75);
  });
});


describe('getUniqueYearMonths', () => {
  it('should return unique year/month combinations grouped by year', () => {
    const dataLines = [
      '2023/01/15, 100.50, 2000.75, Grocery shopping',
      '2023/01/20, -50.00, 1950.75, Restaurant',
      '2023/02/05, 200.00, 2150.75, Salary',
      '2024/01/10, -30.00, 2120.75, Utilities',
      '2024/02/11, -20.00, 2100.75, Internet',
    ];

    const expectedOutput: Record<string, string[]> = {
      '2023': ['2023/01', '2023/02'],
      '2024': ['2024/01', '2024/02'],
    };

    const result = getUniqueYearMonths(dataLines);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle an empty input', () => {
    const dataLines: string[] = [];

    const expectedOutput: Record<string, string[]> = {};

    const result = getUniqueYearMonths(dataLines);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a case with only one year/month', () => {
    const dataLines = [
      '2023/01/15, 100.50, 2000.75, Grocery shopping',
      '2023/01/20, -50.00, 1950.75, Restaurant',
    ];

    const expectedOutput: Record<string, string[]> = {
      '2023': ['2023/01'],
    };

    const result = getUniqueYearMonths(dataLines);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a case with multiple years and months', () => {
    const dataLines = [
      '2023/01/15, 100.50, 2000.75, Grocery shopping',
      '2023/01/20, -50.00, 1950.75, Restaurant',
      '2023/02/05, 200.00, 2150.75, Salary',
      '2024/01/10, -30.00, 2120.75, Utilities',
      '2024/02/11, -20.00, 2100.75, Internet',
      '2024/02/15, 50.00, 2150.75, Bonus',
    ];

    const expectedOutput: Record<string, string[]> = {
      '2023': ['2023/01', '2023/02'],
      '2024': ['2024/01', '2024/02'],
    };

    const result = getUniqueYearMonths(dataLines);
    expect(result).toEqual(expectedOutput);
  });

});


describe('getMonthName', () => {
  it('should return the correct month name for valid month strings', () => {
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
});

describe('isDuplicate', () => {
  const transaction1: Transaction = {
    date: '2024/08/25',
    amount: 100.0,
    balance: 500.0,
    description: 'Grocery shopping',
    category: ""
  };

  it('should return true for identical transactions', () => {
    const transaction2: Transaction = { ...transaction1 };
    expect(isDuplicate(transaction1, transaction2)).toBe(true);
  });

  it('should return false if dates are different', () => {
    const transaction2: Transaction = { ...transaction1, date: '2024/08/26' };
    expect(isDuplicate(transaction1, transaction2)).toBe(false);
  });

  it('should return false if amounts are different', () => {
    const transaction2: Transaction = { ...transaction1, amount: 200.0 };
    expect(isDuplicate(transaction1, transaction2)).toBe(false);
  });

  it('should return false if balances are different', () => {
    const transaction2: Transaction = { ...transaction1, balance: 600.0 };
    expect(isDuplicate(transaction1, transaction2)).toBe(false);
  });

  it('should return false if descriptions are different', () => {
    const transaction2: Transaction = { ...transaction1, description: 'Rent payment' };
    expect(isDuplicate(transaction1, transaction2)).toBe(false);
  });

  it('should return true if both transactions are empty objects', () => {
    const emptyTransaction1: Transaction = {
      date: '',
      amount: 0,
      balance: 0,
      description: '',
      category: ""
    };
    const emptyTransaction2: Transaction = { ...emptyTransaction1 };
    expect(isDuplicate(emptyTransaction1, emptyTransaction2)).toBe(true);
  });

  it('should return false if one transaction is empty and the other is not', () => {
    const emptyTransaction: Transaction = {
      date: '',
      amount: 0,
      balance: 0,
      description: '',
      category: ""
    };
    expect(isDuplicate(transaction1, emptyTransaction)).toBe(false);
  });
});


