import React, { useState } from 'react';
import BudgetingTool from '../tools/BudgetingTool';
import CompoundInterestCalculator from '../tools/CompoundInterestCalculator';
import Profile from '../tools/Profile';
import StudentLoanCalculator from '../tools/StudentLoanCalculator';

const Dashboard = () => {
  // State to manage the currently active tool
  const [activeTool, setActiveTool] = useState('budgeting');

  // Function to render the selected tool component
  const renderTool = () => {
    switch (activeTool) {
      case 'budgeting':
        return <BudgetingTool />;
      case 'compoundInterest':
        return <CompoundInterestCalculator />;
      case 'studentLoan':
        return <StudentLoanCalculator />;
      case 'profile':
        return <Profile />;
      default:
        return <BudgetingTool />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 p-6 bg-blue-800 text-white">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <nav>
          <ul>
            <li>
              <button
                onClick={() => setActiveTool('budgeting')}
                className="block text-white py-2 hover:underline"
              >
                Budgeting Tool
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTool('compoundInterest')}
                className="block text-white py-2 hover:underline"
              >
                Compound Interest Calculator
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTool('studentLoan')}
                className="block text-white py-2 hover:underline"
              >
                Student Loan Calculator
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTool('profile')}
                className="block text-white py-2 hover:underline"
              >
                Profile
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>
        
        {/* Render the active tool */}
        {renderTool()}
      </main>
    </div>
  );
};

export default Dashboard;