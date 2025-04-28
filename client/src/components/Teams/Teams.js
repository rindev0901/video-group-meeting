import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Avatar,
  Button,
  Tooltip,
  Modal,
  Form,
  Input,
  Divider,
  Empty,
  Spin,
  message,
} from "antd";
import {
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  MoreOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;

// Delete mock data completely

// Styled components
const TeamCard = styled(Card)`
  height: 300px;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const TeamCardHeader = styled.div`
  height: 100px;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TeamCardBody = styled.div`
  padding: 16px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TeamName = styled(Title)`
  color: white !important;
  margin-bottom: 4px !important;
`;

const MemberAvatar = styled(Avatar)`
  margin-right: -8px;
  border: 2px solid white;
`;

const TeamFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DateText = styled(Text)`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export default function Teams() {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const { user } = useAuth();

  // Fetch teams data when component mounts
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/teams`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.access_token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.data)) {
          setTeams(data.data);
        } else {
          // Just show empty UI, no fallback to mock data
          setTeams([]);
          // Show error message from API if available
          if (data.message) {
            message.error(data.message);
          } else {
            message.error("Failed to fetch teams");
          }
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeams([]);
        message.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [user]);

  // Functions to handle team operations
  const handleOpenTeam = (teamId) => {
    navigate(`/team/${teamId}`);
  };

  const showCreateTeamModal = () => {
    setIsModalVisible(true);
  };

  const handleCreateTeam = async (values) => {
    setAddLoading(true);

    try {
      // Make an API call to create a team
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/teams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.access_token}`,
          },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Add the new team to the list
        setTeams([...teams, data.data]);
        setIsModalVisible(false);
        form.resetFields();
        message.success(data.message || "Team created successfully");
      } else {
        message.error(data.message || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      message.error("Error connecting to server");
    } finally {
        setAddLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          My Teams
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateTeamModal}
          size="large"
          style={{ background: "#000000", borderColor: "#000000" }}
        >
          Create Team
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : teams.length > 0 ? (
        <Row gutter={[24, 24]}>
          {teams.map((team) => (
            <Col xs={24} sm={12} md={8} lg={6} key={team.id}>
              <TeamCard
                hoverable
                onClick={() => handleOpenTeam(team.id)}
                bodyStyle={{ padding: 0, height: "100%" }}
                style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
              >
                <TeamCardHeader
                  style={{
                    backgroundColor: "#000000",
                    backgroundImage: `linear-gradient(to right, #000000, #222222)`,
                  }}
                >
                  <TeamName level={4}>{team.name}</TeamName>
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    style={{ color: "white" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add menu actions here
                    }}
                  />
                </TeamCardHeader>
                <TeamCardBody>
                  <div>
                    <Text type="secondary">Team Members</Text>
                    <div style={{ marginTop: "8px" }}>
                      {team.users && team.users.length > 0 ? (
                        <Avatar.Group maxCount={3}>
                          {team.users.map((user) => (
                            <Tooltip title={user.name} key={user.id}>
                              <MemberAvatar
                                src={user.avatar}
                                icon={!user.avatar && <UserOutlined />}
                                style={{
                                  backgroundColor: "#000000",
                                  color: "white",
                                }}
                              >
                                {user.name
                                  ? user.name.charAt(0).toUpperCase()
                                  : "U"}
                              </MemberAvatar>
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                      ) : (
                        <Text type="secondary">No members yet</Text>
                      )}
                    </div>
                  </div>

                  <TeamFooter>
                    <DateText type="secondary">
                      <CalendarOutlined /> {formatDate(team.created_at)}
                    </DateText>
                    <Tooltip title="View Team">
                      <Button
                        type="text"
                        icon={<TeamOutlined />}
                        style={{ color: "#000000" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTeam(team.id);
                        }}
                      />
                    </Tooltip>
                  </TeamFooter>
                </TeamCardBody>
              </TeamCard>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description="No teams found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: "48px 0" }}
        >
          <Button
            type="primary"
            onClick={showCreateTeamModal}
            style={{ background: "#000000", borderColor: "#000000" }}
          >
            Create Your First Team
          </Button>
        </Empty>
      )}

      {/* Create Team Modal */}
      <Modal
        title={<span style={{ color: "#000000" }}>Create New Team</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTeam}>
          <Form.Item
            name="name"
            label="Team Name"
            rules={[{ required: true, message: "Please input the team name!" }]}
          >
            <Input placeholder="Enter team name" />
          </Form.Item>

          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea placeholder="Enter team description" rows={4} />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setIsModalVisible(false)}
            >
              Cancel
            </Button>
            <Button
              htmlType="submit"
              loading={addLoading}
              style={{ background: "#000000", borderColor: "#000000" }}
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
