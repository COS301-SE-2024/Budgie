import { render } from '@testing-library/react';

import LearnMore from './LearnMore';

describe('LearnMore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LearnMore />);
    expect(baseElement).toBeTruthy();
  });
});
