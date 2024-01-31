// src/contexts/TokenContext.tsx
'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TokenContextType {
  token: string;
  setToken: (token: string) => void;
}

const TokenContext = createContext<TokenContextType>({
  token: '',
  setToken: () => {},
});

export const useToken = () => useContext(TokenContext);

export const TokenProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [token, setToken] = useState<string>('');

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};
