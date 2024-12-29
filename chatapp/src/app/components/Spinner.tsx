import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="bg-white dark:bg-black flex items-center justify-center min-h-screen">
      <div className="border-black-300 h-20 w-20 animate-spin rounded-full border-8 border-t-black" />    </div>
  );
};

export default Spinner;
