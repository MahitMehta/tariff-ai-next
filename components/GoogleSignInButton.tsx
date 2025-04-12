import { useState, FC, ButtonHTMLAttributes } from "react";

interface GoogleSignUpButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const GoogleSignUpButton: FC<GoogleSignUpButtonProps> = ({
  text = "Sign up with Google",
  onClick,
  disabled = false,
  loading = false,
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
          text-sm font-medium
          rounded-md
          transition-all duration-300
          bg-black
          border border-[rgba(255,255,255,0.2)]
          hover:opacity-50
          focus:outline-none
          shadow-sm
          flex items-center justify-center gap-2
          w-full
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => !isDisabled && setIsHovered(false)}
        {...rest}
      >
        {/* Google logo */}
        <div className="flex items-center mr-2">
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        </div>
        
        {/* iOS-style spinner when loading */}
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="spinner-container inline-block relative w-4 h-4 mr-2">
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(8)].map((_, i) => (
                  <div
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
            <span className="text-white">{text}</span>
          </div>
        ) : (
          <span className="text-white">{text}</span>
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

export default GoogleSignUpButton;