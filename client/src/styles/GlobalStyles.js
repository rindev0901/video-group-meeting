import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  #root {
    height: 100%;
    width: 100%;
  }

  .width-peer1 {
    width: 100%;
    height: 100%;
  }

  .width-peer2 {
    width: 45%;
    height: 45%;
  }

  .width-peer3, .width-peer4 {
    width: 35%;
    height: 35%;
  }

  .width-peer5, .width-peer6, .width-peer7, .width-peer8 {
    width: 30%;
    height: 30%;
  }

  @media (max-width: 768px) {
    .width-peer2, .width-peer3, .width-peer4, .width-peer5, .width-peer6, .width-peer7, .width-peer8 {
      width: 45%;
      height: 45%;
    }
  }

  @media (max-width: 480px) {
    .width-peer2, .width-peer3, .width-peer4, .width-peer5, .width-peer6, .width-peer7, .width-peer8 {
      width: 100%;
      height: 40%;
    }
  }

  button, input, textarea {
    font-family: inherit;
  }
`;

export default GlobalStyles; 