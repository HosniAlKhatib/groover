// // HandleRedirect.js
// import { useEffect } from 'react';
// import useSpotifyToken from './useSpotifyToken'; // Import your hook

// const HandleRedirect = () => {
//   const { setRefreshToken } = useSpotifyToken(); // Get setRefreshToken function

//   useEffect(() => {
//     // Function to fetch the access token using the authorization code
//     const fetchAccessToken = async () => {
//       const queryParams = new URLSearchParams(window.location.search);
//       const code = queryParams.get('code');
//       const client_id = 'fdf4ebde87024efd9eca75e74263f7e6';
//       const client_secret = 'affdc690e60c448d92b054592916b24e';
//       if (code) {
//         try {
//           const response = await fetch(
//             'https://accounts.spotify.com/api/token',
//             {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//               },
//               body: new URLSearchParams({
//                 grant_type: 'refresh_token',
//                 code: code,
//                 redirect_uri: 'http://localhost:3000/callback', // Your redirect URI must match exactly
//                 client_id: client_id, // Your client ID
//                 client_secret: client_secret, // Your client secret
//               }),
//             }
//           );

//           if (!response.ok) {
//             throw new Error('Failed to fetch access token');
//           }

//           const data = await response.json();
//           const { access_token, refresh_token } = data;

//           console.log('Access Token:', access_token); // Log the access token for debugging
//           console.log('Refresh Token:', refresh_token); // Log the refresh token for debugging

//           setRefreshToken(refresh_token); // Update the refresh token in your hook
//         } catch (error) {
//           console.error('Error fetching access token:', error);
//         }
//       } else {
//         console.error('Authorization code not found in URL');
//       }
//     };

//     fetchAccessToken(); // Call the function to fetch the token
//   }, [setRefreshToken]);
// };

// export default HandleRedirect;
