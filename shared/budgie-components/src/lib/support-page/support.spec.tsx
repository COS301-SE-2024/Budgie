import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Support from '../support-page/support';
import { HelpModal } from '../help-modal/help-modal';
import { FaqModal } from '../faq-modal/faq-modal';

jest.mock('../help-modal/help-modal', () => ({
  HelpModal: ({ onClose }) => (
    <div data-testid="help-modal">
      <button onClick={onClose}>Close Help Modal</button>
    </div>
  ),
}));

jest.mock('../faq-modal/faq-modal', () => ({
  FaqModal: ({ onClose }) => (
    <div data-testid="faq-modal">
      <button onClick={onClose}>Close FAQ Modal</button>
    </div>
  ),
}));

describe('Support Component', () => {
  test('renders correctly', () => {
    render(<Support onClose={() => {}} />);
    expect(screen.getByText('Support Settings')).toBeInTheDocument();
    expect(screen.getByText('How can we help?')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  test('toggles HelpModal visibility', () => {
    render(<Support onClose={() => {}} />);

    expect(screen.queryByTestId('help-modal')).toBeNull();

    fireEvent.click(screen.getByText('Usage Guidance'));
    expect(screen.getByTestId('help-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Help Modal'));
    expect(screen.queryByTestId('help-modal')).toBeNull();
  });

  test('toggles FaqModal visibility', () => {
    render(<Support onClose={() => {}} />);

    expect(screen.queryByTestId('faq-modal')).toBeNull();

    fireEvent.click(screen.getByText('FAQs'));
    expect(screen.getByTestId('faq-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close FAQ Modal'));
    expect(screen.queryByTestId('faq-modal')).toBeNull();
  });

  test('toggles contact information visibility', () => {
    render(<Support onClose={() => {}} />);

    expect(screen.queryByText('email: Technocrats.301@gmail.com')).toBeNull();

    fireEvent.click(screen.getByText('Contact'));
    expect(
      screen.getByText('email: Technocrats.301@gmail.com')
    ).toBeInTheDocument();
  });

  test('calls onClose prop function when the back button is clicked', () => {
    const onCloseMock = jest.fn();
    render(<Support onClose={onCloseMock} />);

    fireEvent.click(screen.getByText('arrow_back'));
    expect(onCloseMock).toHaveBeenCalled();
    
describe('Support', () => {
  it('should render successfully', () => {
    // const { baseElement } = render(<Support />);
    // expect(baseElement).toBeTruthy();
  });
});
