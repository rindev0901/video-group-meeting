import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./components/Main/Main";
import Room from "./components/Room/Room";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import styled from "styled-components";
import { theme } from "antd";

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
    <BrowserRouter>
      <AppContainer>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </AppContainer>
    </BrowserRouter>
  );
}

export default App;
