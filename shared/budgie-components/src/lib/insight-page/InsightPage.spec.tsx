import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
    getLastPetrolPrices,
    getThisPetrolPrices,
    getNextPetrolPrices
} from './InsightsPage';


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
  

  describe('getLastPetrolPrices', () => {
    const mockPetrolPrices = {
      lastMonth: 1.45,
      thisMonth: 1.50,
      nextMonth: 1.55
    };
  
    const mockFirestoreResult = {
      forEach: jest.fn((callback) => {
        callback({
          data: () => mockPetrolPrices
        });
      })
    };
  
    it('should return petrol prices from Firestore', async () => {
      // Mock Firestore's getDocs to return a result with petrol prices
      (getDocs as jest.Mock).mockResolvedValue(mockFirestoreResult);
  
      // Call the function
      const prices = await getLastPetrolPrices();
  
      // Assert that the correct prices are returned
      expect(prices).toEqual(mockPetrolPrices);
    });
  
    it('should return undefined if no petrol prices are found', async () => {
      // Mock Firestore's getDocs to return no results
      const mockEmptyResult = {
        forEach: jest.fn() // No callback is called
      };
      (getDocs as jest.Mock).mockResolvedValue(mockEmptyResult);
  
      // Call the function
      const prices = await getLastPetrolPrices();
  
      // Assert that prices are undefined
      expect(prices).toBeUndefined();
    });
  
    it('should handle errors', async () => {
      // Mock Firestore's getDocs to throw an error
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));
  
      // Call the function and expect it to throw
      await expect(getLastPetrolPrices()).rejects.toThrow('Firestore error');
    });
  });


  describe('getThisPetrolPrices', () => {
    const mockPetrolPrices = {
      lastMonth: 1.50,
      thisMonth: 1.55,
      nextMonth: 1.60
    };
  
    const mockFirestoreResult = {
      forEach: jest.fn((callback) => {
        callback({
          data: () => mockPetrolPrices
        });
      })
    };
  
    it('should return petrol prices for the current month from Firestore', async () => {
      // Mock Firestore's getDocs to return a result with petrol prices
      (getDocs as jest.Mock).mockResolvedValue(mockFirestoreResult);
  
      // Call the function
      const prices = await getThisPetrolPrices();
  
      // Assert that the correct prices are returned
      expect(prices).toEqual(mockPetrolPrices);
    });
  
    it('should return undefined if no petrol prices are found for the current month', async () => {
      // Mock Firestore's getDocs to return no results
      const mockEmptyResult = {
        forEach: jest.fn() // No callback is called, indicating no documents were found
      };
      (getDocs as jest.Mock).mockResolvedValue(mockEmptyResult);
  
      // Call the function
      const prices = await getThisPetrolPrices();
  
      // Assert that no prices are returned (prices should be undefined)
      expect(prices).toBeUndefined();
    });
  
    it('should handle Firestore errors correctly', async () => {
      // Mock Firestore's getDocs to throw an error
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));
  
      // Call the function and expect it to throw an error
      await expect(getThisPetrolPrices()).rejects.toThrow('Firestore error');
    });
  });


  describe('getNextPetrolPrices', () => {
    const mockPetrolPrices = {
      lastMonth: 1.55,
      thisMonth: 1.60,
      nextMonth: 1.65
    };
  
    const mockFirestoreResult = {
      forEach: jest.fn((callback) => {
        callback({
          data: () => mockPetrolPrices
        });
      })
    };
  
    it('should return petrol prices for the next month from Firestore', async () => {
      // Mock Firestore's getDocs to return a result with petrol prices
      (getDocs as jest.Mock).mockResolvedValue(mockFirestoreResult);
  
      // Call the function
      const prices = await getNextPetrolPrices();
  
      // Assert that the correct prices are returned
      expect(prices).toEqual(mockPetrolPrices);
    });
  
    it('should return undefined if no petrol prices are found for the next month', async () => {
      // Mock Firestore's getDocs to return no results
      const mockEmptyResult = {
        forEach: jest.fn() // No callback is called
      };
      (getDocs as jest.Mock).mockResolvedValue(mockEmptyResult);
  
      // Call the function
      const prices = await getNextPetrolPrices();
  
      // Assert that no prices are returned (prices should be undefined)
      expect(prices).toBeUndefined();
    });
  
    it('should handle Firestore errors correctly', async () => {
      // Mock Firestore's getDocs to throw an error
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));
  
      // Call the function and expect it to throw an error
      await expect(getNextPetrolPrices()).rejects.toThrow('Firestore error');
    });
  });