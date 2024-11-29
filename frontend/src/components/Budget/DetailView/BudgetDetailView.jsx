import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import DetailHeader from './DetailHeader';
import BudgetInfo from './BudgetInfo';
import FrequencyInfo from './FrequencyInfo';
import ProgressInfo from './ProgressInfo';
import ActionButtons from './ActionButtons';
import { useItemContext } from '../Categories/Items/ItemContext';
import { useCategoryContext } from '../Categories/CategoryContext';

const BudgetDetailView = ({ item }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudget, setEditedBudget] = useState(item ? item.budget : 0);
  const [spentAmount, setSpentAmount] = useState(item ? item.spent : 0);
  const [originalSpentAmount, setOriginalSpentAmount] = useState(item ? item.spent : 0);
  const [originalBudget, setOriginalBudget] = useState(item ? item.budget : 0);
  const [isRenamingItem, setIsRenamingItem] = useState(false);
  const [newItemName, setNewItemName] = useState(item ? item.name : '');
  const [paymentDate, setPaymentDate] = useState(item ? item.paymentDate : '');
  const [frequency, setFrequency] = useState(item ? item.frequency : 'monthly');
  const [customSchedule, setCustomSchedule] = useState(item ? item.customSchedule : '');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [dayOfMonth, setDayOfMonth] = useState('Last Day of Month');
  const [dayOfYear, setDayOfYear] = useState(new Date());

  const { handleUpdateItem } = useItemContext();
  const { categories } = useCategoryContext();

  useEffect(() => {
    if (item) {
      const currentCategory = categories.find(cat => cat.id === item.categoryId);
      const currentItem = currentCategory?.items.find(i => i.id === item.id);
      
      if (currentItem) {
        setEditedBudget(currentItem.budget);
        setSpentAmount(currentItem.spent);
        setOriginalSpentAmount(currentItem.spent);
        setOriginalBudget(currentItem.budget);
        setNewItemName(currentItem.name);
        setPaymentDate(currentItem.paymentDate);
        setFrequency(currentItem.frequency);
        setCustomSchedule(currentItem.customSchedule);
      }
    }
  }, [item, categories]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedItem = {
      ...item,
      budget: parseFloat(editedBudget),
      spent: spentAmount,
      paymentDate,
      frequency,
      customSchedule,
      dayOfWeek,
      dayOfMonth,
      dayOfYear,
    };
    handleUpdateItem(updatedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedBudget(originalBudget);
    setSpentAmount(originalSpentAmount);
  };

  const handleSpentChange = (e) => {
    const value = Math.max(0, Math.min(e.target.value, editedBudget));
    setSpentAmount(value);
    handleUpdateItem({ ...item, budget: parseFloat(editedBudget), spent: parseFloat(value) });
  };

  const handleBudgetChange = (e) => {
    const value = Math.max(0, parseFloat(e.target.value));
    setEditedBudget(value);
  };

  const handleRemove = () => {
    handleUpdateItem({ ...item, deleted: true });
  };

  const handleRenameClick = () => {
    setIsRenamingItem(true);
    setNewItemName(item.name);
  };

  const handleRenameSubmit = () => {
    if (newItemName.trim() && newItemName !== item.name) {
      handleUpdateItem({ ...item, name: newItemName.trim() });
    }
    setIsRenamingItem(false);
  };

  const calculateDaysUntilPayment = () => {
    const today = new Date();
  
    if (frequency === 'monthly') {
      let targetDay = dayOfMonth === 'Last Day of Month' ? new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() : parseInt(dayOfMonth);
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
      if (targetDay > daysInMonth) {
        targetDay = daysInMonth;
      }
  
      let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), targetDay);
      if (nextPaymentDate < today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        const newDaysInMonth = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 0).getDate();
        if (targetDay > newDaysInMonth) {
          nextPaymentDate.setDate(newDaysInMonth);
        }
      }
  
      const diffTime = Math.abs(nextPaymentDate - today);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  
    if (frequency === 'weekly') {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
      const todayIndex = today.getDay();
      let daysUntilNext = targetDayIndex - todayIndex;
      if (daysUntilNext <= 0) {
        daysUntilNext += 7;
      }
      return daysUntilNext;
    }
  
    if (frequency === 'yearly') {
      const nextPaymentDate = new Date(dayOfYear);
      if (nextPaymentDate < today) {
        nextPaymentDate.setFullYear(today.getFullYear() + 1);
      } else {
        nextPaymentDate.setFullYear(today.getFullYear());
      }
      
      const diffTime = nextPaymentDate - today;
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return daysUntil < 0 ? 365 + daysUntil : daysUntil === 0 ? 365 : Math.min(daysUntil, 365);
    }
  
    return 0;
  };

  const daysUntilPayment = calculateDaysUntilPayment();

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
  dayOfMonth={dayOfMonth}
  setDayOfMonth={setDayOfMonth}
  daysUntilPayment={daysUntilPayment}
  setFrequency={setFrequency}
  dayOfWeek={dayOfWeek}
  setDayOfWeek={setDayOfWeek}
  yearlyDate={dayOfYear}
  setYearlyDate={setDayOfYear}
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