import React, { createContext, useContext, useState, useEffect } from 'react';

const BudgetContext = createContext();

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgetContext must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const [incomeItems, setIncomeItems] = useState([]);

  useEffect(() => {
    const savedIncomeItems = localStorage.getItem("incomeItems");
    if (savedIncomeItems) {
      setIncomeItems(JSON.parse(savedIncomeItems));
    }
  }, []);

  const getMonthlyIncome = (amount, recurring, lastPaymentDate) => {
    const parsedAmount = parseFloat(amount);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    let paymentCount = 0;
    let nextPaymentDate = new Date(lastPaymentDate);

    switch (recurring) {
      case "weekly":
        while (nextPaymentDate <= endOfMonth) {
          if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth) {
            paymentCount++;
          }
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
        }
        return parsedAmount * paymentCount;
      case "bi-weekly":
        while (nextPaymentDate <= endOfMonth) {
          if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth) {
            paymentCount++;
          }
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 14);
        }
        return parsedAmount * paymentCount;
      case "monthly":
        if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth) {
          return parsedAmount;
        }
        return 0;
      case "semester":
        return parsedAmount / 6;
      case "yearly":
        return parsedAmount / 12;
      case "termly":
        return parsedAmount / 4;
      default:
        return parsedAmount;
    }
  };

  const calculateMonthlyIncome = () => {
    return incomeItems.reduce((total, item) => {
      return total + getMonthlyIncome(item.amount, item.recurring, item.lastPaymentDate);
    }, 0);
  };

  const value = {
    incomeItems,
    setIncomeItems,
    calculateMonthlyIncome,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}; 