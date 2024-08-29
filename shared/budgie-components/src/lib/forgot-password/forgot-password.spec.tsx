import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPassword } from './forgot-password';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

// Mock Firebase functions
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.Mock;

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ForgotPassword />);

    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByText('Confirm')).toBeTruthy();
  });

  it('updates email input value', () => {
    render(<ForgotPassword />);
    
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  it('shows error message on invalid email', async () => {
    render(<ForgotPassword />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      const errorMessage = screen.queryByText('Please enter a valid email address.');
      expect(errorMessage).toBeTruthy();
    });
  });

  it('shows error message on failed email submission', async () => {
    mockSendPasswordResetEmail.mockRejectedValueOnce(new Error('Failed to send email'));

    render(<ForgotPassword />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      const errorMessage = screen.queryByText('Failed to send email');
      expect(errorMessage).toBeTruthy();
    });
  });
});
