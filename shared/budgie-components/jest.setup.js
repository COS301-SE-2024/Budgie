import { mockFirebaseAuth, mockNextImage } from './src/mocks/globalMocks';

jest.mock('firebase/auth', () => mockFirebaseAuth);
jest.mock('next/image', () => mockNextImage.Image);
