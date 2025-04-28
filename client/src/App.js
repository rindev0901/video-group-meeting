import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./components/Main/Main";
import Room from "./components/Room/Room";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Teams from "./components/Teams/Teams";
import TeamDetail from "./components/Teams/TeamDetail";
import InviteProcess from "./components/Teams/InviteProcess";
import styled from "styled-components";
import { App as AntApp, theme } from "antd";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { UnAuthRoute } from "./components/Auth/UnAuthRoute";

const { useToken } = theme;

function App() {
  const { token } = useToken();
  const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    font-size: calc(8px + 2vmin);
    color: white;
    background-color: ${token.colorBgContainer};
    text-align: center;
  `;

  return (
    <AntApp>
      <BrowserRouter>
        <AppContainer>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <UnAuthRoute>
                  <Login />
                </UnAuthRoute>
              }
            />
            <Route
              path="/register"
              element={
                <UnAuthRoute>
                  <Register />
                </UnAuthRoute>
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <ProtectedRoute>
                  <Room />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <Teams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/:teamId"
              element={
                <ProtectedRoute>
                  <TeamDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invite"
              element={<InviteProcess />}
            />
            <Route
              path="/accept-invite/:userId"
              element={<InviteProcess />}
            />
          </Routes>
        </AppContainer>
      </BrowserRouter>
    </AntApp>
  );
}

export default App;
