export const mockFirebaseAuth = {
  createUserWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  // Add any other methods you need to mock
};

export const mockNextImage = {
  Image: ({ src, alt }) => {
    // Implement a fallback component for testing purposes
    return <img src={src} alt={alt} />;
  },
};
