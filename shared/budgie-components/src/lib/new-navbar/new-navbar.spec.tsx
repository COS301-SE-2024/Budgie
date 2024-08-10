import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewNavbar } from '../new-navbar/new-navbar';
import { usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signOut: jest.fn().mockResolvedValue('signed out'),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('NewNavbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with all navigation items and logout button', () => {
    const usePathnameMock = usePathname as jest.Mock;
    usePathnameMock.mockReturnValue('/overview');

    render(<NewNavbar />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('applies selected styles correctly on navigation items', () => {
    const usePathnameMock = usePathname as jest.Mock;
    usePathnameMock.mockReturnValue('/transactions');

    render(<NewNavbar />);
    expect(screen.getByText('Transactions')).toHaveClass('selected');

    fireEvent.click(screen.getByText('Accounts'));
    expect(screen.getByText('Accounts')).toHaveClass('selected');
    expect(screen.queryByText('Transactions')).not.toHaveClass('selected');
  });

  test('calls signOut function on logout click', () => {
    const usePathnameMock = usePathname as jest.Mock;
    usePathnameMock.mockReturnValue('/overview');

    render(<NewNavbar />);

    fireEvent.click(screen.getByText('Logout'));
    expect(signOut).toHaveBeenCalledWith(getAuth());
  });
});
