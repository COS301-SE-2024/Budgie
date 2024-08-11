import { render } from '@testing-library/react';

import AddGoalPopup from './AddGoalPopup';

describe('AddGoalPopup', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AddGoalPopup />);
    expect(baseElement).toBeTruthy();
  });
});
