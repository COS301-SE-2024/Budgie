import { useEffect, useState } from 'react';
import styles from './notification-settings.module.css';

/* eslint-disable-next-line */
export interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings(props: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    budget: false,
    goal: false,
    spending: false,
    csv: false,
  });

  useEffect(() => {
    const storedSettings = {
      budget: localStorage.getItem('budget') === 'true',
      goal: localStorage.getItem('goal') === 'true',
      spending: localStorage.getItem('spending') === 'true',
      csv: localStorage.getItem('csv') === 'true',
    };
    setSettings(storedSettings);
  }, []);

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: checked,
    }));
  }

  function saveSettings() {
    localStorage.setItem('budget', settings.budget.toString());
    localStorage.setItem('goal', settings.goal.toString());
    localStorage.setItem('spending', settings.spending.toString());
    localStorage.setItem('csv', settings.csv.toString());

    alert('Settings saved.');
  }

  function uncheckAll() {
    setSettings({
      budget: false,
      goal: false,
      spending: false,
      csv: false,
    });
  }

  return (
    <>
      <div className="mainPage">
        <div className="pageTitle">
          <span
            className="material-symbols-outlined"
            onClick={props.onClose}
            style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}
          >
            arrow_back
          </span>
          Notification Settings
        </div>
        <div className="bg-white rounded-lg shadow-lg w-96">
          <div className="p-6 space-y-6">
            <div>
              <div className="mt-3 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Budget updates
                    </p>
                    <p className="text-xs text-gray-500">
                      Updates about your current budget to your email.
                    </p>
                  </div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="toggle-switch"
                      name="budget"
                      data-testid="budget"
                      checked={settings.budget}
                      onChange={handleCheckboxChange}
                    />
                  </label>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Goal progress
                    </p>
                    <p className="text-xs text-gray-500">
                      Updates and alerts directly to your email about your
                      progress towards your goal
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
                    <p className="text-sm font-medium text-gray-800">
                      Spending warnings
                    </p>
                    <p className="text-xs text-gray-500">
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
                    <p className="text-sm font-medium text-gray-800">
                      CSV remainder
                    </p>
                    <p className="text-xs text-gray-500">
                      Alert to upload a csv to make sure app is up to date with
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
              className="bg-black text-white px-4 py-2 rounded"
              onClick={uncheckAll}
            >
              Clear
            </button>
            <button
              className="bg-black text-white px-4 py-2 rounded"
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
