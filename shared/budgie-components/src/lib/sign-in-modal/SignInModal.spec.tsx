import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInModal from './SignInModal';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
  })),
}));

jest.mock('../forgot-password/forgot-password', () => () => (
  <div data-testid="forgot-password">Forgot Password Component</div>
));

describe('SignInModal Component', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should render the SignInModal with email and password input fields', () => {
    render(<SignInModal></SignInModal>);

    expect(screen.getByPlaceholderText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
    expect(screen.getByText('Log In')).toBeDefined();
  });

  it('should update the email and password fields on user input', () => {
    render(<SignInModal />);

    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      'Password'
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should display an error message when trying to log in without email or password', () => {
    render(<SignInModal />);

    const loginButton = screen.getByText('Log In');
    fireEvent.click(loginButton);
    expect(
      screen.getByText('Please enter both email and password.')
    ).toBeDefined();
  });

  it('should call signInWithPopup when "Sign In with Google" button is clicked', async () => {
    const signInWithPopupMock = signInWithPopup as jest.Mock;
    signInWithPopupMock.mockResolvedValueOnce({ user: {} });
    render(<SignInModal />);
    const googleButton = screen.getByText('Sign In with Google');
    fireEvent.click(googleButton);
    expect(signInWithPopup).toHaveBeenCalled();
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
});
