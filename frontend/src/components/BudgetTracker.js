import React, { useState } from "react";
import BudgetCategory from "./BudgetCategory";

const BudgetTracker = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Bills",
      isExpanded: true,
      items: [
        { id: 101, name: "Electricity", budget: 50, spent: 0 },
        { id: 102, name: "Water", budget: 30, spent: 10 },
      ],
    },
    {
      id: 2,
      name: "Needs",
      isExpanded: true,
      items: [
        { id: 201, name: "Groceries", budget: 200, spent: 50 },
        { id: 202, name: "Gas", budget: 100, spent: 40 },
      ],
    },
  ]);

  const toggleExpand = (id) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === id
          ? { ...category, isExpanded: !category.isExpanded }
          : category
      )
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Budget Tracker</h2>
      <div>
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(category.id)}
            >
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <span className="text-gray-500">
                {category.isExpanded ? "-" : "+"}
              </span>
            </div>
            {category.isExpanded && (
              <div className="mt-2 space-y-2">
                {category.items.map((item) => (
                  <BudgetCategory key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetTracker;
