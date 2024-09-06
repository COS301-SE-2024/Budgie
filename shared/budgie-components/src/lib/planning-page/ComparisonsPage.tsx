import React from 'react';
import styles from './ComparisonsPage.module.css'; // CSS Module for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons'; // Import the specific user icon
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'; // Import recharts components

// Dummy data for the bar chart with unique colors
const data = [
    { category: 'Groceries', amount: 3000, color: '#ff6f61' },
    { category: 'Utilities', amount: 1500, color: '#ffcc00' },
    { category: 'Entertainment', amount: 2000, color: '#00bfae' },
    { category: 'Shopping', amount: 2500, color: '#8e44ad' },
    { category: 'Eating Out', amount: 1800, color: '#3498db' },
    { category: 'Transport', amount: 2200, color: '#e74c3c' },
    { category: 'Medical Aid', amount: 3500, color: '#2ecc71' },
    { category: 'Insurance', amount: 2700, color: '#e67e22' },
    { category: 'Other', amount: 1000, color: '#9b59b6' }
];

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
                    <h3>Average Income of an 30 Year Old</h3>
                    <div className={styles.triangle}>R50,000</div>
                </div>

                {/* Your Income Section */}
                <div className={styles.rightHalf}>
                    <h3>Your Income</h3>
                    <div className={styles.triangle}>R60,000</div>
                </div>
            </div>

            {/* Comparison Bar Chart */}
            <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                    <h3 className={styles.gridTitle}>
                        How you compare to other people earning R50 000
                    </h3>
                </div>
                <BarChart
                    width={1200} // Increased width for better spacing
                    height={400}
                    data={data}
                    margin={{ top: 20, right: 70, left: 80, bottom: 80 }} // Adjust margins
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {data.map((entry) => (
                        <Bar
                            key={entry.category}
                            dataKey="amount"
                            fill={entry.color}
                            name={entry.category}
                        />
                    ))}
                </BarChart>
            </div>

            <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                    <h2 className={styles.gridTitle}>
                        Annual Salary according to Position
                    </h2>
                </div>
                Under Construction
            </div>

            <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                    <h2 className={styles.gridTitle}>
                        Annual Salary According to Experience
                    </h2>
                </div>
                Under Construction
            </div>
        </div>
    );
}

export default ComparisonsPage;
