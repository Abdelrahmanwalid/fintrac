import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronUp, DollarSign, PieChart, Wallet, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import BudgetCategoryList from "../components/BudgetCategoryList";
import BudgetDetailView from "../components/BudgetDetailView";
import IncomeForm from "../components/IncomeForm";
import Reports from "../components/Reports";
import { arrayMove } from '@dnd-kit/sortable';

const normalizeCategories = (cats) => {
  return cats.map((category, categoryIndex) => {
    const categoryNumber = categoryIndex + 1;
    const categoryId = `category-${categoryNumber}`;
    return {
      ...category,
      id: categoryId,
      items: (category.items || []).map((item, itemIndex) => ({
        ...item,
        id: `draggable-${categoryNumber}-${itemIndex + 1}`,
        categoryId: categoryId
      }))
    };
  });
};

const NavItem = ({ section, icon: Icon, label, activeSection, onClick }) => (
  <button
    onClick={() => onClick(section)}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors w-full md:w-auto
      ${
        activeSection === section
          ? "bg-blue-700 text-white"
          : "hover:bg-blue-700/10 text-blue-50"
      }`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
);

const BudgetingTool = ({ setIsSidebarOpen, isSidebarOpen }) => {
  const defaultCategories = [
    {
      id: "category-1",
      name: "Bills",
      isExpanded: true,
      items: [
        { id: "draggable-1-1", categoryId: "category-1", name: "Electricity", budget: 50, spent: 0 },
        { id: "draggable-1-2", categoryId: "category-1", name: "Water", budget: 30, spent: 10 },
      ],
    },
    {
      id: "category-2",
      name: "Needs",
      isExpanded: true,
      items: [
        { id: "draggable-2-1", categoryId: "category-2", name: "Groceries", budget: 200, spent: 50 },
        { id: "draggable-2-2", categoryId: "category-2", name: "Gas", budget: 100, spent: 40 },
      ],
    },
    {
      id: "category-3",
      name: "Wants",
      isExpanded: true,
      items: [
        { id: "draggable-3-1", categoryId: "category-3", name: "Dining Out", budget: 100, spent: 20 },
        { id: "draggable-3-2", categoryId: "category-3", name: "Music Subscription", budget: 20, spent: 10 },
      ],
    },
  ];

  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem("budgetCategories");
    console.log('Initial load from localStorage:', savedCategories);
    
    try {
      if (savedCategories && savedCategories !== "[]") {
        const parsed = JSON.parse(savedCategories);
        return normalizeCategories(parsed);
      }
      console.log('Using default categories');
      return normalizeCategories(defaultCategories);
    } catch (e) {
      console.error('Error parsing saved categories:', e);
      return normalizeCategories(defaultCategories);
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      console.log('Saving categories to localStorage:', categories);
      localStorage.setItem("budgetCategories", JSON.stringify(categories));
    }
  }, [categories, isLoading]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [activeSection, setActiveSection] = useState("tracker");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [income, setIncome] = useState(() => {
    const savedIncome = localStorage.getItem("income");
    return savedIncome ? JSON.parse(savedIncome) : 0;
  });

  useEffect(() => {
    localStorage.setItem("budgetCategories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("income", JSON.stringify(income));
  }, [income]);

  const toggleExpand = (id) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === id
          ? { ...category, isExpanded: !category.isExpanded }
          : category
      )
    );
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    setIsSidebarOpen(false);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const categoryNumber = categories.length + 1;
      const categoryId = `category-${categoryNumber}`;
      const newCategory = {
        id: categoryId,
        name: newCategoryName.trim(),
        isExpanded: true,
        items: [],
      };
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  const updateBudgetItem = (categoryId, itemId, updates) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : category
      )
    );
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    if (active.id === over.id) return;

    setCategories(prevCategories => {
      // Find if we're dealing with categories or items
      const isCategory = prevCategories.find(cat => cat.id === active.id);

      if (isCategory) {
        // Handle category reordering
        const oldIndex = prevCategories.findIndex(cat => cat.id === active.id);
        const newIndex = prevCategories.findIndex(cat => cat.id === over.id);
        return arrayMove(prevCategories, oldIndex, newIndex);
      } else {
        // Handle item reordering
        const newCategories = [...prevCategories];
        let sourceCategory, destinationCategory;
        let sourceIndex, destinationIndex;

        // Find source and destination categories and indices
        newCategories.forEach(category => {
          const itemIndex = category.items.findIndex(item => item.id === active.id);
          if (itemIndex !== -1) {
            sourceCategory = category;
            sourceIndex = itemIndex;
          }
          if (category.items.some(item => item.id === over.id)) {
            destinationCategory = category;
            destinationIndex = category.items.findIndex(item => item.id === over.id);
          }
        });

        if (!sourceCategory || !destinationCategory) return prevCategories;

        // Move the item
        const [movedItem] = sourceCategory.items.splice(sourceIndex, 1);
        destinationCategory.items.splice(destinationIndex, 0, {
          ...movedItem,
          categoryId: destinationCategory.id
        });

        return newCategories;
      }
    });
  };

  const addItemToCategory = (categoryId, itemName) => {
    setCategories(prevCategories => {
      return prevCategories.map(category => {
        if (category.id === categoryId) {
          const newItem = {
            id: `draggable-${categoryId}-${category.items.length + 1}`,
            categoryId: categoryId,
            name: itemName,
            budget: 0,
            spent: 0,
          };
          return {
            ...category,
            items: [...category.items, newItem],
          };
        }
        return category;
      });
    });
  };

  const removeBudgetItem = (itemId) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) => ({
        ...category,
        items: category.items.filter((item) => item.id !== itemId),
      }))
    );
  };

  const removeCategory = (categoryId) => {
    if (window.confirm("Are you sure you want to remove this category and all its items?")) {
      setCategories(prevCategories => 
        prevCategories.filter(category => category.id !== categoryId)
      );
      // If the selected item belongs to the deleted category, clear the selection
      if (selectedItem && selectedItem.categoryId === categoryId) {
        setSelectedItem(null);
      }
    }
  };

  const renameCategory = (categoryId, newName) => {
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === categoryId
          ? { ...category, name: newName }
          : category
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white z-40 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-blue-700/20 transition-colors"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
              <h2 className="text-lg font-semibold">Budget Tracker</h2>
            </div>

            <nav className="hidden md:flex space-x-2">
              <NavItem
                section="tracker"
                icon={DollarSign}
                label="Budget"
                activeSection={activeSection}
                onClick={handleNavigation}
              />
              <NavItem
                section="income"
                icon={Wallet}
                label="Income"
                activeSection={activeSection}
                onClick={handleNavigation}
              />
              <NavItem
                section="reports"
                icon={PieChart}
                label="Reports"
                activeSection={activeSection}
                onClick={handleNavigation}
              />
            </nav>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-700/20 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden py-2 space-y-1">
              <NavItem
                section="tracker"
                icon={DollarSign}
                label="Budget"
                activeSection={activeSection}
                onClick={handleNavigation}
              />
              <NavItem
                section="income"
                icon={Wallet}
                label="Income"
                activeSection={activeSection}
                onClick={handleNavigation}
              />
              <NavItem
                section="reports"
                icon={PieChart}
                label="Reports"
                activeSection={activeSection}
                onClick={handleNavigation}
              />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeSection === "tracker" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
            </button>

            <div className="lg:w-1/3 space-y-4">
              <BudgetCategoryList
                categories={categories}
                onToggleCategory={toggleExpand}
                onSelectItem={selectItem}
                selectedItemId={selectedItem?.id}
                onDragEnd={onDragEnd}
                onAddItem={addItemToCategory}
                onRemoveCategory={removeCategory}
                onRenameCategory={renameCategory}
              />
              
              {isAddingCategory ? (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="flex-grow p-2 border rounded-lg"
                  />
                  <button
                    onClick={addCategory}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Category</span>
                </button>
              )}
            </div>

            <div className="lg:w-2/3">
              {selectedItem ? (
                <BudgetDetailView
                  item={selectedItem}
                  onUpdate={(updates) =>
                    updateBudgetItem(selectedItem.categoryId, selectedItem.id, updates)
                  }
                  onRemove={removeBudgetItem}
                />
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">Select a budget item</h3>
                  <p className="text-gray-600">
                    Choose a budget item from the list to view and edit its details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {activeSection === "income" && <IncomeForm income={income} setIncome={setIncome} />}
        {activeSection === "reports" && <Reports categories={categories} income={income} />}
      </main>
    </div>
  );
};

export default BudgetingTool;