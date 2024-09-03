import React from 'react';
import { render, screen } from '@testing-library/react';
import SignUpPage from './SignUpPage';
import '@testing-library/jest-dom'; // for extended matchers like toBeInTheDocument

// Mock the SignUpModal component
jest.mock('../sign-up-modal/SignUpModal', () => () => <div>SignUpModal</div>);

describe('SignUpPage Component', () => {
  it('renders correctly', () => {
    render(<SignUpPage />);

    // Check if the SignUpModal component is rendered
    expect(screen.getByText('SignUpModal')).toBeInTheDocument();

    // Check if the waveTop and waveBottom elements are present
    // Using querySelector since getByClassName is not available in testing-library
    const container = screen.getByTestId('signup-page-container'); // Add a data-testid to the container in SignUpPage

    const waveTop = container.querySelector('.waveTop');
    const waveBottom = container.querySelector('.waveBottom');

    expect(waveTop).toBeInTheDocument();
    expect(waveBottom).toBeInTheDocument();
  });
});
