import React, { useState } from 'react';
import signUpStyle from '../../style/signup.module.css';
import { createGlobalStyle } from 'styled-components';
import { ArrowLeft } from 'react-feather';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useAuth } from '../Authentication/Auth';
import MobileIllustration from '../../assets/icons/mobile_ill.svg';

const GlobalStyle = createGlobalStyle`
  .navbar {
    display: none;
  }
  html, body {
    overflow-x: hidden;
    overflow-y: hidden;
  }
`;

const Signup = () => {
  const { signUp, Google, GitHub } = useAuth();
  const [state, setState] = useState({});
  const [password, setPassword] = useState('');
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setIsTermsChecked(event.target.checked);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log(state);
  };

  const submitAction = async (e) => {
    e.preventDefault();
    console.log('Executing...');
    console.log(state);
    if (!state.name) {
      alert('Please Fill Out The Name Input');
    } else if (!state.email) {
      alert('Please Fill Out The Email Input');
    } else if (!password) {
      alert('Please Fill Out The Password Input');
    } else if (!isTermsChecked) {
      alert('You must agree to the terms and conditions to proceed.');
    } else {
      await signUp(state, password);
    }
  };

  return (
    <div className='signUpPage'>
      <GlobalStyle />

      <div>
        <Row>
          <Col md={7} className={signUpStyle.column__left}>
            <div className={signUpStyle.backButton}>
              <Link to='/' className={signUpStyle.backButton__Link}>
                {' '}
                <ArrowLeft style={{ marginBottom: '2px' }} />
                <p className={signUpStyle.backButton__Text}>Go back</p>
              </Link>
            </div>
            <div className={signUpStyle.signUp__Title}>
              <h2>Sign up</h2>
            </div>
            <div className={signUpStyle.social}>
              <button className={signUpStyle.social__google} onClick={Google}>
                Continue with Google
              </button>
              <button className={signUpStyle.social__github} onClick={GitHub}>
                Continue with GitHub
              </button>
            </div>
            <div className={signUpStyle.lineBreaker}>
              <p>or Sign up with Email</p>
            </div>
            <div className={signUpStyle.email__form}>
              <form onSubmit={submitAction}>
                <div className={signUpStyle.form__group}>
                  <label htmlFor='name'>Name</label>
                  <input
                    className={signUpStyle.form__input}
                    type='text'
                    id='name'
                    name='name'
                    onChange={handleInputChange}
                    placeholder='Joe Smith'
                    autoComplete
                  />
                </div>

                <div className={signUpStyle.form__group}>
                  <label htmlFor='email'>Email</label>
                  <input
                    className={signUpStyle.form__input}
                    type='text'
                    id='email'
                    name='email'
                    onChange={handleInputChange}
                    placeholder='Mail@mail.com'
                  />
                </div>

                <div className={signUpStyle.form__group}>
                  <label htmlFor='password'>Password</label>
                  <input
                    className={signUpStyle.form__input}
                    type='password'
                    id='password'
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    placeholder='Min. 10 character'
                  />
                </div>

                <div className={signUpStyle.form__group}>
                  <div className={signUpStyle.checkbox__group}>
                    <input
                      type='checkbox'
                      name='terms'
                      id='terms'
                      checked={isTermsChecked}
                      onChange={handleCheckboxChange}
                    />
                    <label
                      htmlFor='terms'
                      className={signUpStyle.indented__checkbox__text}
                    >
                      I agree to the terms and conditions
                    </label>
                  </div>
                </div>

                <button className={signUpStyle.form__submit}>Sign up</button>
              </form>
            </div>
          </Col>
          <Col>
            <div className={signUpStyle.right}>
              <div className={signUpStyle.layout}>
                <h1>Groover</h1>
                <h2 className={signUpStyle.layout__words}>
                  A few clicks away from creating your Profile
                </h2>
                <div className={signUpStyle.layout__image}>
                  <img
                    className={signUpStyle.layout__illustraion}
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

export default Signup;
