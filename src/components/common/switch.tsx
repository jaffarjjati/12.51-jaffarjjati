"use client";

import { useTheme } from "@/context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const Switch = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex items-center">
      <button
        onClick={toggleTheme}
        className={`flex items-center justify-center rounded-full focus:outline-none w-8 h-8 ${
          isDarkMode ? "bg-gray-800" : "bg-yellow-300"
        }`}
      >
        {isDarkMode ? (
          <MoonIcon className="w-4 h-4 text-white" />
        ) : (
          <SunIcon className="w-4 h-4 text-yellow-500" />
        )}
      </button>
    </div>
  );
};

export default Switch;
