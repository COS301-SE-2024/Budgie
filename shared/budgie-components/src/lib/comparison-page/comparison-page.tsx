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
} from './services';


export interface ComparisonPage {}

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

    const [accounts, setAccount] = useState<Account[]>([]);
    const [income, setIncome] = useState(0);
    const [age, setAge] = useState('');
    const [jobPosition, setJobPosition] = useState('');
    const [industry, setIndustry] = useState('');
    const [positionValues, setPositionValues] = useState<(number | null)[]>([]);
    const [industryValues, setIndustryValues] = useState<(number | null)[]>([]);
    const [ageIncome, setAgeIncome] = useState(0);
    const [yourCategory, setYourCategory] = useState([0,0,0,0,0,0,0,0,0]);
    const [averageCategory, setAverageCategory] = useState([0,0,0,0,0,0,0,0,0]);
    const [formAge, setFormAge] = useState('');
    const [formJobPosition, setFormJobPosition] = useState('');
    const [formIndustry, setFormIndustry] = useState('');
    const [formBirthDate, setFormBirthDate] = useState('');

    const getData = async () => {
        const account = await getAccounts();
        setAccount(account);
        let total = 0;
        let updatedCategory = [0,0,0,0,0,0,0,0,0];
        for (let i = 0; i < account.length; i++) {
            let transaction = await getTransactions(account[i].account_number);
            let balance = await getMonthlyIncome(transaction);
            total += balance;
            let category = await getExpensesByCategory(transaction);
            for(let j=0; j<9; j++){
                updatedCategory[j] += category[j];
            }
        }
        setYourCategory(updatedCategory);
        setIncome(total);
    };

    useEffect(() => {
        getData();
    }, [age, jobPosition, industry]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Set job position and industry
        setJobPosition(formJobPosition);
        setIndustry(formIndustry);
    
        // Calculate age from birth date
        const birthDate = new Date(formBirthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Adjust if birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
    
        // Set the calculated age
        setAge(age.toString());
    
        // Fetch data for job position and industry
        let position = await getPosition(formJobPosition);
        setPositionValues(position);
    
        let JobIndustry = await getIndustry(formIndustry);
        setIndustryValues(JobIndustry);

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
            <p>Your income: {income}</p>
            <p>Average income of a {age} year old: {ageIncome}</p>
            <br/>
            <p>Average groceries: {averageCategory[0]}</p>
            <p>Your groceries: {yourCategory[0]}</p>
            <p>Average Utilities: {averageCategory[1]}</p>
            <p>Your Utilities: {yourCategory[1]}</p>
            <p>Average Entertainment: {averageCategory[2]}</p>
            <p>Your Entertainment: {yourCategory[2]}</p>
            <p>Average Transport: {averageCategory[3]}</p>
            <p>Your Transport: {yourCategory[3]}</p>
            <p>Average Insurance: {averageCategory[4]}</p>
            <p>Your Insurance: {yourCategory[4]}</p>
            <p>Average Medical Aid: {averageCategory[5]}</p>
            <p>Your Medical Aid: {yourCategory[5]}</p>
            <p>Average Eating Out: {averageCategory[6]}</p>
            <p>Your Eating Out: {yourCategory[6]}</p>
            <p>Average Shopping: {averageCategory[7]}</p>
            <p>Your Shopping: {yourCategory[7]}</p>
            <p>Average Other: {averageCategory[8]}</p>
            <p>Your Other: {yourCategory[8]}</p>
            <br/>
            <p>{jobPosition}:</p>
            <p>Minimum salary according to position: {positionValues[0]}</p>
            <p>Average salary according to position: {positionValues[1]}</p>
            <p>Maximum salary according to position: {positionValues[2]}</p>
            <p>Your salary account to position: {income}</p>
            <br/>
            <p>{industry}:</p>
            <p>Minimum salary according to industry: {industryValues[0]}</p>
            <p>Average salary according to industry: {industryValues[1]}</p>
            <p>Maximum salary according to industry: {industryValues[2]}</p>
            <p>Your salary account to industry: {income}</p>
        </div>
    );
}

export default ComparisonPage;
