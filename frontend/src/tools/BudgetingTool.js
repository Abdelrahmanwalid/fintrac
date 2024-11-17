import React, { useState } from 'react';
import Tutorial from '../components/Tutorial.js';

const BudgetingTool = () => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [activeSection, setActiveSection] = useState("budget-overview"); // Default to Budget Overview

  const closeTutorial = () => setShowTutorial(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Conditional Tutorial */}
      {showTutorial && <Tutorial onClose={closeTutorial} />}

      {/* Horizontal Navbar */}
      <header className="bg-blue-800 text-white py-4 px-6">
        <h2 className="text-2xl font-bold inline-block mr-6">Dashboard</h2>
        <nav className="inline-block">
          <ul className="flex space-x-6">
            <li>
              <button
                onClick={() => setActiveSection("budget-overview")}
                className={`hover:underline ${activeSection === "budget-overview" ? "text-orange-400 font-semibold" : ""}`}
              >
                Budget Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("add-income")}
                className={`hover:underline ${activeSection === "add-income" ? "text-orange-400 font-semibold" : ""}`}
              >
                Add Income
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("add-expense")}
                className={`hover:underline ${activeSection === "add-expense" ? "text-orange-400 font-semibold" : ""}`}
              >
                Add Expenses
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("reports")}
                className={`hover:underline ${activeSection === "reports" ? "text-orange-400 font-semibold" : ""}`}
              >
                View Reports
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>

        {/* Render sections based on activeSection state */}
        {activeSection === "budget-overview" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Budget Overview</h2>
            <p>Manage and review your overall budget here.</p>
            {/* Additional content goes here */}
          </section>
        )}

        {activeSection === "add-income" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Add Income</h2>
            <p>Enter your sources of income to keep track of your budget.</p>
            {/* Additional content goes here */}
          </section>
        )}

        {activeSection === "add-expense" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Add Expenses</h2>
            <p>Track your expenses and categorize them.</p>
            {/* Additional content goes here */}
          </section>
        )}

        {activeSection === "reports" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">View Reports</h2>
            <p>Analyze your spending trends and financial reports.</p>
            {/* Additional content goes here */}
          </section>
        )}
      </main>
    </div>
  );
};

export default BudgetingTool;