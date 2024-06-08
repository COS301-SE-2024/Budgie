import "../../root.css";
import React, { useRef, useState } from 'react';
import styles from './UploadStatementCSV.module.css';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from 'firebase/auth';

export interface UploadStatementCSVProps {
  onFileUpload: (file: File) => void;
}

export function UploadStatementCSV(props: UploadStatementCSVProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const handleButtonClick = () => {
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Get the current user's ID
      const user = getAuth().currentUser;
      if (user) {
        const userId = user.uid;

        props.onFileUpload(file);
        setPopupVisible(false);

        if (storage) {
          const storageRef = ref (storage, `${userId}`);
          // Set the storage reference to the root directory with user ID as the file name
          uploadBytes(storageRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
          }).catch((error) => {
            console.error('Upload failed', error);
          });
        } else {
          console.error('Storage is not initialized.');
        }
      } else {
        console.error('User is not authenticated.');
      }
    }
  };

  return (
    <div>
      <button className={styles.uploadButton} onClick={handleButtonClick}>
        Upload Bank Statement (.csv)
      </button>
      {isPopupVisible && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <h2>Upload Bank Statement</h2>
            </div>
            <div className={styles.popupContent}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv"
                onChange={handleFileChange}
              />
              <button className={styles.uploadButton} onClick={() => fileInputRef.current?.click()}>
                Choose File
              </button>
              <button className={styles.closeButton} onClick={handleClosePopup}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadStatementCSV;
