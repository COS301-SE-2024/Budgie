import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { MonthlyTransactionsView } from './MonthlyTransactionsView';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import '@testing-library/jest-dom';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('../../../../../apps/budgie-app/firebase/clientApp', () => ({
  db: {},
}));

const mockUserContextValue = { uid: 'test-uid' };

describe('MonthlyTransactionsView', () => {
  beforeEach(() => {
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-uid' },
    });
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [
        {
          data: () => ({
            january: JSON.stringify([
              {
                date: '2024/01/15',
                amount: 100,
                balance: 1000,
                description: 'Sample transaction',
                category: 'Income',
              },
            ]),
          }),
        },
      ],
    });
  });

  it('renders the component correctly', async () => {
    render(
      <UserContext.Provider value={mockUserContextValue}>
        <MonthlyTransactionsView
          account="test-account"
          data={{ january: JSON.stringify([{ date: '2024/01/15', amount: 100, balance: 1000, description: 'Sample transaction', category: 'Income' }]) }}
          availableYears={[2023, 2024]}
        />
      </UserContext.Provider>
    );
  
    await waitFor(() => {
      expect(screen.getByText(/Balance:/)).toBeInTheDocument();
      expect(screen.getByText(/Money In:/)).toBeInTheDocument();
      expect(screen.getByText(/Money Out:/)).toBeInTheDocument();
    });
  });

  // it('displays transactions for the selected month and year', async () => {
  //   render(
  //     <UserContext.Provider value={mockUserContextValue}>
  //       <MonthlyTransactionsView
  //         account="test-account"
  //         data={{ january: JSON.stringify([{ date: '2024/01/15', amount: 100, balance: 1000, description: 'Sample transaction', category: 'Income' }]) }}
  //         availableYears={[2023, 2024]}
  //       />
  //     </UserContext.Provider>
  //   );
  
  //   screen.debug(); // Print the HTML to the console
  
  //   await waitFor(() => {
  //     expect(screen.getByText('Sample transaction')).toBeInTheDocument();
  //     expect(screen.getByText('R100.00')).toBeInTheDocument();
  //   });
  // });

  it('changes the month and year when navigation buttons are clicked', async () => {
    render(
      <UserContext.Provider value={mockUserContextValue}>
        <MonthlyTransactionsView
          account="test-account"
          data={{ january: JSON.stringify([{ date: '2024/01/15', amount: 100, balance: 1000, description: 'Sample transaction', category: 'Income' }]) }}
          availableYears={[2023, 2024]}
        />
      </UserContext.Provider>
    );

    const nextMonthButton = screen.getByRole('button', { name: /arrow_forward_ios/i });
    fireEvent.click(nextMonthButton);

    await waitFor(() => {
      expect(getDocs).toHaveBeenCalledWith(
        query(
          collection(db, 'transaction_data_2024'),
          where('uid', '==', 'test-uid'),
          where('account_number', '==', 'test-account')
        )
      );
    });
  });

  // it('updates transaction category when selected from dropdown', async () => {
  //   render(
  //     <UserContext.Provider value={mockUserContextValue}>
  //       <MonthlyTransactionsView
  //         account="test-account"
  //         data={{ january: JSON.stringify([{ date: '2024/01/15', amount: 100, balance: 1000, description: 'Sample transaction', category: 'Income' }]) }}
  //         availableYears={[2023, 2024]}
  //       />
  //     </UserContext.Provider>
  //   );

  //   const dropdown = screen.getByRole('combobox');
  //   fireEvent.change(dropdown, { target: { value: 'Entertainment' } });

  //   await waitFor(() => {
  //     expect(getDocs).toHaveBeenCalled();
  //   });
  // });
});
