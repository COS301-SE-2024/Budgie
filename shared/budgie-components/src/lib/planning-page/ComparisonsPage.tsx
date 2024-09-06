import React from 'react';
import styles from './ComparisonsPage.module.css'; // CSS Module for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons'; // Import the specific user icon

export function ComparisonsPage() {
    return (
        <div className={styles.comparisonsPage}>
            {/* User Info Button */}
            <button className={styles.userInfoButton}>
                <FontAwesomeIcon icon={faUser} className={styles.userIcon} /> User Info
            </button>

            {/* Income Grid */}
            <div className={styles.incomeGrid}>
                {/* Average Income Section */}
                <div className={styles.leftHalf}>
                    <h3>Average Income of an X Year Old</h3>
                    <div className={styles.triangle}>R50,000</div>
                </div>

                {/* Your Income Section */}
                <div className={styles.rightHalf}>
                    <h3>Your Income</h3>
                    <div className={styles.triangle}>R60,000</div>
                </div>
            </div>
        </div>
    );
}

export default ComparisonsPage;
