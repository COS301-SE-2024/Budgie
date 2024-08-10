import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewNavbar } from './new-navbar';
import { usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({
    currentUser: { uid: 'test-uid' },
  }),
  signOut: jest.fn(),
}));

describe('NewNavbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const usePathnameMock = usePathname as jest.Mock;
    usePathnameMock.mockReturnValue('/overview');
    render(<NewNavbar />);
    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('Accounts')).toBeDefined();
    expect(screen.getByText('Transactions')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
    expect(screen.getByText('Logout')).toBeDefined();
  });

  it('highlights the correct nav item based on pathname', () => {
    const usePathnameMock = usePathname as jest.Mock;
    usePathnameMock.mockReturnValue('/accounts');
    render(<NewNavbar />);
    expect(screen.getByText('Accounts')).toHaveClass('selected');
    expect(screen.queryByText('Overview')).not.toHaveClass('selected');
  });

  it('changes the selected item on click', () => {
    const usePathnameMock = usePathname as jest.Mock;
    usePathnameMock.mockReturnValue('/overview');
    render(<NewNavbar />);
    fireEvent.click(screen.getByText('Accounts'));
    expect(screen.getByText('Accounts')).toHaveClass('selected');
    expect(screen.queryByText('Overview')).not.toHaveClass('selected');
  });

  it('calls signOut when logout item is clicked', () => {
    const signOutMock = signOut as jest.Mock;
    const usePathnameMock = usePathname as jest.Mock;
    usePathnameMock.mockReturnValue('/overview');
    render(<NewNavbar />);
    fireEvent.click(screen.getByText('Logout'));
    expect(signOutMock).toHaveBeenCalled();
  it('should render successfully', () => {
    // const { baseElement } = render(<NewNavbar />);
    // expect(baseElement).toBeTruthy();
  });
});
