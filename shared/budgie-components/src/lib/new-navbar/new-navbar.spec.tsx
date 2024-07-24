import { render } from '@testing-library/react';

import NewNavbar from './new-navbar';

describe('NewNavbar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NewNavbar />);
    expect(baseElement).toBeTruthy();
  });
});
