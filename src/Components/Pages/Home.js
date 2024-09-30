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

  const { token } = useSpotifyToken();
  const theme = useTheme();

  useEffect(() => {
    if (token) {
      console.log('Access Token:', token);
      fetchGenres();
    }
  }, [token]);

  const fetchGenres = async () => {
    try {
      const res = await fetch(
        'https://api.spotify.com/v1/recommendations/available-genre-seeds',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setGenres(data.genres);
      if (data.genres.length > 0) {
        const randomGenre =
          data.genres[Math.floor(Math.random() * data.genres.length)];
        setType(randomGenre);
        fetchArtists(randomGenre);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchArtists = async (selectedGenre) => {
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=genre:"${selectedGenre}"&type=artist&limit=50&access_token=${token}`
      );
      const data = await res.json();
      if (data.artists && data.artists.items.length > 0) {
        const sortedArtists = data.artists.items.sort(
          (a, b) => b.popularity - a.popularity
        );
        setFinal(sortedArtists.slice(0, 7));
      } else {
        console.log('No artists found for this genre.');
      }
    } catch (error) {
      console.error('Error fetching artist data:', error);
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
                      final.map((Rartist) => (
                        <li key={Rartist.id}>- {Rartist.name}</li>
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
