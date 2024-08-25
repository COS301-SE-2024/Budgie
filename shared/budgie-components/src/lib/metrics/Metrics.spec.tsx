import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Metrics from './Metrics';

describe('Metrics Component', () => {
  // Mocking the CSS module import
  jest.mock('./Metrics.module.css', () => ({
    metricsContainer: 'metricsContainer',
    closeButton: 'closeButton',
    chartTitle: 'chartTitle',
    gridContainer: 'gridContainer',
    gridItem: 'gridItem',
  }));

  it('should render the Metrics component', () => {
    render(<Metrics onClose={() => {}} />);

    // Check if close button is rendered
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeTruthy();

    // Check if chart titles are rendered
    const metricsTitle = screen.getByText('Metrics');
    const spendingVsBudgetTitle = screen.getByText('Spending vs Budget');
    const spendingByCategoryTitle = screen.getByText('Spending by Category');
    const spendingBreakdownTitle = screen.getByText('Spending Breakdown Over Time');
    const budgetUtilizationTitle = screen.getByText('Budget Utilization');

    expect(metricsTitle).toBeTruthy();
    expect(spendingVsBudgetTitle).toBeTruthy();
    expect(spendingByCategoryTitle).toBeTruthy();
    expect(spendingBreakdownTitle).toBeTruthy();
    expect(budgetUtilizationTitle).toBeTruthy();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Metrics onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
