import React from "react";

const IconFunc = ({ src, name }) => {
  return (
    <div className="w-[40px] h-[40px] p-[8px] bg-[#3c4043] rounded-full">
      <img src={src} alt={name} />
    </div>
  );
};

export default IconFunc;
