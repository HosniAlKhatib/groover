// Not Used!
import React from 'react';
import Style from '../../style/search.module.css';
import Artist_Style from '../../style/search/artist.module.css';
import Jdenticon from 'react-jdenticon';

const ArtistCard = (props) => {
  return (
    <div className={Style.search__results__item}>
      <div
        style={{
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // filter: 'blur(3.5px)',
          filter: 'brightness(0.5) blur(3.5px)',
          zIndex: -1,
        }}
      ></div>
      {props.data.images[2] ? (
        <div className={Style.search__results__item__wrapper}>
          <img
            src={props.data.images[2].url}
            alt=''
            className={Style.search__results__img__self_artists}
          />
        </div>
      ) : (
        <li className={Style.search__results__img}>
          <Jdenticon
            size='140'
            value={props.data.name}
            style={{
              borderRadius: '10px',
            }}
          />
        </li>
      )}
      <p className={Artist_Style.search__results__elements}>
        {props.data.name}
      </p>
      <li className={Artist_Style.search__results__elements}>
        {props.data.genres.length === 0 ? (
          <span>no genres found</span>
        ) : (
          props.data.genres.map((elem) => (
            <span>
              {elem}{' '}
              {props.data.genres.length === props.data.genres.indexOf(elem) + 1
                ? null
                : ', '}
            </span>
          ))
        )}
      </li>
      <a
        href={props.data.external_urls.spotify}
        rel='noopener noreferrer'
        target='_blank'
        className={Artist_Style.search__results__elements}
      >
        {props.data.name}
      </a>
    </div>
  );
};

export default ArtistCard;
