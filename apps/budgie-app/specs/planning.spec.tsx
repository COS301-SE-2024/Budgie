import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import PlanningPage from '../src/app/(dashboard)/planning/page';
import { collection, getDocs, query, where } from 'firebase/firestore';
import '@testing-library/jest-dom';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

describe('PlanningPage', () => {
  const mockGoals = [
    {
      id: 'goal1',
      name: 'Save for Vacation',
      type: 'Savings',
      start_date: '2024-01-01',
      current_amount: 500,
      target_amount: 1000,
    },
    {
      id: 'goal2',
      name: 'Pay off Credit Card',
      type: 'Debt',
      start_date: '2024-01-15',
      initial_amount: 2000,
      current_amount: 1000,
      target_amount: 0,
    },
  ];

  it('should render PlanningPage and display GoalsPage by default', async () => {
    const user = { uid: 'test-user-id' };

    (getDocs as jest.Mock).mockResolvedValue({
      docs: mockGoals.map((goal) => ({
        id: goal.id,
        data: () => goal,
      })),
    });

    render(
      <UserContext.Provider value={user}>
        <PlanningPage />
      </UserContext.Provider>
    );

    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();

    expect(await screen.findByText('Save for Vacation')).toBeInTheDocument();
    expect(await screen.findByText('Pay off Credit Card')).toBeInTheDocument();
  });

  it('should switch to Insights view and show "under construction" screen', () => {
    const user = { uid: 'test-user-id' };

    render(
      <UserContext.Provider value={user}>
        <PlanningPage />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByText('Insights'));

    expect(
      screen.getByText('This page is under construction.')
    ).toBeInTheDocument();
  });

  it('should switch to Upcoming view and show "under construction" screen', () => {
    const user = { uid: 'test-user-id' };

    render(
      <UserContext.Provider value={user}>
        <PlanningPage />
      </UserContext.Provider>
    );

    fireEvent.click(screen.getByText('Upcoming'));

    expect(
      screen.getByText('This page is under construction.')
    ).toBeInTheDocument();
  });
});
