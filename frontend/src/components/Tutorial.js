import React, { useState, useEffect } from 'react';

const Tutorial = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Budgeting!",
      content: "This is the budgeting tool. Here you can manage and track your expenses.",
      target: "#budget-overview",
    },
    {
      title: "Add Income",
      content: "Click here to add your income sources, so you can track your budget accurately.",
      target: "#add-income",
    },
    {
      title: "Add Expenses",
      content: "Click here to add and categorize your expenses to keep track of your spending.",
      target: "#add-expense",
    },
    {
      title: "View Reports",
      content: "In this section, you can see your spending and saving trends over time.",
      target: "#reports",
    },
  ];

  const nextStep = () => setStep((prev) => (prev < steps.length - 1 ? prev + 1 : onClose()));

  useEffect(() => {
    const tutorialSeen = localStorage.getItem("tutorialSeen");
    if (tutorialSeen) {
      onClose(); // Skip if the user has already completed the tutorial
    } else {
      localStorage.setItem("tutorialSeen", true); // Mark tutorial as seen
    }
  }, [onClose]);

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-popup" style={{ top: '50%', left: '50%' }}>
        <h3>{steps[step].title}</h3>
        <p>{steps[step].content}</p>
        <button onClick={nextStep}>{step === steps.length - 1 ? "Finish" : "Next"}</button>
        <button onClick={onClose}>Skip Tutorial</button>
      </div>
    </div>
  );
};

export default Tutorial;