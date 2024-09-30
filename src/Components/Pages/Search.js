import React, { useEffect, useState } from 'react';
import Style from '../../style/search.module.css';
// import Switch from 'react-switch'; previously used the switcher to toggle between artist and track search.
// import Col from 'react-bootstrap/Col';
// import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
// Import ArtistCard from '../SearchCards/ArtistCard'; previously required to be used, I will keep it as a reference. Not needed since I developed Grinder.
import TrackCard from '../SearchCards/TrackCard';
import useSpotifyToken from '../useSpotifyToken';
import firebase from 'firebase/app';

const Search = () => {
  const [query, setQuery] = useState('');
  const [flag, setFlag] = useState(false);
  const [trackData, setTrackData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bannedArtists, setBannedArtists] = useState([]);
  const [favoriteArtists, setFavoriteArtists] = useState([]);
  const { token } = useSpotifyToken();

  useEffect(() => {
    const fetchBannedArtists = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        const bannedArtistsRef = firebase
          .database()
          .ref(`users/${user.uid}/banned`);
        bannedArtistsRef.on('value', (snapshot) => {
          const bannedList = snapshot.val() ? Object.keys(snapshot.val()) : [];
          setBannedArtists(bannedList);
        });
      }
    };

    const fetchFavoriteArtists = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        const favoritesRef = firebase
          .database()
          .ref(`users/${user.uid}/favorites`);
        favoritesRef.on('value', (snapshot) => {
          const favoritesList = snapshot.val()
            ? Object.values(snapshot.val())
            : [];
          setFavoriteArtists(favoritesList);
        });
      }
    };

    fetchBannedArtists();
    fetchFavoriteArtists();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getDataTrack();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (flag) {
      fetchData();
    }
  }, [flag]);

  const getDataTrack = async () => {
    const queryParam = encodeURIComponent(query);
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${queryParam}&type=track&access_token=${token}`
    );
    const data = await res.json();

    if (data.tracks && data.tracks.items) {
      const filteredTracks = data.tracks.items.filter(
        (track) => !bannedArtists.includes(track.artists[0].id)
      );

      const favoriteTracksData = filteredTracks.filter((track) =>
        favoriteArtists.some((fav) => fav.name === track.artists[0].name)
      );
      const otherTracksData = filteredTracks.filter(
        (track) =>
          !favoriteArtists.some((fav) => fav.name === track.artists[0].name)
      );

      otherTracksData.sort((a, b) => b.popularity - a.popularity);

      const topTracks = [...favoriteTracksData, ...otherTracksData].slice(
        0,
        10
      );
      setTrackData(topTracks);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFlag(!flag);
  };

  const handleValueChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <Container>
      <div className={Style.search__div}>
        <h1 className={Style.search__title}>Search</h1>
        <form onSubmit={handleSubmit} className={Style.search__form}>
          <input
            placeholder={'Search for Tracks'}
            className={Style.search__btn}
            value={query}
            onChange={handleValueChange}
            id='search_bar'
          />
        </form>

        {loading ? (
          <div className={Style.loadingContainer}>
            <div className={Style.spinner}></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div className={Style.results}>
            {trackData &&
              trackData.map((track, index) => (
                <div key={index}>
                  <TrackCard track={track} />
                </div>
              ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default Search;
