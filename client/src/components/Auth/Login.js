import React, { useEffect, useState } from "react";

import {
  Button,
  Divider,
  Form,
  Grid,
  Image,
  Input,
  message,
  Spin,
  theme,
  Typography,
} from "antd";

import {
  GithubOutlined,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export default function Login() {
  const { token } = useToken();
  const screens = useBreakpoint();
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  console.log(process.env.NODE_ENV);

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
      const data = await res.json();
      console.log("loginResponse:::", data);

      if (!res.ok || !data.success) throw new Error(data?.message);

      login(data?.data);

      navigate("/");
    } catch (error) {
      console.error("Server error:::", error);
      message.error(error?.message ?? "Something went wrong!");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);

    try {
      // Redirect to Google OAuth endpoint
      window.open(
        `${process.env.REACT_APP_BE_BASE_URL}/auth/google/redirect`,
        "googleLogin",
        "width=500,height=600"
      );
    } catch (error) {
      console.error("Google login error:", error);
      message.error("Failed to connect with Google. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    // Lắng nghe sự kiện 'message' từ popup

    const handleCallbackSocial = (event) => {
      if (event.origin !== process.env.REACT_APP_BE_BASE_URL) return; // Kiểm tra nguồn

      const socialLoginData = JSON.parse(event.data);

      login(socialLoginData.data);

      navigate("/");
    };

    window.addEventListener("message", handleCallbackSocial);

    return () => {
      window.removeEventListener("message", handleCallbackSocial);
    };
  }, []);

  const handleGithubLogin = async () => {
    setIsLoggingIn(true);
    try {
      setIsLoggingIn(true);

      // Redirect to Google OAuth endpoint
      window.open(
        `${process.env.REACT_APP_BE_BASE_URL}/auth/github/redirect`,
        "googleLogin",
        "width=500,height=600"
      );
    } catch (error) {
      console.error("GitHub login error:", error);
      message.error("Failed to connect with GitHub. Please try again.");
      setIsLoggingIn(false);
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
    socialButton: {
      width: "100%",
      marginBottom: token.marginSM,
    },
    socialButtonsContainer: {
      marginBottom: token.marginMD,
    },
    divider: {
      margin: `${token.marginMD}px 0`,
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
          disabled={isLoggingIn}
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
              loading={isLoggingIn}
              disabled={isLoggingIn}
            >
              Log in
            </Button>
            <Divider style={styles.divider}>or</Divider>

            <div style={styles.socialButtonsContainer}>
              <Button
                type="default"
                icon={<GoogleOutlined />}
                style={styles.socialButton}
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
              >
                Continue with Google
              </Button>
              <Button
                type="default"
                icon={<GithubOutlined />}
                style={styles.socialButton}
                onClick={handleGithubLogin}
                disabled={isLoggingIn}
              >
                Continue with GitHub
              </Button>
            </div>
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
