import apiClient from "./apiClient.js";

// Fetch all income items
export const fetchIncome = async () => {
  try {
    const response = await apiClient.get("/income");
    return response.data; // Expect an array of income items
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error(`Failed to fetch income: ${message}`);
    throw new Error(`Failed to fetch income: ${message}`);
  }
};

// Add a new income item
export const addIncome = async (incomeData) => {
  try {
    const response = await apiClient.post("/income", incomeData);
    return response.data; // Expect the newly created income item
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error(`Failed to add income: ${message}`);
    throw new Error(`Failed to add income: ${message}`);
  }
};

// Remove an income item
export const deleteIncome = async (incomeId) => {
  try {
    const response = await apiClient.delete(`/income/${incomeId}`);
    return response.data; // Expect success message or empty response
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error(`Failed to delete income: ${message}`);
    throw new Error(`Failed to delete income: ${message}`);
  }
};
