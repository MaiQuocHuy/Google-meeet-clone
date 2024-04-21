import { createContext, useContext, useState } from "react";

const JoinContext = createContext();

const JoinProvider = ({ children }) => {
  const [join, setJoin] = useState([]);
  return (
    <JoinContext.Provider value={[join, setJoin]}>
      {children}
    </JoinContext.Provider>
  );
};

const useJoin = () => useContext(JoinContext);

export { useJoin, JoinProvider };
