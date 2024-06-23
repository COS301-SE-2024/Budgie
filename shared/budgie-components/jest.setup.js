import {
  mockFirebaseAuth,
  mockNextImage,
  mockFirebaseFunctions,
  mockNextRouter,
} from './src/mocks/globalMocks';

jest.mock('firebase/auth', () => mockFirebaseAuth);
jest.mock('next/image', () => mockNextImage.Image);
jest.mock('firebase/functions', () => mockFirebaseFunctions);
jest.mock('next/navigation', () => mockNextRouter);
