import { createContext } from "react";

interface DashboardContextType {
  dashboardValue: string;
}

export const DashboardContext = createContext<DashboardContextType>({
  dashboardValue: "",
});
