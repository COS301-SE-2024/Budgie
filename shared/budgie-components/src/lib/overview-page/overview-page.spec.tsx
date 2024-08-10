import { render } from '@testing-library/react';
import { 
  query, 
  collection, 
  where, 
  getDocs,
  getFirestore } from 'firebase/firestore';
import OverviewPage from './overview-page';
import {
  getUser,
  getAccounts,
  getTransactions,
  getMoneyIn,
  getMoneyOut,
  getLastTransaction,
  getMonthlyIncome,
  getMonthlyExpenses,
  getExpensesByCategory
} from './overviewServices';
import { getAuth } from 'firebase/auth';

/*============================================================================================
 MOCKS
============================================================================================*/

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

// Mock Firebase Firestore methods
jest.mock('firebase/firestore', () => ({
  query: jest.fn(),
  collection: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  getFirestore: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockWhere = where as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockGetFirestore = getFirestore as jest.Mock;
const mockGetUser = getUser as jest.Mock;

/*============================================================================================
 UNIT TESTS
============================================================================================*/

describe('getUser', () => {
  it('should return the user id if user is logged in', () => {
    const mockUid = '123456';
    const mockAuth = {
      currentUser: { uid: mockUid },
    };

    // Mock the getAuth function to return the mockAuth object
    (getAuth as jest.Mock).mockReturnValue(mockAuth);

    const result = getUser();
    expect(result).toBe(mockUid);
  });

  it('should return undefined if no user is logged in', () => {
    // Mock the getAuth function to return an object with no currentUser
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });

    const result = getUser();
    expect(result).toBeUndefined();
  });

  it('should return undefined if getAuth returns null', () => {
    // Mock the getAuth function to return null
    (getAuth as jest.Mock).mockReturnValue(null);

    const result = getUser();
    expect(result).toBeUndefined();
  });

});


describe('getAccounts', () => {
  it('should return accounts for the user', async () => {
    const mockUid = '123456';
    const mockAccounts = [
      { id: '1', name: 'Account 1' },
      { id: '2', name: 'Account 2' },
    ];

    // Mock Firestore methods
    mockCollection.mockReturnValue('mockCollection');
    mockWhere.mockReturnValue('mockWhere');
    mockQuery.mockReturnValue('mockQuery');
    mockGetDocs.mockResolvedValue({
      forEach: (callback: (doc: any) => void) => {
        mockAccounts.forEach(account => callback({ data: () => account }));
      },
    });

    const accounts = await getAccounts();

    expect(accounts).toEqual(mockAccounts);
    expect(mockGetDocs).toHaveBeenCalled();
  });

  it('should return an empty array if no accounts are found', async () => {
    const mockUid = '123456';

    // Mock Firestore methods
    mockCollection.mockReturnValue('mockCollection');
    mockWhere.mockReturnValue('mockWhere');
    mockQuery.mockReturnValue('mockQuery');
    mockGetDocs.mockResolvedValue({
      forEach: (callback: (doc: any) => void) => {},
    });

    const accounts = await getAccounts();

    expect(accounts).toEqual([]);
    expect(mockGetDocs).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const mockUid = '123456';

    // Mock Firestore methods to throw an error
    mockCollection.mockReturnValue('mockCollection');
    mockWhere.mockReturnValue('mockWhere');
    mockQuery.mockReturnValue('mockQuery');
    mockGetDocs.mockRejectedValue(new Error('Firestore error'));

    await expect(getAccounts()).rejects.toThrow('Firestore error');
  });

});


describe('getTransactions', () => {
  it('should return transactions for the user and account for the current year', async () => {
    const mockUid = '123456';
    const mockAccountNumber = 'ACC123';
    const mockTransactions = [
      { id: 'txn1', amount: 100 },
      { id: 'txn2', amount: 200 },
    ];

    // Mock Firestore methods
    mockCollection.mockReturnValue('mockCollection');
    mockWhere.mockReturnValue('mockWhere');
    mockQuery.mockReturnValue('mockQuery');
    mockGetDocs.mockResolvedValue({
      forEach: (callback: (doc: any) => void) => {
        const data = {
          jan: JSON.stringify(mockTransactions),
        };
        callback({ data: () => data });
      },
    });

    const transactions = await getTransactions(mockAccountNumber);

    expect(transactions).toEqual(mockTransactions);
    expect(mockGetDocs).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledWith(
      'mockCollection',
      'mockWhere',
      'mockWhere'
    );
  });
  it('should handle non-JSON and non-array fields', async () => {
    const mockUid = '123456';
    const mockAccountNumber = 'ACC123';
    const mockTransactions = [
      { id: 'txn1', amount: 100 },
      { id: 'txn2', amount: 200 },
    ];

    // Mock Firestore methods
    mockCollection.mockReturnValue('mockCollection');
    mockWhere.mockReturnValue('mockWhere');
    mockQuery.mockReturnValue('mockQuery');
    mockGetDocs.mockResolvedValue({
      forEach: (callback: (doc: any) => void) => {
        const data = {
          jan: JSON.stringify(mockTransactions),
          feb: mockTransactions, // array
          mar: 'invalid-json-string',
        };
        callback({ data: () => data });
      },
    });

    const transactions = await getTransactions(mockAccountNumber);

    expect(transactions).toEqual([...mockTransactions, ...mockTransactions]);
    expect(mockGetDocs).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledWith(
      'mockCollection',
      'mockWhere',
      'mockWhere'
    );
  });
  it('should return an empty array if no transactions are found', async () => {
    const mockUid = '123456';
    const mockAccountNumber = 'ACC123';

    // Mock Firestore methods
    mockCollection.mockReturnValue('mockCollection');
    mockWhere.mockReturnValue('mockWhere');
    mockQuery.mockReturnValue('mockQuery');
    mockGetDocs.mockResolvedValue({
      forEach: (callback: (doc: any) => void) => {
        // No transactions in Firestore
      },
    });

    const transactions = await getTransactions(mockAccountNumber);

    expect(transactions).toEqual([]);
    expect(mockGetDocs).toHaveBeenCalled();
  });

});


describe('getMoneyIn', () => {
  it('should return the correct sum for positive amounts', async () => {
    const transactions = [
      { amount: 100 },
      { amount: 200 },
      { amount: 50 },
    ];

    const result = await getMoneyIn(transactions);
    expect(result).toBe(350);
  });

  it('should return 0 when all amounts are negative', async () => {
    const transactions = [
      { amount: -100 },
      { amount: -200 },
      { amount: -50 },
    ];

    const result = await getMoneyIn(transactions);
    expect(result).toBe(0);
  });

  it('should ignore transactions with amount equal to 0', async () => {
    const transactions = [
      { amount: 0 },
      { amount: 100 },
      { amount: -50 },
      { amount: 0 },
    ];

    const result = await getMoneyIn(transactions);
    expect(result).toBe(100);
  });

  it('should return 0 for an empty list of transactions', async () => {
    const transactions: any[] = [];
  
    const result = await getMoneyIn(transactions);
    expect(result).toBe(0);
  });

  it('should handle a mix of positive and negative amounts', async () => {
    const transactions = [
      { amount: 100 },
      { amount: -50 },
      { amount: 200 },
      { amount: -100 },
    ];

    const result = await getMoneyIn(transactions);
    expect(result).toBe(300);
  });

});

describe('getMoneyOut', () => {
  it('should return the total money out for the year', async () => {
    const transactions = [
      { amount: -100 },
      { amount: 200 },
      { amount: -50 },
      { amount: -300 },
    ];

    const result = await getMoneyOut(transactions);

    expect(result).toBe(450); // The total money out should be 450
  });

  it('should return 0 if there are no money out transactions', async () => {
    const transactions = [
      { amount: 200 },
      { amount: 150 },
    ];

    const result = await getMoneyOut(transactions);

    expect(result).toBe(-0); // No money out, so result should be 0
  });

  it('should handle an empty transactions array', async () => {
    const transactions: any[] = [];

    const result = await getMoneyOut(transactions);

    expect(result).toBe(-0); // Empty array, so result should be 0
  });
});

describe('getLastTransaction', () => {
  it('should return the first transaction in the array', async () => {
    const transactions = [
      { id: 3, amount: 150 },
      { id: 2, amount: -50 },
      { id: 1, amount: 100 },
    ];

    const result = await getLastTransaction(transactions);

    expect(result).toEqual({ id: 3, amount: 150 });
  });

  it('should return undefined if the transactions array is empty', async () => {
    const transactions: any[] = [];

    const result = await getLastTransaction(transactions);

    expect(result).toBeUndefined();
  });

  it('should return the only transaction if the array has one element', async () => {
    const transactions = [
      { id: 1, amount: 100 },
    ];

    const result = await getLastTransaction(transactions);

    expect(result).toEqual({ id: 1, amount: 100 });
  });
});


describe('getMonthlyIncome', () => {
  it('should return correct monthly income totals', async () => {
    const transactions = [
      { date: '2024/01/15', amount: 100 },
      { date: '2024/01/20', amount: 150 },
      { date: '2024/02/05', amount: 200 },
      { date: '2024/03/10', amount: 250 },
      { date: '2024/03/25', amount: 50 }, 
    ];

    const result = await getMonthlyIncome(transactions);

    expect(result).toEqual([250, 200, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should return an array of zeros when no transactions are present', async () => {
    const transactions: any[] = [];
    const result = await getMonthlyIncome(transactions);

    expect(result).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should handle transactions with mixed positive and negative amounts correctly', async () => {
    const transactions = [
      { date: '2024/01/01', amount: 100 },
      { date: '2024/01/15', amount: -50 },
      { date: '2024/02/10', amount: 200 },
      { date: '2024/02/20', amount: -100 },
    ];

    const result = await getMonthlyIncome(transactions);

    expect(result).toEqual([100, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should correctly parse dates and assign amounts to the correct month', async () => {
    const transactions = [
      { date: '2024/01/31', amount: 100 },
      { date: '2024/02/01', amount: 150 },
      { date: '2024/12/25', amount: 500 },
    ];

    const result = await getMonthlyIncome(transactions);

    expect(result).toEqual([100, 150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
  });
});


describe('getMonthlyExpenses', () => {
  it('should return correct monthly expenses totals', async () => {
    const transactions = [
      { date: '2024/01/15', amount: -100 },
      { date: '2024/01/20', amount: -150 },
      { date: '2024/02/05', amount: -200 },
      { date: '2024/03/10', amount: -250 },
      { date: '2024/03/25', amount: 50 }, // positive amount, should not be counted
    ];

    const result = await getMonthlyExpenses(transactions);

    expect(result).toEqual([250, 200, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should return an array of zeros when no transactions are present', async () => {
    const transactions: any[] = [];
    const result = await getMonthlyExpenses(transactions);

    expect(result).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should handle transactions with mixed positive and negative amounts correctly', async () => {
    const transactions = [
      { date: '2024/01/01', amount: -100 },
      { date: '2024/01/15', amount: 50 },
      { date: '2024/02/10', amount: -200 },
      { date: '2024/02/20', amount: 100 },
    ];

    const result = await getMonthlyExpenses(transactions);

    expect(result).toEqual([100, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should correctly parse dates and assign amounts to the correct month', async () => {
    const transactions = [
      { date: '2024/01/31', amount: -100 },
      { date: '2024/02/01', amount: -150 },
      { date: '2024/12/25', amount: -500 },
    ];

    const result = await getMonthlyExpenses(transactions);

    expect(result).toEqual([100, 150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500]);
  });
});


describe('getExpensesByCategory', () => {
  it('should return correct totals for each category', async () => {
    const transactions = [
      { category: 'Groceries', amount: -100 },
      { category: 'Utilities', amount: -50 },
      { category: 'Entertainment', amount: -75 },
      { category: 'Transport', amount: -25 },
      { category: 'Insurance', amount: -150 },
      { category: 'Medical Aid', amount: -200 },
      { category: 'Eating Out', amount: -60 },
      { category: 'Shopping', amount: -80 },
      { category: 'Other', amount: -30 },
      { category: 'Groceries', amount: -20 }, // another Groceries transaction
    ];

    const result = await getExpensesByCategory(transactions);

    expect(result).toEqual([120, 50, 75, 25, 150, 200, 60, 80, 30]);
  });

  it('should return an array of zeros when no transactions are present', async () => {
    const transactions: any[] = [];
    const result = await getExpensesByCategory(transactions);

    expect(result).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should ignore transactions with categories not in the list', async () => {
    const transactions = [
      { category: 'Groceries', amount: -100 },
      { category: 'Vacation', amount: -500 }, // category not in the list
      { category: 'Other', amount: -30 },
    ];

    const result = await getExpensesByCategory(transactions);

    expect(result).toEqual([100, 0, 0, 0, 0, 0, 0, 0, 30]);
  });

  it('should handle mixed positive and negative amounts correctly', async () => {
    const transactions = [
      { category: 'Groceries', amount: -100 },
      { category: 'Groceries', amount: 50 }, 
      { category: 'Utilities', amount: -50 },
    ];

    const result = await getExpensesByCategory(transactions);

    expect(result).toEqual([50, 50, 0, 0, 0, 0, 0, 0, 0]);
  });
});

/*===========================================================================================
INTEGRATED TESTS
=============================================================================================*/

describe('OverviewPage', () => {
  it('should render successfully', () => {
    // const { baseElement } = render(<OverviewPage />);
    // expect(baseElement).toBeTruthy();
  });
});