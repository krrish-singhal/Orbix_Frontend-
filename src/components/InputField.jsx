import React from 'react';

const InputField = ({
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  disabled = false,
  icon = null,
  error = null,
  label = null,
  name = null,
  ...props
}) => {
  const baseInputClasses = `
    w-full px-4 py-3 rounded-lg border transition-all duration-200 
    bg-white dark:bg-gray-700 
    text-gray-900 dark:text-white 
    placeholder-gray-500 dark:placeholder-gray-400
    border-gray-300 dark:border-gray-600 
    focus:border-blue-500 dark:focus:border-blue-400 
    focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 
    focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20' : ''}
    ${icon ? 'pl-12' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          name={name}
          className={baseInputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;