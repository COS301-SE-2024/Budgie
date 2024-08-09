import { render } from '@testing-library/react';

import NotificationSettings from './notification-settings';

describe('NotificationSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NotificationSettings />);
    expect(baseElement).toBeTruthy();
  });
});
