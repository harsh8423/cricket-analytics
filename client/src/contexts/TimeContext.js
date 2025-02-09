import React, { createContext, useState, useEffect } from 'react';
import moment from 'moment';

const TimeContext = createContext();

const TimeProvider = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(moment().format('dddd, MMMM Do YYYY, h:mm:ss a'));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(moment().format('dddd, MMMM Do YYYY, h:mm:ss a'));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const contextValue = {
    currentTime,
  };

  return (
    <TimeContext.Provider value={contextValue}>
      {children}
    </TimeContext.Provider>
  );
};

export { TimeContext, TimeProvider };