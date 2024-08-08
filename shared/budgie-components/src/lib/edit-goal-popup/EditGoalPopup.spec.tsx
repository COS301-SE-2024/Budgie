import { render } from '@testing-library/react';

import EditGoalPopup from './EditGoalPopup';

describe('EditGoalPopup', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EditGoalPopup />);
    expect(baseElement).toBeTruthy();
  });
});
