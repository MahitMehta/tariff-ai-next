"use client";

import Link from "next/link";


export default function Home() {
  return (
    // Main container with pure black background
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Enhanced green glow effects - three layers for better visibility */}
      <div
        className="fixed w-full h-full rounded-full bg-green-500 opacity-6 blur-xl"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(100px)",
          animation: "pulseGlow 20s infinite alternate ease-in-out",
        }}
      />

      <div
        className="fixed w-96 h-96 rounded-full bg-green-500 opacity-8 blur-xl"
        style={{
          left: "25%",
          top: "30%",
          filter: "blur(90px)",
          animation: "moveGlow1 60s infinite alternate ease-in-out",
        }}
      />

      <div
        className="fixed w-80 h-80 rounded-full bg-green-400 opacity-8 blur-xl"
        style={{
          right: "25%",
          bottom: "30%",
          filter: "blur(90px)",
          animation: "moveGlow2 75s infinite alternate ease-in-out",
        }}
      />

      {/* Header with PoliStocks and account buttons */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-4 z-10">
        <div className="text-2xl font-bold text-white flex items-center">
          <span className="text-green-400">Poli</span>
          <span>Stocks</span>
        </div>
        <div className="flex space-x-4">
          <Link href="/signup">
            <button
              type="button"
              className="px-4 py-2 font-semibold text-white bg-transparent border border-gray-500 rounded-md hover:bg-grey-900 hover:border-green-400 hover:scale-105 transition-all duration-200"
            >
              Create Account
            </button>
          </Link>
          <Link href="/login">
            <button
              type="button"
              className="px-4 py-2 font-semibold text-white cursor-pointer bg-green-500 rounded-md hover:bg-green-350 hover:scale-105 transition-all duration-200"
            >
              Sign In
            </button>
          </Link>
        </div>
      </header>

      {/* Content container with animations */}
      <div className="w-full max-w-3xl text-center z-10">
        {/* Headline with simple fade-in animation */}
        <h1 style={{ lineHeight: 1.1 }} className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-6 animate-fadeIn">
          <span className="block">Helping Retail Investors</span>
          <span className="block">Stay on Top of </span>
          <span className="block text-green-400">Critical Financial News</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg text-gray-300 animate-fadeIn">
          Real-time insights, analysis, and alerts to make informed investment
          decisions
        </p>

        {/* Button group with hover effects */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 animate-fadeIn">
          <Link href="/signup">
            <button
              type="button"
              className="rounded-md bg-green-500 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-200 group"
            >
              <span className="flex items-center justify-center">
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            </button>
          </Link>
          <Link target="_blank" href="https://devpost.com/software/902063">
            <button
              type="button"
              className="rounded-md bg-transparent border border-green-500 px-6 py-3 text-base font-semibold text-green-400 shadow-lg hover:bg-green-900 hover:bg-opacity-30 hover:scale-105 transition-all duration-200"
            >
              Learn More
            </button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
          <div className="p-6 rounded-lg border border-gray-500 bg-black-900 bg-opacity-70 hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="text-green-400 text-xl mb-2">Real-time Alerts</div>
            <p className="text-gray-300">
              Get instant notifications on market movements and breaking news
            </p>
          </div>
          <div className="p-6 rounded-lg border border-gray-500 bg-black-900 bg-opacity-70 hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="text-green-400 text-xl mb-2">Smart Analysis</div>
            <p className="text-gray-300">
              AI-powered insights to help you make better investment decisions
            </p>
          </div>
          <div className="p-6 rounded-lg border border-gray-500 bg-black-900 bg-opacity-70 hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="text-green-400 text-xl mb-2">
              Portfolio Tracking
            </div>
            <p className="text-gray-300">
              Monitor all your investments in one place with customized
              dashboards
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full p-4 text-center text-gray-400 text-sm">
        <p>© 2025 PoliStocks. All rights reserved.</p>
      </footer>

      {/* Simplified CSS animations */}
      <style jsx global>{`
        @keyframes moveGlow1 {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(100px, 50px);
          }
        }

        @keyframes moveGlow2 {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-100px, -50px);
          }
        }

        @keyframes pulseGlow {
          0% {
            opacity: 0.04;
          }
          50% {
            opacity: 0.08;
          }
          100% {
            opacity: 0.04;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1.5s forwards;
        }
      `}</style>
    </main>
  );
}
