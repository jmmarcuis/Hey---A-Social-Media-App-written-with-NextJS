 // src/components/OTPModal.tsx
"use client"
import { useState } from 'react';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  email: string;
}

export default function OTPModal({ isOpen, onClose, onVerify, email }: OTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value && index < 5) {
      const nextInput = element.parentElement?.querySelector(
        `input[name=otp-${index + 1}]`
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      onVerify(otpString);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
          Verify Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We&apos;ve sent a verification code to {email}
        </p>
        
        <div className="flex gap-2 mb-6 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              name={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              className="w-12 h-12 text-center border-2 rounded-md text-black dark:text-white dark:bg-gray-700"
            />
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-black text-white dark:bg-white dark:text-black py-2 rounded-md"
          >
            Verify
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-black dark:text-white py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}