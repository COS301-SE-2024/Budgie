import React, { useEffect, useState } from 'react';
import styles from './comparison-page.module.css';
import {
    getAccounts,
    getTransactions,
    getMonthlyIncome,
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

    const getData = async () => {
        const account = await getAccounts();
        setAccount(account);
        let total = 0;
        for (let i = 0; i < account.length; i++) {
            let transaction = await getTransactions(account[i].account_number);
            let balance = await getMonthlyIncome(transaction);
            total += balance;
        }
        setIncome(total);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // You can add logic here to process or send the form data somewhere
        alert(JSON.stringify({ age, jobPosition, industry }));
    };

    useEffect(() => {
        getData();
    }, [accounts]);

    return (
        <div className={styles.container}>
            <h2>User Information</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="age">Age:</label>
                    <input
                        type="number"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="jobPosition">Job Position:</label>
                    <select
                        id="jobPosition"
                        value={jobPosition}
                        onChange={(e) => setJobPosition(e.target.value)}
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
                    </select>
                </div>
                <div>
                    <label htmlFor="experience">Industry:</label>
                    <select
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
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
                  </select>

                </div>
                <button type="submit">Submit</button>
            </form>

            <br />
            <p>Your income: {income}</p>
        </div>
    );
}

export default ComparisonPage;
