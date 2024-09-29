import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, ListGroup } from 'react-bootstrap';
import Style from '../../style/profile.module.css';
import { useAuth } from '../Authentication/Auth';
import { useHistory } from 'react-router-dom';
import Avatar, { genConfig } from 'react-nice-avatar';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import ProfileNav from '../ProfileNav';

const Profile = () => {
  const { currentUser, loading, name, email, logOut } = useAuth();
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadedImage = useRef(null);
  const history = useHistory();
  const db = firebase.database();
  const [artistsList, setArtistsList] = useState([]);
  const [view, setView] = useState('favorites');
  const [selectedArtists, setSelectedArtists] = useState({});

  const signOut = () => {
    logOut();
    history.push('/');
  };

  useEffect(() => {
    const config = randomAvatar(name);
    setAvatarConfig(config);
  }, [name]);

  const randomAvatar = () => {
    return genConfig();
  };

  const greet = () => {
    const hours = new Date().getHours();
    return hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      handleSubmit(file);
    }
  };

  const handleSubmit = (file) => {
    if (!file) return;

    const metadata = { contentType: file.type };
    const storageRef = firebase
      .storage()
      .ref()
      .child(`images/${firebase.auth().currentUser.uid}/profile`);

    const uploadTask = storageRef.put(file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (err) => {
        console.error('Upload error: ', err);
        setUploadProgress(0);
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          console.log('File available at:', url);
          db.ref('users/' + currentUser.uid)
            .update({ profilePicture: url })
            .then(() => {
              console.log('Profile picture updated successfully!');
            })
            .catch((error) => {
              console.error(
                'Error updating profile picture URL in database:',
                error
              );
            });
          setUploadProgress(0);
        });
      }
    );
  };

  useEffect(() => {
    if (currentUser) {
      const userRef = db.ref('users/' + currentUser.uid);
      userRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (userData.profilePicture) {
            setPhotoUrl(userData.profilePicture);
          }
        }
      });
    }
  }, [currentUser, db]);

  const getFavoriteArtists = async () => {
    const userRef = db.ref(`users/${currentUser.uid}/favorites`);
    const snapshot = await userRef.once('value');
    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([id, name]) => ({ id, name }));
    }
    return [];
  };

  const getBannedArtists = async () => {
    const userRef = db.ref(`users/${currentUser.uid}/banned`);
    const snapshot = await userRef.once('value');
    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([id, name]) => ({ id, name }));
    }
    return [];
  };

  const fetchArtists = async () => {
    if (view === 'favorites') {
      const favoriteArtists = await getFavoriteArtists();
      setArtistsList(favoriteArtists);
    } else if (view === 'banned') {
      const bannedArtists = await getBannedArtists();
      setArtistsList(bannedArtists);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, [view, currentUser]);

  const handleNavClick = (type) => {
    setView(type);
  };

  const handleCheckboxChange = (artistId) => {
    setSelectedArtists((prevSelected) => ({
      ...prevSelected,
      [artistId]: !prevSelected[artistId],
    }));
  };

  const handleStarAction = async (selected) => {
    const updates = {};
    selected.forEach((artistId) => {
      updates[`/favorites/${artistId}`] = artistsList.find(
        (artist) => artist.id === artistId
      ).name;
      updates[`/banned/${artistId}`] = null;
    });
    await db.ref(`users/${currentUser.uid}`).update(updates);
    setSelectedArtists({});
    fetchArtists();
  };

  const handleXAction = async (selected) => {
    const updates = {};
    selected.forEach((artistId) => {
      updates[`/banned/${artistId}`] = artistsList.find(
        (artist) => artist.id === artistId
      ).name;
      updates[`/favorites/${artistId}`] = null;
    });
    await db.ref(`users/${currentUser.uid}`).update(updates);
    setSelectedArtists({});
    fetchArtists();
  };

  const handleDeleteAction = async (selected) => {
    const updates = {};
    selected.forEach((artistId) => {
      if (view === 'favorites') {
        updates[`/favorites/${artistId}`] = null;
      } else {
        updates[`/banned/${artistId}`] = null;
      }
    });
    await db.ref(`users/${currentUser.uid}`).update(updates);
    setSelectedArtists({});
    fetchArtists();
  };

  const deleteAccount = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmation) {
      const input = window.prompt(
        "Please enter the word 'Delete' to confirm account deletion (case-sensitive):"
      );
      if (input === 'Delete') {
        try {
          const user = firebase.auth().currentUser;
          if (user) {
            await db.ref(`users/${user.uid}`).remove();
            await user.delete();
            signOut();
          } else {
            alert('No user is currently signed in.');
          }
        } catch (error) {
          console.error('Error deleting account:', error.message);
          alert(
            'An error occurred while trying to delete your account: ' +
              error.message
          );
        }
      } else {
        alert(
          "Account deletion cancelled. Please enter 'Delete' (case-sensitive) to proceed."
        );
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <h1>Loading...</h1>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container>
        <p>
          Sorry, you have to <a href='/login'>login</a> to see your profile.
        </p>
      </Container>
    );
  }

  return (
    <Container className={Style.profileContainer}>
      <Row className={Style.profileRow}>
        <Col md={4} className={Style.avatarCol}>
          <div className={Style.avatarContainer}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${name}'s profile`}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                }}
              />
            ) : (
              <Avatar
                style={{
                  width: '150px',
                  height: '150px',
                }}
                {...avatarConfig}
              />
            )}
          </div>
          <div>
            <p className={Style.greetUser}>
              Good {greet()},<br />
              {name}
            </p>
            <p className={Style.emailText}>
              Email: <span className={Style.email}>{email}</span>
            </p>
          </div>
        </Col>

        <Col md={8}>
          <Form>
            <Form.Group className={Style.form__group}>
              <Button
                className={Style.uploadButton}
                onClick={() => uploadedImage.current.click()}
              >
                Upload
              </Button>
              <Form.File
                onChange={handleFileChange}
                ref={uploadedImage}
                accept='image/*'
                hidden
              />
            </Form.Group>
            <div className={Style.progressContainer}>
              <div
                className={Style.progressBar}
                style={{ width: `${uploadProgress}%` }}
              />
              <span className={Style.progressText}>
                {parseInt(uploadProgress)}%
              </span>
            </div>
          </Form>
          <Button
            onClick={signOut}
            variant='signOut'
            className={Style.signOutButton}
          >
            Sign Out
          </Button>
          <Button
            onClick={deleteAccount}
            variant='danger'
            className={Style.deleteAccountButton}
          >
            Delete Account
          </Button>
        </Col>
      </Row>
      <ProfileNav onNavClick={handleNavClick} activeView={view} />
      <Row>
        <Col>
          <Row className={Style.actionRow}>
            {view === 'banned' && (
              <span
                role='img'
                aria-label='Star'
                onClick={() =>
                  handleStarAction(
                    Object.keys(selectedArtists).filter(
                      (artistId) => selectedArtists[artistId]
                    )
                  )
                }
                style={{
                  cursor: 'pointer',
                  marginLeft: '16px',
                  fontSize: '22px',
                }}
              >
                ⭐️
              </span>
            )}
            {view === 'favorites' && (
              <span
                role='img'
                aria-label='Ban'
                onClick={() =>
                  handleXAction(
                    Object.keys(selectedArtists).filter(
                      (artistId) => selectedArtists[artistId]
                    )
                  )
                }
                style={{
                  cursor: 'pointer',
                  marginLeft: '16px',
                  fontSize: '22px',
                }}
              >
                🚫
              </span>
            )}
            <span
              role='img'
              aria-label='Trash'
              onClick={() =>
                handleDeleteAction(
                  Object.keys(selectedArtists).filter(
                    (artistId) => selectedArtists[artistId]
                  )
                )
              }
              style={{
                cursor: 'pointer',
                marginLeft: '16px',
                fontSize: '22px',
              }}
            >
              🗑️
            </span>
          </Row>
          <ListGroup>
            {artistsList.map((artist) => (
              <ListGroup.Item
                key={artist.id}
                className={Style.artistItem}
                style={{
                  background: 'none',
                  border: 'none',
                }}
              >
                <input
                  type='checkbox'
                  checked={!!selectedArtists[artist.id]}
                  onChange={() => handleCheckboxChange(artist.id)}
                  id={`checkbox-${artist.id}`}
                  style={{ cursor: 'pointer', display: 'none' }}
                />
                <span
                  className={Style.customCheckbox}
                  onClick={() => handleCheckboxChange(artist.id)}
                  style={{
                    cursor: 'pointer',
                    background: selectedArtists[artist.id]
                      ? '#32CD32'
                      : 'white',
                  }}
                />
                <span
                  onClick={() => handleCheckboxChange(artist.id)}
                  style={{
                    cursor: 'pointer',
                    color: selectedArtists[artist.id] ? '#FF6F61' : 'white',
                  }}
                >
                  {artist.name}
                </span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
