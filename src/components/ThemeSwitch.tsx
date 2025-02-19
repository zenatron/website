import { useContext, useState, useRef, useEffect } from 'react';
import { ThemeContext } from '../ThemeContext';
import { FaSun, FaMoon, FaLaptop } from 'react-icons/fa';

const ThemeSwitch = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const options = [
    { id: 'light', label: 'Light', icon: <FaSun className="text-yellow-500 w-4 h-4" /> },
    { id: 'dark', label: 'Dark', icon: <FaMoon className="text-blue-400 w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <FaLaptop className="text-gray-500 w-4 h-4" /> },
  ];

  if (!theme) return null; // Avoid rendering until theme is initialized

  const handleSelection = (mode: string) => {
    setTheme(mode);
    setMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Icon */}
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="w-10 h-10 flex items-center justify-center bg-secondary-bg dark:bg-gray-700 rounded-full shadow-md transition-colors"
        aria-label="Toggle Theme Menu"
        aria-expanded={menuOpen}
      >
        {theme === 'light' && <FaSun className="text-yellow-500 w-5 h-5" />}
        {theme === 'dark' && <FaMoon className="text-blue-400 w-5 h-5" />}
        {theme === 'system' && <FaLaptop className="text-gray-500 w-5 h-5" />}
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-primary-bg dark:bg-gray-800 shadow-lg rounded-md z-50" ref={menuRef}>
          <ul className="py-2">
            {options.map((option) => (
              <li key={option.id}>
                <button
                  onClick={() => handleSelection(option.id)}
                  className={`flex items-center px-4 py-2 w-full text-left text-primary-text dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    theme === option.id ? 'font-bold' : ''
                  }`}
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitch;