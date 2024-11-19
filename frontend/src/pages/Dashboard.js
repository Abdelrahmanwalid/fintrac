import React, { useState } from 'react';
import { X, DollarSign, PieChart, GraduationCap, User } from 'lucide-react';
import BudgetingTool from '../tools/BudgetingTool';
import CompoundInterestCalculator from '../tools/CompoundInterestCalculator';
import Profile from '../tools/Profile';
import StudentLoanCalculator from '../tools/StudentLoanCalculator';

const Dashboard = () => {
  const [activeTool, setActiveTool] = useState('budgeting');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderTool = () => {
    switch (activeTool) {
      case 'budgeting':
        return <BudgetingTool setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />;
      case 'compoundInterest':
        return <CompoundInterestCalculator />;
      case 'studentLoan':
        return <StudentLoanCalculator />;
      case 'profile':
        return <Profile />;
      default:
        return <BudgetingTool setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />;
    }
  };

  const NavItem = ({ icon: Icon, label, toolName }) => (
    <li>
      <button
        onClick={() => setActiveTool(toolName)}
        className={`flex items-center w-full text-left px-4 py-2 rounded-lg transition-colors ${
          activeTool === toolName
            ? 'bg-blue-700 text-white'
            : 'text-blue-100 hover:bg-blue-700/50'
        }`}
      >
        <Icon className="h-5 w-5 mr-3" />
        {label}
      </button>
    </li>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex items-center h-14 px-4 border-b border-blue-700">
          <h2 className="text-xl font-bold">FinTrac</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-white hover:text-blue-200 ml-auto"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-4">
          <ul className="space-y-1 px-3">
            <NavItem icon={DollarSign} label="Budgeting Tool" toolName="budgeting" />
            <NavItem icon={PieChart} label="Compound Interest" toolName="compoundInterest" />
            <NavItem icon={GraduationCap} label="Student Loan" toolName="studentLoan" />
            <NavItem icon={User} label="Profile" toolName="profile" />
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-auto">{renderTool()}</div>
      </main>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;