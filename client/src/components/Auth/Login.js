import React, { useState } from "react";

import {
  Button,
  Form,
  Grid,
  Image,
  Input,
  message,
  theme,
  Typography,
} from "antd";

import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export default function Login() {
  const { token } = useToken();
  const screens = useBreakpoint();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const onFinish = async (values) => {
    setIsLoggingIn(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          body: JSON.stringify(values),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Login failed!");

      const data = await res.json();
      console.log("loginResponse:::", data);
      // Do something with the response
    } catch (error) {
      console.error("Server error:::", error);
      message.error(error?.message ?? "Something went wrong!");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const styles = {
    container: {
      margin: "0 auto",
      padding: screens.md
        ? `${token.paddingXL}px`
        : `${token.sizeXXL}px ${token.padding}px`,
      width: "380px",
    },
    footer: {
      marginTop: token.marginLG,
      textAlign: "center",
      width: "100%",
    },
    forgotPassword: {
      float: "right",
    },
    header: {
      marginBottom: token.marginXL,
    },
    section: {
      alignItems: "center",
      display: "flex",
      height: screens.sm ? "100vh" : "auto",
      padding: screens.md ? `${token.sizeXXL}px 0px` : "0px",
    },
    text: {
      color: token.colorTextSecondary,
    },
    title: {
      fontSize: screens.md ? token.fontSizeHeading2 : token.fontSizeHeading3,
      color: token.colorTextBase,
    },
    link: {
      textDecoration: "underline",
      color: token.colorTextSecondary,
      fontWeight: 700,
    },
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Image src="https://img.icons8.com/fluent/48/000000/conference-call.png" />

          <Title style={styles.title}>Sign in</Title>
          <Text style={styles.text}>
            Welcome back to Meeting App! Please enter your details below to sign
            in.
          </Text>
        </div>
        <Form
          name="normal_login"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="email"
            rules={[
              {
                type: "email",
                required: true,
                message: "Please input your Email!",
              },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: "0px" }}>
            <Button
              block="true"
              type="primary"
              htmlType="submit"
              disabled={isLoggingIn}
            >
              Log in
            </Button>
            <div style={styles.footer}>
              <Text style={styles.text}>Don't have an account?</Text>{" "}
              <Link to="/register" style={styles.link}>
                Sign up now
              </Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}
