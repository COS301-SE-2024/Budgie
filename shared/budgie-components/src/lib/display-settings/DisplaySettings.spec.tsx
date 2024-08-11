import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisplaySettings, { DisplaySettingsProps } from './DisplaySettings';

describe('DisplaySettings', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('colour-theme', 'light-blue');
    document.documentElement.style.setProperty('--font-size-multiplier', '1');
  });

  test('renders correctly with initial settings', () => {
    render(<DisplaySettings onClose={mockOnClose} />);

    expect(screen.getByText('Display Settings')).toBeInTheDocument();
    expect(screen.getByText('Light')).toHaveClass('selected');
    expect(screen.getByText('✔')).toBeInTheDocument();
  });

  test('changes theme to dark', () => {
    render(<DisplaySettings onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByText('Dark')).toHaveClass('selected');
  });

  test('changes theme to light', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    render(<DisplaySettings onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Light'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(screen.getByText('Light')).toHaveClass('selected');
  });

  test('selects blue color theme', () => {
    render(<DisplaySettings onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('✔').closest('div')); // Click the blue circle
    expect(document.documentElement.getAttribute('colour-theme')).toBe(
      'light-blue'
    );
    expect(screen.getByText('✔')).toBeInTheDocument(); // Checkmark should be on the blue circle
  });

  test('selects yellow color theme', () => {
    render(<DisplaySettings onClose={mockOnClose} />);

    fireEvent.click(
      screen.getByText('✔').closest('div').nextSibling as HTMLElement
    );
    expect(document.documentElement.getAttribute('colour-theme')).toBe(
      'light-yellow'
    );
    expect(screen.getByText('✔')).toBeInTheDocument();
  });
});
