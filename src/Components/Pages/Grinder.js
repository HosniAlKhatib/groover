import React, { useState, useEffect, useMemo, useRef } from 'react';
import firebase from 'firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { Container, Col } from 'react-bootstrap';
import Style from '../../style/grinder.module.css';
import TinderCard from 'react-tinder-card';
import useSpotifyToken from '../useSpotifyToken';

const Grinder = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [artists, setArtists] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bannedArtists, setBannedArtists] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingTrack, setPlayingTrack] = useState(null);
  const audioRef = useRef(null);
  const { token } = useSpotifyToken();
  const childRefs = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map(() => React.createRef()),
    []
  );

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
    fetchBannedArtists();
  }, []);

  useEffect(() => {
    const unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged((user) => {
        setIsSignedIn(!!user);
      });
    return () => unregisterAuthObserver();
  }, []);

  const fetchArtists = async (term) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          term
        )}&type=artist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (data.artists && data.artists.items.length > 0) {
        const matchedArtist = data.artists.items[0];

        const additionalArtists = await Promise.all(
          data.artists.items
            .slice(1)
            .filter((artist) => !bannedArtists.includes(artist.id))
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 7)
            .map(async (artist) => {
              const popularTrackRes = await fetch(
                `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const popularTrackData = await popularTrackRes.json();
              const topTrack = popularTrackData.tracks[0] || null;
              return { ...artist, topTrack };
            })
        );

        setArtists([matchedArtist, ...additionalArtists].reverse());
        setCurrentIndex(0);
      } else {
        setArtists([]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching artist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      fetchArtists(query);
    }
  };

  const manualSwipe = (dir) => {
    if (artists.length >= currentIndex && childRefs[currentIndex].current) {
      childRefs[artists.length - currentIndex - 1].current.swipe(dir);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const swiped = (dir, artistId, name) => {
    setLastDirection(dir);
    const user = firebase.auth().currentUser;
    if (user) {
      if (dir === 'left') {
        firebase
          .database()
          .ref(`users/${user.uid}/banned`)
          .update({ [artistId]: name });
        setBannedArtists((prevBanned) => [...prevBanned, artistId]);
        firebase
          .database()
          .ref(`users/${user.uid}/favorites`)
          .child(artistId)
          .remove();
      }
      if (dir === 'up') {
        firebase
          .database()
          .ref(`users/${user.uid}/favorites`)
          .child(artistId)
          .once('value', (snapshot) => {
            if (!snapshot.exists()) {
              firebase
                .database()
                .ref(`users/${user.uid}/favorites`)
                .update({ [artistId]: name });
            }
          });
      }
    }
  };

  const brightnessOfBackgroundImage = (artist) => {
    const hasImage = artists[artist].images.length > 0;
    const backgroundStyle = hasImage
      ? {
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${artists[artist].images[0].url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {
          background: 'gray',
        };
    return {
      ...backgroundStyle,
      borderRadius: '15px',
    };
  };

  const playPreview = (previewUrl) => {
    if (audioRef.current) {
      if (audioRef.current.src === previewUrl) {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
          return;
        } else {
          audioRef.current
            .play()
            .catch((error) => console.error('Error playing audio:', error));
          setIsPlaying(true);
          return;
        }
      } else {
        stopPlayback();
      }
    }
    audioRef.current = new Audio(previewUrl);
    audioRef.current
      .play()
      .catch((error) => console.error('Error playing audio:', error));
    setPlayingTrack(audioRef.current);
    setIsPlaying(true);
    audioRef.current.onended = () => {
      audioRef.current = null;
      setIsPlaying(false);
      setPlayingTrack(null);
    };
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setPlayingTrack(null);
    }
  };

  if (!isSignedIn) {
    return (
      <Container>
        <p>
          Sorry, you have to <a href='/login'>login</a> to see your profile.
        </p>
      </Container>
    );
  }

  if (loading) {
    return (
      <div className={Style.loadingContainer}>
        <div className={Style.spinner}></div>
        <p>Loading artists...</p>
      </div>
    );
  }

  return (
    <>
      <Container>
        <div className={Style.grinder_main}>
          <h1 className={`text-center`}>Grinder!</h1>
          <form onSubmit={handleSearch}>
            <Col md={9} sm={12}>
              <input
                placeholder='Search Artists'
                className={Style.search__btn}
                value={query}
                onChange={handleValueChange}
                id='search_bar'
              />
            </Col>
          </form>

          <div className={`${Style.grinder__container}`}>
            <div className='cardContainer'>
              {artists.map((artist, index) => (
                <TinderCard
                  ref={childRefs[index]}
                  className='swipe'
                  key={artist.id}
                  onSwipe={(dir) => swiped(dir, artist.id, artist.name)}
                  preventSwipe={['down']}
                >
                  <div
                    className={`${Style.card}`}
                    style={brightnessOfBackgroundImage(index)}
                  >
                    <div className={`${Style.card_content}`}>
                      <div className={`${Style.artist_footer}`}>
                        <h5 className={`${Style.artist_name}`}>
                          {artist.name}
                        </h5>
                        <button
                          onClick={() =>
                            playPreview(artist.topTrack.preview_url)
                          }
                          className={Style.previewButton}
                          title={
                            isPlaying &&
                            playingTrack &&
                            artist.topTrack &&
                            artist.topTrack.preview_url === playingTrack.src
                              ? 'Pause'
                              : artist.topTrack
                              ? `Play ${artist.topTrack.name} by ${artist.name}`
                              : `Play track by ${artist.name}`
                          }
                          style={{
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            background: 'rgba(127, 90, 240, 0.7)',
                            width: '27px',
                            height: '27px',
                            marginLeft: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = 'scale(1.1)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = 'scale(1)')
                          }
                        >
                          {isPlaying &&
                          playingTrack &&
                          artist.topTrack.preview_url === playingTrack.src ? (
                            <FontAwesomeIcon
                              icon={faPause}
                              style={{
                                color: '#ffffff',
                                fontSize: '16px',
                              }}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faPlay}
                              style={{ color: '#ffffff', fontSize: '16px' }}
                            />
                          )}
                        </button>
                      </div>
                      <p className={`${Style.artist_popularity}`}>
                        Popularity: {artist.popularity}
                      </p>
                      <p className={`${Style.artist_genres}`}>
                        Genres: {(artist.genres || []).join(', ')}
                      </p>
                    </div>
                  </div>
                </TinderCard>
              ))}
            </div>
            <div className='buttons'>
              <button
                className={`${Style.swipeButton}`}
                onClick={() => manualSwipe('left')}
              >
                Swipe Left!
              </button>
              <button
                className={`${Style.swipeButton}`}
                onClick={() => manualSwipe('up')}
              >
                Swipe Up!
              </button>
              <button
                className={`${Style.swipeButton}`}
                onClick={() => manualSwipe('right')}
              >
                Swipe Right!
              </button>
            </div>
            {lastDirection ? (
              <h2 key={lastDirection} className='infoText'>
                Swiped {lastDirection}
              </h2>
            ) : (
              <h2 className='infoText'>Start Swipin'!</h2>
            )}
          </div>
        </div>
      </Container>
    </>
  );
};

export default Grinder;
