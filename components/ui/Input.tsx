import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2.5 
          bg-white dark:bg-slate-700/50 
          border border-slate-300 dark:border-slate-600 
          text-slate-900 dark:text-slate-50 
          placeholder-slate-400 dark:placeholder-slate-400
          rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;

