import React from 'react';
import styles from './InsightsPage.module.css'; // Import the CSS module for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGasPump, faBank, faHome, faBus, faLightbulb, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons'; // Icons for petrol, bank, home, transport, utilities
import fnb from '../../../public/images/FNB_Color.png';
import absa from '../../../public/images/absa-logo.png';
import sb from '../../../public/images/Standard-Bank-Logo.png';
import capitec from '../../../public/images/capitec.png';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    query,
    where,
    setDoc,
} from 'firebase/firestore';

export async function getLastPetrolPrices() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear(); 
    const currentMonth = (currentDate.getMonth()).toString().padStart(2, '0');
    const date = currentYear + "/" + currentMonth + "/01";
    let prices; 
    const a = query(
        collection(db, 'petrol_prices'),
        where('date', '==', date)
    );
    const result = await getDocs(a);
    result.forEach(doc => {
        prices = doc.data() as PetrolPrices;
    });
    return prices;
}

export async function getThisPetrolPrices() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear(); 
    const currentMonth = (currentDate.getMonth()+1).toString().padStart(2, '0');
    const date = currentYear + "/" + currentMonth + "/01";
    let prices;
    const a = query(
        collection(db, 'petrol_prices'),
        where('date', '==', date)
    );
    const result = await getDocs(a);
    result.forEach(doc => {
        prices = doc.data() as PetrolPrices;
    });
    return prices;
}

export async function getNextPetrolPrices() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear(); 
    const currentMonth = (currentDate.getMonth()+2).toString().padStart(2, '0');
    const date = currentYear + "/" + currentMonth + "/01";
    let prices; 
    const a = query(
        collection(db, 'petrol_prices'),
        where('date', '==', date)
    );
    const result = await getDocs(a);
    result.forEach(doc => {
        prices = doc.data() as PetrolPrices;
    });
    return prices;
}

interface PetrolPrices {
    diesel_coastal: number;
    diesel_inland: number;
    petrol_93_coastal: number;
    petrol_93_inland: number;
    petrol_95_coastal: number;
    petrol_95_inland : number
}

export function InsightsPage() {

    const [currentBank, setCurrentBank] = useState("fnb");
    const [lastMonth, setLastMonth] = useState<PetrolPrices | null>(null);
    const [thisMonth, setThisMonth] = useState<PetrolPrices | null>(null);
    const [nextMonth, setNextMonth] = useState<PetrolPrices | null>(null);

    const formatCurrency = (value: number) => {
        const formatter = new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 2,
        });
        return formatter.format(value);
    };

    useEffect(() => {
        async function fetchData() {
            const [last, thisM, next] = await Promise.all([
                getLastPetrolPrices(),
                getThisPetrolPrices(),
                getNextPetrolPrices()
            ]);
            if (last) { 
                setLastMonth(last);
            }
            if (thisM) { 
                setThisMonth(thisM);
            }
            if (next) { 
                setNextMonth(next);
            }
        }
        fetchData();
    }, [lastMonth]);

    return (
        <div className={styles.mainContainer}>
            <div className={styles.insightsContainer}>
                {/* Petrol Prices Grid */}
                <div className={styles.gridItem}>
                    <div className={styles.gridItemTitleBox}>
                        <h2 className={styles.gridItemTitle}>Petrol Prices</h2>
                    </div>
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <span>Last month</span>
                            <span>Coastal</span>
                            <span>Inland</span>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.productName}>
                                <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                                <span>95 Unleaded Petrol</span>
                            </div>
                            <span>{lastMonth ? formatCurrency(lastMonth.petrol_95_coastal) : '-'}</span>
                            <span>{lastMonth ? formatCurrency(lastMonth.petrol_95_inland) : '-'}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.productName}>
                                <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                                <span>93 Unleaded Petrol</span>
                            </div>
                            <span>{lastMonth ? formatCurrency(lastMonth.petrol_93_coastal) : '-'}</span>
                            <span>{lastMonth ? formatCurrency(lastMonth.petrol_93_inland) : '-'}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.productName}>
                                <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                                <span>Diesel 50ppm</span>
                            </div>
                            <span>{lastMonth ? formatCurrency(lastMonth.diesel_coastal) : '-'}</span>
                            <span>{lastMonth ? formatCurrency(lastMonth.diesel_inland) : '-'}</span>
                        </div>
                    </div>
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <span>This month</span>
                            <span>Coastal</span>
                            <span>Inland</span>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.productName}>
                                <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                                <span>95 Unleaded Petrol</span>
                            </div>
                            <span>{thisMonth ? formatCurrency(thisMonth.petrol_95_coastal) : '-'}</span>
                            <span>{thisMonth ? formatCurrency(thisMonth.petrol_95_inland) : '-'}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.productName}>
                                <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                                <span>93 Unleaded Petrol</span>
                            </div>
                            <span>{thisMonth ? formatCurrency(thisMonth.petrol_93_coastal) : '-'}</span>
                            <span>{thisMonth ? formatCurrency(thisMonth.petrol_93_inland) : '-'}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.productName}>
                                <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                                <span>Diesel 50ppm</span>
                            </div>
                            <span>{thisMonth ? formatCurrency(thisMonth.diesel_coastal) : '-'}</span>
                            <span>{thisMonth ? formatCurrency(thisMonth.diesel_inland) : '-'}</span>
                        </div>
                    </div>
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <span>Next month</span>
                            <span>Coastal</span>
                            <span>Inland</span>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.productName}>
                                <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                                <span>95 Unleaded Petrol</span>
                            </div>
                            <span>{nextMonth ? formatCurrency(nextMonth.petrol_95_coastal) : '-'}</span>
                            <span>{nextMonth ? formatCurrency(nextMonth.petrol_95_inland) : '-'}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.productName}>
                                <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                                <span>93 Unleaded Petrol</span>
                            </div>
                            <span>{nextMonth ? formatCurrency(nextMonth.petrol_93_coastal) : '-'}</span>
                            <span>{nextMonth ? formatCurrency(nextMonth.petrol_93_inland) : '-'}</span>
                        </div>
                        <div className={styles.tableRow}>
                            <div className={styles.productName}>
                                <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                                <span>Diesel 50ppm</span>
                            </div>
                            <span>{nextMonth ? formatCurrency(nextMonth.diesel_coastal) : '-'}</span>
                            <span>{nextMonth ? formatCurrency(nextMonth.diesel_inland) :'-'}</span>
                        </div>
                    </div>
                </div>


                {currentBank == "fnb" && (
                    //Bank Insights Grid 
                    <div className={styles.gridItem}>
                        <div className={styles.gridItemTitleBox}>
                            <h2 className={styles.gridItemTitle}>Bank Insights</h2>
                        </div>
                        <div className={styles.bankInsightsContainer}>
                            <div className={styles.navigation}>
                                <span className={styles.arrow} onClick={() => setCurrentBank("sb")}>&lt;</span>
                                <div className={styles.bankInfo}>
                                    <span><Image
                                        src={fnb}
                                        width={150}
                                        alt="FNB"
                                        style={{
                                            width: '120px',
                                            borderRadius: '8px'
                                        }}>
                                    </Image></span>
                                </div>
                                <span className={styles.arrow} onClick={() => setCurrentBank("absa")}>&gt;</span>
                            </div>
                            <div className={styles.prosConsContainer}>
                                <div className={styles.pros}>
                                    <div className={styles.prosContainer}>
                                        <h3 className={styles.prosTitle}>Pros of FNB</h3>
                                        <ul className={styles.prosList}>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Digital Banking:</span>
                                                <br></br>
                                                Strong digital and mobile banking platforms, offering a wide range of user-friendly features.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Reward Programs:</span>
                                                <br></br>
                                                FNB offers eBucks, which incentivize clients based on their spending.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Product Variety:</span>
                                                <br></br>
                                                Comprehensive range of accounts, from low-cost Easy accounts to premium Private Clients accounts.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Innovative Solutions:</span>
                                                <br></br>
                                                High on tech innovation, including mobile wallet and contactless payment options.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className={styles.cons}>
                                    <div className={styles.consContainer}>
                                        <h3 className={styles.consTitle}>Cons of FNB</h3>
                                        <ul className={styles.consList}>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Fees:</span>
                                                <br></br>
                                                FNB can be on the higher side with account maintenance fees and transaction charges for premium accounts.
                                            </li>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Complexity:</span>
                                                <br></br>
                                                Some users may find their fee structures and account types a bit complicated.
                                            </li>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Branch Services:</span>
                                                <br></br>
                                                Reports suggest that in-branch services can sometimes be slow compared to their digital offering.
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentBank == "absa" && (
                    //Bank Insights Grid 
                    <div className={styles.gridItem}>
                        <div className={styles.gridItemTitleBox}>
                            <h2 className={styles.gridItemTitle}>Bank Insights</h2>
                        </div>
                        <div className={styles.bankInsightsContainer}>
                            <div className={styles.navigation}>
                                <span className={styles.arrow} onClick={() => setCurrentBank("fnb")}>&lt;</span>
                                <div className={styles.bankInfo}>
                                    <span><Image
                                        src={absa}
                                        width={150}
                                        alt="Absa"
                                        style={{
                                            width: '120px',
                                            borderRadius: '8px'
                                        }}>
                                    </Image></span>
                                </div>
                                <span className={styles.arrow} onClick={() => setCurrentBank("capitec")}>&gt;</span>
                            </div>
                            <div className={styles.prosConsContainer}>
                                <div className={styles.pros}>
                                    <div className={styles.prosContainer}>
                                        <h3 className={styles.prosTitle}>Pros of Absa</h3>
                                        <ul className={styles.prosList}>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Comprehensive Offering:</span>
                                                <br></br>
                                                Strong in retail banking and investment services, offering a variety of account options from low-cost to premium.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>African Footprint:</span>
                                                <br></br>
                                                One of the largest footprints across Africa, providing opportunities for cross-border transactions.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Wealth Management:</span>
                                                <br></br>
                                                Offers strong wealth management services, catering to high-net-worth individuals with customized solutions.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Branch and ATM Network:</span>
                                                <br></br>
                                                Extensive branch and ATM network, particularly helpful for customers who prefer in-person banking services.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className={styles.cons}>
                                    <div className={styles.consContainer}>
                                        <h3 className={styles.consTitle}>Cons of Absa</h3>
                                        <ul className={styles.consList}>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Customer Service:</span>
                                                <br></br>
                                                Absa has been known to face issues with customer service, with long wait times being a frequent complaint.
                                            </li>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Fees:</span>
                                                <br></br>
                                                Fees can be high, particularly for premium accounts or customers using in-branch services.
                                            </li>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Digital Services:</span>
                                                <br></br>
                                                While improving, Absa’s digital services and mobile banking app are not considered as seamless or advanced as FNB or Capitec’s offerings.
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentBank == "capitec" && (
                    //Bank Insights Grid 
                    <div className={styles.gridItem}>
                        <div className={styles.gridItemTitleBox}>
                            <h2 className={styles.gridItemTitle}>Bank Insights</h2>
                        </div>
                        <div className={styles.bankInsightsContainer}>
                            <div className={styles.navigation}>
                                <span className={styles.arrow} onClick={() => setCurrentBank("absa")}>&lt;</span>
                                <div className={styles.bankInfo}>
                                    <span><Image
                                        src={capitec}
                                        width={150}
                                        alt="Capitec"
                                        style={{
                                            width: '120px',
                                            borderRadius: '8px'
                                        }}>
                                    </Image></span>
                                </div>
                                <span className={styles.arrow} onClick={() => setCurrentBank("sb")}>&gt;</span>
                            </div>
                            <div className={styles.prosConsContainer}>
                                <div className={styles.pros}>
                                    <div className={styles.prosContainer}>
                                        <h3 className={styles.prosTitle}>Pros of Capitec</h3>
                                        <ul className={styles.prosList}>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Low Fees:</span>
                                                <br></br>
                                                Capitec is widely recognized for offering the lowest fees among the major banks, making it popular with cost-conscious customers.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Simplified Products:</span>
                                                <br></br>
                                                Focuses on simple, easy-to-understand products like the Global One account, which offers low fees and easy account management.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Growth:</span>
                                                <br></br>
                                                Capitec has shown remarkable growth and competitiveness, often disrupting the banking sector with its aggressive strategies.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Digital Banking:</span>
                                                <br></br>
                                                Well-regarded for its user-friendly digital banking services and mobile app.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className={styles.cons}>
                                    <div className={styles.consContainer}>
                                        <h3 className={styles.consTitle}>Cons of Capitec</h3>
                                        <ul className={styles.consList}>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Limited Corporate Services:</span>
                                                <br></br>
                                                Capitec is primarily focused on retail banking, and its corporate or investment banking offerings are less developed compared to Standard Bank or Nedbank.
                                            </li>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Branch Network:</span>
                                                <br></br>
                                                While growing, Capitec’s branch and ATM network may not be as extensive as the older banks, especially in rural areas.
                                            </li>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Investment Services:</span>
                                                <br></br>
                                                Capitec is relatively new in the asset management and investment space, so its offerings are more limited compared to its peers.
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentBank == "sb" && (
                    //Bank Insights Grid 
                    <div className={styles.gridItem}>
                        <div className={styles.gridItemTitleBox}>
                            <h2 className={styles.gridItemTitle}>Bank Insights</h2>
                        </div>
                        <div className={styles.bankInsightsContainer}>
                            <div className={styles.navigation}>
                                <span className={styles.arrow} onClick={() => setCurrentBank("capitec")}>&lt;</span>
                                <div className={styles.bankInfo}>
                                    <span><Image
                                        src={sb}
                                        width={150}
                                        alt="Standard Bank"
                                        style={{
                                            width: '120px',
                                            borderRadius: '8px'
                                        }}>
                                    </Image></span>
                                </div>
                                <span className={styles.arrow} onClick={() => setCurrentBank("fnb")}>&gt;</span>
                            </div>
                            <div className={styles.prosConsContainer}>
                                <div className={styles.pros}>
                                    <div className={styles.prosContainer}>
                                        <h3 className={styles.prosTitle}>Pros of Standard Bank</h3>
                                        <ul className={styles.prosList}>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Stability:</span>
                                                <br></br>
                                                Long-established presence in the banking sector, offering financial security and trust.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Corporate Services:</span>
                                                <br></br>
                                                Significant presence in corporate and investment banking, making it strong for business clients.
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Wide Network:</span>
                                                <br></br>
                                                Extensive branch and ATM network across the country, ensuring access even in rural areas
                                            </li>
                                            <li className={styles.prosItem}>
                                                <span className={styles.prosLabel}>Diverse Products:</span>
                                                <br></br>
                                                Offers a wide variety of financial products and services, including retail banking, wealth management, and investment services.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className={styles.cons}>
                                    <div className={styles.consContainer}>
                                        <h3 className={styles.consTitle}>Cons of Standard Bank</h3>
                                        <ul className={styles.consList}>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Fees:</span>
                                                <br></br>
                                                Can be more expensive in terms of transaction fees and monthly account fees, especially for basic accounts.
                                            </li>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Customer Satisfaction:</span>
                                                <br></br>
                                                Standard Bank tends to rank lower in customer satisfaction surveys, with complaints often related to customer service.
                                            </li>
                                            <li className={styles.consItem}>
                                                <span className={styles.consLabel}>Slow Adaptation:</span>
                                                <br></br>
                                                Lags behind competitors like FNB in terms of mobile banking innovations.
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Property and Rent Grid */}
                <div className={styles.gridItem}>
                    <div className={styles.gridItemTitleBox}>
                        <h2 className={styles.gridItemTitle}>Property and Rent</h2>
                    </div>
                    <div className={styles.propertyTable}>
                        <div className={styles.utilityHeader}>
                            <span></span>
                            <span></span>
                            <span>Price</span>
                            <span>Range</span>
                        </div>
                        <div className={styles.propertyRow}>
                            <span><FontAwesomeIcon icon={faHome} className={styles.icon} /></span>
                            <span>Apartment (1 bedroom) in City Centre</span>
                            <span>R8,104.34</span>
                            <span>R5,000.00 - R15,000.00</span>
                        </div>
                        <div className={styles.propertyRow}>
                            <span><FontAwesomeIcon icon={faHome} className={styles.icon} /></span>
                            <span>Apartment (1 bedroom) Outside of Centre</span>
                            <span>R6,494.41</span>
                            <span>R4,500.00 - R10,000.00</span>
                        </div>
                        <div className={styles.propertyRow}>
                            <span><FontAwesomeIcon icon={faHome} className={styles.icon} /></span>
                            <span>Apartment (3 bedrooms) in City Centre</span>
                            <span>R16,140.77 </span>
                            <span>R9,500.00 - R30,000.00</span>
                        </div>
                        <div className={styles.propertyRow}>
                            <span><FontAwesomeIcon icon={faHome} className={styles.icon} /></span>
                            <span>Apartment (3 bedrooms) Outside of Centre</span>
                            <span>R12,568.71</span>
                            <span>R8,500.00 - R20,000.00</span>
                        </div>
                        <div className={styles.propertyRow}>
                            <span><FontAwesomeIcon icon={faHome} className={styles.icon} /></span>
                            <span>Price per Square Meter to Buy Apartment in City Centre</span>
                            <span>R18,673.75</span>
                            <span>R8,000.00 - R36,000.00</span>
                        </div>
                        <div className={styles.propertyRow}>
                            <span><FontAwesomeIcon icon={faHome} className={styles.icon} /></span>
                            <span>Price per Square Meter to Buy Apartment Outside of Centre</span>
                            <span>R14,157.36</span>
                            <span>R9,000.00 - R28,000.00</span>
                        </div>
                    </div>
                </div>

                {/* Tax brackets */}
                <div className={styles.gridItem}>
                    <div className={styles.gridItemTitleBox}>
                        <h2 className={styles.gridItemTitle}>Tax Brackets</h2>
                    </div>
                    <div className={styles.taxTable}>
                        <div className={styles.taxRow}>
                            <span><FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} /></span>
                            <span>Up to R216,200</span>
                            <span>18%</span>
                        </div>
                        <div className={styles.taxRow}>
                            <span><FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} /></span>
                            <span>Up to R337,800</span>
                            <span>26% on income above R216,200</span>
                        </div>
                        <div className={styles.taxRow}>
                            <span><FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} /></span>
                            <span>Up to R467,500</span>
                            <span>31% on income above R337,800</span>
                        </div>
                        <div className={styles.taxRow}>
                            <span><FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} /></span>
                            <span>Up to R613,600</span>
                            <span>36% on income above R467,500</span>
                        </div>
                        <div className={styles.taxRow}>
                            <span><FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} /></span>
                            <span>Up to R782,200</span>
                            <span>39% on income above R613,600</span>
                        </div>
                        <div className={styles.taxRow}>
                            <span><FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} /></span>
                            <span>Up to R1,656,600</span>
                            <span>41% on income above R782,200</span>
                        </div>
                        <div className={styles.taxRow}>
                            <span><FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} /></span>
                            <span>Over R1,656,601</span>
                            <span>45% on income above R1,656,600</span>
                        </div>
                    </div>
                </div>

                {/* Utility Prices Grid */}
                <div className={styles.gridItem}>
                    <div className={styles.gridItemTitleBox}>
                        <h2 className={styles.gridItemTitle}>Utility Prices</h2>
                    </div>
                    <div className={styles.utilityTable}>
                        <div className={styles.utilityHeader}>
                            <span></span>
                            <span></span>
                            <span>Price</span>
                            <span>Range</span>
                        </div>
                        <div className={styles.utilityRow}>
                            <span><FontAwesomeIcon icon={faLightbulb} className={styles.icon} /></span>
                            <span>Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment</span>
                            <span>R1,878.91</span>
                            <span>R1,000.00 - R3,500.00</span>
                        </div>
                        <div className={styles.utilityRow}>
                            <span><FontAwesomeIcon icon={faLightbulb} className={styles.icon} /></span>
                            <span>Mobile Phone Monthly Plan with Calls and 10GB+ Data</span>
                            <span>R589.95 </span>
                            <span>R300.00 - R1,000.00</span>
                        </div>
                        <div className={styles.utilityRow}>
                            <span><FontAwesomeIcon icon={faLightbulb} className={styles.icon} /></span>
                            <span>Internet (60 Mbps or More, Unlimited Data, Cable/ADSL)</span>
                            <span>R750.58</span>
                            <span>R540.00 - R1,000.00</span>
                        </div>
                    </div>
                </div>

                {/* Transport Prices Grid */}
                <div className={styles.gridItem}>
                    <div className={styles.gridItemTitleBox}>
                        <h2 className={styles.gridItemTitle}>Transport Prices</h2>
                    </div>
                    <div className={styles.transportTable}>
                        <div className={styles.utilityHeader}>
                            <span></span>
                            <span></span>
                            <span>Price</span>
                            <span>Range</span>
                        </div>
                        <div className={styles.transportRow}>
                            <span><FontAwesomeIcon icon={faBus} className={styles.icon} /></span>
                            <span>One-way Ticket (Local Transport)</span>
                            <span>R30.00</span>
                            <span>R15.00 - R65.00</span>
                        </div>
                        <div className={styles.transportRow}>
                            <span><FontAwesomeIcon icon={faBus} className={styles.icon} /></span>
                            <span>Monthly Pass (Regular Price)</span>
                            <span>R825.00</span>
                            <span>R460.00 - R2,000.00</span>
                        </div>
                        <div className={styles.transportRow}>
                            <span><FontAwesomeIcon icon={faBus} className={styles.icon} /></span>
                            <span>Taxi 1km (Normal Tariff)</span>
                            <span>R20.00</span>
                            <span>R10.00 - R30.00</span>
                        </div>
                        <div className={styles.transportRow}>
                            <span><FontAwesomeIcon icon={faBus} className={styles.icon} /></span>
                            <span>Taxi 1hour Waiting (Normal Tariff)</span>
                            <span>R487.50</span>
                            <span>R55.82 - R150.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InsightsPage;
