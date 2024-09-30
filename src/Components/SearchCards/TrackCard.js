import React, { useState } from 'react';
import Style from '../../style/search.module.css';
import Track_Style from '../../style/search/track.module.css';
import Jdenticon from 'react-jdenticon';
import { ColorExtractor } from 'react-color-extractor';

const TrackCard = (props) => {
  const { track } = props;
  const [colors, setCololrs] = useState([]);
  return (
    <div
      style={{
        backgroundColor: colors.length > 2 ? colors[5] : '#19191d',
        width: '300px',
        height: '400px',
        position: 'relative',
        marginLeft: '35px',
        marginBottom: '30px',
        borderRadius: '5px',
      }}
    >
      <script src='https://sdk.scdn.co/spotify-player.js'></script>
      <div className={Style.search__results__item__wrapper}>
        <ul>
          {track.album.images[1] ? (
            <li className={Style.search__results__img}>
              <ColorExtractor getColors={(colors) => setCololrs(colors)}>
                <img
                  className={Style.search__results__img__self_tracks}
                  src={track.album.images[1].url}
                  alt=''
                  width={150}
                />
              </ColorExtractor>
            </li>
          ) : (
            <li className={Style.search__results__img}>
              <Jdenticon size='140' value={track.name} />
            </li>
          )}
          <li
            className={`${Style.search__results__name} ${Track_Style.search__results__elements}`}
          >
            {track.name}
          </li>
          <li
            className={`${Style.search__results__name} ${Track_Style.search__results__elements} ${Track_Style.artists__names}`}
          >
            {track.artists.map((elem, index) => (
              <React.Fragment
                key={index}
                className={`${Track_Style.artists__names}`}
              >
                {elem.name}
                {track.artists.length === track.artists.indexOf(elem) + 1
                  ? null
                  : ', '}
              </React.Fragment>
            ))}
          </li>

          <li className={Style.search__results__spotify__player}>
            <iframe
              src={`https://open.spotify.com/embed/${track.uri.split(':')[1]}/${
                track.uri.split(':')[2]
              }`}
              width='280'
              title='Spotify'
              height='80'
              style={{ borderRadius: '5px' }}
              frameborder='0'
              allowtransparency='true'
              allow='encrypted-media'
            ></iframe>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TrackCard;
