// Function to refresh the access token
const refreshToken = () => {
  const refresh_token =
    'AQAEcKmTQJUVctWqAtYliRf_EixdRQAgN2dGP3T1wvRBnn7N5TtRYTrpEhF-mm-U4CSPnmZ0WToAZyNUoX4URi_3H8mT_XA1JTh4TGBZC25BtlRP8hCQFYsRts2Pym2rSUc';
  const client_id = 'fdf4ebde87024efd9eca75e74263f7e6';
  const client_secret = 'affdc690e60c448d92b054592916b24e';

  const url = 'https://accounts.spotify.com/api/token';
  const data = new URLSearchParams();
  data.append('grant_type', 'refresh_token');
  data.append('refresh_token', refresh_token);
  data.append('client_id', client_id);
  data.append('client_secret', client_secret);

  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }
        return response.json();
      })
      .then((data) => {
        // Handle the refreshed access token
        const access_token = data.access_token;
        console.log('Refreshed Access Token:', access_token);
        resolve(access_token);
      })
      .catch((error) => {
        console.error('Error refreshing token:', error);
        reject(error);
      });
  });
};

refreshToken()
  .then((accessToken) => {
    console.log('Access Token:', accessToken);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

// Call refreshToken initially
export default refreshToken;
