import { useState, type FC, type ButtonHTMLAttributes } from "react";

interface BrandButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const BrandButton: FC<BrandButtonProps> = ({
  text = "Click Me",
  onClick,
  disabled = false,
  loading = false,
  className,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  // Button should be disabled when loading
  const isDisabled = disabled || loading;

  return (
    <div className="flex items-center justify-center p-4">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`
          relative
          px-5 py-2
          text-sm font-medium text-white
          rounded-md
          transition-all duration-300
          bg-gradient-to-r from-emerald-500 to-[#003019]
          hover:opacity-70
           focus:ring-opacity-50
          shadow-sm
          flex items-center justify-center gap-2
          w-full
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => !isDisabled && setIsHovered(false)}
        {...rest}
      >
        {/* Subtle glow effect */}
        <div
          className={`
            absolute inset-0 
            rounded-md
            blur-md opacity-30
            transition-opacity duration-200
            -z-10
            ${isDisabled ? 'opacity-20' : ''}
          `}
          style={{
            opacity: isHovered && !isDisabled ? 0.5 : 0.3,
            transform: 'scale(1.1)',
          }}
        />
        
        {/* iOS-style spinner when loading */}
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="spinner-container inline-block relative w-4 h-4 mr-2">
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(8)].map((_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: acceptable for this case
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-0 animate-ios-spinner"
                    style={{
                      top: i === 0 || i === 4 ? '50%' : i < 4 ? '25%' : '75%',
                      left: i === 2 || i === 6 ? '50%' : i < 3 || i > 6 ? '25%' : '75%',
                      transform: 'translate(-50%, -50%)',
                      animationDelay: `${i * 0.125}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            <span>{text}</span>
          </div>
        ) : (
          <span>{text}</span>
        )}
        
        {/* Animated arrow - only show when not loading */}
        {!loading && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isHovered && !isDisabled ? 'translate-x-1' : ''}`}
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  );
};

// Add required keyframes for iOS spinner animation
const injectSpinnerStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('ios-spinner-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'ios-spinner-styles';
    styleSheet.textContent = `
      @keyframes ios-spinner {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }
      .animate-ios-spinner {
        animation: ios-spinner 1.2s linear infinite;
      }
    `;
    document.head.appendChild(styleSheet);
  }
};

// Run on component mount in browser environments
if (typeof window !== 'undefined') {
  injectSpinnerStyles();
}

export default BrandButton;