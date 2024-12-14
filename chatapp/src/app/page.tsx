"use client";
import Link from "next/link";
import ThemeToggle from "./components/icons/ThemeToggle";
import { Icon } from '@iconify/react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="h-screen flex items-center justify-center flex-col gap-y-3 bg-white dark:bg-black">
        <h2 className="text-2xl text-black dark:text-white">
          Hello, this is a chat app made by{" "}
          <a
            href="https://github.com/jmmarcuis"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-black dark:text-white"
          >
            jeiiimarcs
          </a>
        </h2>
        <Icon icon="ph:arrow-circle-down" className="w-6 h-6 my-2 text-black dark:text-white animate-bounce" />
        <Link href="/login"><button className="border-2 border-black dark:border-white p-2.5 px-5 rounded-lg transition duration-300 ease-in-out hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white">
          Let&apos;s Start
        </button></Link>
        <ThemeToggle />
      </div>
    </div>
  );
}