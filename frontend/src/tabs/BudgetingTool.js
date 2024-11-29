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
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeSection === "tracker" && (
          <CategoryProvider>
          <ItemProvider>
            <div className="flex flex-col lg:flex-row gap-6">
              <CategorySection />
              <DetailView />
            </div>
          </ItemProvider>
          </CategoryProvider>
        )}
        {activeSection === "income" && <IncomeForm income={income} setIncome={setIncome} />}
        {activeSection === "reports" && <Reports />}
      </main>
    </div>
  );
};

export default BudgetingTool;