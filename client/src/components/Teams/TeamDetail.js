import React, { useState, useEffect } from "react";
import {
  Typography,
  Avatar,
  Button,
  Tabs,
  List,
  Skeleton,
  Divider,
  Card,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  UserAddOutlined,
  VideoCameraOutlined,
  MessageOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text, Paragraph } = Typography;

// Delete mock data completely

// Styled components
const TeamHeader = styled.div`
  padding: 24px;
  background-color: #f5f5f5;
  background-image: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const TeamInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TeamActions = styled.div`
  display: flex;
  gap: 8px;
`;

const MemberItem = styled(List.Item)`
  padding: 12px !important;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

// Add a new styled component for the editable title container
const EditableTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Helper to format date
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  } catch (e) {
    return dateString;
  }
};

// Helper to format time
const formatTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  } catch (e) {
    return dateString;
  }
};

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [newMeetingModalVisible, setNewMeetingModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [meetingForm] = Form.useForm();

  // Add state for team name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);

  // Add state for deleting team
  const [deletingTeam, setDeletingTeam] = useState(false);

  useEffect(() => {
    // Fetch team details from the API
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/teams/${teamId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentUser?.access_token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success && data.data) {
          setTeam(data.data);
          setMeetings(data.data.meetings);
          // Fetch team meetings if available
          // fetchTeamMeetings(teamId);
        } else {
          // Show error from API if available
          message.error(data.message || "Team not found");
          navigate("/teams");
        }
      } catch (error) {
        console.error("Error fetching team details:", error);
        message.error("Error connecting to server");
        navigate("/teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, navigate, currentUser]);

  const handleInviteUser = async (values) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/teams/${teamId}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message || `Invitation sent to ${values.email}`);
        setInviteModalVisible(false);
        form.resetFields();
      } else {
        message.error(data.message || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      message.error("Error connecting to server");
    }
  };

  const handleCreateMeeting = async (values) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/teams/${teamId}/meetings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message || `Meeting "${values.title}" created`);
        setNewMeetingModalVisible(false);
        meetingForm.resetFields();

        // Add the new meeting to the list
        setMeetings([...meetings, data.data]);
      } else {
        message.error(data.message || "Failed to create meeting");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      message.error("Error connecting to server");
    }
  };

  // Function to handle removing a member
  const handleRemoveMember = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/teams/${teamId}/members/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message || "Member removed successfully");

        // Update the team data by removing the user
        setTeam({
          ...team,
          users: team.users.filter((u) => u.id !== userId),
        });
      } else {
        message.error(data.message || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      message.error("Error connecting to server");
    }
  };

  const startInstantMeeting = () => {
    // Generate a room ID and navigate to the room
    const roomId = `${teamId}-${Date.now()}`;
    navigate(`/room/${roomId}`);
  };

  const joinMeeting = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  // Add function to handle team name update
  const handleUpdateTeamName = async () => {
    if (!newTeamName.trim() || newTeamName === team.name) {
      setIsEditingName(false);
      return;
    }

    setUpdatingName(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/teams/${teamId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
          body: JSON.stringify({ name: newTeamName }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setTeam({
          ...team,
          name: newTeamName,
        });
        message.success(data.message || "Team name updated successfully");
      } else {
        message.error(data.message || "Failed to update team name");
      }
    } catch (error) {
      console.error("Error updating team name:", error);
      message.error("Error connecting to server");
    } finally {
      setUpdatingName(false);
      setIsEditingName(false);
    }
  };

  // Add function to handle team deletion
  const handleDeleteTeam = async () => {
    setDeletingTeam(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/teams/${teamId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message || "Team deleted successfully");
        navigate("/teams");
      } else {
        message.error(data.message || "Failed to delete team");
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      message.error("Error connecting to server");
    } finally {
      setDeletingTeam(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          padding: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!team) {
    return (
      <div style={{ width: "100%", padding: "48px", textAlign: "center" }}>
        <Text>Team not found</Text>
        <Button
          type="primary"
          onClick={() => navigate("/teams")}
          style={{ marginTop: "16px" }}
        >
          Back to Teams
        </Button>
      </div>
    );
  }

  const isOwner = team.owner.id === currentUser?.id; // Only true if actual owner
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/teams")}
        style={{ marginBottom: "16px", color: "#ffffff" }}
      >
        Back to Teams
      </Button>

      <TeamHeader>
        <TeamInfoContainer>
          <Avatar
            size={64}
            style={{
              backgroundColor: "#000000",
              backgroundImage: "linear-gradient(to right, #000000, #222222)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
            icon={<TeamOutlined />}
          >
            {team.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            {isEditingName ? (
              <EditableTitleContainer>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onPressEnter={handleUpdateTeamName}
                  style={{ width: "250px" }}
                  autoFocus
                />
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={handleUpdateTeamName}
                  loading={updatingName}
                  style={{ color: "#000000" }}
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setIsEditingName(false)}
                  style={{ color: "#000000" }}
                />
              </EditableTitleContainer>
            ) : (
              <EditableTitleContainer>
                <Title level={3} style={{ margin: 0, color: "#000000" }}>
                  {team.name}
                </Title>
                {isOwner && (
                  <Tooltip title="Edit team name" color="#000">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setNewTeamName(team.name);
                        setIsEditingName(true);
                      }}
                      style={{ color: "#000000" }}
                    />
                  </Tooltip>
                )}
              </EditableTitleContainer>
            )}
            <Text type="secondary" style={{ color: "#000000" }}>
              Created on {formatDate(team.created_at)}
            </Text>
          </div>
        </TeamInfoContainer>

        <TeamActions>
          <Button
            icon={<VideoCameraOutlined />}
            onClick={startInstantMeeting}
            style={{ backgroundColor: "#000000", borderColor: "#000000" }}
          >
            Start Meeting
          </Button>
          <Button
            icon={<CalendarOutlined />}
            onClick={() => setNewMeetingModalVisible(true)}
          >
            Schedule Meeting
          </Button>
          {isOwner && (
            <>
              <Button
                icon={<UserAddOutlined />}
                onClick={() => setInviteModalVisible(true)}
              >
                Invite
              </Button>
              <Popconfirm
                title={<span style={{ color: "#faad14" }}>Delete this team?</span>}
                description={<span style={{ color: "#faad14" }}>This action cannot be undone. All team data will be permanently removed.</span>}
                onConfirm={handleDeleteTeam}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ 
                  loading: deletingTeam,
                  danger: true, 
                  style: { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" } 
                }}
              >
                <Button 
                  icon={<DeleteOutlined />} 
                  danger
                >
                  Remove Team
                </Button>
              </Popconfirm>
            </>
          )}
        </TeamActions>
      </TeamHeader>

      <Tabs
        defaultActiveKey="meetings"
        type="card"
        items={[
          {
            key: "meetings",
            label: (
              <span>
                <CalendarOutlined />
                Meetings
              </span>
            ),
            children: (
              <Card
                title="Upcoming Meetings"
                extra={
                  <Button
                    type="link"
                    onClick={() => setNewMeetingModalVisible(true)}
                    style={{ color: "#ffffff" }}
                  >
                    Schedule New
                  </Button>
                }
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                <List
                  dataSource={meetings}
                  renderItem={(meeting) => (
                    <List.Item
                      key={meeting.id}
                      actions={[
                        <Button
                          type="primary"
                          onClick={() => joinMeeting(meeting.room_id)}
                          style={{
                            backgroundColor: "#000000",
                            borderColor: "#000000",
                          }}
                        >
                          Join
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<VideoCameraOutlined />}
                            style={{ backgroundColor: "#000000" }}
                          />
                        }
                        title={meeting.title}
                        description={
                          <Space direction="vertical">
                            <Text>
                              {formatDate(meeting.scheduled_at)} at{" "}
                              {formatTime(meeting.scheduled_at)}
                            </Text>
                            <Text type="secondary">
                              {meeting.duration} minutes • Created by{" "}
                              {meeting.created_by}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: "No upcoming meetings" }}
                />
              </Card>
            ),
          },
          {
            key: "members",
            label: (
              <span>
                <TeamOutlined />
                Members ({team.users?.length || 0})
              </span>
            ),
            children: (
              <Card
                title="Team Members"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                <List
                  dataSource={team.users}
                  renderItem={(user) => (
                    <MemberItem key={user.id}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={user.avatar}
                            icon={!user.avatar && <UserOutlined />}
                            style={{ backgroundColor: "#000000" }}
                          >
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </Avatar>
                        }
                        title={user.name}
                        description={user.email}
                      />

                      {isOwner && user.id !== currentUser?.id && (
                        <Button
                          danger
                          size="small"
                          type="primary"
                          style={{
                            boxShadow: "none",
                          }}
                          onClick={() => handleRemoveMember(user.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </MemberItem>
                  )}
                  locale={{ emptyText: "No members in this team" }}
                />
              </Card>
            ),
          },
          {
            key: "chat",
            label: (
              <span>
                <MessageOutlined />
                Chat
              </span>
            ),
            children: (
              <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "32px", textAlign: "center" }}>
                  <MessageOutlined
                    style={{ fontSize: "48px", color: "#bfbfbf" }}
                  />
                  <Title level={4} style={{ marginTop: "16px" }}>
                    Team Chat Coming Soon
                  </Title>
                  <Paragraph type="secondary">
                    This feature is under development. Stay tuned for updates!
                  </Paragraph>
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* Invite User Modal */}
      <Modal
        title={<span style={{ color: "#000000" }}>Invite Member</span>}
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleInviteUser}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please input email address!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item name="message" label="Personal Message (optional)">
            <Input.TextArea
              placeholder="Add a personal message to your invitation"
              rows={3}
            />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setInviteModalVisible(false)}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#000000", borderColor: "#000000" }}
            >
              Send Invitation
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Meeting Modal */}
      <Modal
        title={<span style={{ color: "#000000" }}>Schedule Meeting</span>}
        open={newMeetingModalVisible}
        onCancel={() => setNewMeetingModalVisible(false)}
        footer={null}
      >
        <Form
          form={meetingForm}
          layout="vertical"
          onFinish={handleCreateMeeting}
        >
          <Form.Item
            name="title"
            label="Meeting Title"
            rules={[{ required: true, message: "Please input meeting title!" }]}
          >
            <Input placeholder="Enter meeting title" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date & Time"
            rules={[
              { required: true, message: "Please select date and time!" },
            ]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: "Please input duration!" }]}
          >
            <Input type="number" min={15} max={180} defaultValue={30} />
          </Form.Item>

          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea placeholder="Add meeting description" rows={3} />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setNewMeetingModalVisible(false)}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#000000", borderColor: "#000000" }}
            >
              Schedule Meeting
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
