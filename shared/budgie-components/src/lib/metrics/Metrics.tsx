import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Tooltip, CartesianGrid, XAxis, YAxis, Legend, Cell } from 'recharts';
import styles from './Metrics.module.css';

export interface MetricsProps {
  onClose: () => void;
}

const Metrics: React.FC<MetricsProps> = ({ onClose }) => {
  // Mock data
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className={styles.metricsContainer}>
      <button onClick={onClose} className={styles.closeButton}>Close</button>
      <h2>Metrics</h2>
      <div className={styles.chart}>
        <h3>Spending vs Budget</h3>
        <BarChart width={600} height={300} data={spendingData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="spending" fill="#8884d8" />
          <Line type="monotone" dataKey={() => monthlyBudget} stroke="red" />
        </BarChart>
      </div>
      <div className={styles.chart}>
        <h3>Spending by Category</h3>
        <PieChart width={400} height={400}>
          <Pie
            data={categoryData}
            cx={200}
            cy={200}
            labelLine={false}
            outerRadius={80}
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
    </div>
  );
};

export default Metrics;
