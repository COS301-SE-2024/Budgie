import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from '../settings-page/settings';

jest.mock('../display-settings/DisplaySettings', () =>
  jest.fn(() => <div>Display Settings Component</div>)
);
jest.mock('../account-settings/AccountSettings', () =>
  jest.fn(() => <div>Account Settings Component</div>)
);
jest.mock('../notification-settings/notification-settings', () =>
  jest.fn(() => <div>Notification Settings Component</div>)
);
jest.mock('../support-page/support', () =>
  jest.fn(() => <div>Support Component</div>)
);

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Settings component with options', () => {
    render(<Settings />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Display Settings')).toBeInTheDocument();
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('opens the Account Settings overlay when the corresponding option is clicked', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText('Account Settings'));

    expect(screen.getByText('Account Settings Component')).toBeInTheDocument();
    expect(
      screen.queryByText('Display Settings Component')
    ).not.toBeInTheDocument();
  });

  it('opens the Display Settings overlay when the corresponding option is clicked', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText('Display Settings'));

    expect(screen.getByText('Display Settings Component')).toBeInTheDocument();
    expect(
      screen.queryByText('Account Settings Component')
    ).not.toBeInTheDocument();
  });

  it('opens the Notification Settings overlay when the corresponding option is clicked', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText('Notification Settings'));

    expect(
      screen.getByText('Notification Settings Component')
    ).toBeInTheDocument();
    expect(screen.queryByText('Support Component')).not.toBeInTheDocument();
  });

  it('opens the Support overlay when the corresponding option is clicked', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText('Support'));

    expect(screen.getByText('Support Component')).toBeInTheDocument();
    expect(
      screen.queryByText('Display Settings Component')
    ).not.toBeInTheDocument();
  });
});
