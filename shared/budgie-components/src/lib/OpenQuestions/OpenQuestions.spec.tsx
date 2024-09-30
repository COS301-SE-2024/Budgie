import { render } from '@testing-library/react';

import OpenQuestions from './OpenQuestions';

describe('OpenQuestions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OpenQuestions />);
    expect(baseElement).toBeTruthy();
  });
});
