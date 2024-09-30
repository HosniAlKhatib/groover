import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text}; /* Default text color for body */
    height: 100vh;
    margin: 0;
    padding: 0;
    font-family: 'TT Norms Pro';
    transition: all 0.25s linear;
  }

  ::selection {
    background-color: #7f5af0;
    font-weight: 700 !important;
    color: black;
  }

  .navbar {
    background-color: ${({ theme }) => theme.nav} !important;
  }

  .navbar-brand {
    color: ${({ theme }) => theme.text} !important;
  }

  .navbar-nav a {
    color: ${({ theme }) => theme.text} !important;
  }

  .nav-link {
    color: ${({ theme }) => theme.text} !important;
    font-size: 20px;
  }

  .login__btn {
    color: ${({ theme }) => theme.text} !important;
  }

  .navbar-brand a {
    color: ${({ theme }) => theme.text} !important;
    text-decoration: none;
  }

  .react-switch {
    margin-top: 18px;
    margin-right: 20px;
    margin-left: 10px;
  }

  /* Exclude buttons and input[type='text'] from the theme color */
  input[type='text'], button {
    color: initial; /* Keep default color */
  }

  /* Artist names color */
  .search__results__name, .search__results__name span {
    color: #363537 !important; /* Set a specific color for artist names */
  }

  /* Other text elements styled by theme */
  h1, h2, h3, p, h4, h5, h6, span, a {
    color: ${({ theme }) => theme.text} !important;
  }
`;
