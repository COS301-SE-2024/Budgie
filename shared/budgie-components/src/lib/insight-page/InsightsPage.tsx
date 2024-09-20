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
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Apartment (1 bedroom) in City Centre</span>
                        <span>R8,104.34</span>
                        <span>Range: 1,000.00 - 4,500.00</span>
                    </div>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Apartment (1 bedroom) Outside of Centre</span>
                        <span>R6,494.41</span>
                        <span>Range: 1,000.00 - 4,500.00</span>
                    </div>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Apartment (3 bedrooms) in City Centre</span>
                        <span>R16,140.77 </span>
                        <span>Range: 1,000.00 - 4,500.00</span>
                    </div>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Apartment (3 bedrooms) Outside of Centre</span>
                        <span>R12,568.71</span>
                        <span>Range: 1,000.00 - 4,500.00</span>
                    </div>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Price per Square Meter to Buy Apartment in City Centre</span>
                        <span>R18,673.75</span>
                        <span>Range: 1,000.00 - 4,500.00</span>
                    </div>
                    <div className={styles.propertyRow}>
                        <FontAwesomeIcon icon={faHome} className={styles.icon} />
                        <span>Price per Square Meter to Buy Apartment Outside of Centre</span>
                        <span>R14,157.36</span>
                        <span>Range: 1,000.00 - 4,500.00</span>
                    </div>
                </div>
            </div>

            {/* Tax brackets */}
            <div className={styles.gridItem}>
                <div className={styles.gridItemTitleBox}>
                    <h2 className={styles.gridItemTitle}>Tax Brackets</h2>
                </div>
                <div className={styles.utilityTable}>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} />
                        <span>Up to R216,200</span>
                        <span>18%</span>
                    </div>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} />
                        <span>Up to R337,800</span>
                        <span>26% on income above R216,200</span>
                    </div>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} />
                        <span>Up to R467,500</span>
                        <span>31% on income above R337,800</span>
                    </div>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} />
                        <span>Up to R613,600r</span>
                        <span>36% on income above R467,500</span>
                    </div>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} />
                        <span>Up to R782,200</span>
                        <span>39% on income above R613,600</span>
                    </div>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} />
                        <span>Up to R1,656,600</span>
                        <span>41% on income above R782,200</span>
                    </div>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className={styles.icon} />
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
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faLightbulb} className={styles.icon} />
                        <span>Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment</span>
                        <span>R1,878.91</span>
                        <span>Range: 1,000.00-3,500.00</span>
                    </div>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faLightbulb} className={styles.icon} />
                        <span>Mobile Phone Monthly Plan with Calls and 10GB+ Data</span>
                        <span>R589.95 </span>
                        <span>Range: 300.00-1,000.00</span>
                    </div>
                    <div className={styles.utilityRow}>
                        <FontAwesomeIcon icon={faLightbulb} className={styles.icon} />
                        <span>Internet (60 Mbps or More, Unlimited Data, Cable/ADSL)</span>
                        <span>R750.58</span>
                        <span>Range: 540.00-1,000.00</span>
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
                        <span>R30.00</span>
                        <span>Range: 15.00-65.00</span>
                    </div>
                    <div className={styles.transportRow}>
                        <FontAwesomeIcon icon={faBus} className={styles.icon} />
                        <span>Monthly Pass (Regular Price)</span>
                        <span>R825.00</span>
                        <span>Range: 460.00-2,000.00</span>
                    </div>
                    <div className={styles.transportRow}>
                        <FontAwesomeIcon icon={faBus} className={styles.icon} />
                        <span>Taxi 1km (Normal Tariff)</span>
                        <span>R20.00</span>
                        <span>Range: 10.00-30.00</span>
                    </div>
                    <div className={styles.transportRow}>
                        <FontAwesomeIcon icon={faBus} className={styles.icon} />
                        <span>Taxi 1hour Waiting (Normal Tariff)</span>
                        <span>R487.50</span>
                        <span>Range: 55.82-150.00</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InsightsPage;
