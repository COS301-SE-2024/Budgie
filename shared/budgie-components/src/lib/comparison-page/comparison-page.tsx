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
    const [age, setAge] = useState('');
    const [jobPosition, setJobPosition] = useState('');
    const [industry, setIndustry] = useState('');
    const [positionValues, setPositionValues] = useState<(number)[]>([]);
    const [industryValues, setIndustryValues] = useState<(number)[]>([]);
    const [ageIncome, setAgeIncome] = useState(0);
    const [yourCategory, setYourCategory] = useState([0,0,0,0,0,0,0,0,0]);
    const [averageCategory, setAverageCategory] = useState([0,0,0,0,0,0,0,0,0]);
    const [formJobPosition, setFormJobPosition] = useState('');
    const [formIndustry, setFormIndustry] = useState('');
    const [formBirthDate, setFormBirthDate] = useState('');


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
        e.preventDefault();

        // Set job position and industry and age 
        setJobPosition(formJobPosition);
        setIndustry(formIndustry);
        let age = calculateAge(formBirthDate)
        setAge(age.toString());
        let incomeByAge = await getIncomeByAge(age);
        setAgeIncome(incomeByAge); 
        
        // Fetch data for job position and industry
        let position = await getPosition(formJobPosition);
        setPositionValues(position);
        let JobIndustry = await getIndustry(formIndustry);
        setIndustryValues(JobIndustry);

        //set user info on database
        let user = await getUser();
        if(user){
            const userData = {
                birthDate: formBirthDate,  
                jobPosition: formJobPosition,
                industry: formIndustry,
                uid : user
            };
            addUserInfo(userData)
        }

    };

    return (
        <div className={styles.container}>
            <h2>User Information</h2>

            <form onSubmit={handleSubmit}>
                <div>
                <label htmlFor="birthDate">Birth Date:</label>
                <input
                    type="date"
                    id="birthDate"
                    value={formBirthDate} 
                    onChange={(e) => setFormBirthDate(e.target.value)} 
                    required
                />
                </div>
                <div>
                    <label htmlFor="jobPosition">Job Position:</label>
                    <select
                        id="jobPosition"
                        value={formJobPosition}
                        onChange={(e) => setFormJobPosition(e.target.value)}
                        required
                    >
                        <option value="">Select your job position</option>
                        <option value="Academic">Academic</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Analyst">Analyst</option>
                        <option value="CEO">CEO</option>
                        <option value="Consultant">Consultant</option>
                        <option value="COO">COO</option>
                        <option value="Engineer">Engineer</option>
                        <option value="Executive/Director">Executive/Director</option>
                        <option value="Financial Manager">Financial Manager</option>
                        <option value="General Manager">General Manager</option>
                        <option value="Head of Department">Head of Department</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Managing Director">Managing Director</option>
                        <option value="Marketing Director/Manager">Marketing Director/Manager</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Sales Manager">Sales Manager</option>
                        <option value="Self-employed">Self-employed</option>
                        <option value="Senior Manager">Senior Manager</option>
                        <option value="Student">Student</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="industry">Industry:</label>
                    <select
                      id="industry"
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      required
                  >
                      <option value="">Select your industry</option>
                      <option value="Advertising / Marketing / Public Relations">Advertising / Marketing / Public Relations</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Arts / Entertainment">Arts / Entertainment</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Construction / Architecture">Construction / Architecture</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Education / Training">Education / Training</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Environment">Environment</option>
                      <option value="Finance / Banking / Insurance / Accounting">Finance / Banking / Insurance / Accounting</option>
                      <option value="Government">Government</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Legal">Legal</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Media / Publishing / Broadcasting">Media / Publishing / Broadcasting</option>
                      <option value="Medical / Dental / Healthcare / Pharmaceutical">Medical / Dental / Healthcare / Pharmaceutical</option>
                      <option value="Mining / Petrochemical">Mining / Petrochemical</option>
                      <option value="Non-Governmental Organisation">Non-Governmental Organisation (non-profit)</option>
                      <option value="Real Estate / Property">Real Estate / Property</option>
                      <option value="Retail / Wholesale">Retail / Wholesale</option>
                      <option value="Service">Service</option>
                      <option value="Sports">Sports</option>
                      <option value="Telecommunications">Telecommunications</option>
                      <option value="Transport / Logistics">Transport / Logistics</option>
                      <option value="Travel / Tourism / Lodging">Travel / Tourism / Lodging</option>
                      <option value="Utilities / Parastatals">Utilities / Parastatals</option>
                      <option value="Student">Student</option>
                  </select>

                </div>
                <button type="submit">Submit</button>
            </form>

            <br />
            <p>Your income: {formatCurrency(income)}</p>
            <p>Average income of a {age} year old: {formatCurrency(ageIncome)}</p>
            <br/>
            <p>Average groceries: {averageCategory[0]}%</p>
            <p>Your groceries: {yourCategory[0]}%</p>
            <p>Average Utilities: {averageCategory[1]}%</p>
            <p>Your Utilities: {yourCategory[1]}%</p>
            <p>Average Entertainment: {averageCategory[2]}%</p>
            <p>Your Entertainment: {yourCategory[2]}%</p>
            <p>Average Transport: {averageCategory[3]}%</p>
            <p>Your Transport: {yourCategory[3]}%</p>
            <p>Average Insurance: {averageCategory[4]}%</p>
            <p>Your Insurance: {yourCategory[4]}%</p>
            <p>Average Medical Aid: {averageCategory[5]}%</p>
            <p>Your Medical Aid: {yourCategory[5]}%</p>
            <p>Average Eating Out: {averageCategory[6]}%</p>
            <p>Your Eating Out: {yourCategory[6]}%</p>
            <p>Average Shopping: {averageCategory[7]}%</p>
            <p>Your Shopping: {yourCategory[7]}%</p>
            <p>Average Other: {averageCategory[8]}%</p>
            <p>Your Other: {yourCategory[8]}%</p>
            <br/>
            <p>{jobPosition}:</p>
            <p>Minimum salary according to position: {formatCurrency(positionValues[0])}</p>
            <p>Average salary according to position: {formatCurrency(positionValues[1])}</p>
            <p>Maximum salary according to position: {formatCurrency(positionValues[2])}</p>
            <p>Your salary account to position: {formatCurrency(income)}</p>
            <br/>
            <p>{industry}:</p>
            <p>Minimum salary according to industry: {formatCurrency(industryValues[0])}</p>
            <p>Average salary according to industry: {formatCurrency(industryValues[1])}</p>
            <p>Maximum salary according to industry: {formatCurrency(industryValues[2])}</p>
            <p>Your salary account to industry: {formatCurrency(income)}</p>
        </div>
    );
}

export default ComparisonPage;
