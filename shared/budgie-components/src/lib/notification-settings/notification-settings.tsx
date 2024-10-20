import { useEffect, useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import styles from './notification-settings.module.css';
import { getAuth } from 'firebase/auth';

/* eslint-disable-next-line */
export interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings(props: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    goal: false,
    spending: false,
    csv: false,
  });

  useEffect(() => {
    const auth = getAuth(); // Get the Auth instance
    const firestore = getFirestore(); // Get the Firestore instance
    const user = auth.currentUser; // Get the current user

    if (user) {
      const storedSettings = {
        goal: localStorage.getItem('goal') === 'true',
        spending: localStorage.getItem('spending') === 'true',
        csv: localStorage.getItem('csv') === 'true',
      };

      setSettings(storedSettings);

      const storeSettingsInFirestore = async () => {
        try {
          const userSettingsRef = doc(firestore, 'usersSettings', user.uid); // Create a reference to the user's settings document
          await setDoc(userSettingsRef, storedSettings, { merge: true }); // Use setDoc to store settings
          console.log('Settings stored in Firestore:', storedSettings);
        } catch (error) {
          console.error('Error storing settings in Firestore:', error);
        }
      };

      storeSettingsInFirestore();
    } else {
      console.log('No user is signed in.');
    }
  }, []);

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: checked,
    }));
  }

  function saveSettings() {
    localStorage.setItem('goal', settings.goal.toString());
    localStorage.setItem('spending', settings.spending.toString());
    localStorage.setItem('csv', settings.csv.toString());
  }

  function uncheckAll() {
    setSettings({
      goal: false,
      spending: false,
      csv: false,
    });
  }

  return (
    <>
      <div
        className="flex flex-col shadow-lg z-10 fixed top-0 right-0  bg-[var(--main-background)] p-8 h-full"
        style={{ width: '85vw' }}
      >
        <div className="pageTitle">
          <span
            className="material-symbols-outlined cursor-pointer left-100"
            style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}
            onClick={props.onClose}
          >
            arrow_back
          </span>
          Notification Settings
        </div>
        <div className="flex flex-col bg-white rounded-lg shadow-lg w-full mt-4">
          <div className="p-6 space-y-6">
            <div>
              <div className="mt-2 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md font-medium text-gray-800">
                      Goal progress
                    </p>
                    <p className="text-sm text-gray-500">
                      Updates and alerts directly to your email about your
                      progress towards your goal.
                    </p>
                  </div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="toggle-switch"
                      name="goal"
                      data-testid="goal"
                      checked={settings.goal}
                      onChange={handleCheckboxChange}
                    />
                  </label>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md font-medium text-gray-800">
                      Spending warnings
                    </p>
                    <p className="text-sm text-gray-500">
                      Updates and alerts via email about your spending.
                    </p>
                  </div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="toggle-switch"
                      name="spending"
                      data-testid="spending"
                      checked={settings.spending}
                      onChange={handleCheckboxChange}
                    />
                  </label>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md font-medium text-gray-800">
                      CSV reminder
                    </p>
                    <p className="text-sm text-gray-500">
                      Alert to upload a CSV to ensure the app is up to date with
                      your spending.
                    </p>
                  </div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="toggle-switch"
                      name="csv"
                      data-testid="csv"
                      checked={settings.csv}
                      onChange={handleCheckboxChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t px-6 py-4 flex justify-between items-center">
            <button
              className=" bg-slate-400 text-white px-4 py-2 rounded"
              onClick={uncheckAll}
            >
              Clear
            </button>
            <button
              className=" bg-green-500 text-white px-4 py-2 rounded"
              onClick={saveSettings}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationSettings;
