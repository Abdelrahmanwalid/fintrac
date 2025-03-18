import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SortableItem from "./Categories/Items/SortableItem"; // Adjust path as needed
import BudgetDetailView from "./DetailView/BudgetDetailView"; // Adjust path as needed
import { fetchItemsAsync } from "../../store/itemSlice"; // Adjust path
import { fetchIncomeAsync } from "../../store/incomeSlice"; // Adjust path
import { ChevronDown, ChevronUp } from "lucide-react";

const BudgetTracker = () => {
  const dispatch = useDispatch();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPopupExpanded, setIsPopupExpanded] = useState(false);

  // Fetch items and income from Redux
  const incomeItems = useSelector((state) => state.income?.incomeItems || []);
  const budgetItemsByCategory = useSelector(
    (state) => state.items?.itemsByCategory || {}
  );
  const budgetItems = Object.values(budgetItemsByCategory).flat();

  useEffect(() => {
    dispatch(fetchItemsAsync());
    dispatch(fetchIncomeAsync());
  }, [dispatch]);

  // Simplified monthly income calculation
  const getMonthlyIncome = (amount, recurring) => {
    const parsedAmount = parseFloat(amount);
    switch (recurring) {
      case "weekly":
        return parsedAmount * 4.33;
      case "bi-weekly":
        return parsedAmount * 2.17;
      case "monthly":
        return parsedAmount;
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

  const monthlyIncome = incomeItems.reduce(
    (total, inc) => total + getMonthlyIncome(inc.amount, inc.recurring),
    0
  );
  const totalBudgeted = budgetItems.reduce(
    (total, item) => total + (item.budget || 0),
    0
  );
  const fundsRemaining = monthlyIncome - totalBudgeted;

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {/* Expandable Popup at the Top */}
      <div className="fixed top-0 left-0 right-0 z-10 mx-auto max-w-md">
        <div
          className="bg-gray-100 p-2 rounded-b-lg shadow-md cursor-pointer"
          onClick={() => setIsPopupExpanded(!isPopupExpanded)}
        >
          <div className="flex justify-between items-center text-sm">
            <span>Income: £{monthlyIncome.toFixed(2)}</span>
            <span
              className={fundsRemaining < 0 ? "text-red-500" : "text-green-500"}
            >
              Budgeted: £{totalBudgeted.toFixed(2)}
            </span>
            {isPopupExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>
          {isPopupExpanded && (
            <div className="mt-2 p-2 bg-white rounded-lg shadow-inner text-sm">
              <p>Funds Remaining: £{fundsRemaining.toFixed(2)}</p>
              <p className="text-gray-500 text-xs mt-1">Click to collapse</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-16">
        {" "}
        {/* Offset for popup */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Category Section */}
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-bold mb-4">Budget Categories</h2>
            {Object.keys(budgetItemsByCategory).length === 0 ? (
              <p className="text-gray-500">
                No categories yet. Add some budget items to start!
              </p>
            ) : (
              Object.entries(budgetItemsByCategory).map(
                ([categoryId, items]) => (
                  <div key={categoryId} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {items[0]?.categoryId?.name || "Uncategorized"}
                    </h3>
                    {items.map((item) => (
                      <SortableItem
                        key={item._id}
                        item={item}
                        onClick={() => setSelectedItem(item)}
                        isSelected={selectedItem?._id === item._id}
                      />
                    ))}
                  </div>
                )
              )
            )}
          </div>

          {/* Budget Detail View */}
          <div className="w-full md:w-1/2">
            <BudgetDetailView item={selectedItem} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
