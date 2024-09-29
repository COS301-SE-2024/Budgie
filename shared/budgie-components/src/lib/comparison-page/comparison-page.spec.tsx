import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { 
    getUser,
    getAccounts,
    getMonthlyIncome,
    getPosition,
    getIndustry,
    getExpensesByCategory,
 } from './services';
 import { collection, getDocs, query, where } from 'firebase/firestore';

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

describe('getUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the uid when the auth object and currentUser exist', () => {
    const mockAuth = {
      currentUser: {
        uid: 'test-uid',
      },
    };
    (getAuth as jest.Mock).mockReturnValue(mockAuth);

    const result = getUser();
    expect(result).toBe('test-uid');
  });

  it('should return undefined when currentUser is null', () => {
    const mockAuth = {
      currentUser: null,
    };
    (getAuth as jest.Mock).mockReturnValue(mockAuth);

    const result = getUser();
    expect(result).toBeUndefined();
  });

  it('should return undefined when auth is null', () => {
    (getAuth as jest.Mock).mockReturnValue(null);

    const result = getUser();
    expect(result).toBeUndefined();
  });
});



  
  describe('getAccounts', () => {
 
    it('should return accounts when Firestore returns data', async () => {
  
      // Mock the result of Firestore getDocs
      const mockDocs = [
        { id: '1', data: () => ({ accountNumber: '123', balance: 1000 }) },
        { id: '2', data: () => ({ accountNumber: '456', balance: 1500 }) },
      ];
      (getDocs as jest.Mock).mockResolvedValue(mockDocs);
  
      const accounts = await getAccounts();
  
      // Check if the expected accounts are returned
      expect(accounts).toEqual([
        { accountNumber: '123', balance: 1000 },
        { accountNumber: '456', balance: 1500 },
      ]);
  
    });
  
    it('should return an empty array when no documents are found', async () => {
  
      // Mock the result of getDocs to return an empty array
      (getDocs as jest.Mock).mockResolvedValue([]);
  
      const accounts = await getAccounts();
  
      // Check that the returned accounts array is empty
      expect(accounts).toEqual([]);
  
    });
  });


  describe('getMonthlyIncome', () => {

    it('should return the total income for the last month', async () => {
        const transactions = [
            { date: '2024/09/01', amount: 100 }, // Current month (September)
            { date: '2024/08/15', amount: 200 }, // Current month (September)
            { date: '2024/08/20', amount: 50 },  // Previous month (August)
            { date: '2024/07/10', amount: -30 }, // Previous month (July - negative amount)
        ];

        const result = await getMonthlyIncome(transactions);

        expect(result).toBe(250); // 100 + 200 = 300
    });

    it('should return previous months income if there are no transactions for the last month', async () => {
        const transactions = [
            { date: '2024/07/20', amount: 50 }, // Previous month (August)
            { date: '2024/07/10', amount: 30 }, // Previous month (July)
        ];

        const result = await getMonthlyIncome(transactions);

        expect(result).toBe(80); // No transactions for the current month
    });

    it('should ignore negative amounts', async () => {
        const transactions = [
            { date: '2024/09/01', amount: 100 }, // Current month (September)
            { date: '2024/09/15', amount: -200 }, // Negative amount for current month
            { date: '2024/08/20', amount: 50 },   // Previous month (August)
        ];

        const result = await getMonthlyIncome(transactions);

        expect(result).toBe(50); // Only the positive transaction for September counts
    });

});


describe('getPosition', () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  it('should return default stats when no documents are found', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
          empty: true,
      });

      const result = await getPosition('Software Engineer');

      expect(result).toEqual([-1, -1, -1]); // Default stats
  });

  it('should return rounded stats from Firestore documents', async () => {
      const mockDocs = [
          { data: () => ({ minimum: 60000, median: 80000, maximum: 100000 }) },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
          empty: false,
          forEach: jest.fn((callback) => {
              mockDocs.forEach(callback);
          }),
      });

      const result = await getPosition('Software Engineer');

      expect(result).toEqual([5000, 7000, 8000]); // Rounded values in thousands
  });

  it('should return default stats when documents do not contain expected fields', async () => {
      const mockDocs = [
          { data: () => ({ otherField: 50000 }) }, // No minimum, median, maximum
      ];

      (getDocs as jest.Mock).mockResolvedValue({
          empty: false,
          forEach: jest.fn((callback) => {
              mockDocs.forEach(callback);
          }),
      });

      const result = await getPosition('Software Engineer');

      expect(result).toEqual([-1, -1, -1]); // Default stats
  });

  it('should handle errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getPosition('Software Engineer')).rejects.toThrow('Firestore error');
  });
});


describe('getIndustry', () => {

  it('should return default stats when no documents are found', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
          empty: true,
      });

      const result = await getIndustry('Technology');

      expect(result).toEqual([-1, -1, -1]); // Default stats
  });

  it('should return rounded stats from Firestore documents', async () => {
      const mockDocs = [
          { data: () => ({ minimum: 72000, median: 96000, maximum: 120000 }) },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
          empty: false,
          forEach: jest.fn((callback) => {
              mockDocs.forEach(callback);
          }),
      });

      const result = await getIndustry('Technology');

      expect(result).toEqual([6000, 8000, 10000]); // Rounded values in thousands
  });

  it('should return default stats when documents do not contain expected fields', async () => {
      const mockDocs = [
          { data: () => ({ otherField: 50000 }) }, // No minimum, median, maximum
      ];

      (getDocs as jest.Mock).mockResolvedValue({
          empty: false,
          forEach: jest.fn((callback) => {
              mockDocs.forEach(callback);
          }),
      });

      const result = await getIndustry('Technology');

      expect(result).toEqual([-1, -1, -1]); // Default stats
  });

  it('should handle errors gracefully', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getIndustry('Technology')).rejects.toThrow('Firestore error');
  });
});


describe('getExpensesByCategory', () => {

  it('should correctly sum expenses for the current month', async () => {
      const transactions = [
          { date: '2024/08/01', amount: 100, category: 'Groceries' },
          { date: '2024/08/05', amount: 50, category: 'Utilities' },
          { date: '2024/08/15', amount: 200, category: 'Entertainment' },
          { date: '2024/08/20', amount: 75, category: 'Transport' },
      ];

      const result = await getExpensesByCategory(transactions);
      expect(result).toEqual([-100, -50, -200, -75, 0, 0, 0, 0, 0]); // Total expenses for each category
  });

  it('should return previous month when no transactions for last month', async () => {
      const transactions = [
          { date: '2024/07/01', amount: 100, category: 'Groceries' },
          { date: '2024/07/05', amount: 50, category: 'Utilities' },
          { date: '2024/07/15', amount: 200, category: 'Entertainment' },
      ];

      const result = await getExpensesByCategory(transactions);
      expect(result).toEqual([-100, -50, -200, 0, 0, 0, 0, 0, 0]); 
  });

});

