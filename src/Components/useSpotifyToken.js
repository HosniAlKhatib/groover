import { useEffect, useState } from 'react';
import refreshToken from './TokenRefresh';

const useSpotifyToken = () => {
  const [token, setToken] = useState(null);
  const [refresh_token, setRefreshToken] = useState(null);

  useEffect(() => {
    const refresh = () => {
      if (refresh_token === null || refresh_token) {
        refreshToken(refresh_token)
          .then((accessToken) => {
            setToken(accessToken);
            console.log('Access Token refreshed:', accessToken);
          })
          .catch((error) => {
            console.error('Error refreshing token:', error);
          });
      }
    };

    refresh();

    const interval = setInterval(() => {
      refresh();
    }, 3600000);

    return () => clearInterval(interval);
  }, [refresh_token]);

  return { token, setToken, setRefreshToken };
};

export default useSpotifyToken;
