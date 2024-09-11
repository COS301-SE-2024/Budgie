import React, { useEffect, useState } from 'react';
import styles from './comparison-page.module.css';
import {
    getAccounts,
    getTransactions,
    getMonthlyIncome,
    getPosition,
    getIndustry,
    getExpensesByCategory,
    getUser,
    addUserInfo,
    getUserInfo,
    getIncomeByAge,
    getSpendingByCategory
} from './services';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons'; // Import the specific user icon
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Label, Legend, ResponsiveContainer, BarChart} from 'recharts';

export interface ComparisonPage {}

export const calculateAge = (date : any) => {
    // Calculate age from birth date
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

const formatCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
};

export function ComparisonPage(props: ComparisonPage) {

    interface Account {
        account_number: string;
        alias: string;
        name: string;
        type: string;
        uid: string;
    }

    interface Transaction {
        date: string;
        amount: number;
        balance: number;
        description: string;
        category: string;
    }

    const [isAccount, setIsAccount] = useState(false);
    const [isUserInfo, srtIsUserInfo] = useState(false);
    const [income, setIncome] = useState(0);
    const [positionValues, setPositionValues] = useState<(number)[]>([]);
    const [industryValues, setIndustryValues] = useState<(number)[]>([]);
    const [ageIncome, setAgeIncome] = useState(0);
    const [yourCategory, setYourCategory] = useState([0,0,0,0,0,0,0,0,0]);
    const [averageCategory, setAverageCategory] = useState([0,0,0,0,0,0,0,0,0]);
    const [formBirthDate, setFormBirthDate] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [age, setAge] = useState('');
    const [jobPosition, setJobPosition] = useState('Developer');
    const [industry, setIndustry] = useState('Technology');


    const handleShowForm = () => setShowForm(true);
    const handleCloseForm = () => setShowForm(false);

    const data = [
        { category: 'Groceries', average: averageCategory[0], you: yourCategory[0], color: '#ff6f61' },
        { category: 'Utilities', average: averageCategory[1], you: yourCategory[1], color: '#ffcc00' },
        { category: 'Entertainment', average: averageCategory[2], you: yourCategory[2], color: '#00bfae' },
        { category: 'Transport', average: averageCategory[3], you: yourCategory[3], color: '#e74c3c' },
        { category: 'Insurance', average: averageCategory[4], you: yourCategory[4], color: '#e67e22' },
        { category: 'Medical Aid', average: averageCategory[5], you: yourCategory[5], color: '#2ecc71' },
        { category: 'Eating Out', average: averageCategory[6], you: yourCategory[6], color: '#3498db' },
        { category: 'Shopping', average: averageCategory[7], you: yourCategory[7], color: '#8e44ad' },
        { category: 'Other', average: averageCategory[8], you: yourCategory[8], color: '#9b59b6' }
    ];

    const positionData = [
        { level: "You", income: income },
        { level: "Minimum", income: positionValues[0] },
        { level: "Median", income: positionValues[1] },
        { level: "Maximum", income: positionValues[2] },
    ];
    const sortedPositionData = positionData.sort((a, b) => a.income - b.income);

    const industryData = [
        { level: "You", income: income },
        { level: "Minimum", income: industryValues[0] },
        { level: "Median", income: industryValues[1] },
        { level: "Maximum", income: industryValues[2] },
          ];
    const sortedIndustryData = industryData.sort((a, b) => a.income - b.income);


    const getData = async () => {
        const accountPromise = getAccounts();
        const userInfoPromise = getUserInfo();
        const spendingCategoryPromise = getSpendingByCategory();
        
        // Wait for accounts, userInfo, and averageCategory to resolve in parallel
        const [account, userInfo, averageCategory] = await Promise.all([accountPromise, userInfoPromise, spendingCategoryPromise]);
        
        if (account.length !== 0) {
            setIsAccount(true);
        }

        
        // Fetch transactions in parallel for all accounts
        const transactionPromises = account.map((acc: Account) => getTransactions(acc.account_number));
        const transactions = await Promise.all(transactionPromises);
        
        // Calculate monthly income and update categories in parallel
        const resultPromises = transactions.map(async (transaction) => {
            const [balance, category] = await Promise.all([
                getMonthlyIncome(transaction), // Get monthly income
                getExpensesByCategory(transaction) // Get category expenses
            ]);
        
            return { balance, category };
        });
        
        // Wait for all the results to resolve
        const results = await Promise.all(resultPromises);
        
        // Calculate totals and updated categories
        let total = 0;
        let updatedCategory = Array(9).fill(0); // Initial category array
        
        results.forEach(({ balance, category }) => {
            total += balance;
        
            // Update categories in a non-blocking way
            category.forEach((cat: number, i: number) => {
                updatedCategory[i] += cat;
            });
        });
        
        // Normalize the updated categories
        updatedCategory = updatedCategory.map(cat => cat !== 0 ? (cat / total) * 100 : 0);

        // Fetch position, industry, and ageIncome in parallel
        const age = calculateAge(userInfo.birthDate);
        const [incomeByAge, position, industry] = await Promise.all([
            getIncomeByAge(age),
            getPosition(userInfo.jobPosition),
            getIndustry(userInfo.industry)
        ]);

        // Batch state updates to minimize re-renders
        setAgeIncome(incomeByAge);
        setYourCategory(updatedCategory);
        setIncome(total);
        setAge(age.toString());
        setFormBirthDate(userInfo.birthDate);
        setJobPosition(userInfo.jobPosition);
        setIndustry(userInfo.industry);
        setAverageCategory(averageCategory);
        setPositionValues(position);
        setIndustryValues(industry);
    };  

    useEffect(() => {
        getData();
    }, [income]);


    const handleSubmit = async (e: React.FormEvent) => {
        setShowForm(false);
        e.preventDefault();

        // Set age 
        let age = calculateAge(formBirthDate)
        setAge(age.toString());
        let incomeByAge = await getIncomeByAge(age);
        setAgeIncome(incomeByAge); 
        
        // Fetch data for job position and industry
        let position = await getPosition(jobPosition);
        setPositionValues(position);
        let JobIndustry = await getIndustry(industry);
        setIndustryValues(JobIndustry);

        //set user info on database
        let user = await getUser();
        if(user){
            const userData = {
                birthDate: formBirthDate,  
                jobPosition: jobPosition,
                industry: industry,
                uid : user
            };
            addUserInfo(userData)
        }
    };

    return (
        <div className={styles.comparisonsPage}>
            {isAccount ? (
            <>
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
                            <label htmlFor="birthDate">Birth Date:</label>
                            <input
                                type="date"
                                id="birthDate"
                                value={formBirthDate} 
                                onChange={(e) => setFormBirthDate(e.target.value)} 
                                required
                            />
                            <label>
                                Job Position:
                                <select
                                    value={jobPosition}
                                    onChange={(e) => setJobPosition(e.target.value)}
                                    required
                                >
                                    {['Select your job position',
                                        'Academic',
                                        'Accountant',
                                        'Analyst',
                                        'CEO',
                                        'Consultant',
                                        'COO',
                                        'Engineer',
                                        'Executive/Director',
                                        'Financial Manager',
                                        'General Manager',
                                        'Head of Department',
                                        'HR Manager',
                                        'Managing Director',
                                        'Marketing Director/Manager',
                                        'Project Manager',
                                        'Sales Manager',
                                        'Self-employed',
                                        'Senior Manager',
                                        'Student' 
                                    ].map((position) => (
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
                                    {['Select your industry',
                                        'Advertising / Marketing / Public Relations',
                                        'Agriculture',
                                        'Arts / Entertainment',
                                        'Automotive',
                                        'Construction / Architecture',
                                        'Consulting',
                                        'Education / Training',
                                        'Engineering',
                                        'Environment',
                                        'Finance / Banking / Insurance / Accounting',
                                        'Government',
                                        'Information Technology',
                                        'Legal',
                                        'Manufacturing',
                                        'Media / Publishing / Broadcasting',
                                        'Medical / Dental / Healthcare / Pharmaceutical',
                                        'Mining / Petrochemical',
                                        'Non-Governmental Organisation (non-profit)',
                                        'Real Estate / Property',
                                        'Retail / Wholesale',
                                        'Service',
                                        'Sports',
                                        'Telecommunications',
                                        'Transport / Logistics',
                                        'Travel / Tourism / Lodging',
                                        'Utilities / Parastatals',
                                        'Student'
                                    ].map((industry) => (
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
                    <h3>Average monthly income of a {age} Year Old</h3>
                    <div className={styles.triangle}>{formatCurrency(ageIncome)}</div>
                </div>

                {/* Your Income Section */}
                <div className={styles.rightHalf}>
                    <h3>Your monthly income</h3>
                    <div className={styles.triangle}>{formatCurrency(income)}</div>
                </div>
            </div>

            {/* Comparison Bar Chart with Line Chart */}
            <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                    <h3 className={styles.gridTitle}>
                        AVERAGE SPENDING BY CATEGORY COMPARED TO YOU
                    </h3>
                </div>
                <ComposedChart
                    width={1600} // Increased width for better spacing
                    height={325}
                    data={data}
                    margin={{ top: 20, right: 70, left: 80, bottom: 80 }} // Adjust margins
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category">
                        <Label value="Category" offset={-29} position="insideBottom" />
                    </XAxis>
                    <YAxis>
                        <Label value="percent of income" offset={-29} angle={-90} position="insideLeft" />
                    </YAxis>
                    <Tooltip />
                    {/* Remove the default Legend by providing a custom content */}
                    <Legend content={() => null} />

                    <Bar dataKey="average" fill="#8884d8">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                    <Line
                        type="monotone"
                        dataKey="you"
                        stroke="#0000ff"
                        strokeWidth={2}
                        dot={true}
                    />
                </ComposedChart>
            </div>

            <div className={styles.gridContainer}>
                {/* Position Grid */}
                <div className={styles.gridItem}>
                    <div className={styles.gridTitleContainer}>
                        <h3 className={styles.gridTitle}>Annual Salary according to Position</h3>
                    </div>
                    <div className={styles.comparisonContainer}>
                        {/* Title at the top and centered */}
                        <h3 className={styles.centeredTitle}>{jobPosition}</h3>
                             {/* Recharts BarChart */}
                             <ResponsiveContainer width="101%" height={300}>
                                <BarChart data={sortedPositionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="level" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="income" fill="black">
                                    {positionData.map((entry, index) => (
                                        <Cell
                                        key={`cell-${index}`}
                                        fill={entry.level === "You" ? "#003366" : "#73c786"} // Highlight the "You" bar
                                        />
                                    ))}
                                    </Bar>
                                </BarChart>
                                </ResponsiveContainer>
                    </div>
                </div>

                {/* Industry Grid */}
                <div className={styles.gridItem}>
                    <div className={styles.gridTitleContainer}>
                        <h3 className={styles.gridTitle}>Annual Salary According to Industry</h3>
                    </div>
                    <div className={styles.comparisonContainer}>
                        {/* Title at the top and centered */}
                        <h3 className={styles.centeredTitle}>{industry}</h3>

                        <ResponsiveContainer width="101%" height={300}>
                                <BarChart data={sortedIndustryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="level" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="income" fill="black">
                                    {industryData.map((entry, index) => (
                                        <Cell
                                        key={`cell-${index}`}
                                        fill={entry.level === "You" ? "#003366" : "#73c786"} // Highlight the "You" bar
                                        />
                                    ))}
                                    </Bar>
                                </BarChart>
                                </ResponsiveContainer>
                    </div>
                </div>
            </div>
            </>
            ):(        
                <div className={styles.noAccountsMessage}>
                <p>You have no accounts. <br />
                Head to the accounts section to create new accounts.</p>
                </div>
            )}
        </div>

    );

}

export default ComparisonPage;
