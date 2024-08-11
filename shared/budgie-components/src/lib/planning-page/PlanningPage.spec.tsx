import { render } from '@testing-library/react';

import PlanningPage from './PlanningPage';

describe('PlanningPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlanningPage />);
    expect(baseElement).toBeTruthy();
  });
});
