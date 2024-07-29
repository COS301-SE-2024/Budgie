import { render } from '@testing-library/react';

import AccountsPage from './accounts-page';

describe('AccountsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AccountsPage />);
    expect(baseElement).toBeTruthy();
  });
});
