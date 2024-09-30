import React from 'react';

export default function Loading() {
  return (
    <div
      className="w-full h-full flex items-center justify-center bg-BudgieGrayLight"
      role="status"
      aria-label="Loading"
    >
      <div className="w-16 h-16 border-8 border-l-BudgieBlue2 border-t-transparent border-b-transparent border-r-BudgieBlue2 rounded-full animate-spin"></div>
    </div>
  );
}
