import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [budget, setBudget] = useState([]);

  const loadBudget = async () => {
    if (budget.length > 0) {
      return budget;
    }
    const response = await axios.get("http://localhost:3005/budget");
    setBudget(response.data.myBudget);
    return response.data.myBudget;
  };

  const getBudget = () => {
    return budget;
  };

  return (
    <DataContext.Provider value={{ budget, loadBudget, getBudget }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataService = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataService must be used within a DataProvider");
  }
  return context;
};
