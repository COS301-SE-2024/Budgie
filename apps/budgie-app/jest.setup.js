import {
  mockFirebaseAuth,
  mockNextImage,
  mockNextRouter,
} from '../../shared/budgie-components/src/mocks/globalMocks';

jest.mock('firebase/auth', () => mockFirebaseAuth);
jest.mock('next/image', () => mockNextImage.Image);
jest.mock('next/navigation', () => mockNextRouter);
