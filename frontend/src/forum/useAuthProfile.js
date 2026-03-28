import { useQuery } from '@tanstack/react-query';
import { authClient } from '../api';

export function useAuthProfile() {
  const token = localStorage.getItem('accessToken');
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await authClient.profile();
      return response.data;
    },
    enabled: !!token, // Chỉ gọi API khi có token
  });
}
