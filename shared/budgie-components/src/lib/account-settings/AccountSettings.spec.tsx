import { render } from '@testing-library/react';

import AccountSettings from './AccountSettings';
import React from 'react';

describe('AccountSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AccountSettings onClose={() => {}} />);
    expect(baseElement).toBeTruthy();
  });
});
