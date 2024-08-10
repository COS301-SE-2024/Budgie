import { render } from '@testing-library/react';
import { 
  query, 
  collection, 
  where, 
  getDocs,
  getFirestore } from 'firebase/firestore';
import OverviewPage from './overview-page';
import {
  getUser,
  getAccounts
} from './overviewServices';

/*============================================================================================
 MOCKS
============================================================================================*/

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

// Import the mocked getAuth function
import { getAuth } from 'firebase/auth';

// Mock Firebase Firestore methods
jest.mock('firebase/firestore', () => ({
  query: jest.fn(),
  collection: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  getFirestore: jest.fn(),
}));

const mockQuery = query as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockWhere = where as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockGetFirestore = getFirestore as jest.Mock;
const mockGetUser = getUser as jest.Mock;

/*============================================================================================
 UNIT TESTS
============================================================================================*/

describe('getUser', () => {
  it('should return the user id if user is logged in', () => {
    const mockUid = '123456';
    const mockAuth = {
      currentUser: { uid: mockUid },
    };

    // Mock the getAuth function to return the mockAuth object
    (getAuth as jest.Mock).mockReturnValue(mockAuth);

    const result = getUser();
    expect(result).toBe(mockUid);
  });

  it('should return undefined if no user is logged in', () => {
    // Mock the getAuth function to return an object with no currentUser
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });

    const result = getUser();
    expect(result).toBeUndefined();
  });

  it('should return undefined if getAuth returns null', () => {
    // Mock the getAuth function to return null
    (getAuth as jest.Mock).mockReturnValue(null);

    const result = getUser();
    expect(result).toBeUndefined();
  });

});


// describe('getAccounts', () => {
//   it('should return accounts for the user', async () => {
//     const mockUid = '123456';
//     const mockAccounts = [
//       { id: '1', name: 'Account 1' },
//       { id: '2', name: 'Account 2' },
//     ];

//     // Mock getUser to return a predefined UID
//     mockGetUser.mockReturnValue(mockUid);

//     // Mock Firestore methods
//     mockCollection.mockReturnValue('mockCollection');
//     mockWhere.mockReturnValue('mockWhere');
//     mockQuery.mockReturnValue('mockQuery');
//     mockGetDocs.mockResolvedValue({
//       forEach: (callback: (doc: any) => void) => {
//         mockAccounts.forEach(account => callback({ data: () => account }));
//       },
//     });

//     const accounts = await getAccounts();

//     expect(accounts).toEqual(mockAccounts);
//     expect(mockGetDocs).toHaveBeenCalled();
//   });

// });

/*===========================================================================================
INTEGRATED TESTS
=============================================================================================*/

describe('OverviewPage', () => {
  it('should render successfully', () => {
    // const { baseElement } = render(<OverviewPage />);
    // expect(baseElement).toBeTruthy();
  });
});