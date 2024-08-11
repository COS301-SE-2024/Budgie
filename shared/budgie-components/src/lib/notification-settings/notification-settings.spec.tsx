import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationSettings from '../notification-settings/notification-settings';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => (store[key] = value),
    clear: () => (store = {}),
  };
})();
global.localStorage = mockLocalStorage;

describe('NotificationSettings Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders correctly', () => {
    render(<NotificationSettings onClose={() => {}} />);
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    expect(screen.getByText('Budget updates')).toBeInTheDocument();
    expect(screen.getByText('Goal progress')).toBeInTheDocument();
    expect(screen.getByText('Spending warnings')).toBeInTheDocument();
    expect(screen.getByText('CSV remainder')).toBeInTheDocument();
  });

  test('checkboxes reflect local storage values', () => {
    localStorage.setItem('budget', 'true');
    localStorage.setItem('goal', 'false');
    localStorage.setItem('spending', 'true');
    localStorage.setItem('csv', 'false');

    render(<NotificationSettings onClose={() => {}} />);
    expect(screen.getAllByTestId('budget')[0]).toBeChecked();
    expect(screen.getAllByTestId('goal')[0]).not.toBeChecked();
    expect(screen.getAllByTestId('spending')[0]).toBeChecked();
    expect(screen.getAllByTestId('csv')[0]).not.toBeChecked();
  });

  test('handles checkbox changes', () => {
    render(<NotificationSettings onClose={() => {}} />);
    const budgetCheckbox = screen.getAllByTestId('budget')[0];
    expect(budgetCheckbox).not.toBeChecked();
    fireEvent.click(budgetCheckbox);

    expect(budgetCheckbox).toBeChecked();
  });

  test('saves settings to local storage', () => {
    render(<NotificationSettings onClose={() => {}} />);

    const budgetCheckbox = screen.getAllByTestId('budget')[0];
    fireEvent.click(budgetCheckbox);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(localStorage.getItem('budget')).toBe('true');
  });

  test('clears all settings', () => {
    localStorage.setItem('budget', 'true');
    localStorage.setItem('goal', 'true');
    localStorage.setItem('spending', 'true');
    localStorage.setItem('csv', 'true');

    render(<NotificationSettings onClose={() => {}} />);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(screen.getAllByTestId('budget')[0]).not.toBeChecked();
    expect(screen.getAllByTestId('goal')[0]).not.toBeChecked();
    expect(screen.getAllByTestId('spending')[0]).not.toBeChecked();
    expect(screen.getAllByTestId('csv')[0]).not.toBeChecked();
  });
});
