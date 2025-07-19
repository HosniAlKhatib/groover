import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Style from '../../style/home.module.css';
import useSpotifyToken from '../useSpotifyToken';
import { useTheme } from 'styled-components';

const Home = () => {
  const [type, setType] = useState('');
  const [final, setFinal] = useState([]);
  const [genres, setGenres] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomGenreInput, setShowCustomGenreInput] = useState(false);
  const [userGenre, setUserGenre] = useState('');
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [error, setError] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const { token } = useSpotifyToken();
  const theme = useTheme();

  useEffect(() => {
    if (token) {
      fetchGenres();
    }
  }, [token]);

  const fetchGenres = async () => {
    setLoadingGenres(true);
    setError(null);
    try {
      const response = await fetch(
        'https://api.spotify.com/v1/browse/categories?limit=50',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.categories || !Array.isArray(data.categories.items)) {
        throw new Error('Invalid categories data received');
      }

      const genreList = data.categories.items.map((category) => category.name);
      setGenres(genreList);

      if (genreList.length > 0) {
        const randomGenre =
          genreList[Math.floor(Math.random() * genreList.length)];
        setType(randomGenre);
        await fetchArtists(randomGenre);
      }
    } catch (err) {
      console.error('Genre fetch error:', err);
      setError(`Failed to load genres: ${err.message}`);
    } finally {
      setLoadingGenres(false);
    }
  };

  const fetchArtists = async (selectedCategory) => {
    if (!selectedCategory) return;

    setLoadingArtists(true);
    setError(null);
    try {
      // First get category ID
      const categoryResponse = await fetch(
        `https://api.spotify.com/v1/browse/categories?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const categoryData = await categoryResponse.json();
      const category = categoryData.categories.items.find(
        (c) => c.name === selectedCategory
      );

      if (!category) {
        throw new Error('Category not found');
      }

      // Then get playlists for that category
      const playlistsResponse = await fetch(
        `https://api.spotify.com/v1/browse/categories/${category.id}/playlists?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const playlistsData = await playlistsResponse.json();

      // Then get tracks from the first playlist
      if (playlistsData.playlists.items.length > 0) {
        const tracksResponse = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistsData.playlists.items[0].id}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const tracksData = await tracksResponse.json();

        // Extract artists
        const artists = tracksData.items
          .map((item) => item.track.artists[0])
          .filter(
            (artist, index, self) =>
              index === self.findIndex((a) => a.id === artist.id)
          );

        setFinal(artists.slice(0, 7));
      } else {
        setFinal([]);
      }
    } catch (err) {
      console.error('Artist fetch error:', err);
      setError(`Failed to load artists: ${err.message}`);
      setFinal([]);
    } finally {
      setLoadingArtists(false);
    }
  };

  const handleGenreClick = (selectedGenre) => {
    if (selectedGenre === 'Others') {
      setShowCustomGenreInput(true);
      setShowDropdown(false);
      setType('Cutsom');
    } else {
      setType(selectedGenre);
      fetchArtists(selectedGenre);
      setShowDropdown(false);
      setShowCustomGenreInput(false);
    }
  };

  const filteredGenres = genres.filter((genre) =>
    genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const previewArtist = async (artistId, artistName) => {
    try {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
        setCurrentlyPlaying(null);
      }

      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.tracks && data.tracks.length > 0) {
        const previewUrl = data.tracks[0].preview_url;
        if (previewUrl) {
          const audio = new Audio(previewUrl);
          audio.play();
          setAudioElement(audio);
          setCurrentlyPlaying(artistId);

          audio.onended = () => {
            setCurrentlyPlaying(null);
          };
        } else {
          console.log('No preview available for this track');
        }
      }
    } catch (error) {
      console.error('Error previewing artist:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  return (
    <div className={Style.home__header}>
      <Container>
        <Row>
          <Col md={7} sm={12}>
            <h1 className={Style.title}>
              <span className={Style.title__text}>Welcome to </span>
              <span className={Style.title__name}>Groover</span>
            </h1>
            <p className={Style.header__brief}>
              We provide you with data about your favorite artist.
            </p>
          </Col>
          <Col md={5} sm={12} className='part2'>
            <div className={Style.card}>
              {error && (
                <div className={Style.errorAlert}>
                  {error} <button onClick={() => setError(null)}>×</button>
                </div>
              )}
              <h1 className={Style.title}>
                <span className={Style.title__text}>Cool artists in the </span>
                <span className={Style.title__type}>{type}</span>
                <button
                  className={Style.genreDropdownBtn}
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    color: theme.icon,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.5em',
                    position: 'relative',
                    top: '-5px',
                    right: '5px',
                  }}
                >
                  {showDropdown ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                <span className={Style.title__type}>genre</span>
              </h1>

              {showDropdown && (
                <div className={Style.dropdown}>
                  <input
                    type='text'
                    placeholder='Search Genre'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={Style.searchInput}
                  />
                  <ul className={Style.genreList}>
                    {filteredGenres.map((genre) => (
                      <li key={genre} onClick={() => handleGenreClick(genre)}>
                        {genre}
                      </li>
                    ))}
                    <li
                      onClick={() => {
                        setShowDropdown(false);
                        setShowCustomGenreInput(true);
                      }}
                    >
                      Others (write your own)
                    </li>
                  </ul>
                </div>
              )}

              {showCustomGenreInput && (
                <input
                  type='text'
                  placeholder='Enter your genre'
                  value={userGenre}
                  onChange={(e) => setUserGenre(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setType(userGenre);
                      fetchArtists(userGenre);
                      setShowCustomGenreInput(false);
                      setUserGenre('');
                    }
                  }}
                  className={Style.searchInput}
                />
              )}

              <div className={Style.artist}>
                Go and listen to:
                <div className={Style.allArtist}>
                  <ul>
                    {final.length > 0 ? (
                      final.map((artist) => (
                        <li
                          key={artist.id}
                          className={`${Style.artistName} ${
                            currentlyPlaying === artist.id ? Style.playing : ''
                          }`}
                          onClick={() => previewArtist(artist.id, artist.name)}
                          onMouseEnter={() =>
                            previewArtist(artist.id, artist.name)
                          }
                        >
                          {artist.name}
                        </li>
                      ))
                    ) : (
                      <li>No Artists Found In This Genre</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className={Style.changeMood}>
                <button className={Style.changeMoodBtn} onClick={fetchGenres}>
                  into another genre?
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
