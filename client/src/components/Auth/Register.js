import React, { useState } from "react";

import {
  Button,
  Form,
  Grid,
  Image,
  Input,
  message,
  Spin,
  theme,
  Typography,
} from "antd";

import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export default function Register() {
  const { token } = useToken();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [isSignIn, setIsSignIn] = useState(false);

  const onFinish = async (values) => {
    setIsSignIn(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/auth/register`,
        {
          method: "POST",
          body: JSON.stringify(values),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      console.log("registerResponse:::", data);

      if (!res.ok || !data.success) {
        if (data.data) {
          const errorContent = (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              {data.data.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          );
          message.error({
            content: errorContent,
            style: {
              marginTop: "20px",
            },
            duration: 5,
          });
          return;
        }
        throw new Error(data?.message || "Something went wrong!");
      }

      message.success(data.message);

      navigate("/login");
    } catch (error) {
      console.error("Server error:::", error);
      message.error(error?.message || "Something went wrong!");
    } finally {
      setIsSignIn(false);
    }
  };

  const styles = {
    container: {
      margin: "0 auto",
      padding: screens.md
        ? `${token.paddingXL}px`
        : `${token.sizeXXL}px ${token.sizeXXL}px`,
      width: "300px",
    },
    forgotPassword: {
      float: "right",
    },
    header: {
      marginBottom: token.marginXL,
      textAlign: "center",
    },
    section: {
      alignItems: "center",
      backgroundColor: token.colorBgContainer,
      display: "flex",
      height: screens.sm ? "100vh" : "auto",
      padding: screens.md ? `${token.sizeXXL}px 0px` : "0px",
    },
    signup: {
      marginTop: token.marginLG,
      textAlign: "center",
      width: "100%",
    },
    text: {
      color: token.colorTextSecondary,
    },
    title: {
      fontSize: screens.md ? token.fontSizeHeading2 : token.fontSizeHeading3,
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

          <Title style={styles.title}>Sign up</Title>
          <Text style={styles.text}>
            Join us! Create an account to get started.
          </Text>
        </div>
        <Form
          name="normal_signup"
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your Name!",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Name" />
          </Form.Item>
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
              {
                min: 6,
                message: "Password needs to be at least 6 characters.",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            name="password_confirmation"
            rules={[
              {
                required: true,
                message: "Please input your Password confirm!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "The password confirm that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
            dependencies={["password"]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password confirm"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: "0px" }}>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={isSignIn}
              disabled={isSignIn}
            >
              Sign up
            </Button>
            <div style={styles.signup}>
              <Text style={styles.text}>Already have an account?</Text>{" "}
              <Link style={styles.link} to="/login">
                Sign in
              </Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}
