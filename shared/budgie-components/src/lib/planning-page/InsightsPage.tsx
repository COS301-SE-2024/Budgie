import React from 'react';
import styles from './InsightsPage.module.css'; // Import the CSS module for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGasPump, faBank, faHome, faBus, faLightbulb } from '@fortawesome/free-solid-svg-icons'; // Icons for petrol, bank, home, transport, utilities

export function InsightsPage() {
    return (
        <div className={styles.insightsContainer}>
            {/* Petrol Prices Grid */}
            <div className={styles.gridItem}>
                <div className={styles.gridItemTitleBox}>
                    <h2 className={styles.gridItemTitle}>Petrol Prices</h2>
                </div>
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <span>Product Name</span>
                        <span>Coastal</span>
                        <span>Inland</span>
                    </div>
                    <div className={styles.tableRow}>
                        <div className={styles.productName}>
                            <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                            <span>95 Unleaded Petrol with Techkron</span>
                        </div>
                        <span>cpl 23.32</span>
                        <span>cpl 23.22</span>
                    </div>
                    <div className={styles.tableRow}>
                        <div className={styles.productName}>
                            <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                            <span>93 Unleaded Petrol with Techkron</span>
                        </div>
                        <span>cpl 22.45</span>
                        <span>cpl 22.35</span>
                    </div>
                </div>
            </div>

            {/* Bank Insights Grid */}
            <div className={styles.gridItem}>
                <div className={styles.gridItemTitleBox}>
                    <h2 className={styles.gridItemTitle}>Bank Insights</h2>
                </div>
                <div className={styles.bankInsightsContainer}>
                    <div className={styles.navigation}>
                        <span className={styles.arrow}>&lt;</span>
                        <div className={styles.bankInfo}>
                            <FontAwesomeIcon icon={faBank} className={styles.bankIcon} />
                            <span>FNB</span>
                        </div>
                        <span className={styles.arrow}>&gt;</span>
                    </div>
                    <div className={styles.prosConsContainer}>
                        <div className={styles.pros}>
                            <h3>Pros</h3>
                            <div className={styles.underline}></div>
                            <div className={styles.prosItem}>Bank Fees: R50</div>
                            <div className={styles.prosItem}>Earn Ebucks</div>
                        </div>
                        <div className={styles.cons}>
                            <h3>Cons</h3>
                            <div className={styles.underline}></div>
                            <div className={styles.consItem}>Limited Branches</div>
                            <div className={styles.consItem}>High Interest on Loans</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Property and Rent Grid */}
            <div className={styles.gridItem}>
                <div className={styles.gridItemTitleBox}>
                    <h2 className={styles.gridItemTitle}>Property and Rent</h2>
                </div>
                <div className={styles.propertyTable}>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Apartment (1 bedroom) in City Central</span>
                        <span>R7588.00</span>
                    </div>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Apartment (2 bedroom) in Suburban Area</span>
                        <span>R8900.00</span>
                    </div>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Studio Apartment in City Outskirts</span>
                        <span>R6200.00</span>
                    </div>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Luxury Apartment in City Central</span>
                        <span>R12500.00</span>
                    </div>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Shared Room in Suburban Area</span>
                        <span>R4500.00</span>
                    </div>
                </div>
            </div>

            {/* Transport Prices Grid */}
            <div className={styles.gridItem}>
                <div className={styles.gridItemTitleBox}>
                    <h2 className={styles.gridItemTitle}>Transport Prices</h2>
                </div>
                <div className={styles.transportTable}>
                    <div className={styles.transportRow}>
                        <FontAwesomeIcon icon={faBus} className={styles.icon} />
                        <span>One-way Ticket (Local Transport)</span>
                        <span>R15.00</span>
                    </div>
                    <div className={styles.transportRow}>
                        <FontAwesomeIcon icon={faBus} className={styles.icon} />
                        <span>Monthly Pass (Regular Price)</span>
                        <span>R450.00</span>
                    </div>
                </div>
            </div>

            {/* Utility Prices Grid */}
            <div className={styles.gridItem}>
                <div className={styles.gridItemTitleBox}>
                    <h2 className={styles.gridItemTitle}>Utility Prices</h2>
                </div>
                <div className={styles.utilityTable}>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faLightbulb} className={styles.icon} />
                        <span>Basic electricity, water</span>
                        <span>R1,880.14</span>
                        <span>Range: 1,000.00 - 4,500.00</span>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default InsightsPage;
