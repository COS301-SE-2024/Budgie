import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import UploadStatementCSV, { UploadStatementCSVProps } from './UploadStatementCSV';

describe('UploadStatementCSV', () => {
  it('should render the upload button', () => {
    render(<UploadStatementCSV onFileUpload={jest.fn()} />);
    const button = screen.getByText('Upload Bank Statement (.csv)');
    expect(button).not.toBeNull();  // Ensure button is rendered
  });

  it('should call onFileUpload with the selected file', () => {
    const mockOnFileUpload = jest.fn();
    render(<UploadStatementCSV onFileUpload={mockOnFileUpload} />);
    
    const button = screen.getByText('Upload Bank Statement (.csv)');
    fireEvent.click(button);

    const file = new File(['file content'], 'statement.csv', { type: 'text/csv' });
    const input = screen.getByRole('button').nextSibling as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnFileUpload).toHaveBeenCalledTimes(1);
    expect(mockOnFileUpload).toHaveBeenCalledWith(file);
  });

  it('should reset the input value after file selection', () => {
    const mockOnFileUpload = jest.fn();
    render(<UploadStatementCSV onFileUpload={mockOnFileUpload} />);

    const button = screen.getByText('Upload Bank Statement (.csv)');
    fireEvent.click(button);

    const file = new File(['file content'], 'statement.csv', { type: 'text/csv' });
    const input = screen.getByRole('button').nextSibling as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(input.value).toBe(''); // Input value should be reset after file selection
  });
});
