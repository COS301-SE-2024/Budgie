import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Tooltip, CartesianGrid, XAxis, YAxis, Legend, Cell, AreaChart, Area } from 'recharts';
import styles from './Metrics.module.css';

export interface MetricsProps {
  onClose: () => void;
}

const Metrics: React.FC<MetricsProps> = ({ onClose }) => {
  const monthlyBudget = 1000;
  const spendingData = [
    { name: 'Week 1', spending: 200 },
    { name: 'Week 2', spending: 300 },
    { name: 'Week 3', spending: 150 },
    { name: 'Week 4', spending: 400 },
  ];

  const categoryData = [
    { name: 'Groceries', value: 400 },
    { name: 'Rent', value: 500 },
    { name: 'Entertainment', value: 200 },
    { name: 'Utilities', value: 150 },
  ];

  const monthlySpendingData = [
    { name: 'January', spending: 800 },
    { name: 'February', spending: 950 },
    { name: 'March', spending: 700 },
    { name: 'April', spending: 850 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className={styles.metricsContainer}>
      <button onClick={onClose} className={styles.closeButton}>Close</button>
      <h2 className={styles.chartTitle}>Metrics</h2>

      <div className={styles.chart}>
        <h3 className={styles.chartTitle}>Spending vs Budget</h3>
        <BarChart width={500} height={250} data={spendingData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: 'white' }} />
          <YAxis tick={{ fill: 'white' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="spending" fill="#8884d8" />
          <Line type="monotone" dataKey={() => monthlyBudget} stroke="red" />
        </BarChart>
      </div>

      <div className={styles.chart}>
        <h3 className={styles.chartTitle}>Spending by Category</h3>
        <PieChart width={400} height={350}>
          <Pie
            data={categoryData}
            cx={200}
            cy={200}
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      <div className={styles.chart}>
        <h3 className={styles.chartTitle}>Spending Breakdown Over Time</h3>
        <AreaChart width={600} height={200} data={monthlySpendingData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: 'white' }} />
          <YAxis tick={{ fill: 'white' }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="spending" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </div>
    </div>
  );
};

export default Metrics;
