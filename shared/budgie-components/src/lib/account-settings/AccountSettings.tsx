'use client';
import styles from './AccountSettings.module.css';
import '../../root.css';
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { db, auth } from '../../../../../apps/budgie-app/firebase/clientApp';
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';

/* eslint-disable-next-line */
export interface AccountSettingsProps {
  onClose: () => void;
}

export function AccountSettings(props: AccountSettingsProps) {
  const auth = getAuth();
  let user = null;
  if (auth) {
    user = auth.currentUser;
  }
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [OldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [error, setError] = useState(false);
  const [ConPassword, setConPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChangePassword = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.error('No user is currently logged in.');
      setError(true);
      setErrorMessage('No user is currently logged in.');
      return;
    }
    const credential = EmailAuthProvider.credential(user.email, OldPassword);
    await reauthenticateWithCredential(user, credential)
      .then(() => {
        console.log('Authenticated successfully');
      })
      .catch((error) => {
        console.log('Reauthentication failed');
        setError(true);
        setErrorMessage(error.message);
        return;
      });
    if (newPassword !== ConPassword) {
      setError(true);
      setErrorMessage('Password mismatch');
      return;
    }

    updatePassword(user, newPassword)
      .then(() => {
        console.log('new password set');
        handlecClosePopup();
      })
      .catch((e) => {
        console.log('here');
        setError(true);
        setErrorMessage(e.message);
        return;
      });
  };

  const handleDeleteUser = async () => {
    console.log('hi');
    if (!user) {
      setMessage('No user is signed in');
      return;
    }
    const credential = EmailAuthProvider.credential(user.email || '', password);
    try {
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      auth.signOut();

      alert('User deleted.');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + (error as Error).message);
    }
  };
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isCPopupVisible, setCPopupVisible] = useState(false);

  const handleDeleteClick = () => {
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handlePassChangeClick = () => {
    setCPopupVisible(true);
  };

  const handlecClosePopup = () => {
    setCPopupVisible(false);
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
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Profile Information</p>
          <p className={styles.settingDescription}>
            Edit your profile information.
          </p>
        </div>
        <div className="p-4 bg-white shadow-md rounded-md">
          <p className="text-lg font-semibold mb-2">Password Management</p>
          <p className="text-sm text-gray-600 mb-4">Change your password.</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handlePassChangeClick}
          >
            Change password
          </button>
          {isCPopupVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-md shadow-md">
                <p className="mb-2">Type in your old password:</p>
                <input
                  type="password"
                  value={OldPassword}
                  placeholder="Enter your old password"
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded w-3/4 mb-4"
                />
                <p className="mb-2">Type in your new password:</p>
                <input
                  type="password"
                  value={newPassword}
                  placeholder="Enter your new password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded w-3/4 mb-4"
                />
                <p className="mb-2">Confirm new password:</p>
                <input
                  type="password"
                  value={ConPassword}
                  placeholder="Enter your new password"
                  onChange={(e) => setConPassword(e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded w-3/4 mb-4"
                />
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={handleChangePassword}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Delete Account</p>
          <p className={styles.settingDescription}>
            Click the button below to start deleting your account. Learn about
            our deletion policy here.
          </p>
          <button className={styles.deleteButton} onClick={handleDeleteClick}>
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
