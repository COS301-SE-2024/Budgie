import React, { useState } from 'react';
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

// Dummy data for dropdown options
const jobPositions = ['Developer', 'Manager', 'Analyst', 'Designer'];
const industries = ['Technology', 'Finance', 'Healthcare', 'Education'];

export function ComparisonsPage() {
    const [showForm, setShowForm] = useState(false);
    const [age, setAge] = useState('');
    const [jobPosition, setJobPosition] = useState(jobPositions[0]);
    const [industry, setIndustry] = useState(industries[0]);

    const handleShowForm = () => setShowForm(true);
    const handleCloseForm = () => setShowForm(false);

    const handleSubmit = () => {
        // e.preventDefault();
        // Handle form submission logic here
        console.log('Submitted:', { age, jobPosition, industry });
        handleCloseForm();
    };

    return (
        <div className={styles.comparisonsPage}>
            {/* User Info Button */}
            <button className={styles.userInfoButton} onClick={handleShowForm}>
                <FontAwesomeIcon icon={faUser} className={styles.userIcon} /> User Info
            </button>

            {/* Pop-up Form */}
            {showForm && (
                <div className={styles.popupForm}>
                    <div className={styles.formContainer}>
                        <h2>User Information</h2>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Age:
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Job Position:
                                <select
                                    value={jobPosition}
                                    onChange={(e) => setJobPosition(e.target.value)}
                                    required
                                >
                                    {jobPositions.map((position) => (
                                        <option key={position} value={position}>
                                            {position}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Industry:
                                <select
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    required
                                >
                                    {industries.map((industry) => (
                                        <option key={industry} value={industry}>
                                            {industry}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button type="submit">Submit</button>
                            <button type="button" onClick={handleCloseForm}>Close</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Income Grid */}
            <div className={styles.incomeGrid}>
                {/* Average Income Section */}
                <div className={styles.leftHalf}>
                    <h3>Average Income of a 30 Year Old</h3>
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
                        How you compare to other people earning R50,000
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

            <div className={styles.gridContainer}>
                {/* Position Grid */}
                <div className={styles.gridItem}>
                    <div className={styles.gridTitleContainer}>
                        <h3 className={styles.gridTitle}>Annual Salary according to Position</h3>
                    </div>
                    <div className={styles.comparisonContainer}>
                        {/* Title at the top and centered */}
                        <h3 className={styles.centeredTitle}>CEO</h3>

                        {/* Status Bar/Bar Graph Comparison */}
                        <div className={styles.statusBar}>
                            <div className={styles.userBar}></div>
                            <div className={styles.divider}></div>
                            <div className={styles.marketBar}></div>
                        </div>

                        {/* Labels for the bars */}
                        <div className={styles.labels}>
                            <span className={styles.userLabel}>You</span>
                            <span className={styles.amount}>R50 000</span>
                            <span className={styles.marketLabel}>Market Avg</span>
                            <span className={styles.amount}>R75 642</span>
                        </div>
                    </div>
                </div>

                {/* Industry Grid */}
                <div className={styles.gridItem}>
                    <div className={styles.gridTitleContainer}>
                        <h3 className={styles.gridTitle}>Annual Salary According to Industry</h3>
                    </div>
                    <div className={styles.comparisonContainer}>
                        {/* Title at the top and centered */}
                        <h3 className={styles.centeredTitle}>5-6 Years</h3>

                        {/* Status Bar/Bar Graph Comparison */}
                        <div className={styles.statusBar}>
                            <div className={styles.userBar}></div>
                            <div className={styles.divider}></div>
                            <div className={styles.marketBar}></div>
                        </div>

                        {/* Labels for the bars */}
                        <div className={styles.labels}>
                            <span className={styles.userLabel}>You</span>
                            <span className={styles.amount}>R70 000</span>
                            <span className={styles.marketLabel}>Market Avg</span>
                            <span className={styles.amount}>R65 000</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComparisonsPage;
