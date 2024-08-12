import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountsPage from '../src/app/(dashboard)/accounts/page';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockUser = { uid: 'mockUserId' };
const MockUserContextProvider = ({ children }) => (
  <UserContext.Provider value={mockUser}>{children}</UserContext.Provider>
);

jest.mock('../src/app/(dashboard)/accounts/page', () => {
  const originalModule = jest.requireActual(
    '../src/app/(dashboard)/accounts/page'
  );

  return {
    __esModule: true,
    ...originalModule,
    getBalancesForMonthYears: jest.fn(),
  };
});

describe('AccountsPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays NoAccountsPage when no accounts are found', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: jest.fn((callback) => {}),
      docs: [],
    });

    (
      require('../src/app/(dashboard)/accounts/page')
        .getBalancesForMonthYears as jest.Mock
    ).mockResolvedValue({});

    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <MockUserContextProvider>
        <AccountsPage />
      </MockUserContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No Accounts Added Yet/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Add an Account/i));
    expect(mockPush).toHaveBeenCalledWith('/accounts/new');
  });

  test('displays accounts and graph data when accounts are found', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: jest.fn((callback) => {
        callback({
          data: () => ({
            name: 'Sample Account',
            alias: 'Sample Alias',
            type: 'current',
            account_number: '12345',
          }),
        });
      }),
      docs: [
        {
          data: () => ({
            name: 'Sample Account',
            alias: 'Sample Alias',
            type: 'current',
            account_number: '12345',
          }),
        },
      ],
    });

    (
      require('../src/app/(dashboard)/accounts/page')
        .getBalancesForMonthYears as jest.Mock
    ).mockResolvedValue({
      '0802024': 1000,
    });

    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <MockUserContextProvider>
        <AccountsPage />
      </MockUserContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sample Alias/i)).toBeInTheDocument();
      expect(screen.getByText(/Sample Account/i)).toBeInTheDocument();
    });
  });
});
