import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DollarSign } from "lucide-react";

import DetailHeader from "./DetailHeader";
import BudgetInfo from "./BudgetInfo";
import FrequencyInfo from "./FrequencyInfo";
import ProgressInfo from "./ProgressInfo";
import ActionButtons from "./ActionButtons";

// Import your Redux actions/thunks
import { updateItemAsync } from "../../../store/itemSlice";

const BudgetDetailView = ({ item }) => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.categories);

  // Use backend-aligned field names
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudget, setEditedBudget] = useState(item ? item.budget : 0);
  const [spentAmount, setSpentAmount] = useState(item ? item.spent : 0);
  const [originalSpentAmount, setOriginalSpentAmount] = useState(
    item ? item.spent : 0
  );
  const [originalBudget, setOriginalBudget] = useState(item ? item.budget : 0);
  const [isRenamingItem, setIsRenamingItem] = useState(false);
  const [newItemName, setNewItemName] = useState(item ? item.name : "");
  const [paymentDate, setPaymentDate] = useState(item ? item.paymentDate : "");
  const [frequency, setFrequency] = useState(item ? item.frequency : "monthly");
  const [customSchedule, setCustomSchedule] = useState(
    item ? item.customSchedule : ""
  );
  const [paymentDayOfWeek, setPaymentDayOfWeek] = useState(
    item ? item.paymentDayOfWeek || "Monday" : "Monday"
  );
  const [paymentDayOfMonth, setPaymentDayOfMonth] = useState(
    item
      ? item.isLastDayOfMonth
        ? "Last Day of Month"
        : item.paymentDayOfMonth || "1"
      : "Last Day of Month"
  );
  const [paymentDateOfYear, setPaymentDateOfYear] = useState(
    item
      ? item.paymentDateOfYear
        ? new Date(item.paymentDateOfYear)
        : new Date()
      : new Date()
  );

  // Sync state with item changes
  useEffect(() => {
    if (!item) return;
    const currentCategory = categories.find(
      (cat) => cat.id === item.categoryId
    );
    const currentItem = currentCategory?.items?.find((i) => i.id === item.id);

    if (currentItem) {
      setNewItemName(currentItem.name);
      setEditedBudget(currentItem.budget);
      setSpentAmount(currentItem.spent);
      setOriginalSpentAmount(currentItem.spent);
      setOriginalBudget(currentItem.budget);
      setPaymentDate(currentItem.paymentDate);
      setFrequency(currentItem.frequency);
      setCustomSchedule(currentItem.customSchedule);
      setPaymentDayOfWeek(currentItem.paymentDayOfWeek || "Monday");
      setPaymentDayOfMonth(
        currentItem.isLastDayOfMonth
          ? "Last Day of Month"
          : currentItem.paymentDayOfMonth || "1"
      );
      setPaymentDateOfYear(
        currentItem.paymentDateOfYear
          ? new Date(currentItem.paymentDateOfYear)
          : new Date()
      );
    }
  }, [item, categories]);

  const handleUpdateItemRedux = (updatedItem) => {
    dispatch(
      updateItemAsync({
        itemId: updatedItem.id || updatedItem._id,
        itemData: updatedItem,
      })
    );
  };
  // -----------
  // Editing Logic
  // -----------
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!item) return;
    const updatedItem = {
      ...item,
      budget: parseFloat(editedBudget),
      spent: spentAmount,
      paymentDate,
      frequency,
      customSchedule,
      paymentDayOfWeek: frequency === "weekly" ? paymentDayOfWeek : undefined,
      paymentDayOfMonth:
        frequency === "monthly" && paymentDayOfMonth !== "Last Day of Month"
          ? parseInt(paymentDayOfMonth)
          : undefined,
      isLastDayOfMonth:
        frequency === "monthly" && paymentDayOfMonth === "Last Day of Month",
      paymentDateOfYear: frequency === "yearly" ? paymentDateOfYear : undefined,
    };
    handleUpdateItemRedux(updatedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedBudget(originalBudget);
    setSpentAmount(originalSpentAmount);
  };

  // -----------
  // Input Handlers
  // -----------
  const handleSpentChange = (e) => {
    if (!item) return;
    const value = Math.max(0, Math.min(e.target.value, editedBudget));
    setSpentAmount(value);
    // If you want immediate updates:
    handleUpdateItemRedux({
      ...item,
      budget: parseFloat(editedBudget),
      spent: parseFloat(value),
    });
  };

  const handleBudgetChange = (e) => {
    const value = Math.max(0, parseFloat(e.target.value) || 0);
    setEditedBudget(value);
  };

  const handleRemove = () => {
    if (!item) return;
    handleUpdateItemRedux({ ...item, deleted: true });
  };

  // -----------
  // Renaming
  // -----------
  const handleRenameClick = () => {
    if (!item) return;
    setIsRenamingItem(true);
    setNewItemName(item.name);
  };

  const handleRenameSubmit = () => {
    if (!item) return;

    if (newItemName.trim() && newItemName !== item.name) {
      const updatedItem = {
        ...item,
        name: newItemName.trim(),
        categoryId: item.categoryId, // Ensure category stays the same
      };

      handleUpdateItemRedux(updatedItem);
    }
    setIsRenamingItem(false);
  };

  // -----------
  // Payment Calculation
  // -----------
  const calculateDaysUntilPayment = () => {
    const today = new Date();

    if (frequency === "monthly") {
      let targetDay =
        paymentDayOfMonth === "Last Day of Month"
          ? new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
          : parseInt(paymentDayOfMonth, 10);
      const daysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();

      if (targetDay > daysInMonth) {
        targetDay = daysInMonth;
      }

      let nextPaymentDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        targetDay
      );
      if (nextPaymentDate < today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        const newDaysInMonth = new Date(
          nextPaymentDate.getFullYear(),
          nextPaymentDate.getMonth() + 1,
          0
        ).getDate();
        if (targetDay > newDaysInMonth) {
          nextPaymentDate.setDate(newDaysInMonth);
        }
      }

      const diffTime = Math.abs(nextPaymentDate - today);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (frequency === "weekly") {
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const targetDayIndex = daysOfWeek.indexOf(paymentDayOfWeek);
      const todayIndex = today.getDay();
      let daysUntilNext = targetDayIndex - todayIndex;
      if (daysUntilNext <= 0) {
        daysUntilNext += 7;
      }
      return daysUntilNext;
    }

    if (frequency === "yearly") {
      const nextPaymentDate = new Date(paymentDateOfYear);
      if (nextPaymentDate < today) {
        nextPaymentDate.setFullYear(today.getFullYear() + 1);
      } else {
        nextPaymentDate.setFullYear(today.getFullYear());
      }

      const diffTime = nextPaymentDate - today;
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return daysUntil < 0
        ? 365 + daysUntil
        : daysUntil === 0
        ? 365
        : Math.min(daysUntil, 365);
    }

    return 0;
  };

  const daysUntilPayment = calculateDaysUntilPayment();

  // If no item, show placeholder
  if (!item) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <div className="max-w-sm mx-auto space-y-4">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-500">
            Select a budget item from the list to view its details
          </p>
        </div>
      </div>
    );
  }

  const budget = editedBudget;
  const remaining = budget - spentAmount;
  const percentSpent = (spentAmount / budget) * 100;
  const isOverBudget = spentAmount > budget;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <DetailHeader
        item={item}
        isRenamingItem={isRenamingItem}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        handleRenameSubmit={handleRenameSubmit}
        handleRenameClick={handleRenameClick}
        handleRemove={handleRemove}
      />
      <BudgetInfo
        isEditing={isEditing}
        editedBudget={editedBudget}
        handleBudgetChange={handleBudgetChange}
        spentAmount={spentAmount}
        handleSpentChange={handleSpentChange}
        remaining={remaining}
        isOverBudget={isOverBudget}
      />
      <FrequencyInfo
        frequency={frequency}
        isEditing={isEditing}
        dayOfMonth={paymentDayOfMonth}
        setDayOfMonth={setPaymentDayOfMonth}
        daysUntilPayment={daysUntilPayment}
        setFrequency={setFrequency}
        dayOfWeek={paymentDayOfWeek}
        setDayOfWeek={setPaymentDayOfWeek}
        yearlyDate={paymentDateOfYear}
        setYearlyDate={setPaymentDateOfYear}
      />
      <ProgressInfo
        percentSpent={percentSpent}
        isOverBudget={isOverBudget}
        remaining={remaining}
        budget={budget}
        spentAmount={spentAmount}
      />
      <ActionButtons
        isEditing={isEditing}
        handleSave={handleSave}
        handleCancel={handleCancel}
        handleEditClick={handleEditClick}
      />
    </div>
  );
};

export default BudgetDetailView;
