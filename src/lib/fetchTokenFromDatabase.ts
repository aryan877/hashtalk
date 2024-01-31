import { PatTokenApiResponse } from '@/types/ApiResponse';

// // Function to fetch the token from the database
export async function fetchTokenFromDatabase() {
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
