import { render } from '@testing-library/react';
import SignInModal from './SignInModal';
import React from 'react';

describe('SignInModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SignInModal />);
    expect(baseElement).toBeTruthy();
  });
});
