import React, { useState } from 'react';
import logInStyle from '../../style/login.module.css';
import { createGlobalStyle } from 'styled-components';
import { ArrowLeft } from 'react-feather';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useAuth } from '../Authentication/Auth';
import MobileIllustration from '../../assets/icons/mobile_ill_login.svg';

const GlobalStyle = createGlobalStyle`
  .navbar {
    display: none;
  }
  html, body {
    overflow-x: hidden;
    overflow-y: hidden;
  }
`;

const LogIn = () => {
  const { login, Google, GitHub } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitAction = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className='signUpPage'>
      <GlobalStyle />

      <div>
        <Row>
          <Col md={7} className={logInStyle.column__left}>
            <div className={logInStyle.backButton}>
              <Link to='/' className={logInStyle.backButton__Link}>
                {' '}
                <ArrowLeft style={{ marginBottom: '2px' }} />
                <p className={logInStyle.backButton__Text}>Go back</p>
              </Link>
            </div>
            <div className={logInStyle.signUp__Title}>
              <h2>Log in</h2>
            </div>
            <div className={logInStyle.social}>
              <button className={logInStyle.social__google} onClick={Google}>
                Continue with Google
              </button>
              <button className={logInStyle.social__github} onClick={GitHub}>
                Continue with GitHub
              </button>
            </div>
            <div className={logInStyle.lineBreaker}>
              <p>or Log in with Email</p>
            </div>
            <div className={logInStyle.email__form}>
              <form onSubmit={submitAction}>
                <div className={logInStyle.form__group}>
                  <label htmlFor='email'>Email</label>

                  <input
                    className={logInStyle.form__input}
                    type='text'
                    id='email'
                    name='email'
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    placeholder='Mail@mail.com'
                  />
                </div>

                <div className={logInStyle.form__group}>
                  <label htmlFor='password'>Password</label>
                  <input
                    className={logInStyle.form__input}
                    type='password'
                    id='password'
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    placeholder='Min. 10 character'
                  />
                </div>

                <button className={logInStyle.form__submit}>Log in</button>
              </form>
            </div>
          </Col>
          <Col>
            <div className={logInStyle.right}>
              <div className={logInStyle.layout}>
                <h1>Groover</h1>
                <h2 className={logInStyle.layout__words}>Welcome back.</h2>
                <br />
                <div className={logInStyle.layout__image}>
                  <img
                    className={logInStyle.layout__illustraion}
                    src={MobileIllustration}
                    alt=''
                  />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LogIn;
