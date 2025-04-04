import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Main from "./components/Main/Main";
import Room from "./components/Room/Room";
import styled from "styled-components";
import GlobalStyles from "./styles/GlobalStyles";
import { LoginForm } from "./components/Auth/login-form";

function App() {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <AppContainer>
        <Switch>
          <Route exact path="/" component={Main} />
          <Route exact path="/login" component={LoginForm} />
          <Route exact path="/room/:roomId" component={Room} />
        </Switch>
      </AppContainer>
    </BrowserRouter>
  );
}

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  font-size: calc(8px + 2vmin);
  color: white;
  background-color: #454552;
  text-align: center;

  @media (max-width: 768px) {
    font-size: calc(7px + 2vmin);
  }

  @media (max-width: 480px) {
    font-size: calc(6px + 2vmin);
  }
`;

export default App;
