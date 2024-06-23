import React from 'react';
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
import styles from './Metrics.module.css';

export interface MetricsProps {
  onClose: () => void;
}

const Metrics: React.FC<MetricsProps> = ({ onClose }) => {
  const monthlyBudget = 1000;
  const spendingData = [
    { name: 'Month 1', spending: 200 },
    { name: 'Month 2', spending: 300 },
    { name: 'Month 3', spending: 150 },
    { name: 'Month 4', spending: 400 },
  ];

  const categoryData = [
    { name: 'Groceries', value: 400 },
    { name: 'Rent', value: 500 },
    { name: 'Entertainment', value: 200 },
    { name: 'Utilities', value: 150 },
  ];

  const monthlySpendingData = [
    { name: 'Month 1', spending: 800 },
    { name: 'Month 2', spending: 950 },
    { name: 'Month 3', spending: 700 },
    { name: 'Month 4', spending: 850 },
  ];

  const spending = 400; // Current spending
  const budget = 800; // Budget set for the month
  const percentageSpent = (spending / budget) * 100;
  const percentageRemaining = 100 - percentageSpent;

  const radialData = [
    { name: 'Spent', value: percentageSpent, fill: '#8884d8' },
    { name: 'Remaining', value: percentageRemaining, fill: '#d3d3d3' },
  ];

  const COLORS = ['#8884d8', '#d3d3d3'];

  // Define colors for each category
  const CATEGORY_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  return (
    <div className={styles.metricsContainer}>
      <button onClick={onClose} className={styles.closeButton}>Close</button>
      <h2 className={styles.chartTitle}>Metrics</h2>

      <div className={styles.gridContainer}>
        <div className={styles.gridItem}>
          <h3 className={styles.chartTitle}>Spending vs Budget</h3>
          <BarChart width={350} height={450} data={spendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: 'white' }} />
            <YAxis tick={{ fill: 'white' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="spending" fill="#8884d8" />
            <Line type="monotone" dataKey={() => monthlyBudget} stroke="red" />
          </BarChart>
        </div>

        <div className={styles.gridItem}>
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

        <div className={styles.gridItem}>
          <h3 className={styles.chartTitle}>Spending Breakdown Over Time</h3>
          <AreaChart width={410} height={450} data={monthlySpendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: 'white' }} />
            <YAxis tick={{ fill: 'white' }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="spending" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </div>

        <div className={styles.gridItem}>
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
              label={renderCustomLabel}
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
      </div>
    </div>
  );
};

export default Metrics;
