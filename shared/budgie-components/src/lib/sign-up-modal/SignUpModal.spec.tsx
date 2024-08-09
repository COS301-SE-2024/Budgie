import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SignUpModal } from './SignUpModal';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
}));

describe('SignUpModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SignUpModal />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Sign Up with Google')).toBeInTheDocument();
    expect(screen.getByText('Already Have an Account?')).toBeInTheDocument();
  });

  it('handles email and password input changes', () => {
    render(<SignUpModal />);
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    expect(screen.getByPlaceholderText('Email')).toHaveValue(
      'test@example.com'
    );
    expect(screen.getByPlaceholderText('Password')).toHaveValue('password123');
  });

  it('shows error message when email or password is missing', async () => {
    render(<SignUpModal />);
    fireEvent.click(screen.getByText('Sign Up'));
    await waitFor(() => {
      expect(
        screen.getByText('Please enter both email and password.')
      ).toBeInTheDocument();
    });
  });

  it('shows error message for invalid email', async () => {
    render(<SignUpModal />);
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('Sign Up'));
    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address.')
      ).toBeInTheDocument();
    });
  });

  it('calls createUserWithEmailAndPassword with correct arguments', async () => {
    const createUserWithEmailAndPasswordMock =
      createUserWithEmailAndPassword as jest.Mock;
    createUserWithEmailAndPasswordMock.mockResolvedValueOnce({ user: {} });

    render(<SignUpModal />);
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        undefined,
        'test@example.com',
        'password123'
      );
    });
  });

  it('shows appropriate error message for Firebase errors', async () => {
    const createUserWithEmailAndPasswordMock =
      createUserWithEmailAndPassword as jest.Mock;
    createUserWithEmailAndPasswordMock.mockRejectedValueOnce({
      code: 'auth/weak-password',
      message: 'The password is too weak.',
    });

    render(<SignUpModal />);
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(screen.queryByText('The password is too weak.')).toBeDefined();
    });
  });

  it('handles Google sign-in', async () => {
    const signInWithPopupMock = signInWithPopup as jest.Mock;
    signInWithPopupMock.mockResolvedValueOnce({ user: {} });

    render(<SignUpModal />);
    fireEvent.click(screen.getByText('Sign Up with Google'));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
  });

  it('shows error message on Google sign-in failure', async () => {
    const signInWithPopupMock = signInWithPopup as jest.Mock;
    signInWithPopupMock.mockRejectedValueOnce(
      new Error('Google sign-in failed')
    );

    render(<SignUpModal />);
    fireEvent.click(screen.getByText('Sign Up with Google'));

    await waitFor(() => {
      expect(
        screen.queryByText('Google sign-in failed')
      ).not.toBeInTheDocument();
    });
  });
});

// jest.mock('firebase/auth', () => ({
//   createUserWithEmailAndPassword: jest.fn(),
//   getAuth: jest.fn(),
//   GoogleAuthProvider: jest.fn(),
//   signInWithPopup: jest.fn(),
//   // Add any other methods you need to mock
// }));

// jest.mock('next/image', () => {
//   const Image = ({ src, alt }: { src: string; alt: string }) => {
//     // Implement a fallback component for testing purposes
//     return <img src={src} alt={alt} />;
//   };
//   return Image;
// });
