import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Style from '../../style/home.module.css';
import useSpotifyToken from '../useSpotifyToken';

const Home = () => {
  const [type, setType] = useState();
  const [final, setFinal] = useState([]);

  const { token } = useSpotifyToken();

  useEffect(() => {
    if (token) {
      console.log('Access Token:', token);
    }
  }, [token]);

  const randomGenre = async () => {
    try {
      const res1 = await fetch(
        'https://api.spotify.com/v1/recommendations/available-genre-seeds',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data1 = await res1.json();
      const len = data1.genres.length;
      const rGenre = data1.genres[Math.floor(Math.random() * len)];
      setType(rGenre);
      setFinal([]);
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=genre:"${rGenre}"&type=artist&limit=50&access_token=${token}`
      );
      const data = await res.json();
      console.log('Data:', data.artists.items);
      if (data.artists.items.length === 0) {
        console.log('No Artists Found For This Genre.');
        randomGenre();
      }
      if (data.artists && data.artists.items) {
        data.artists.items.sort((a, b) => b.popularity - a.popularity);
        let newFinal = [];
        for (const item of data.artists.items) {
          if (newFinal.length >= 7) {
            break;
          }
          for (let i = 0; i < item.genres.length; i++) {
            if (!newFinal.includes(item)) {
              newFinal.push(item);
            }
            if (newFinal.length >= 7) {
              break;
            }
          }
        }
        setFinal(newFinal);
        console.log(newFinal);
      }
    } catch (error) {
      console.error('Error fetching artist data:', error);
    }
  };

  useEffect(() => {
    randomGenre();
  }, [token]);

  return (
    <div className={Style.home__header}>
      <Container>
        <Row>
          <Col md={7} sm={12}>
            <h1 className={Style.title}>
              Welcome to <span className={Style.title__name}>Groover</span>
            </h1>
            <p className={Style.header__brief}>
              We provide you with data about your favorite artist.
            </p>
          </Col>
          <Col md={5} sm={12} className='part2'>
            <div className={Style.card}>
              <h1 className={Style.title}>Cool artists in the {type} genre</h1>
              <div className={Style.artist}>
                Go and listen to:
                <div className={Style.allArtist}>
                  <ul>
                    {final && final.map((Rartist) => <li>- {Rartist.name}</li>)}
                  </ul>
                </div>
              </div>
              <div className={Style.changeMood}>
                <button className={Style.changeMoodBtn} onClick={randomGenre}>
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
