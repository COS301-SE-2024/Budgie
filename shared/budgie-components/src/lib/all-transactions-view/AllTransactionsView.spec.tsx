import React from 'react';
import { render, screen, waitFor,fireEvent } from '@testing-library/react';
import { AllTransactionsView } from './AllTransactionsView';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { getDocs } from 'firebase/firestore';
import '@testing-library/jest-dom';


// Mock the Firestore functions
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'mockUserId' },
  })),
}));

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
}));

jest.mock('../../useThemes', () => ({
  useThemeSettings: jest.fn(),
}));

// Mock data for transactions
const mockTransactions = [
  { date: '2024/01/01', amount: 1000, balance: 5000, description: 'Salary', category: 'Income' },
  { date: '2024/01/10', amount: -200, balance: 4800, description: 'Groceries', category: 'Groceries' },
];

// Mock the UserContext
const mockUserContext = {
  uid: 'mockUid',
};

describe('AllTransactionsView', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the component and displays the correct year', () => {
    render(
      <UserContext.Provider value={mockUserContext}>
        <AllTransactionsView account="mockAccount" availableYears={[2023, 2024]} />
      </UserContext.Provider>
    );

    // Check if the year dropdown is rendered with the correct options
    const yearDropdown = screen.getByRole('combobox');
    expect(yearDropdown).toBeInTheDocument();
    expect(yearDropdown).toHaveValue('2024');
  });

  test('fetches and displays transactions for the current year', async () => {
    // Mock Firestore response
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [
        {
          data: () => ({
            january: JSON.stringify(mockTransactions),
          }),
        },
      ],
    });
  
    // Render component
    render(
      <UserContext.Provider value={mockUserContext}>
        <AllTransactionsView account="mockAccount" availableYears={[2023, 2024]} />
      </UserContext.Provider>
    );
  
    // Wait for transactions to appear and verify their presence
    await waitFor(() => {
      // Get all matching elements
      const salaryElements = screen.getAllByText('Salary');
      const groceriesElements = screen.getAllByText('Groceries');
      
      // Check if at least one element is found for each
      expect(salaryElements.length).toBeGreaterThan(0);
      expect(groceriesElements.length).toBeGreaterThan(0);
    });
  });
  
});