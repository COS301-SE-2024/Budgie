import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import SignUp from '../src/app/(auth)/signup/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('SignUp Page', () => {
  it('should render the SignUpModal when no user is logged in', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    // Mock UserContext with no user
    const user = null;

    render(
      <UserContext.Provider value={user}>
        <SignUp />
      </UserContext.Provider>
    );

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('should redirect to /overview when a user is logged in', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    const user = { uid: '123', email: 'test@example.com' };

    render(
      <UserContext.Provider value={user}>
        <SignUp />
      </UserContext.Provider>
    );
    expect(mockPush).toHaveBeenCalledWith('/overview');
  });

  it('should show an error message when signing up with invalid email', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const user = null;

    render(
      <UserContext.Provider value={user}>
        <SignUp />
      </UserContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'validPassword123' },
    });

    fireEvent.click(screen.getByText('Sign Up'));

    expect(
      await screen.findByText('Please enter a valid email address.')
    ).toBeInTheDocument();
  });
});
