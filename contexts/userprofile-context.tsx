import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserProfileContextType {
  version: number;
  bumpVersion: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [version, setVersion] = useState(1);

  const bumpVersion = () => {
    setVersion(prev => prev + 1);
  };

  return (
    <UserProfileContext.Provider value={{ version, bumpVersion }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

