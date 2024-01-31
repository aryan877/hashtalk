import { PatTokenApiResponse } from '@/types/ApiResponse';
import { onError } from 'apollo-link-error';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { toast } from '@/components/ui/use-toast';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      toast({
        title: 'GraphQL error',
        description: message,
        variant: 'destructive',
      })
    );

  if (networkError) {
    toast({
      title: 'Network error',
      description: networkError.message,
      variant: 'destructive',
    });
  }
}) as unknown as ApolloLink;

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT,
});

const getToken = async () => {
  const token = await fetchTokenFromDatabase();
  return token;
};

const authLink = setContext(async (_, { headers }) => {
  const token = await getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? token : '',
    },
  };
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;

// // Function to fetch the token from the database
async function fetchTokenFromDatabase() {
  try {
    const response = await fetch('/api/pat', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data = (await response.json()) as PatTokenApiResponse;
    if (data && data.patToken) {
      return data.patToken;
    }
    console.error('Token not found in response');
    return '';
  } catch (error) {
    console.error('Error fetching token:', error);
    return '';
  }
}
