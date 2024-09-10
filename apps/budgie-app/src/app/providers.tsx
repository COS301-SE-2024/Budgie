'use client';

import { UserProvider } from '@capstone-repo/shared/budgie-components';

export function Providers({ children }: any) {
  return <UserProvider>{children}</UserProvider>;
}
