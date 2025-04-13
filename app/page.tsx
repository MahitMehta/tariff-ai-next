"use client";

export default function Home() {
  return (
    // Main container: Full height, flexbox centering, background colors
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black px-4 sm:px-6 lg:px-8">
      
      {/* Header with PolyStocks and account buttons */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-4">
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          PolyStocks
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            className="px-4 py-2 font-semibold text-gray-900 dark:text-black bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-300 hover:scale-105 transition-transform duration-200"
          >
            Create Account
          </button>
          <button
            type="button"
            className="px-4 py-2 font-semibold text-white bg-gray-900 dark:bg-gray-200 dark:text-black rounded-md hover:bg-gray-700 dark:hover:bg-gray-300"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Content container: Max width, centered text */}
      <div className="w-full max-w-3xl text-center">
        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Helping investors stay on top of financial news
        </h1>

        {/* "Learn more" button below the headline */}
        <button
          type="button"
          className="mt-6 rounded-md bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 hover:scale-130 transition-transform duration-200"
        >
          Learn more
        </button>
      </div>
    </main>
  );
}
