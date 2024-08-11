import { render, screen, fireEvent } from '@testing-library/react';
import Landing from './Landing';
import React from 'react';

jest.mock('../sign-in-modal/SignInModal', () => () => (
  <div data-testid="sign-in-modal">Sign In Modal</div>
));
jest.mock('../learn-more-modal/LearnMore', () => (props: any) => (
  <div data-testid="learn-more-modal">
    Learn More Modal
    <button onClick={props.onClose}>Close</button>
  </div>
));
describe('Landing', () => {
  it('should render successfully', () => {
    // const { baseElement } = render(<Landing />);
    // expect(baseElement).toBeTruthy();
  });
  it('should render the landing page with Sign In and Learn More buttons', () => {
    render(<Landing />);
    expect(screen.getByText('Sign In')).toBeDefined();
    expect(screen.getByText('Learn More ↓')).toBeDefined();
  });

  it('should show SignInModal when "Sign In" button is clicked', () => {
    render(<Landing />);

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    expect(screen.getByTestId('sign-in-modal')).toBeDefined();
  });

  it('should show LearnMore modal when "Learn More" button is clicked', () => {
    render(<Landing />);

    const learnMoreButton = screen.getByText('Learn More ↓');
    fireEvent.click(learnMoreButton);

    expect(screen.queryByTestId('learn-more-modal')).toBeDefined();
  });

  it('should close LearnMore modal when the "Close" button is clicked', () => {
    render(<Landing />);

    const learnMoreButton = screen.getByText('Learn More ↓')
      .parentElement as HTMLElement;
    fireEvent.click(learnMoreButton);
    expect(screen.queryByTestId('learn-more-modal')).toBeDefined();
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('learn-more-modal')).toBe(null);
  });
});
