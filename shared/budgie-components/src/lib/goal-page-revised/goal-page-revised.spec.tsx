import { render } from '@testing-library/react';

import GoalPageRevised from './goal-page-revised';

describe('GoalPageRevised', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GoalPageRevised />);
    expect(baseElement).toBeTruthy();
  });
});
