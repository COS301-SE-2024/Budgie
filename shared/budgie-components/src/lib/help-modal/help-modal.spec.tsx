import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpModal from '../help-modal/help-modal';

const onCloseMock = jest.fn();

describe('HelpModal Component', () => {
  test('renders correctly with initial content', () => {
    render(<HelpModal onClose={onCloseMock} />);

    expect(screen.getByText('Usage guidance')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Core Features')).toBeInTheDocument();
    expect(screen.getByText('Tips')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();

    expect(screen.getByText('Welcome to Budgie')).toBeInTheDocument();
  });

  test('displays correct content when a section is selected', () => {
    render(<HelpModal onClose={onCloseMock} />);

    fireEvent.click(screen.getByText('Getting Started'));
    expect(screen.getByText('Installation:')).toBeInTheDocument();
    expect(screen.getByText('Account Setup:')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Core Features'));
    expect(screen.getByText('Bank Account linking:')).toBeInTheDocument();
    expect(screen.getByText('Predictions:')).toBeInTheDocument();
    expect(screen.getByText('Visualization:')).toBeInTheDocument();
    expect(screen.getByText('Goal tracking:')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tips'));
    expect(screen.getByText('Overview Page:')).toBeInTheDocument();
    expect(screen.getByText('Accounts Page:')).toBeInTheDocument();
    expect(screen.getByText('Transactions Page:')).toBeInTheDocument();
    expect(screen.getByText('Planning Page:')).toBeInTheDocument();
  });

  test('calls onClose prop function when the back button is clicked', () => {
    render(<HelpModal onClose={onCloseMock} />);

    fireEvent.click(screen.getByText('arrow_back'));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
