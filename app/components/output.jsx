import React from "react";

const Output = ({value = ''}) => {
  return (
    <div className="w-1/3 h-64 rounded-lg border-2 border-primary p-5">
      <h1 className="text-2xl font-sans font-bold text-start">Output</h1>
      <div>
        <br />
        &#123;
        <br />
        <div className="flex">
          <p className="text-green-800">"key":</p>
          <p className="text-orange-700">&nbsp;&nbsp;&nbsp;"{value}"</p>
        </div>
        &#125;
      </div>
    </div>
  );
};

export default Output;
