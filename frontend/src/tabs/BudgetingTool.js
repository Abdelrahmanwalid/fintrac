import React, { useState, useEffect } from "react";
import Header from "../components/Budget/Header";
import DetailView from "../components/Budget/DetailView/DetailView";
import IncomeForm from "../components/Income/IncomeForm";
import Reports from "../components/Report/Reports";
import CategorySection from "../components/Budget/Categories/CategorySection";
import BudgetTracker from "../components/Budget/BudgetTracker.jsx";

const BudgetingTool = ({ setIsSidebarOpen, isSidebarOpen }) => {
  const [activeSection, setActiveSection] = useState("tracker");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [income, setIncome] = useState(0);

  useEffect(() => {
    const savedIncome = localStorage.getItem("income");
    if (savedIncome) {
      setIncome(JSON.parse(savedIncome));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("income", JSON.stringify(income));
  }, [income]);

  const handleNavigation = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        activeSection={activeSection}
        handleNavigation={handleNavigation}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        className="shadow-md bg-white z-10"
      />

      <main className="flex-1 w-full px-0 pt-6 pb-8">
        {activeSection === "tracker" && (
          <div className="flex flex-col gap-6">
            <BudgetTracker />
            <div className="flex flex-col lg:flex-row gap-6 w-full px-4 sm:px-6 lg:px-8">
              <CategorySection />
              <DetailView />
            </div>
          </div>
        )}

        {activeSection === "income" && (
          <div className="px-4 sm:px-6 lg:px-8">
            <IncomeForm income={income} setIncome={setIncome} />
          </div>
        )}

        {activeSection === "reports" && (
          <div className="px-4 sm:px-6 lg:px-8">
            <Reports />
          </div>
        )}
      </main>
    </div>
  );
};

export default BudgetingTool;
