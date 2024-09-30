import React from 'react';
import { useTheme } from 'styled-components';

const VideoBackground = ({ video }) => {
  const theme = useTheme();

  return (
    <div className='fullscreen_bg'>
      <iframe
        className='fullscreen_bg__video'
        src={video}
        style={{
          filter: `brightness(${theme.body === '#16161a' ? '15%' : ''})`,
        }}
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
        title='bg'
      ></iframe>
    </div>
  );
};

export default VideoBackground;
