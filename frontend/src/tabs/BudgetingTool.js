import React, { useState, useEffect } from "react";
import Header from "../components/Budget/Header";
import DetailView from "../components/Budget/DetailView/DetailView";
import IncomeForm from "../components/Income/IncomeForm";
import Reports from "../components/Report/Reports";
import CategorySection from "../components/Budget/Categories/CategorySection";
import { ItemProvider } from "../components/Budget/Categories/Items/ItemContext";
import { CategoryProvider } from "../components/Budget/Categories/CategoryContext";

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

  <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Tracker Section */}
    {activeSection === "tracker" && (
      <CategoryProvider>
        <ItemProvider>
          <div className="flex flex-col lg:flex-row gap-8">
            <CategorySection className="flex-1 p-4 bg-white rounded-lg shadow-md" />
            <DetailView className="flex-1 p-4 bg-white rounded-lg shadow-md" />
          </div>
        </ItemProvider>
      </CategoryProvider>
    )}

    {/* Income Section */}
    {activeSection === "income" && (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <IncomeForm income={income} setIncome={setIncome} />
      </div>
    )}

    {/* Reports Section */}
    {activeSection === "reports" && (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <Reports />
      </div>
    )}
  </main>
</div>
  );
};

export default BudgetingTool;