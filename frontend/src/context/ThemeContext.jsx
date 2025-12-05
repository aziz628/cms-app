import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Initialize theme from local storage or default to 'light' (use try catch to avoid JSON parse errors)
    let savedTheme;
    try {
      savedTheme = JSON.parse(localStorage.getItem('theme')) || 'light';
    } catch {
      savedTheme = 'light';
    }
    // Apply the theme to the document element
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
  });


  const toggleTheme = () => {
    // Toggle between 'light' and 'dark'
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Save to local storage
    localStorage.setItem('theme', JSON.stringify(newTheme));
    
    // Update data-theme attribute on html element
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);