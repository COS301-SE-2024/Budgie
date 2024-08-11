import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountSettings } from './AccountSettings';
import '@testing-library/jest-dom';

import {
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  getAuth,
} from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
  deleteUser: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn(() => ({})),
  },
  getAuth: jest.fn(() => ({
    currentUser: {
      email: 'user@example.com',
    },
  })),
}));

describe('AccountSettings', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders AccountSettings component', () => {
    render(<AccountSettings onClose={mockOnClose} />);
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
  });

  test('shows error when reauthentication fails during password change', async () => {
    const reauthenticateWithCredentialMock =
      reauthenticateWithCredential as jest.Mock;
    reauthenticateWithCredentialMock.mockRejectedValueOnce(
      new Error('Reauthentication failed')
    );

    render(<AccountSettings onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Change password'));
    fireEvent.change(screen.getByPlaceholderText('Enter your old password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(screen.getByText('Reauthentication failed')).toBeInTheDocument();
    });
  });

  test('updates password successfully', async () => {
    const reauthenticateWithCredentialMock =
      reauthenticateWithCredential as jest.Mock;
    reauthenticateWithCredentialMock.mockResolvedValueOnce(true);
    (updatePassword as jest.Mock).mockResolvedValueOnce({});

    render(<AccountSettings onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Change password'));
    fireEvent.change(screen.getByPlaceholderText('Enter your old password'), {
      target: { value: 'correctpassword' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalled();
    });
  });

  test('shows error when passwords do not match', async () => {
    render(<AccountSettings onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Change password'));
    fireEvent.change(screen.getByPlaceholderText('Enter your new password'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), {
      target: { value: 'DifferentPassword123!' },
    });
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(screen.getByText('Password mismatch')).toBeInTheDocument();
    });
  });

  test('deletes user successfully', async () => {
    const reauthenticateWithCredentialMock =
      reauthenticateWithCredential as jest.Mock;
    reauthenticateWithCredentialMock.mockResolvedValueOnce(true);
    (deleteUser as jest.Mock).mockResolvedValueOnce({});

    render(<AccountSettings onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Delete Account'));
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'correctpassword' },
    });
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalled();
    });
  });
});
