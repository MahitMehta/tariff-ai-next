"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Create a slow-moving animation for the glow effect
    let startTime;
    let animationFrameId;

    const animateGlow = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const glowElement = document.getElementById("glow-effect");
      if (glowElement) {
        // Create slow, smooth movement using sine/cosine for a circular path
        // Complete one cycle every 60 seconds
        const cycle = elapsed / 60000;
        const x = 50 + 30 * Math.sin(cycle * 2 * Math.PI);
        const y = 50 + 30 * Math.cos(cycle * 2 * Math.PI);

        glowElement.style.left = `${x}%`;
        glowElement.style.top = `${y}%`;
      }

      animationFrameId = requestAnimationFrame(animateGlow);
    };

    animationFrameId = requestAnimationFrame(animateGlow);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Only show animations after component is mounted to prevent hydration issues
  const animationClass = mounted ? "animate-fadeIn" : "opacity-0";

  return (
    // Main container with relative positioning for the glow effect
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Animated glow effect */}
      <div
        id="glow-effect"
        className="absolute w-1/2 h-1/2 rounded-full bg-green-500 opacity-3 blur-3xl"
        style={{
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          transition: "left 15s ease-in-out, top 15s ease-in-out",
          filter: "blur(150px)",
        }}
      />

      {/* Second glow effect for additional depth */}
      <div
        className="absolute w-1/3 h-1/3 rounded-full bg-green-400 opacity-4 blur-3xl"
        style={{
          left: "30%",
          top: "60%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          animation: "floatAnimation 120s infinite alternate ease-in-out",
          filter: "blur(180px)",
        }}
      />

      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      {/* Header with PolyStocks and account buttons */}
      <header
        className={`absolute top-0 left-0 w-full flex justify-between items-center p-4 z-10 ${animationClass}`}
      >
        <div className="text-2xl font-bold text-white flex items-center space-x-2">
          <span className="text-green-400">Poly</span>
          <span>Stocks</span>
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            className="px-4 py-2 font-semibold text-white bg-transparent border border-gray-500 backdrop-blur-sm rounded-md hover:bg-gray-800 hover:border-green-400 hover:scale-105 transition-all duration-200"
          >
            Create Account
          </button>
          <button
            type="button"
            className="px-4 py-2 font-semibold text-black bg-green-400 rounded-md hover:bg-green-300 hover:scale-105 transition-all duration-200"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Content container with animations */}
      <div
        className={`w-full max-w-3xl text-center z-10 ${animationClass} transition-all duration-700 ease-in-out`}
      >
        {/* Headline with staggered text animation */}
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-6">
          <span className="block animate-slideUp">Helping retail investors</span>
          <span className="block animate-slideUp animation-delay-300">
            stay on top of
          </span>
          <span className="block animate-slideUp animation-delay-600 text-green-400">
            financial news
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg text-gray-300 animate-fadeIn animation-delay-900">
          Real-time insights, analysis, and alerts to make informed investment
          decisions
        </p>

        {/* Button group with hover effects */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 animate-fadeIn animation-delay-1200">
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
          <button
            type="button"
            className="rounded-md bg-transparent border border-green-500 px-6 py-3 text-base font-semibold text-green-400 shadow-lg hover:bg-green-900 hover:bg-opacity-30 hover:scale-105 transition-all duration-200"
          >
            Learn More
          </button>
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn animation-delay-1500">
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900 bg-opacity-70 backdrop-blur-sm hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="text-green-400 text-xl mb-2">Real-time Alerts</div>
            <p className="text-gray-300">
              Get instant notifications on market movements and breaking news
            </p>
          </div>
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900 bg-opacity-70 backdrop-blur-sm hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
            <div className="text-green-400 text-xl mb-2">Smart Analysis</div>
            <p className="text-gray-300">
              AI-powered insights to help you make better investment decisions
            </p>
          </div>
          <div className="p-6 rounded-lg border border-gray-800 bg-gray-900 bg-opacity-70 backdrop-blur-sm hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
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
      <footer className="absolute bottom-0 w-full p-4 text-center text-gray-400 text-sm animate-fadeIn animation-delay-2000">
        <p>© 2025 PolyStocks. All rights reserved.</p>
      </footer>

      {/* Add CSS for custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes floatAnimation {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }
          25% {
            transform: translate(-40%, -55%) scale(1.1);
          }
          50% {
            transform: translate(-50%, -60%) scale(1);
          }
          75% {
            transform: translate(-60%, -55%) scale(0.9);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s forwards;
        }

        .animate-slideUp {
          opacity: 0;
          animation: slideUp 0.8s forwards;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-900 {
          animation-delay: 900ms;
        }

        .animation-delay-1200 {
          animation-delay: 1200ms;
        }

        .animation-delay-1500 {
          animation-delay: 1500ms;
        }

        .animation-delay-2000 {
          animation-delay: 2000ms;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }
      `}</style>
    </main>
  );
}
