'use client';

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { useToken } from './TokenContext';

interface ApolloProviderWrapperProps {
  children: React.ReactNode;
}

const ApolloProviderWrapper: React.FC<ApolloProviderWrapperProps> = ({
  children,
}) => {
  const { token } = useToken();
  const [client, setClient] = useState<ApolloClient<any>>(
    createApolloClient(token)
  );

  useEffect(() => {
    // Update the Apollo Client instance when the token changes
    setClient(createApolloClient(token));
  }, [token]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

function createApolloClient(token: string): ApolloClient<any> {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT,
  });

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }));

  return new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}

export default ApolloProviderWrapper;
