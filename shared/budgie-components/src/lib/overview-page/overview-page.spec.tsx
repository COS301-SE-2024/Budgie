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
  getLastTransaction
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


/*===========================================================================================
INTEGRATED TESTS
=============================================================================================*/

describe('OverviewPage', () => {
  it('should render successfully', () => {
    // const { baseElement } = render(<OverviewPage />);
    // expect(baseElement).toBeTruthy();
  });
});