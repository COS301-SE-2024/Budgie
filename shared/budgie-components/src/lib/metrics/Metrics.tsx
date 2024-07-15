import React, { useState } from 'react';
import {
  BarChart,
  Line,
  Bar,
  PieChart,
  Pie,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import './global.css'; // Importing the global.css file
import styles from './Metrics.module.css';

export interface MetricsProps {
  onClose: () => void;
}

const Metrics: React.FC<MetricsProps> = ({ onClose }) => {
  const [isLightMode, setIsLightMode] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const handleMetricChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMetric(event.target.value);
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    value: number;
  }) => (
    <text
      x={cx}
      y={cy}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      {`${Math.round(value)}%`}
    </text>
  );

  // Sample data for metrics
  const monthlyBudget = 1000;
  const spendingData = [
    { name: 'jan', spending: 200 },
    { name: 'Feb', spending: 300 },
    { name: 'Mar', spending: 150 },
    { name: 'Apr', spending: 400 },
    { name: 'May', spending: 270 },
    { name: 'Jun', spending: 235 },
  ];

  const categoryData = [
    { name: 'Groceries', value: 200 },
    { name: 'Utilities', value: 100 },
    { name: 'Entertainment', value: 200 },
    { name: 'Transport', value: 150 },
    { name: 'Insurance', value: 150 },
    { name: 'Medical Aid', value: 150 },
    { name: 'Eating Out', value: 150 },
    { name: 'Shopping', value: 150 },
    { name: 'Other', value: 150 },
  ];

  const monthlySpendingData = [
    { name: 'Jan', spending: 800 },
    { name: 'Feb', spending: 950 },
    { name: 'Mar', spending: 700 },
    { name: 'Apr', spending: 850 },
    { name: 'May', spending: 850 },
    { name: 'Jun', spending: 850 },
  ];

  const spending = 400; // Current spending
  const budget = 800; // Budget set for the month
  const percentageSpent = (spending / budget) * 100;
  const percentageRemaining = 100 - percentageSpent;

  const radialData = [
    { name: 'Spent', value: percentageSpent, fill: '#8884d8' },
    { name: 'Remaining', value: percentageRemaining, fill: '#d3d3d3' },
  ];

  const CATEGORY_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const renderMetricVisual = (metricName: string) => {
    switch (metricName) {
      case 'spendingVsBudget':
        return (
          <div className={`${styles.gridItem} ${isLightMode ? styles.lightMode : ''}`}>
            <h3 className={styles.chartTitle}>Spending vs Budget</h3>
            <BarChart width={350} height={450} data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: isLightMode ? 'black' : 'white' }} />
              <YAxis tick={{ fill: isLightMode ? 'black' : 'white' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="spending" fill="#8884d8" />
              <Line type="monotone" dataKey={() => monthlyBudget} stroke="red" />
            </BarChart>
          </div>
        );
      case 'spendingByCategory':
        return (
          <div className={`${styles.gridItem} ${isLightMode ? styles.lightMode : ''}`}>
            <h3 className={styles.chartTitle}>Spending by Category</h3>
            <PieChart width={350} height={450}>
              <Pie
                data={categoryData}
                cx={125}
                cy={100}
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        );
      case 'spendingOverTime':
        return (
          <div className={`${styles.gridItem} ${isLightMode ? styles.lightMode : ''}`}>
            <h3 className={styles.chartTitle}>Spending Breakdown Over Time</h3>
            <AreaChart width={410} height={450} data={monthlySpendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: isLightMode ? 'black' : 'white' }} />
              <YAxis tick={{ fill: isLightMode ? 'black' : 'white' }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="spending" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </div>
        );
      case 'budgetUtilization':
        return (
          <div className={`${styles.gridItem} ${isLightMode ? styles.lightMode : ''}`}>
            <h3 className={styles.chartTitle}>Budget Utilization</h3>
            <RadialBarChart
              width={350}
              height={450}
              cx={175}
              cy={175}
              innerRadius={70}
              outerRadius={140}
              barSize={20}
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                label={renderCustomLabel} // Pass renderCustomLabel function as label prop
                background
                dataKey="value"
                fill="#8884d8"
              />
              <Tooltip />
              <Legend
                iconSize={10}
                width={120}
                height={140}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </RadialBarChart>
          </div>
        );
      default:
        return null; // Return null if no valid metric is provided
    }
  };

  const showAllMetrics = () => {
    setSelectedMetric(null); // Reset selectedMetric to null to show all metrics
  };

  return (
    <div className={`${styles.metricsContainer} ${isLightMode ? styles.lightMode : ''}`}>
      <button onClick={onClose} className={styles.closeButton}>Close</button>
      <button onClick={toggleTheme} className={styles.toggleButton}>
        {isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      </button>

      {/* Dropdown for selecting metrics */}
      <div className={styles.filterSection}>
        <h3>Select Metrics to Display:</h3>
        <select value={selectedMetric || ''} onChange={handleMetricChange}>
          <option value="">Select a metric...</option>
          <option value="spendingVsBudget">Spending vs Budget</option>
          <option value="spendingByCategory">Spending by Category</option>
          <option value="spendingOverTime">Spending Breakdown Over Time</option>
          <option value="budgetUtilization">Budget Utilization</option>
        </select>
      </div>

      {/* Show All button */}
      <button onClick={showAllMetrics} className={styles.showAllButton}>Show All Metrics</button>

      {/* Render all metrics if selectedMetric is null, otherwise render selectedMetric */}
      <div className={styles.gridContainer}>
        {selectedMetric === null ? (
          ['spendingVsBudget', 'spendingByCategory', 'spendingOverTime', 'budgetUtilization'].map(metric => (
            <React.Fragment key={metric}>
              {renderMetricVisual(metric)}
            </React.Fragment>
          ))
        ) : (
          <React.Fragment key={selectedMetric}>
            {renderMetricVisual(selectedMetric)}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default Metrics;
