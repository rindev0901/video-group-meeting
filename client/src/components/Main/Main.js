import React, { useState, useEffect } from "react";
import styled from "styled-components";
import socket from "../../socket";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Form,
  Input,
  theme,
  Typography,
  Divider,
  Card,
  Avatar,
} from "antd";

const { useToken } = theme;
const { Text, Title } = Typography;

const Main = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { user, logout } = useAuth();
  const { token } = useToken();

  useEffect(() => {
    // Set initial form values
    form.setFieldsValue({
      userName: user?.name,
      roomName: "",
    });

    // Socket connection handlers
    const onConnect = () => {
      console.log("Socket connected");
      setIsConnected(true);
      setErr(false);
      setErrMsg("");
    };

    const onDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setErr(true);
      setErrMsg("Connection lost. Please try again.");
    };

    const onConnectError = (error) => {
      console.log("Socket connection error:", error);
      setIsConnected(false);
      setErr(true);
      setErrMsg("Unable to connect to server. Please try again later.");
    };

    // Socket event handlers
    const onUserExist = ({ error }) => {
      if (!error) {
        const values = form.getFieldsValue();
        navigate(`/room/${values.roomName}`);
      } else {
        setErr(true);
        setErrMsg("User name already exists in this room");
      }
      setLoading(false);
    };

    // Add event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("FE-error-user-exist", onUserExist);

    // Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("FE-error-user-exist", onUserExist);
    };
  }, [form, navigate, user?.name]);

  const handleJoin = async () => {
    try {
      if (!isConnected) {
        setErr(true);
        setErrMsg("Not connected to server. Please wait or refresh the page.");
        return;
      }

      setLoading(true);
      const values = await form.validateFields();

      if (!values.roomName || !values.userName) {
        setErr(true);
        setErrMsg("Please enter both room name and display name");
        setLoading(false);
        return;
      }

      socket.emit("BE-check-user", {
        roomId: values.roomName,
        userName: values.userName,
      });
    } catch (error) {
      setErr(true);
      setErrMsg("Please enter valid values");
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <MainCard>
        <UserCard>
          <Avatar
            size={48}
            src={
              user?.avatar
                ? user?.avatar
                : user?.user_metadata?.avatar
                ? user?.user_metadata?.avatar
                : user?.name?.charAt(0).toUpperCase()
            }
          ></Avatar>
          <UserInfoContainer>
            <Title level={4} style={{ margin: 0 }}>
              {user.name}
            </Title>
            <Text type="secondary">{user.email}</Text>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Member since {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </UserInfoContainer>
          <Button
            type="primary"
            style={{
              boxShadow: "none",
            }}
            danger
            onClick={logout}
          >
            Logout
          </Button>
        </UserCard>

        <Divider />

        <Title
          level={3}
          style={{ textAlign: "center", color: token.colorTextBase }}
        >
          Start or Join Meeting
        </Title>

        {!isConnected && (
          <ConnectionStatus type="warning">
            Connecting to server...
          </ConnectionStatus>
        )}

        <Form form={form} layout="vertical" onFinish={handleJoin}>
          <Form.Item
            label="Room Name"
            name="roomName"
            rules={[{ required: true, message: "Please enter room name" }]}
            validateStatus={err ? "error" : ""}
            help={err && errMsg}
          >
            <Input placeholder="Enter room name..." size="large" />
          </Form.Item>

          <Form.Item
            label="Display Name"
            name="userName"
            rules={[{ required: true, message: "Please enter display name" }]}
          >
            <Input placeholder="Enter display name..." size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              block
              onClick={handleJoin}
              loading={loading}
              disabled={!isConnected}
              style={{
                height: "40px",
                background: token.colorPrimary,
              }}
            >
              Join Meeting
            </Button>
          </Form.Item>
        </Form>

        <Divider>Or</Divider>
        
        <Button 
          type="default" 
          size="large" 
          block
          onClick={() => navigate('/teams')}
          style={{
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          View My Teams
        </Button>
      </MainCard>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const MainCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  border-radius: ${() => {
    const { token } = theme.useToken();
    return token.borderRadiusLG;
  }}px;
  box-shadow: ${() => {
    const { token } = theme.useToken();
    return token.boxShadow;
  }};
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${() => {
    const { token } = theme.useToken();
    return token.colorBgContainer;
  }};
  border-radius: ${() => {
    const { token } = theme.useToken();
    return token.borderRadius;
  }}px;
`;

const UserInfoContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ConnectionStatus = styled(Text)`
  display: block;
  text-align: center;
  margin-bottom: 16px;
`;

export default Main;
