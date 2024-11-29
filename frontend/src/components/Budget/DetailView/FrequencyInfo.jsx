import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FrequencyInfo = ({ frequency, isEditing, dayOfMonth, setDayOfMonth, daysUntilPayment, setFrequency, dayOfWeek, setDayOfWeek, yearlyDate, setYearlyDate }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">Frequency</p>
      {isEditing ? (
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full text-xl font-semibold bg-white border border-gray-300 rounded px-2 py-1"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom</option>
        </select>
      ) : (
        <p className="text-xl font-semibold">{frequency}</p>
      )}
    </div>
    {frequency === 'yearly' && (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-sm text-gray-500 mb-1">By</p>
    {isEditing ? (
      <DatePicker
        selected={yearlyDate}
        onChange={(date) => setYearlyDate(date)}
        dateFormat="MMMM d"
        className="w-full text-xl font-semibold bg-white border border-gray-300 rounded px-2 py-1"
        renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
          <div className="flex justify-between">
            <button onClick={decreaseMonth}>&lt;</button>
            <span>{date.toLocaleString('default', { month: 'long' })} {date.getDate()}</span>
            <button onClick={increaseMonth}>&gt;</button>
          </div>
        )}
      />
    ) : (
      <p className="text-xl font-semibold">{yearlyDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
    )}
  </div>
)}
    
    {frequency === 'weekly' && (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">Day of the Week</p>
        {isEditing ? (
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full text-xl font-semibold bg-white border border-gray-300 rounded px-2 py-1"
          >
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        ) : (
          <p className="text-xl font-semibold">{dayOfWeek}</p>
        )}
      </div>
    )}
    {frequency === 'monthly' && (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">By</p>
        {isEditing ? (
          <select
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="w-full text-xl font-semibold bg-white border border-gray-300 rounded px-2 py-1"
          >
            <option value="Last Day of Month">Last Day of Month</option>
            {[...Array(31).keys()].map(day => (
              <option key={day} value={day + 1}>{day + 1}{['st', 'nd', 'rd'][((day + 1) % 10) - 1] || 'th'}</option>
            ))}
          </select>
        ) : (
          <p className="text-xl font-semibold">{dayOfMonth}</p>
        )}
      </div>
    )}
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">Days Until Payment</p>
      <p className="text-xl font-semibold">{daysUntilPayment} days</p>
    </div>
  </div>
);

export default FrequencyInfo;