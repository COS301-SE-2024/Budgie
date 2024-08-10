import { render } from '@testing-library/react';

import MonthlyTransactionsView from './MonthlyTransactionsView';

describe('MonthlyTransactionsView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MonthlyTransactionsView />);
    expect(baseElement).toBeTruthy();
  });
});
