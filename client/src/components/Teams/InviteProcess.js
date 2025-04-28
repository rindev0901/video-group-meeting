import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Result, Button, Spin, Typography, Card } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text, Paragraph } = Typography;

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
`;

const StyledCard = styled(Card)`
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

export default function InviteProcess() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const teamId = searchParams.get("team_id");
  // Get userId from URL params or query params (for backward compatibility)
  const userId = params.userId || searchParams.get("userId");

  useEffect(() => {
    const processInvite = async () => {
      if (!teamId || !userId) {
        setStatus("error");
        setMessage("Invalid invitation link. No token provided.");
        setLoading(false);
        return;
      }

      try {
        // Process the invitation
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/teams/${teamId}/add-member`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(isAuthenticated && {
                Authorization: `Bearer ${user?.access_token}`,
              }),
            },
            body: JSON.stringify({
              user_id: userId,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "You have successfully joined the team!");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to process invitation.");
        }
      } catch (error) {
        console.error("Error processing invitation:", error);
        setStatus("error");
        setMessage("Error connecting to server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Only process if the user is authenticated
    if (isAuthenticated) {
      processInvite();
    }
  }, [userId, isAuthenticated, user, teamId]);

  // Render different states
  if (loading) {
    return (
      <Container>
        <StyledCard>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 24, color: "#000000" }}>
              Processing invitation...
            </Title>
          </div>
        </StyledCard>
      </Container>
    );
  }

  if (status === "login") {
    return (
      <Container>
        <StyledCard>
          <Result
            icon={<TeamOutlined style={{ color: "#000000" }} />}
            title={
              <span style={{ color: "#000000" }}>Sign in to join the team</span>
            }
            subTitle="You need to sign in or create an account to accept this invitation"
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => navigate("/login")}
                style={{ backgroundColor: "#000000", borderColor: "#000000" }}
              >
                Sign in
              </Button>,
              <Button key="register" onClick={() => navigate("/register")}>
                Create Account
              </Button>,
            ]}
          />
        </StyledCard>
      </Container>
    );
  }

  if (status === "success") {
    return (
      <Container>
        <StyledCard>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: "#000000" }} />}
            title={
              <span style={{ color: "#000000" }}>Invitation Accepted!</span>
            }
            subTitle={message}
            extra={[
              <Button
                type="primary"
                key="team"
                onClick={() => navigate(`/team/${teamId}`)}
                style={{ backgroundColor: "#000000", borderColor: "#000000" }}
              >
                Go to Team
              </Button>,
              <Button key="teams" onClick={() => navigate("/teams")}>
                View All Teams
              </Button>,
            ]}
          />
        </StyledCard>
      </Container>
    );
  }

  return (
    <Container>
      <StyledCard>
        <Result
          status="error"
          icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
          title={<span style={{ color: "#000000" }}>Invitation Error</span>}
          subTitle={message}
          extra={[
            <Button
              type="primary"
              key="teams"
              onClick={() => navigate("/teams")}
              style={{ backgroundColor: "#000000", borderColor: "#000000" }}
            >
              Go to Teams
            </Button>,
          ]}
        />
      </StyledCard>
    </Container>
  );
}
