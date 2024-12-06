"use client";
import { Icon } from "@iconify/react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 border-2 border-black dark:border-white p-2.5 rounded-full transition duration-300 ease-in-out hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white"
      aria-label="Toggle theme"
    >
      <Icon
        icon={isDark ? "ph:moon-bold" : "ph:sun-bold"}
        className="w-5 h-5"
      />
    </button>
  );
}
