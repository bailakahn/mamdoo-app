import React from 'react';
import {
    Provider as PaperProvider,
    DefaultTheme as PaperDefaultTheme,
    DarkTheme as PaperDarkTheme,
} from "react-native-paper";
import NavigationRoot from "_navigations";
import { PreferencesContext } from './context/preferencesContext';
import { useStore } from "_store";
import { Colors } from "_styles";
export const MainNavigationTheming = () => {

  const { 
    theme: {isThemeDark },  
    actions : {setTheme}
  }=  useStore();
  
  let themeName = isThemeDark? "dark" : "light";
  
     

    const themeFinal =  themeName === 'light'
    ? {
        ...PaperDefaultTheme,
        roundness: 2,
        colors: Colors.colors[themeName],
      }
    : {
        ...PaperDarkTheme,
        roundness: 2,
        colors: Colors.colors[themeName],
      }; 
  function toggleTheme() {
    setTheme(!isThemeDark);
  }
  
  const preferences = React.useMemo(
    () => ({
      toggleTheme,
      themeName
    }),
    [themeName]
  );

  return (
    <PreferencesContext.Provider value={preferences}>
      <PaperProvider
        theme={themeFinal}
      >
        <NavigationRoot theme = {themeFinal}/>
      </PaperProvider>
    </PreferencesContext.Provider>
  );
};
