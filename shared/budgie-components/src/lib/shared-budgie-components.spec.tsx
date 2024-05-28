import { render } from '@testing-library/react';

import SharedBudgieComponents from './shared-budgie-components';

describe('SharedBudgieComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedBudgieComponents />);
    expect(baseElement).toBeTruthy();
  });
});
