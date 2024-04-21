import { createContext, useContext, useState } from "react";

const OwnerContext = createContext();

const OwnerProvider = ({ children }) => {
  const [owner, setOwner] = useState({
    idOwner: "",
    isOwner: false,
  });
  return (
    <OwnerContext.Provider value={[owner, setOwner]}>
      {children}
    </OwnerContext.Provider>
  );
};

const useOwner = () => useContext(OwnerContext);

export { useOwner, OwnerProvider };
