// import { useEffect } from 'react';

// const MySpotifyComponent = ({ token }) => {
//   console.log('MySpotifyComponent');
//   useEffect(() => {
//     const fetchCurrentTrack = async () => {
//       if (!token) {
//         console.error('Token is undefined!');
//         return;
//       }

//       try {
//         const response = await fetch(
//           'https://api.spotify.com/v1/me/player/currently-playing',
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (response.status === 401) {
//           console.error('401 Unauthorized: Invalid or expired token.');
//           // Optionally trigger a new authorization flow here to get a fresh token
//           return;
//         } else if (response.status === 204) {
//           console.log('204 No Content: No track is currently playing.');
//           return;
//         }

//         if (!response.ok) {
//           throw new Error(
//             `Error fetching currently playing track: ${response.status}`
//           );
//         }

//         const trackData = await response.json();
//         console.log('Currently Playing Track:', trackData.is_playing());
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     };

//     fetchCurrentTrack();
//   }, []);
// };

// export default MySpotifyComponent;
