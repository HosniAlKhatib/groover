import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/App.css';

import React, { useState, useEffect } from 'react';

import { BrowserRouter as Router } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';

import { lightTheme, darkTheme } from '../style/theme';

import { GlobalStyles } from '../style/global';

import { AuthProvider } from './Authentication/Auth';

import Cursor from './Cursor';
import NavBar from './Nav';
import firebase from 'firebase';
import VideoBackground from './VideoBackground';
import Routes from './Routes';

function App({ initialTheme = 'dark' }) {
  const [theme, setTheme] = useState(() => {
    let localValue = window.localStorage.getItem('theme');
    if (localValue) {
      return JSON.parse(localValue);
    }
    return initialTheme;
  });
  const [click, setClick] = useState(true);
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  useEffect(() => {
    window.localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  const handleClick = (e) => {
    setClick(!click);
  };
  const listId = 'PLtGjfoSQ7TDRx9StmbksF74Vl4DT9mOUd';
  const type = 'list';
  const nowPlaying = `https://www.youtube.com/embed/videoseries?${type}=${listId}&autoplay=1&mute=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&loop=1&cc_load_policy=0`;

  useEffect(() => {
    const unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged((user) => {});
    return () => unregisterAuthObserver();
  }, []);

  return (
    <div
      style={{
        backgroundColor:
          theme === 'light' ? lightTheme.background : darkTheme.background,
        minHeight: '100vh',
      }}
    >
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyles />
        <AuthProvider>
          <Router>
            <VideoBackground video={nowPlaying} />
            <NavBar
              theme={theme}
              handleClick={handleClick}
              click={click}
              toggleTheme={toggleTheme}
            />
            <Routes />
          </Router>
        </AuthProvider>
        <Cursor />
      </ThemeProvider>
    </div>
  );
}

export default App;
