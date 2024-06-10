import { render } from '@testing-library/react';
import SignUpModal from './SignUpModal';
import React from 'react';

// jest.mock('firebase/auth', () => ({
//   createUserWithEmailAndPassword: jest.fn(),
//   getAuth: jest.fn(),
//   GoogleAuthProvider: jest.fn(),
//   signInWithPopup: jest.fn(),
//   // Add any other methods you need to mock
// }));

// jest.mock('next/image', () => {
//   const Image = ({ src, alt }: { src: string; alt: string }) => {
//     // Implement a fallback component for testing purposes
//     return <img src={src} alt={alt} />;
//   };
//   return Image;
// });

describe('SignUpModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SignUpModal />);
    expect(baseElement).toBeTruthy();
  });
});
