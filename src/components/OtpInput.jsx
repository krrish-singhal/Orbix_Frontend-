import React, { useRef, useState } from "react";

const OtpInput = ({ length = 6, onComplete, error }) => {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputs = useRef([]);

  const handleChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newValues = [...values];
    newValues[idx] = val;
    setValues(newValues);
    if (val && idx < length - 1) {
      inputs.current[idx + 1].focus();
    }
    if (newValues.every(v => v.length === 1)) {
      onComplete(newValues.join(""));
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (values[idx]) {
        const newValues = [...values];
        newValues[idx] = "";
        setValues(newValues);
      } else if (idx > 0) {
        inputs.current[idx - 1].focus();
        const newValues = [...values];
        newValues[idx - 1] = "";
        setValues(newValues);
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center items-center mt-2 mb-2">
      {values.map((v, idx) => (
        <input
          key={idx}
          ref={el => (inputs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => handleChange(idx, e.target.value)}
          onKeyDown={e => handleKeyDown(idx, e)}
          className={`w-10 h-12 text-2xl text-center rounded-lg border-2 focus:outline-none focus:ring-2 transition-colors duration-200 ${error ? "border-red-500" : "border-blue-400"} bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
