'use client';
import styles from './AccountSettings.module.css';
import '../../root.css';
import React, { useState, useContext } from 'react';
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  updatePassword
} from 'firebase/auth';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { FirebaseError } from 'firebase/app';

/* eslint-disable-next-line */
export interface AccountSettingsProps {
  onClose: () => void;
}

export function AccountSettings(props: AccountSettingsProps) {
  const auth = getAuth();
  const user = auth.currentUser;

  const [password, setPassword] = useState<string>(''); // To store user password for reauthentication
  const [message, setMessage] = useState<string>('');
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [conPassword, setConPassword] = useState<string>('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChangePassword = async () => {
    setError(false);
    setMessage('');

    if (!user) {
      setError(true);
      setErrorMessage('No user is currently logged in.');
      alert('No user is currently logged in.');
      return;
    }

    if (user.email) {
      try {
        // Reauthenticate user with old password
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, credential);
        console.log('Authenticated successfully');

        // Check password complexity
        if (newPassword.length<6) {
          alert('New password is too weak. It must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
          return;
        }

        if (newPassword !== conPassword) {
          alert('Password mismatch. The new password and confirmation do not match.');
          return;
        }

        // Update the password
        await updatePassword(user, newPassword);
        console.log('New password set');
        alert('Password updated successfully!');
        handlecClosePopup();
      } catch (e: any) {
        // Check if the error is related to wrong current password
        if (e.code === 'auth/wrong-password') {
          alert('Incorrect current password. Please try again.');
        } else {
          console.log('Error setting new password:', e);
          alert('Error updating password: ' + e.message);
        }
      }
    }
  };


  const handleDeleteUser = async () => {
    if (!user) {
      setMessage('No user is signed in');
      return;
    }

    try {
      if (user.providerData[0].providerId === 'google.com') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          await reauthenticateWithCredential(user, credential);
          console.log('Reauthenticated with Google');
        } else {
          throw new Error('Failed to retrieve Google credentials');
        }
      } else if (user.providerData[0].providerId === 'password') {
        if (!password) {
          setErrorMessage('Please enter your password.');
          return;
        }

        // Create credential with email and password
        const credential = EmailAuthProvider.credential(user.email || '', password);

        // Attempt reauthentication with email/password
        await reauthenticateWithCredential(user, credential);
        console.log('Reauthenticated with email and password');
      }

      // Proceed with account deletion
      await deleteUser(user);
      alert('Your account has been deleted.');
      auth.signOut();
      setMessage('Account successfully deleted');

    } catch (error) {
      // Ensure that the error is an instance of FirebaseError
      if (error instanceof FirebaseError) {
        // Check if the error is due to wrong password
        if (error.code === 'auth/wrong-password') {
          setErrorMessage('Incorrect password. Please try again.');
          alert('Incorrect password. Please try again.');
        } else if (error.code === 'auth/popup-closed-by-user') {
          setErrorMessage('Popup closed before reauthentication.');

        } else {
          console.log('Error deleting user:', error);
          setErrorMessage('Failed to delete user: ' + error.message);
          alert('Error deleting user: ' + error.message);
        }
      } else {
        // If the error is not a FirebaseError, log and display a generic message
        console.log('Unknown error:', error);
        setErrorMessage('An unknown error occurred. Please try again.');
        alert('An unknown error occurred. Please try again.');
      }
    }
  };

  let signUpType;

  if (user) {
    user.providerData.forEach((profile) => {
      if (profile.providerId === 'google.com') {
        signUpType = "Google";
      } else if (profile.providerId === 'password') {
        signUpType = "Manual";
      } else {
        signUpType = profile.providerId;
      }
    });
  }

  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isCPopupVisible, setCPopupVisible] = useState(false);

  const handleDeleteClick = () => {
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPassword('');
    setPopupVisible(false);
  };

  const handlePassChangeClick = () => {
    setCPopupVisible(true);
  };

  const handlecClosePopup = () => {
    setCPopupVisible(false);
    setError(false);
  };

  return (
    <div className="mainPage">
      <div className="pageTitle">
        <span
          className="material-symbols-outlined"
          onClick={props.onClose}
          style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}
        >
          arrow_back
        </span>
        Account Settings
      </div>
      <div className={styles.settingsOptionsContainer}>
        {signUpType == "Manual" && (
          <div className={styles.settingsOption}>
            <p className={styles.settingTitle}>Password Management</p>
            <p className={styles.settingDescription}>Change your password.</p>
            <button
              className={styles.actionButton}
              onClick={handlePassChangeClick}
            >
              <div className={styles.deleteButton}>Change Password</div>
            </button>
            {isCPopupVisible && (
              <div className={styles.changeOverlay}>
                <div className={styles.popupContent}>
                  <p className="mb-2">Type in your old password:</p>
                  <input
                    type="password"
                    value={oldPassword}
                    placeholder="Enter your old password"
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="px-2 py-2 border border-gray-300 rounded w-500 mb-4"
                  />
                  <p className="mb-2">Type in your new password:</p>
                  <input
                    type="password"
                    value={newPassword}
                    placeholder="Enter your new password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-2 py-2 border border-gray-300 rounded w-500 mb-4"
                  />
                  <p className="mb-2">Confirm new password:</p>
                  <input
                    type="password"
                    value={conPassword}
                    placeholder="Confirm new password"
                    onChange={(e) => setConPassword(e.target.value)}
                    className="px-2 py-2 border border-gray-300 rounded w-500 mb-4 "
                  />
                  <div className="flex justify-between mt-4">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={handleChangePassword}
                    >
                      Confirm
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-900"
                      onClick={handlecClosePopup}
                    >
                      Cancel
                    </button>
                  </div>
                  {error && (
                    <div className="pt-2 text-red-600 font-medium">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Account Deletion</p>
          <p className={styles.settingDescription}>
            Click the button below to start deleting your account. Learn about
            our deletion policy here.
          </p>
          <button className={styles.actionButton} onClick={signUpType == "Google" ? handleDeleteUser : handleDeleteClick}>
            <div className={styles.deleteButton}>Delete Account</div>
          </button>
          {isPopupVisible && (
            <div className={styles.popupOverlay}>
              <div className={styles.popupContent}>
                <p>Type in your password to confirm account deletion:</p>
                <input
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    paddingLeft: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    height: '2.5rem',
                    width: '70%',
                  }}
                />
                <button
                  className={styles.confirmButton}
                  onClick={handleDeleteUser}
                >
                  Confirm
                </button>
                <br></br>
                <button
                  className={styles.cancelButton}
                  onClick={handleClosePopup}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
