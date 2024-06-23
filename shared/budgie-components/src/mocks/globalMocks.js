export const mockFirebaseAuth = {
  createUserWithEmailAndPassword: jest.fn(),
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
};

export const mockFirebaseFunctions = {
  getFunctions: jest.fn(),
};

export const mockNextImage = {
  Image: ({ src, alt }) => {
    return <img src={src} alt={alt} />;
  },
};

export const mockNextRouter = {
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
};
