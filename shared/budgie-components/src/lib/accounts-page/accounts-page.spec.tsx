import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AccountsPage } from './accounts-page';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';

// Mocking dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
}));
jest.mock('../../useThemes', () => ({
  useThemeSettings: jest.fn(),
}));

const mockRouterPush = jest.fn();

describe('AccountsPage', () => {
  const mockUser = { uid: 'user123' };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

});
