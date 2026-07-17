import React, { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon,
  className = '', 
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl border bg-white dark:bg-slate-900/50 px-4 py-2.5 text-sm
            transition-all duration-200 outline-none
            ${Icon ? 'pl-10' : ''}
            ${error 
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500/50 dark:text-rose-100' 
              : 'border-slate-200 text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:text-white dark:focus:border-brand-500'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-rose-500 ml-1 flex items-center gap-1">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
