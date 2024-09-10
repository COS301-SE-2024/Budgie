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
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Label, Legend } from 'recharts';


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

    const [income, setIncome] = useState(0);
    // const [age, setAge] = useState('');
    // const [jobPosition, setJobPosition] = useState('');
    // const [industry, setIndustry] = useState('');
    const [positionValues, setPositionValues] = useState<(number)[]>([]);
    const [industryValues, setIndustryValues] = useState<(number)[]>([]);
    const [ageIncome, setAgeIncome] = useState(0);
    const [yourCategory, setYourCategory] = useState([0,0,0,0,0,0,0,0,0]);
    const [averageCategory, setAverageCategory] = useState([0,0,0,0,0,0,0,0,0]);
    const [formJobPosition, setFormJobPosition] = useState('');
    const [formIndustry, setFormIndustry] = useState('');
    const [formBirthDate, setFormBirthDate] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [age, setAge] = useState('');
    const [jobPosition, setJobPosition] = useState('Developer');
    const [industry, setIndustry] = useState('Technology');

    const handleShowForm = () => setShowForm(true);
    const handleCloseForm = () => setShowForm(false);

    const data = [
        { category: 'Groceries', amount: averageCategory[0], lineValue: yourCategory[0], color: '#ff6f61' },
        { category: 'Utilities', amount: averageCategory[1], lineValue: yourCategory[1], color: '#ffcc00' },
        { category: 'Entertainment', amount: averageCategory[2], lineValue: yourCategory[2], color: '#00bfae' },
        { category: 'Transport', amount: averageCategory[3], lineValue: yourCategory[3], color: '#e74c3c' },
        { category: 'Insurance', amount: averageCategory[4], lineValue: yourCategory[4], color: '#e67e22' },
        { category: 'Medical Aid', amount: averageCategory[5], lineValue: yourCategory[5], color: '#2ecc71' },
        { category: 'Eating Out', amount: averageCategory[6], lineValue: yourCategory[6], color: '#3498db' },
        { category: 'Shopping', amount: averageCategory[7], lineValue: yourCategory[7], color: '#8e44ad' },
        { category: 'Other', amount: averageCategory[8], lineValue: yourCategory[8], color: '#9b59b6' }
    ];


    const getData = async () => {
        // Start all the promises simultaneously
        const accountPromise = getAccounts();
        const userInfoPromise = getUserInfo();
        const spendingCategoryPromise = getSpendingByCategory();
        
        // Wait for accounts and userInfo to resolve
        const [account, userInfo, averageCategory] = await Promise.all([accountPromise, userInfoPromise, spendingCategoryPromise]);
      
        // Fetch transactions in parallel for all accounts
        const transactionPromises = account.map((acc: Account) => getTransactions(acc.account_number));
        const transactions = await Promise.all(transactionPromises);
      
        // Calculate monthly income and update categories in parallel
        let total = 0;
        let updatedCategory = [0,0,0,0,0,0,0,0,0];
        const monthlyIncomePromises = transactions.map(async (transaction) => {
            const balance = await getMonthlyIncome(transaction);
            total += balance;
      
            // Update categories
            const category = await getExpensesByCategory(transaction);
            category.forEach((cat: number, i: number) => {
                updatedCategory[i] += cat;
              });
        });
        await Promise.all(monthlyIncomePromises);
        
        // Normalize the updated categories
        for (let i = 0; i < 9; i++) {
          if (updatedCategory[i] !== 0) {
            updatedCategory[i] = (updatedCategory[i] / total) * 100;
          }
        }
      
        // Fetch position, industry, and ageIncome in parallel
        const age = calculateAge(userInfo.birthDate);
        const incomeByAgePromise = getIncomeByAge(age);
        const positionPromise = getPosition(userInfo.jobPosition);
        const industryPromise = getIndustry(userInfo.industry);
        const [incomeByAge, position, industry] = await Promise.all([incomeByAgePromise, positionPromise, industryPromise]);
      
        // Set states after all the data is fetched
        setAgeIncome(incomeByAge);
        setYourCategory(updatedCategory);
        setIncome(total);
        setAge(age.toString());
        setFormBirthDate(userInfo.birthDate);
        setJobPosition(userInfo.jobPosition);
        setFormJobPosition(userInfo.jobPosition);
        setIndustry(userInfo.industry);
        setFormIndustry(userInfo.industry);
        setAverageCategory(averageCategory);
        setPositionValues(position);
        setIndustryValues(industry);
    };  

    useEffect(() => {
        getData();
    }, [income]);


    const handleSubmit = async (e: React.FormEvent) => {
        // e.preventDefault();

        // // Set job position and industry and age 
        // setJobPosition(formJobPosition);
        // setIndustry(formIndustry);
        // let age = calculateAge(formBirthDate)
        // setAge(age.toString());
        // let incomeByAge = await getIncomeByAge(age);
        // setAgeIncome(incomeByAge); 
        
        // // Fetch data for job position and industry
        // let position = await getPosition(formJobPosition);
        // setPositionValues(position);
        // let JobIndustry = await getIndustry(formIndustry);
        // setIndustryValues(JobIndustry);

        // //set user info on database
        // let user = await getUser();
        // if(user){
        //     const userData = {
        //         birthDate: formBirthDate,  
        //         jobPosition: formJobPosition,
        //         industry: formIndustry,
        //         uid : user
        //     };
        //     addUserInfo(userData)
        // }
        alert(formBirthDate)
        alert(jobPosition)
        alert(industry)
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
                        <Label value="Amount" offset={-29} angle={-90} position="insideLeft" />
                    </YAxis>
                    <Tooltip />
                    {/* Remove the default Legend by providing a custom content */}
                    <Legend content={() => null} />

                    <Bar dataKey="amount" fill="#8884d8">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                    <Line
                        type="monotone"
                        dataKey="lineValue"
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

    // return (
    //     <div className={styles.container}>
    //         <h2>User Information</h2>

    //         <form onSubmit={handleSubmit}>
    //             <div>
    //             <label htmlFor="birthDate">Birth Date:</label>
    //             <input
    //                 type="date"
    //                 id="birthDate"
    //                 value={formBirthDate} 
    //                 onChange={(e) => setFormBirthDate(e.target.value)} 
    //                 required
    //             />
    //             </div>
    //             <div>
    //                 <label htmlFor="jobPosition">Job Position:</label>
    //                 <select
    //                     id="jobPosition"
    //                     value={formJobPosition}
    //                     onChange={(e) => setFormJobPosition(e.target.value)}
    //                     required
    //                 >
    //                     <option value="">Select your job position</option>
    //                     <option value="Academic">Academic</option>
    //                     <option value="Accountant">Accountant</option>
    //                     <option value="Analyst">Analyst</option>
    //                     <option value="CEO">CEO</option>
    //                     <option value="Consultant">Consultant</option>
    //                     <option value="COO">COO</option>
    //                     <option value="Engineer">Engineer</option>
    //                     <option value="Executive/Director">Executive/Director</option>
    //                     <option value="Financial Manager">Financial Manager</option>
    //                     <option value="General Manager">General Manager</option>
    //                     <option value="Head of Department">Head of Department</option>
    //                     <option value="HR Manager">HR Manager</option>
    //                     <option value="Managing Director">Managing Director</option>
    //                     <option value="Marketing Director/Manager">Marketing Director/Manager</option>
    //                     <option value="Project Manager">Project Manager</option>
    //                     <option value="Sales Manager">Sales Manager</option>
    //                     <option value="Self-employed">Self-employed</option>
    //                     <option value="Senior Manager">Senior Manager</option>
    //                     <option value="Student">Student</option>
    //                 </select>
    //             </div>
    //             <div>
    //                 <label htmlFor="industry">Industry:</label>
    //                 <select
    //                   id="industry"
    //                   value={formIndustry}
    //                   onChange={(e) => setFormIndustry(e.target.value)}
    //                   required
    //               >
    //                   <option value="">Select your industry</option>
    //                   <option value="Advertising / Marketing / Public Relations">Advertising / Marketing / Public Relations</option>
    //                   <option value="Agriculture">Agriculture</option>
    //                   <option value="Arts / Entertainment">Arts / Entertainment</option>
    //                   <option value="Automotive">Automotive</option>
    //                   <option value="Construction / Architecture">Construction / Architecture</option>
    //                   <option value="Consulting">Consulting</option>
    //                   <option value="Education / Training">Education / Training</option>
    //                   <option value="Engineering">Engineering</option>
    //                   <option value="Environment">Environment</option>
    //                   <option value="Finance / Banking / Insurance / Accounting">Finance / Banking / Insurance / Accounting</option>
    //                   <option value="Government">Government</option>
    //                   <option value="Information Technology">Information Technology</option>
    //                   <option value="Legal">Legal</option>
    //                   <option value="Manufacturing">Manufacturing</option>
    //                   <option value="Media / Publishing / Broadcasting">Media / Publishing / Broadcasting</option>
    //                   <option value="Medical / Dental / Healthcare / Pharmaceutical">Medical / Dental / Healthcare / Pharmaceutical</option>
    //                   <option value="Mining / Petrochemical">Mining / Petrochemical</option>
    //                   <option value="Non-Governmental Organisation">Non-Governmental Organisation (non-profit)</option>
    //                   <option value="Real Estate / Property">Real Estate / Property</option>
    //                   <option value="Retail / Wholesale">Retail / Wholesale</option>
    //                   <option value="Service">Service</option>
    //                   <option value="Sports">Sports</option>
    //                   <option value="Telecommunications">Telecommunications</option>
    //                   <option value="Transport / Logistics">Transport / Logistics</option>
    //                   <option value="Travel / Tourism / Lodging">Travel / Tourism / Lodging</option>
    //                   <option value="Utilities / Parastatals">Utilities / Parastatals</option>
    //                   <option value="Student">Student</option>
    //               </select>

    //             </div>
    //             <button type="submit">Submit</button>
    //         </form>

    //         <br />
    //         <p>Your income: {formatCurrency(income)}</p>
    //         <p>Average income of a {age} year old: {formatCurrency(ageIncome)}</p>
    //         <br/>
    //         <p>Average groceries: {averageCategory[0]}%</p>
    //         <p>Your groceries: {yourCategory[0]}%</p>
    //         <p>Average Utilities: {averageCategory[1]}%</p>
    //         <p>Your Utilities: {yourCategory[1]}%</p>
    //         <p>Average Entertainment: {averageCategory[2]}%</p>
    //         <p>Your Entertainment: {yourCategory[2]}%</p>
    //         <p>Average Transport: {averageCategory[3]}%</p>
    //         <p>Your Transport: {yourCategory[3]}%</p>
    //         <p>Average Insurance: {averageCategory[4]}%</p>
    //         <p>Your Insurance: {yourCategory[4]}%</p>
    //         <p>Average Medical Aid: {averageCategory[5]}%</p>
    //         <p>Your Medical Aid: {yourCategory[5]}%</p>
    //         <p>Average Eating Out: {averageCategory[6]}%</p>
    //         <p>Your Eating Out: {yourCategory[6]}%</p>
    //         <p>Average Shopping: {averageCategory[7]}%</p>
    //         <p>Your Shopping: {yourCategory[7]}%</p>
    //         <p>Average Other: {averageCategory[8]}%</p>
    //         <p>Your Other: {yourCategory[8]}%</p>
    //         <br/>
    //         <p>{jobPosition}:</p>
    //         <p>Minimum salary according to position: {formatCurrency(positionValues[0])}</p>
    //         <p>Average salary according to position: {formatCurrency(positionValues[1])}</p>
    //         <p>Maximum salary according to position: {formatCurrency(positionValues[2])}</p>
    //         <p>Your salary account to position: {formatCurrency(income)}</p>
    //         <br/>
    //         <p>{industry}:</p>
    //         <p>Minimum salary according to industry: {formatCurrency(industryValues[0])}</p>
    //         <p>Average salary according to industry: {formatCurrency(industryValues[1])}</p>
    //         <p>Maximum salary according to industry: {formatCurrency(industryValues[2])}</p>
    //         <p>Your salary account to industry: {formatCurrency(income)}</p>
    //     </div>
    // );
}

export default ComparisonPage;
