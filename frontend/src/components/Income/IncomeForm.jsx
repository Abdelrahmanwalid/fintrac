import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import IncomeDashboard from "./IncomeDashboard";
import {
  addIncomeAsync,
  fetchIncomeAsync,
  removeIncomeAsync,
} from "../../store/incomeSlice";

const IncomeForm = () => {
  const dispatch = useDispatch();
  const incomeItems = useSelector((state) => state.income.incomeItems);
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [recurringDate, setRecurringDate] = useState("");
  const [lastPaymentDate, setLastPaymentDate] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isStudentLoan, setIsStudentLoan] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchIncomeAsync());
  }, [dispatch]);

  const validate = () => {
    const newErrors = {};
    if (!source) newErrors.source = "Source of income is required.";
    if (!amount || isNaN(amount) || amount <= 0)
      newErrors.amount = "Please enter a valid positive amount.";
    if (isStudentLoan && !recurringDate)
      newErrors.recurringDate = "Please select a term start month.";
    if (isRecurring && !isStudentLoan && !recurringDate)
      newErrors.recurringDate = "Please select a recurrence interval.";
    if (isRecurring && !isStudentLoan && !lastPaymentDate)
      newErrors.lastPaymentDate = "Please provide the last payment date.";
    if (!isRecurring && !isStudentLoan && !customDate)
      newErrors.customDate = "Please provide the date of payment.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const incomeData = {
      source,
      amount: parseFloat(amount),
      recurring: isStudentLoan
        ? "termly"
        : isRecurring
        ? recurringDate
        : "one-off",
      lastPaymentDate: isRecurring && !isStudentLoan ? lastPaymentDate : null,
      customDate: !isRecurring && !isStudentLoan ? customDate : null,
    };

    dispatch(addIncomeAsync(incomeData));

    setSource("");
    setAmount("");
    setRecurringDate("");
    setLastPaymentDate("");
    setCustomDate("");
    setIsStudentLoan(false);
    setIsRecurring(false);
    setErrors({});
  };

  const removeIncomeItem = (index) => {
    const incomeId = incomeItems[index]._id;
    dispatch(removeIncomeAsync(incomeId));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Form Section */}
      <div className="w-full lg:w-1/2">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
            Add Income
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700">
                Source of Income
              </label>
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setIsStudentLoan(e.target.value === "student-finance");
                  setIsRecurring(
                    e.target.value !== "student-finance" &&
                      e.target.value !== ""
                  );
                  setErrors((prev) => ({ ...prev, source: "" }));
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Select Source</option>
                <option value="student-finance">
                  Student Finance (Loan or Grant)
                </option>
                <option value="part-time-job">Part-Time Job</option>
                <option value="scholarship">Scholarship</option>
                <option value="allowance">Allowance</option>
                <option value="freelancing">Freelancing</option>
                <option value="other">Other</option>
              </select>
              {errors.source && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.source}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700">
                Amount (£)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: "" }));
                }}
                placeholder="e.g., 3000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                min="0"
                step="0.01"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.amount}
                </p>
              )}
            </div>

            {isStudentLoan && (
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700">
                  Select Term Start Month
                </label>
                <select
                  value={recurringDate}
                  onChange={(e) => {
                    setRecurringDate(e.target.value);
                    setErrors((prev) => ({ ...prev, recurringDate: "" }));
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Start Month</option>
                  <option value="september">
                    September (Payments: Sep, Jan, Apr)
                  </option>
                  <option value="october">
                    October (Payments: Oct, Jan, Apr)
                  </option>
                  <option value="january">
                    January (Payments: Jan, Apr, Sep)
                  </option>
                  <option value="april">April (Payments: Apr, Sep, Jan)</option>
                </select>
                {errors.recurringDate && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.recurringDate}
                  </p>
                )}
              </div>
            )}

            {!isStudentLoan && (
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700">
                  Is this a recurring payment?
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-1">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recurring"
                      checked={isRecurring}
                      onChange={() => setIsRecurring(true)}
                      className="mr-2"
                    />
                    Recurring
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recurring"
                      checked={!isRecurring}
                      onChange={() => setIsRecurring(false)}
                      className="mr-2"
                    />
                    One-Off
                  </label>
                </div>
              </div>
            )}

            {isRecurring && !isStudentLoan && (
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700">
                  How often do you receive this income?
                </label>
                <select
                  value={recurringDate}
                  onChange={(e) => {
                    setRecurringDate(e.target.value);
                    setErrors((prev) => ({ ...prev, recurringDate: "" }));
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Recurrence</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="semester">Per Semester</option>
                  <option value="yearly">Yearly</option>
                </select>
                {errors.recurringDate && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.recurringDate}
                  </p>
                )}
              </div>
            )}

            {isRecurring && !isStudentLoan && (
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700">
                  When was your last payment?
                </label>
                <input
                  type="date"
                  value={lastPaymentDate}
                  onChange={(e) => {
                    setLastPaymentDate(e.target.value);
                    setErrors((prev) => ({ ...prev, lastPaymentDate: "" }));
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                {errors.lastPaymentDate && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.lastPaymentDate}
                  </p>
                )}
              </div>
            )}

            {!isStudentLoan && !isRecurring && (
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700">
                  Date of Payment (One-Off)
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setErrors((prev) => ({ ...prev, customDate: "" }));
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                {errors.customDate && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.customDate}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Add Income
            </button>
          </form>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="w-full lg:w-1/2">
        <IncomeDashboard
          incomeItems={incomeItems}
          removeIncomeItem={removeIncomeItem}
        />
      </div>
    </div>
  );
};

export default IncomeForm;
