import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { NewNavbar } from './new-navbar';
import { usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { jest } from '@jest/globals';

// Mock the usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the firebase auth signOut method
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
}));

describe('NewNavbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    usePathname.mockReturnValue('/overview');
    render(<NewNavbar />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('highlights the correct nav item based on pathname', () => {
    usePathname.mockReturnValue('/accounts');
    render(<NewNavbar />);
    expect(screen.getByText('Accounts')).toHaveClass('selected');
    expect(screen.queryByText('Overview')).not.toHaveClass('selected');
  });

  it('changes the selected item on click', () => {
    usePathname.mockReturnValue('/overview');
    render(<NewNavbar />);
    fireEvent.click(screen.getByText('Accounts'));
    expect(screen.getByText('Accounts')).toHaveClass('selected');
    expect(screen.queryByText('Overview')).not.toHaveClass('selected');
  });

  it('calls signOut when logout item is clicked', () => {
    const signOutMock = jest.fn();
    signOut.mockImplementation(signOutMock);
    usePathname.mockReturnValue('/overview');
    render(<NewNavbar />);
    fireEvent.click(screen.getByText('Logout'));
    expect(signOutMock).toHaveBeenCalled();
  });
});
