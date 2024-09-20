import React from 'react';
import styles from './InsightsPage.module.css'; // Import the CSS module for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGasPump, faBank, faHome, faBus, faLightbulb, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons'; // Icons for petrol, bank, home, transport, utilities
import fnb from '../../../public/images/FNB_Color.png';
import absa from '../../../public/images/absa-logo.png';
import sb from '../../../public/images/Standard-Bank-Logo.png';
import Image from 'next/image';
import { useState } from 'react';

export function InsightsPage() {

    const [currentBank, setCurrentBank] = useState("fnb");

    const formatCurrency = (value: number) => {
        const formatter = new Intl.NumberFormat('en-ZA', {
          style: 'currency',
          currency: 'ZAR',
          minimumFractionDigits: 2,
        });
        return formatter.format(value);
    };


    return (
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
                        <span>cpl 23.32</span>
                        <span>cpl 23.22</span>
                    </div>
                    <div className={styles.tableRow}>
                        <div className={styles.productName}>
                            <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                            <span>93 Unleaded Petrol</span>
                        </div>
                        <span>cpl 22.45</span>
                        <span>cpl 22.35</span>
                    </div>
                    <div className={styles.tableRow}>
                        <div className={styles.productName}>
                            <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                            <span>Diesel 50ppm</span>
                        </div>
                        <span>cpl 22.45</span>
                        <span>cpl 22.35</span>
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
                        <span>cpl 23.32</span>
                        <span>cpl 23.22</span>
                    </div>
                    <div className={styles.tableRow}>
                        <div className={styles.productName}>
                            <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                            <span>93 Unleaded Petrol</span>
                        </div>
                        <span>cpl 22.45</span>
                        <span>cpl 22.35</span>
                    </div>
                    <div className={styles.tableRow}>
                        <div className={styles.productName}>
                            <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                            <span>Diesel 50ppm</span>
                        </div>
                        <span>cpl 22.45</span>
                        <span>cpl 22.35</span>
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
                        <span>cpl 23.32</span>
                        <span>cpl 23.22</span>
                    </div>
                    <div className={styles.tableRow}>
                        <div className={styles.productName}>
                            <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                            <span>93 Unleaded Petrol</span>
                        </div>
                        <span>cpl 22.45</span>
                        <span>cpl 22.35</span>
                    </div>
                    <div className={styles.tableRow}>
                        <div className={styles.productName}>
                            <FontAwesomeIcon icon={faGasPump} className={styles.icon} />
                            <span>Diesel 50ppm</span>
                        </div>
                        <span>cpl 22.45</span>
                        <span>cpl 22.35</span>
                    </div>
                </div>
            </div>


            {currentBank=="fnb" && (
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
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
                                    borderRadius: '8px' 
                                }}>
                            </Image></span>
                        </div>
                        <span className={styles.arrow} onClick={() => setCurrentBank("absa")}>&gt;</span>
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
            )}

            {currentBank=="absa" && (
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
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
                                    borderRadius: '8px' 
                                }}>
                            </Image></span>
                        </div>
                        <span className={styles.arrow} onClick={() => setCurrentBank("sb")}>&gt;</span>
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
            )}

            {currentBank=="sb" && (
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
                                src={sb} 
                                width={150} 
                                alt="Standard Bank"     
                                style={{ 
                                    width: '120px', 
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
                                    borderRadius: '8px' 
                                }}>
                            </Image></span>
                        </div>
                        <span className={styles.arrow} onClick={() => setCurrentBank("fnb")}>&gt;</span>
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
    );
}

export default InsightsPage;
