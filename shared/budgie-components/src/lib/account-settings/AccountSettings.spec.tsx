import { render } from '@testing-library/react';

import AccountSettings from './AccountSettings';

describe('AccountSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AccountSettings />);
    expect(baseElement).toBeTruthy();
  });
});
