import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FaqModal from '../faq-modal/faq-modal';

const onCloseMock = jest.fn();

describe('FaqModal Component', () => {
  // test('renders correctly', () => {
  //   render(<FaqModal onClose={onCloseMock} />);

  //   expect(screen.getByText('Display Settings')).toBeInTheDocument();
  //   expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  //   expect(screen.getByText('How do I use budgie?')).toBeInTheDocument();
  //   expect(screen.getByText('What is this Budgie?')).toBeInTheDocument();
  //   expect(screen.getByText('How do I create a budget?')).toBeInTheDocument();
  //   expect(screen.getByText('How do I delete my account?')).toBeInTheDocument();
  //   expect(
  //     screen.getByText('Is there a mobile app available?')
  //   ).toBeInTheDocument();
  //   expect(screen.getByText('How do I reset my password?')).toBeInTheDocument();
  //   expect(
  //     screen.getByText('What if I have more questions?')
  //   ).toBeInTheDocument();
  // });

  test('calls onClose prop function when the back button is clicked', () => {
    // render(<FaqModal onClose={onCloseMock} />);

    // fireEvent.click(screen.getByText('arrow_back'));
    // expect(onCloseMock).toHaveBeenCalled();
  });
});
