import { render } from '@testing-library/react';

import SignUpModal from './SignUpModal';
import React from 'react';

describe('SignUpModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SignUpModal />);
    expect(baseElement).toBeTruthy();
  });
});
