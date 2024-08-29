import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LearnMore from './LearnMore';

// Mock function for onClose
const mockOnClose = jest.fn();

describe('LearnMore Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LearnMore onClose={mockOnClose} />);
    
    // Check if the main title is present
    expect(screen.queryByText('Learn More About Budgie')).not.toBeNull();

    // Check if the features and benefits section is present
    expect(screen.queryByText('Features & Benefits')).not.toBeNull();
    expect(screen.queryByText('Feature 1: Allow tracking of spending patterns.')).not.toBeNull();
    expect(screen.queryByText('Feature 2: Predictive analytics for future spending based on past patterns.')).not.toBeNull();

    // Check if the customer feedback section is present
    expect(screen.queryByText((content, element) =>
      content.includes('Budgie has transformed the way we manage our finances. Highly recommended!')
    )).not.toBeNull();

    // Check if the how it works section is present
    expect(screen.queryByText('How It Works')).not.toBeNull();
    expect(screen.queryByText('Follow these simple steps to get started:')).not.toBeNull();
    expect(screen.queryByText('Sign up for an account.')).not.toBeNull();
    expect(screen.queryByText('Link your financial accounts.')).not.toBeNull();
    expect(screen.queryByText('Add CSV files of your bank statements.')).not.toBeNull();
    expect(screen.queryByText('Start managing your finances with ease.')).not.toBeNull();
  });

  it('calls onClose when the Back button is clicked', () => {
    render(<LearnMore onClose={mockOnClose} />);

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
