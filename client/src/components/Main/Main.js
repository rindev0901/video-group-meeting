import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import socket from '../../socket';

const Main = (props) => {
  const roomRef = useRef();
  const userRef = useRef();
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {

    socket.on('FE-error-user-exist', ({ error }) => {
      if (!error) {
        const roomName = roomRef.current.value;
        const userName = userRef.current.value;

        sessionStorage.setItem('user', userName);
        props.history.push(`/room/${roomName}`);
      } else {
        setErr(error);
        setErrMsg('User name already exist');
      }
    });
  }, [props.history]);

  function clickJoin() {
    const roomName = roomRef.current.value;
    const userName = userRef.current.value;

    if (!roomName || !userName) {
      setErr(true);
      setErrMsg('Enter Room Name or User Name');
    } else {
      socket.emit('BE-check-user', { roomId: roomName, userName });
    }
  }

  return (
    <MainContainer>
      <Row>
        <Label htmlFor="roomName">Room Name</Label>
        <Input type="text" id="roomName" ref={roomRef} />
      </Row>
      <Row>
        <Label htmlFor="userName">User Name</Label>
        <Input type="text" id="userName" ref={userRef} />
      </Row>
      <JoinButton onClick={clickJoin}> Join </JoinButton>
      {err ? <Error>{errMsg}</Error> : null}
    </MainContainer>
  );
};

const MainContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  max-width: 500px;
  width: 80%;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    width: 90%;
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    width: 95%;
    padding: 10px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 15px;
  line-height: 35px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 10px;
  }
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Input = styled.input`
  height: 35px;
  margin-left: 15px;
  padding-left: 10px;
  outline: none;
  border: none;
  border-radius: 5px;
  
  @media (max-width: 768px) {
    width: 130px;
    height: 30px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    margin-left: 0;
    margin-top: 5px;
  }
`;

const Error = styled.div`
  margin-top: 10px;
  font-size: 20px;
  color: #e85a71;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const JoinButton = styled.button`
  height: 40px;
  min-width: 250px;
  margin-top: 35px;
  outline: none;
  border: none;
  border-radius: 15px;
  color: #d8e9ef;
  background-color: #4ea1d3;
  font-size: 25px;
  align-self: center;
  font-weight: 500;
  :hover {
    background-color: #7bb1d1;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    height: 35px;
    margin-top: 25px;
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    height: 30px;
    margin-top: 20px;
    font-size: 18px;
  }
`;

export default Main;
