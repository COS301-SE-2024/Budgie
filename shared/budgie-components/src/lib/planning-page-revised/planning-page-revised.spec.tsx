import { render } from '@testing-library/react';

import PlanningPageRevised from './planning-page-revised';

describe('PlanningPageRevised', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlanningPageRevised />);
    expect(baseElement).toBeTruthy();
  });
});
