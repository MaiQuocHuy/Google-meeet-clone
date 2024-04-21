import React from "react";

const IconBox = ({
  src,
  name,
  index,
  activeComponent,
  changeComponent,
  toggleBox,
  displayBox,
}) => {
  const handleClick = (e, index) => {
    e.preventDefault();
    if (index == activeComponent) {
      toggleBox(!displayBox);
    } else {
      if (toggleBox) toggleBox(true);
      changeComponent(index);
    }
  };
  return (
    <div
      className="h-[40px] w-[40px] rounded-full bg-[#3c4043] p-[10px]"
      onClick={(e) => handleClick(e, index)}
    >
      <img src={src} alt={name} />
    </div>
  );
};

export default IconBox;
