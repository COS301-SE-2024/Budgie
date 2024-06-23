export const mockFirebaseAuth = {
  createUserWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  // Add any other methods you need to mock
};

export const mockFirebaseFunctions = {
  getFunctions: jest.fn(),
};

export const mockNextImage = {
  Image: ({ src, alt }) => {
    // Implement a fallback component for testing purposes
    return <img src={src} alt={alt} />;
  },
};

export const mockNextRouter = {
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    // Add any other methods you use from next/navigation
  }),
};
