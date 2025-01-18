import React, { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div
      onClick={toggleTheme}
      className="relative w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer p-1 transition-colors duration-300"
    >
      <div
        className={`w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {theme === 'light' && (
          <FaSun className="text-yellow-500 w-4 h-4 transition-opacity duration-300" />
        )}
        {theme === 'dark' && (
          <FaMoon className="text-blue-400 w-4 h-4 transition-opacity duration-300" />
        )}
      </div>
    </div>
  );
};

export default ThemeSwitch;