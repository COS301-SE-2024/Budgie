import { render, fireEvent } from '@testing-library/react';
import { Dashboard, formatMonthYear, handlePrevMonth, Transaction } from './Dashboard';
import Metrics from '../metrics/Metrics'; // Ensure Metrics component is imported
import React, { useContext } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';

const setBalance = jest.fn();
const setTransactions = jest.fn();
const setCurrentMonth = jest.fn();
const setCurrentYear = jest.fn();
const setData = jest.fn();
const setShowMetrics = jest.fn();

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(initial => [initial, jest.fn()]),
  useContext: jest.fn(),
}));

jest.mock('@capstone-repo/shared/budgie-components', () => ({
  ...jest.requireActual('@capstone-repo/shared/budgie-components'),
  UserContext: React.createContext(null),
}));

beforeEach(() => {
  // Reset the mock functions before each test
  setBalance.mockClear();
  setTransactions.mockClear();
  setCurrentMonth.mockClear();
  setCurrentYear.mockClear();
  setData.mockClear();
  setShowMetrics.mockClear();

  // Mock initial state values
  const initialBalance = 0;
  const initialTransactions: Transaction[] = [];
  const initialCurrentMonth = new Date();
  const initialCurrentYear = new Date().getFullYear();
  const initialData = null;
  const initialShowMetrics = false;

  // Mock useState to return current state and mock setters
  jest.spyOn(React, 'useState')
    .mockImplementationOnce(() => [initialBalance, setBalance])
    .mockImplementationOnce(() => [initialTransactions, setTransactions])
    .mockImplementationOnce(() => [initialCurrentMonth, setCurrentMonth])
    .mockImplementationOnce(() => [initialCurrentYear, setCurrentYear])
    .mockImplementationOnce(() => [initialData, setData])
    .mockImplementationOnce(() => [initialShowMetrics, setShowMetrics]);

  // Mock useContext to return a dummy user
  (useContext as jest.Mock).mockImplementation(() => ({ user: 'test-user' }));
});

describe('Dashboard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Dashboard />);
    expect(baseElement).toBeTruthy();
  });

  it('should format date correctly', () => {
    const date = new Date(2023, 6, 1); // July 1, 2023
    const formattedDate = formatMonthYear(date);
    expect(formattedDate).toBe('July 2023');
  });
});

describe('Metrics', () => {
  it('should render successfully', () => {
    const mockOnClose = jest.fn();
    const { baseElement } = render(<Metrics onClose={mockOnClose} />);
    expect(baseElement).toBeTruthy();
  });
});

describe('handlePrevMonth', () => {
  let initialCurrentMonth: Date;
  let currentYear: number;

  beforeEach(() => {
    // Reset the mock functions before each test
    setCurrentMonth.mockClear();
    setCurrentYear.mockClear();

    // Mock initial state values
    initialCurrentMonth = new Date(2023, 6, 1); // July 1, 2023
    currentYear = initialCurrentMonth.getFullYear();

    // Mock useState to return current state and mock setters
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [initialCurrentMonth, setCurrentMonth])
      .mockImplementationOnce(() => [currentYear, setCurrentYear]);
  });

  it('should set the current month to the previous month', () => {
    // Call the function
    handlePrevMonth();

    // Check if setCurrentMonth was called with the correct date
    const expectedMonth = new Date(2023, 5, 1); // June 1, 2023
    expect(setCurrentMonth).toHaveBeenCalledWith(expectedMonth);
  });

  it('should update the year if the month changes to a previous year', () => {
    // Set initial date to January 1, 2023
    initialCurrentMonth = new Date(2023, 0, 1);
    currentYear = initialCurrentMonth.getFullYear();

    // Mock useState to return updated currentMonth and currentYear
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [initialCurrentMonth, setCurrentMonth])
      .mockImplementationOnce(() => [currentYear, setCurrentYear]);

    // Call the function
    handlePrevMonth();

    // Check if setCurrentMonth was called with the correct date
    const expectedMonth = new Date(2022, 11, 1); // December 1, 2022
    expect(setCurrentMonth).toHaveBeenCalledWith(expectedMonth);

    // Check if setCurrentYear was called with the correct year
    expect(setCurrentYear).toHaveBeenCalledWith(2022);
  });

  it('should not update the year if the month does not change to a previous year', () => {
    // Call the function
    handlePrevMonth();

    // Check if setCurrentYear was not called
    expect(setCurrentYear).not.toHaveBeenCalled();
  });
});
