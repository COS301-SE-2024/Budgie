import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OverviewPage from '../src/app/(dashboard)/overview/page';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import {
  getAccounts,
  getTransactions,
  getMoneyIn,
  getMoneyOut,
  getLastTransaction,
  getMonthlyIncome,
  getMonthlyExpenses,
  getExpensesByCategory,
} from '../../../shared/budgie-components/src/lib/overview-page/overviewServices';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mocking the service functions
jest.mock(
  '../../../shared/budgie-components/src/lib/overview-page/overviewServices',
  () => ({
    getAccounts: jest.fn(),
    getTransactions: jest.fn(),
    getMoneyIn: jest.fn(),
    getMoneyOut: jest.fn(),
    getLastTransaction: jest.fn(),
    getMonthlyIncome: jest.fn(),
    getMonthlyExpenses: jest.fn(),
    getExpensesByCategory: jest.fn(),
  })
);

describe('OverviewPage Integration Tests', () => {
  const mockUser = { uid: 'test-user-id' };

  it('displays loading state initially', () => {
    render(
      <UserContext.Provider value={mockUser}>
        <OverviewPage />
      </UserContext.Provider>
    );

    expect(screen.getByText('You have not uploaded')).toBeInTheDocument(); // Adjust based on your actual loading state message
  });

  it('displays no transactions message if no accounts are available', async () => {
    (getAccounts as jest.Mock).mockResolvedValueOnce([]);

    render(
      <UserContext.Provider value={mockUser}>
        <OverviewPage />
      </UserContext.Provider>
    );

    expect(screen.queryByText('You have not uploaded')).toBeInTheDocument();
  });

  it('displays account-related data correctly', async () => {
    (getAccounts as jest.Mock).mockResolvedValueOnce([
      { account_number: '123', alias: 'Test Account' },
    ]);
    (getTransactions as jest.Mock).mockResolvedValueOnce([
      {
        date: '2024-08-01',
        amount: 100,
        balance: 500,
        description: 'Test Transaction',
        category: 'Test Category',
      },
    ]);
    (getMoneyIn as jest.Mock).mockResolvedValueOnce(1000);
    (getMoneyOut as jest.Mock).mockResolvedValueOnce(500);
    (getLastTransaction as jest.Mock).mockResolvedValueOnce({
      date: '2024-08-01',
      amount: 100,
      balance: 500,
      description: 'Test Transaction',
      category: 'Test Category',
    });
    (getMonthlyIncome as jest.Mock).mockResolvedValueOnce([
      1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000,
    ]);
    (getMonthlyExpenses as jest.Mock).mockResolvedValueOnce([
      500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600,
    ]);
    (getExpensesByCategory as jest.Mock).mockResolvedValueOnce([
      100, 200, 300, 400, 500, 600, 700, 800, 900,
    ]);

    render(
      <UserContext.Provider value={mockUser}>
        <OverviewPage />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Money in: R 1000')).toBeInTheDocument();
      expect(screen.getByText('Total Money out: R 500')).toBeInTheDocument();
      expect(screen.getByText('Last Transaction')).toBeInTheDocument();
      expect(screen.getByText('Date: 2024-08-01')).toBeInTheDocument();
      expect(screen.getByText('Amount: R 100')).toBeInTheDocument();
    });
  });

  it('handles account type selection correctly', async () => {
    (getAccounts as jest.Mock).mockResolvedValueOnce([
      { account_number: '123', alias: 'Test Account 1' },
      { account_number: '456', alias: 'Test Account 2' },
    ]);
    (getTransactions as jest.Mock).mockResolvedValueOnce([
      {
        date: '2024-08-01',
        amount: 100,
        balance: 500,
        description: 'Test Transaction',
        category: 'Test Category',
      },
    ]);

    render(
      <UserContext.Provider value={mockUser}>
        <OverviewPage />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Account 1')).toBeInTheDocument();
      expect(screen.getByText('Test Account 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Account 2'));

    await waitFor(() => {
      expect(screen.getByText('Test Account 2')).toBeInTheDocument();
    });
  });

  it('handles dark mode toggle', () => {
    render(
      <UserContext.Provider value={mockUser}>
        <OverviewPage />
      </UserContext.Provider>
    );

    const toggleButton = screen.getByText(/Switch to Dark Mode/i); // Adjust based on your toggle button text

    fireEvent.click(toggleButton);

    // Verify that the dark mode class or style is applied
    expect(document.body.classList).toContain('dark-mode-class'); // Adjust based on your actual dark mode implementation
  });
});
