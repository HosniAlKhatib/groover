import React from 'react';
import { Nav } from 'react-bootstrap';
import Style from '../style/profile.module.css';

const ProfileNav = ({ activeView, onNavClick }) => {
  return (
    <Nav variant='tabs' activeKey={activeView} className={Style.profileNav}>
      <Nav.Item>
        <Nav.Link
          eventKey='favorites'
          onClick={() => onNavClick('favorites')}
          style={
            activeView === 'favorites'
              ? {
                  borderRadius: '8px',
                  background: '#7D7F7D',
                }
              : {}
          }
        >
          Favorite Artists
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          eventKey='banned'
          onClick={() => onNavClick('banned')}
          style={
            activeView === 'banned'
              ? {
                  borderRadius: '8px',
                  background: '#7D7F7D',
                }
              : {}
          }
        >
          Banned Artists
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default ProfileNav;
