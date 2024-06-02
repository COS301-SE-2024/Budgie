'use client';
import styles from './AccountSettings.module.css';
import "../../root.css";
import React, { useState, useEffect } from 'react';
import {doc, getDoc, updateDoc } from "firebase/firestore";
import {db, auth} from '../../../../../apps/budgie-app/firebase/clientApp'

/* eslint-disable-next-line */
export interface AccountSettingsProps {
  onClose: () => void;
}

const currentUser = auth.currentUser;

export function AccountSettings(props: AccountSettingsProps) {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, 'Users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      }
      else {
        setUser(null);
        setUserData(null);
        console.log("No user signed in.");
      }
    };

    fetchUser();
  }, []);
 
  const [isPopupVisible, setPopupVisible] = useState(false);

  const handleDeleteClick = () => {
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleConfirmDelete = async (inputPassword: string) => {
    const correctPassword = userData.password;
    if (correctPassword===inputPassword)
    {
      try {
        const docRef = doc(db, 'Users', user.uid);
        await updateDoc(docRef, { name: 'Deleted', surname: 'Deleted', email: 'Deleted', deleted: 'True', ProfilePicture: '', OauthID: '', OauthProvider: '' });
      } catch (error) {
        console.error('Error deleting user:', error);
      }
      alert('Account deleted!');
      setPopupVisible(false);
    }
    else
    {
      alert('Incorrect Password.');
    }
  };

  return <div className='mainPage'>
  <div className='pageTitle'>
      <span className="material-symbols-outlined" onClick={props.onClose} style={{ marginRight: "0.5rem",fontSize: "1.5rem"}}>arrow_back</span>
      Account Settings
  </div>
  <div className={styles.settingsOptionsContainer}>
    <div className={styles.settingsOption}>
      <p className={styles.settingTitle}>Profile Information</p>
      <p className={styles.settingDescription}>Edit your profile information.</p>
    </div>
    <div className={styles.settingsOption}>
      <p className={styles.settingTitle}>Password Management</p>
      <p className={styles.settingDescription}>Change your password.</p>
    </div>
    <div className={styles.settingsOption}>
      <p className={styles.settingTitle}>Delete Account</p>
      <p className={styles.settingDescription}>Click the button below to start deleting your account. Learn about out deletion policy here.</p>
      <button className={styles.deleteButton} onClick={handleDeleteClick}>
        <div className={styles.deleteButton}>Delete Account</div>
      </button>
      {isPopupVisible && (
        <div className= {styles.popupOverlay}>
          <div className={styles.popupContent}>
            <p>Type in your password to confirm account deletion:</p>
            <input
              type="password"
              value = {password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              style={{paddingLeft: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', height: '2.5rem', width: '70%'}}
            />
            <button className={styles.confirmButton} onClick={()=>handleConfirmDelete(password)}>
              Confirm
            </button>
            <br></br>
            <button className={styles.cancelButton} onClick={handleClosePopup}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>;
}

export default AccountSettings;

