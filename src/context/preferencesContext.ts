import React from 'react';

type PreferencesContextType = {
  themeName: "light" | "dark";
  toggleTheme: () => void;
};

export const PreferencesContext = React.createContext<PreferencesContextType>({
  themeName: "light",
  toggleTheme: () => {},
  
});
