import React, { createContext, useState, useContext } from 'react';

const PickBadgeValueContext = createContext();

export const usePickBadgeValue = () => useContext(PickBadgeValueContext);

export const PickBadgeValueProvider = ({ children }) => {
  const [pickBadgeValue, setPickBadgeValue] = useState(0);

  return (
    <PickBadgeValueContext.Provider value={{ pickBadgeValue, setPickBadgeValue }}>
      {children}
    </PickBadgeValueContext.Provider>
  );
};
