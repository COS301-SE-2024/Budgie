import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { 
    getUser,
    getAccounts,
 } from './services';
 import { collection, getDocs, query, where } from 'firebase/firestore';

// Mock Firebase services
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  connectAuthEmulator: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(), // Mocking getFirestore
  connectFirestoreEmulator: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  connectFunctionsEmulator: jest.fn(),
}));

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
    afterEach(() => {
      jest.clearAllMocks();
    });
  
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
