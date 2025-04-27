import React, { useState } from "react";

import {
  Button,
  Form,
  Grid,
  Image,
  Input,
  message,
  Upload,
  theme,
  Typography,
  Avatar,
} from "antd";

import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

// Function to check if a file is an image and under 2MB
const beforeUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message.error("You can only upload image files!");
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must be smaller than 2MB!");
  }

  return isImage && isLt2M;
};

export default function Register() {
  const { token } = useToken();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [isSignIn, setIsSignIn] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }

    if (info.file.status === "removed") {
      setAvatar(null);
      setAvatarUrl(null);
      setLoading(false);
      return;
    }

    const file = info.file.originFileObj;
    setAvatar(file);

    // Get the preview URL for the image
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setAvatarUrl(reader.result);
        setLoading(false);
      });
      reader.readAsDataURL(file);
    }
  };

  const onFinish = async (values) => {
    setIsSignIn(true);

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("password_confirmation", values.password_confirmation);

      // Append avatar if it exists
      if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/auth/register`,
        {
          method: "POST",
          body: formData,
          // No Content-Type header, browser will set it with proper boundary
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
      width: "350px",
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
    avatarUploader: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: token.marginMD,
    },
    avatarButton: {
      border: `1px dashed ${token.colorBorderSecondary}`,
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
    },
    avatar: {
      width: "100px",
      height: "100px",
    },
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

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
          <Form.Item name="avatar" label="Profile Picture">
            <div style={styles.avatarUploader}>
              <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleAvatarChange}
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess("ok");
                  }, 0);
                }}
              >
                {avatarUrl ? (
                  <Avatar
                    src={avatarUrl}
                    alt="avatar"
                    size={100}
                    style={styles.avatar}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </div>
          </Form.Item>

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
