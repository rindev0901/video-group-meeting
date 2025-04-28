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
  Collapse,
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
  FileTextOutlined,
  EditFilled,
  LockOutlined,
  UnlockOutlined,
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

// Helper to determine if a note belongs to the current user
const isCurrentUserNote = (note, currentUser) => {
  return note.user?.id === currentUser?.id;
};

// Helper to determine if a note belongs to the team owner
const isTeamOwnerNote = (note, team) => {
  return note.user?.id === team?.owner?.id;
};

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
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

  // Add state for editing meeting
  const [editMeetingModalVisible, setEditMeetingModalVisible] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [editMeetingForm] = Form.useForm();

  // Add state for deleting meeting
  const [deletingMeetingId, setDeletingMeetingId] = useState(null);

  // Add state for meeting details and notes
  const [meetingDetails, setMeetingDetails] = useState({});

  // Add state for note editing
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteForm] = Form.useForm();
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Add state for new note
  const [newNoteForm] = Form.useForm();
  const [addingNote, setAddingNote] = useState(false);
  const [creatingNote, setCreatingNote] = useState(false);

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
          // Initially set meetings from team data
          if (data.data.meetings) {
            setMeetings(data.data.meetings);
          }
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

  // Function to fetch team meetings
  const fetchTeamMeetings = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/teams/${teamId}/meetings`,
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
        setMeetings(data.data);
      } else {
        console.error("Failed to fetch meetings:", data.message);
      }
    } catch (error) {
      console.error("Error fetching team meetings:", error);
    }
  };

  const handleInviteUser = async (values) => {
    setInviteLoading(true);
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
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreateMeeting = async (values) => {
    try {
      // Format the meeting data according to the required structure
      const meetingData = {
        team_id: parseInt(teamId),
        title: values.title,
        scheduled_at: values.date,
        description: values.description || "",
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/meetings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
          body: JSON.stringify(meetingData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message || `Meeting "${values.title}" created`);
        setNewMeetingModalVisible(false);
        meetingForm.resetFields();

        // Add the new meeting to the list
        if (data.data) {
          setMeetings([...meetings, data.data]);
        }
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
        `${process.env.REACT_APP_API_BASE_URL}/teams/${teamId}/remove-user/${userId}`,
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
    // If roomId is not provided, generate one based on meeting ID and team ID
    if (!roomId) {
      return;
    }
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

  // Function to handle meeting update
  const handleUpdateMeeting = async (values) => {
    try {
      // Format the meeting data according to the required structure
      const meetingData = {
        title: values.title,
        scheduled_at: values.scheduled_at,
        description: values.description || "",
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/meetings/${currentMeeting.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
          body: JSON.stringify(meetingData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message || `Meeting "${values.title}" updated`);
        setEditMeetingModalVisible(false);
        editMeetingForm.resetFields();

        // Update the meeting in the local state
        if (data.data) {
          setMeetings(
            meetings.map((meeting) =>
              meeting.id === currentMeeting.id ? data.data : meeting
            )
          );
        }
      } else {
        message.error(data?.data || data.message || "Failed to update meeting");
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      message.error("Error connecting to server");
    }
  };

  // Function to open the edit meeting modal
  const handleEditMeeting = (meeting) => {
    setCurrentMeeting(meeting);
    editMeetingForm.setFieldsValue({
      title: meeting.title,
      scheduled_at: meeting.scheduled_at,
      description: meeting.description || "",
    });
    setEditMeetingModalVisible(true);
  };

  // Function to handle meeting deletion
  const handleDeleteMeeting = async (meetingId) => {
    setDeletingMeetingId(meetingId);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/meetings/${meetingId}`,
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
        message.success(data.message || "Meeting deleted successfully");

        // Remove the deleted meeting from the local state
        setMeetings(meetings.filter((meeting) => meeting.id !== data.data));
      } else {
        message.error(data?.data || data.message || "Failed to delete meeting");
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      message.error("Error connecting to server");
    } finally {
      setDeletingMeetingId(null);
    }
  };

  // Function to fetch meeting details including notes
  const fetchMeetingDetails = async (meetingId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/meetings/${meetingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Store meeting details in state
        const meetingData = data.data;
        // If the API response format has changed to include meeting and user_notes separately
        if (meetingData.meeting && meetingData.user_notes) {
          setMeetingDetails((prevDetails) => ({
            ...prevDetails,
            [meetingId]: {
              ...meetingData.meeting,
              user_notes: meetingData.user_notes,
            },
          }));
        } else {
          // Original format
          setMeetingDetails((prevDetails) => ({
            ...prevDetails,
            [meetingId]: data.data,
          }));
        }
        return data.data;
      } else {
        console.error("Failed to fetch meeting details:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      return null;
    }
  };

  // Function to handle note update
  const handleUpdateNote = async (noteId, meetingId) => {
    setIsUpdatingNote(true);
    try {
      const values = await noteForm.validateFields();

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/notes/${noteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
          body: JSON.stringify({
            content: values.content,
            is_public: values.is_public,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message || "Note updated successfully");

        // Update the note in local state
        setMeetingDetails((prevDetails) => {
          const updatedMeeting = { ...prevDetails[meetingId] };
          updatedMeeting.user_notes = updatedMeeting.user_notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  content: values.content,
                  is_public: values.is_public,
                  updated_at: new Date().toISOString(),
                }
              : note
          );

          return {
            ...prevDetails,
            [meetingId]: updatedMeeting,
          };
        });

        // Reset editing state
        setEditingNoteId(null);
      } else {
        message.error(data.message || "Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      message.error("Error connecting to server");
    } finally {
      setIsUpdatingNote(false);
    }
  };

  // Function to handle note deletion
  const handleDeleteNote = async (noteId, meetingId) => {
    setIsDeletingNote(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/notes/${noteId}`,
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
        message.success(data.message || "Note deleted successfully");

        // Remove the deleted note from local state
        setMeetingDetails((prevDetails) => {
          const updatedMeeting = { ...prevDetails[meetingId] };
          updatedMeeting.user_notes = updatedMeeting.user_notes.filter(
            (note) => note.id !== noteId
          );

          return {
            ...prevDetails,
            [meetingId]: updatedMeeting,
          };
        });
      } else {
        message.error(data.message || "Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      message.error("Error connecting to server");
    } finally {
      setIsDeletingNote(false);
    }
  };

  // Function to handle note creation
  const handleCreateNote = async (meetingId) => {
    setCreatingNote(true);
    try {
      const values = await newNoteForm.validateFields();

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
          body: JSON.stringify({
            meeting_id: meetingId,
            content: values.content,
            is_public: values.is_public || false,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message || "Note created successfully");

        // Add the new note to the meeting in local state
        if (data.data) {
          setMeetingDetails((prevDetails) => {
            const updatedMeeting = { ...prevDetails[meetingId] };

            // Ensure user_notes is initialized as an array
            if (!updatedMeeting.user_notes) {
              updatedMeeting.user_notes = [];
            }

            // Add the new note with user info
            updatedMeeting.user_notes.push({
              ...data.data,
              user: currentUser,
            });

            return {
              ...prevDetails,
              [meetingId]: updatedMeeting,
            };
          });
        }

        // Reset form and state
        newNoteForm.resetFields();
        setAddingNote(false);
      } else {
        message.error(data.message || "Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      message.error("Error connecting to server");
    } finally {
      setCreatingNote(false);
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
                title={
                  <span style={{ color: "#faad14" }}>Delete this team?</span>
                }
                description={
                  <span style={{ color: "#faad14" }}>
                    This action cannot be undone. All team data will be
                    permanently removed.
                  </span>
                }
                onConfirm={handleDeleteTeam}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{
                  loading: deletingTeam,
                  danger: true,
                  style: { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" },
                }}
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  style={{ boxShadow: "none" }}
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
                          onClick={() => joinMeeting(meeting.code)}
                          style={{
                            backgroundColor: "#000000",
                            borderColor: "#000000",
                          }}
                        >
                          Join
                        </Button>,
                        isOwner && (
                          <Button
                            type="default"
                            icon={<EditOutlined />}
                            onClick={() => handleEditMeeting(meeting)}
                          >
                            Edit
                          </Button>
                        ),
                        isOwner && (
                          <Popconfirm
                            title={
                              <span style={{ color: "#faad14" }}>
                                Delete this meeting?
                              </span>
                            }
                            description={
                              <span style={{ color: "#faad14" }}>
                                This action cannot be undone.
                              </span>
                            }
                            onConfirm={() => handleDeleteMeeting(meeting.id)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{
                              loading: deletingMeetingId === meeting.id,
                              danger: true,
                              style: {
                                backgroundColor: "#ff4d4f",
                                borderColor: "#ff4d4f",
                              },
                            }}
                          >
                            <Button
                              type="default"
                              style={{ boxShadow: "none" }}
                              danger
                              icon={<DeleteOutlined />}
                              loading={deletingMeetingId === meeting.id}
                            >
                              Delete
                            </Button>
                          </Popconfirm>
                        ),
                      ].filter(Boolean)}
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
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Text>
                              {formatDate(meeting.scheduled_at)} at{" "}
                              {formatTime(meeting.scheduled_at)}
                            </Text>
                            <Text type="secondary">
                              Created by {meeting.created_by || team.owner.name}
                            </Text>
                            {meeting.description && (
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                {meeting.description}
                              </Text>
                            )}

                            {/* Notes Collapse Section */}
                            <Collapse
                              bordered={false}
                              style={{ background: "#f9f9f9", marginTop: 10 }}
                              expandIcon={({ isActive }) => (
                                <FileTextOutlined rotate={isActive ? 90 : 0} />
                              )}
                              onChange={() => {
                                // Fetch meeting details if not already loaded
                                if (!meetingDetails[meeting.id]) {
                                  fetchMeetingDetails(meeting.id);
                                }
                              }}
                            >
                              <Collapse.Panel
                                header={
                                  <span
                                    style={{ color: "#000", fontWeight: 700 }}
                                  >
                                    Meeting Notes
                                  </span>
                                }
                                key="1"
                              >
                                {!meetingDetails[meeting.id] ? (
                                  <Skeleton active paragraph={{ rows: 2 }} />
                                ) : (
                                  <>
                                    {/* Add Note Form */}
                                    {addingNote ? (
                                      <Form
                                        form={newNoteForm}
                                        style={{ marginBottom: 16 }}
                                        initialValues={{
                                          content: "",
                                          is_public: isOwner,
                                        }}
                                        onFinish={() =>
                                          handleCreateNote(meeting.id)
                                        }
                                      >
                                        <Form.Item
                                          name="content"
                                          rules={[
                                            {
                                              required: true,
                                              message:
                                                "Note content cannot be empty",
                                            },
                                          ]}
                                          style={{ marginBottom: 8 }}
                                        >
                                          <Input.TextArea
                                            autoFocus
                                            rows={2}
                                            placeholder="Type your note here..."
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          name="is_public"
                                          valuePropName="checked"
                                          style={{ marginBottom: 8 }}
                                        >
                                          <Tooltip
                                            title="When public, all team members can see this note"
                                            color="#000"
                                          >
                                            <span>
                                              <Input.Group compact>
                                                <Button
                                                  icon={
                                                    newNoteForm.getFieldValue(
                                                      "is_public"
                                                    ) ? (
                                                      <UnlockOutlined />
                                                    ) : (
                                                      <LockOutlined />
                                                    )
                                                  }
                                                  onClick={() => {
                                                    const currentValue =
                                                      newNoteForm.getFieldValue(
                                                        "is_public"
                                                      );
                                                    newNoteForm.setFieldValue(
                                                      "is_public",
                                                      !currentValue
                                                    );
                                                  }}
                                                  style={{
                                                    borderRadius: "4px 0 0 4px",
                                                    backgroundColor:
                                                      newNoteForm.getFieldValue(
                                                        "is_public"
                                                      )
                                                        ? "#87d068"
                                                        : "#f5f5f5",
                                                    borderColor:
                                                      newNoteForm.getFieldValue(
                                                        "is_public"
                                                      )
                                                        ? "#87d068"
                                                        : "#d9d9d9",
                                                    color:
                                                      newNoteForm.getFieldValue(
                                                        "is_public"
                                                      )
                                                        ? "#fff"
                                                        : "rgba(0, 0, 0, 0.45)",
                                                  }}
                                                  size="small"
                                                />
                                                <Button
                                                  style={{
                                                    borderRadius: "0 4px 4px 0",
                                                    marginLeft: "-1px",
                                                    backgroundColor:
                                                      newNoteForm.getFieldValue(
                                                        "is_public"
                                                      )
                                                        ? "#87d068"
                                                        : "#f5f5f5",
                                                    borderColor:
                                                      newNoteForm.getFieldValue(
                                                        "is_public"
                                                      )
                                                        ? "#87d068"
                                                        : "#d9d9d9",
                                                    color:
                                                      newNoteForm.getFieldValue(
                                                        "is_public"
                                                      )
                                                        ? "#fff"
                                                        : "rgba(0, 0, 0, 0.45)",
                                                  }}
                                                  size="small"
                                                >
                                                  {newNoteForm.getFieldValue(
                                                    "is_public"
                                                  )
                                                    ? "Public"
                                                    : "Private"}
                                                </Button>
                                              </Input.Group>
                                            </span>
                                          </Tooltip>
                                        </Form.Item>
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 8,
                                          }}
                                        >
                                          <Button
                                            size="small"
                                            onClick={() => setAddingNote(false)}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            type="primary"
                                            size="small"
                                            htmlType="submit"
                                            loading={creatingNote}
                                            style={{
                                              backgroundColor: "#000000",
                                              borderColor: "#000000",
                                            }}
                                          >
                                            Add Note
                                          </Button>
                                        </div>
                                      </Form>
                                    ) : (
                                      <Button
                                        type="dashed"
                                        block
                                        onClick={() => setAddingNote(true)}
                                        style={{ marginBottom: 16 }}
                                        icon={<FileTextOutlined />}
                                      >
                                        Add Note
                                      </Button>
                                    )}

                                    {/* Note List */}
                                    {meetingDetails[meeting.id].user_notes &&
                                    meetingDetails[meeting.id].user_notes
                                      .length > 0 ? (
                                      <List
                                        size="small"
                                        dataSource={
                                          meetingDetails[meeting.id].user_notes
                                        }
                                        style={{
                                          maxHeight: "300px",
                                          overflowY: "auto",
                                          padding: "0 5px",
                                          border: "1px solid #f0f0f0",
                                          borderRadius: "4px",
                                        }}
                                        renderItem={(note) => (
                                          <List.Item
                                            actions={[
                                              <Button
                                                type="text"
                                                icon={<EditFilled />}
                                                size="small"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setEditingNoteId(note.id);
                                                  noteForm.setFieldsValue({
                                                    content: note.content,
                                                    is_public: note.is_public,
                                                  });
                                                }}
                                                style={{ color: "#1890ff" }}
                                              />,
                                              <Popconfirm
                                                title={
                                                  <span
                                                    style={{ color: "#000" }}
                                                  >
                                                    Delete this note?
                                                  </span>
                                                }
                                                description={
                                                  <span
                                                    style={{ color: "#000" }}
                                                  >
                                                    This action cannot be
                                                    undone.
                                                  </span>
                                                }
                                                onConfirm={() =>
                                                  handleDeleteNote(
                                                    note.id,
                                                    meeting.id
                                                  )
                                                }
                                                okText="Delete"
                                                cancelText="Cancel"
                                                okButtonProps={{
                                                  loading: isDeletingNote,
                                                  danger: true,
                                                }}
                                              >
                                                <Button
                                                  type="text"
                                                  icon={<DeleteOutlined />}
                                                  size="small"
                                                  style={{ color: "#ff4d4f" }}
                                                />
                                              </Popconfirm>,
                                            ]}
                                          >
                                            {editingNoteId === note.id ? (
                                              <Form
                                                form={noteForm}
                                                style={{ width: "100%" }}
                                                initialValues={{
                                                  content: note.content,
                                                  is_public: note.is_public,
                                                }}
                                                onFinish={() =>
                                                  handleUpdateNote(
                                                    note.id,
                                                    meeting.id
                                                  )
                                                }
                                              >
                                                <Form.Item
                                                  name="content"
                                                  rules={[
                                                    {
                                                      required: true,
                                                      message:
                                                        "Note content cannot be empty",
                                                    },
                                                  ]}
                                                  style={{ marginBottom: 8 }}
                                                >
                                                  <Input.TextArea
                                                    autoFocus
                                                    rows={2}
                                                    onPressEnter={(e) => {
                                                      if (!e.shiftKey) {
                                                        e.preventDefault();
                                                        handleUpdateNote(
                                                          note.id,
                                                          meeting.id
                                                        );
                                                      }
                                                    }}
                                                  />
                                                </Form.Item>
                                                <Form.Item
                                                  name="is_public"
                                                  valuePropName="checked"
                                                  style={{ marginBottom: 8 }}
                                                >
                                                  <Tooltip
                                                    title="When public, all team members can see this note"
                                                    color="#000"
                                                  >
                                                    <span>
                                                      <Input.Group compact>
                                                        <Button
                                                          icon={
                                                            noteForm.getFieldValue(
                                                              "is_public"
                                                            ) ? (
                                                              <UnlockOutlined />
                                                            ) : (
                                                              <LockOutlined />
                                                            )
                                                          }
                                                          onClick={() => {
                                                            const currentValue =
                                                              noteForm.getFieldValue(
                                                                "is_public"
                                                              );
                                                            noteForm.setFieldValue(
                                                              "is_public",
                                                              !currentValue
                                                            );
                                                          }}
                                                          style={{
                                                            borderRadius:
                                                              "4px 0 0 4px",
                                                            backgroundColor:
                                                              noteForm.getFieldValue(
                                                                "is_public"
                                                              )
                                                                ? "#87d068"
                                                                : "#f5f5f5",
                                                            borderColor:
                                                              noteForm.getFieldValue(
                                                                "is_public"
                                                              )
                                                                ? "#87d068"
                                                                : "#d9d9d9",
                                                            color:
                                                              noteForm.getFieldValue(
                                                                "is_public"
                                                              )
                                                                ? "#fff"
                                                                : "rgba(0, 0, 0, 0.45)",
                                                          }}
                                                          size="small"
                                                        />
                                                        <Button
                                                          style={{
                                                            borderRadius:
                                                              "0 4px 4px 0",
                                                            marginLeft: "-1px",
                                                            backgroundColor:
                                                              noteForm.getFieldValue(
                                                                "is_public"
                                                              )
                                                                ? "#87d068"
                                                                : "#f5f5f5",
                                                            borderColor:
                                                              noteForm.getFieldValue(
                                                                "is_public"
                                                              )
                                                                ? "#87d068"
                                                                : "#d9d9d9",
                                                            color:
                                                              noteForm.getFieldValue(
                                                                "is_public"
                                                              )
                                                                ? "#fff"
                                                                : "rgba(0, 0, 0, 0.45)",
                                                          }}
                                                          size="small"
                                                        >
                                                          {noteForm.getFieldValue(
                                                            "is_public"
                                                          )
                                                            ? "Public"
                                                            : "Private"}
                                                        </Button>
                                                      </Input.Group>
                                                    </span>
                                                  </Tooltip>
                                                </Form.Item>
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                    gap: 8,
                                                  }}
                                                >
                                                  <Button
                                                    size="small"
                                                    onClick={() =>
                                                      setEditingNoteId(null)
                                                    }
                                                  >
                                                    Cancel
                                                  </Button>
                                                  <Button
                                                    type="primary"
                                                    size="small"
                                                    htmlType="submit"
                                                    loading={isUpdatingNote}
                                                    style={{
                                                      backgroundColor:
                                                        "#000000",
                                                      borderColor: "#000000",
                                                    }}
                                                  >
                                                    Save
                                                  </Button>
                                                </div>
                                              </Form>
                                            ) : (
                                              <Text
                                                style={{
                                                  width: "100%",
                                                  color: "#000",
                                                  textAlign: "left",
                                                }}
                                              >
                                                {note.content}
                                                <div>
                                                  <Text
                                                    type="secondary"
                                                    style={{
                                                      fontSize: "12px",
                                                      color: "#000",
                                                    }}
                                                  >
                                                    {formatDate(
                                                      note.created_at
                                                    )}{" "}
                                                    <Text
                                                      style={{
                                                        display: "inline-block",
                                                        padding: "0 5px",
                                                        fontSize: "11px",
                                                        borderRadius: "3px",
                                                        background:
                                                          isTeamOwnerNote(
                                                            note,
                                                            team
                                                          )
                                                            ? "#f56a00"
                                                            : isCurrentUserNote(
                                                                note,
                                                                currentUser
                                                              )
                                                            ? "#1890ff"
                                                            : "#87d068",
                                                        color: "#fff",
                                                        marginLeft: "5px",
                                                      }}
                                                    >
                                                      {isTeamOwnerNote(
                                                        note,
                                                        team
                                                      )
                                                        ? "Owner"
                                                        : isCurrentUserNote(
                                                            note,
                                                            currentUser
                                                          )
                                                        ? "You"
                                                        : "User"}
                                                    </Text>
                                                    {!note.is_public && (
                                                      <Text
                                                        style={{
                                                          display:
                                                            "inline-block",
                                                          padding: "0 5px",
                                                          fontSize: "11px",
                                                          borderRadius: "3px",
                                                          background: "#ff7875",
                                                          color: "#fff",
                                                          marginLeft: "5px",
                                                        }}
                                                      >
                                                        <LockOutlined
                                                          style={{
                                                            fontSize: "10px",
                                                          }}
                                                        />{" "}
                                                        Private
                                                      </Text>
                                                    )}
                                                    {note.user &&
                                                      !isCurrentUserNote(
                                                        note,
                                                        currentUser
                                                      ) && (
                                                        <Text
                                                          type="secondary"
                                                          style={{
                                                            fontSize: "11px",
                                                            marginLeft: "5px",
                                                            color: "#000",
                                                          }}
                                                        >
                                                          by {note.user.name}
                                                        </Text>
                                                      )}
                                                  </Text>
                                                </div>
                                              </Text>
                                            )}
                                          </List.Item>
                                        )}
                                      />
                                    ) : (
                                      <Text type="secondary">
                                        No notes available
                                      </Text>
                                    )}
                                  </>
                                )}
                              </Collapse.Panel>
                            </Collapse>
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
        title={
          <span style={{ color: "#000000", fontWeight: "bold" }}>
            Invite Member
          </span>
        }
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleInviteUser}>
          <Form.Item
            name="email"
            label={<span style={{ color: "#000000" }}>Email Address</span>}
            rules={[
              { required: true, message: "Please input email address!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="message"
            label={
              <span style={{ color: "#000000" }}>
                Personal Message (optional)
              </span>
            }
          >
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
              loading={inviteLoading}
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
        title={
          <span style={{ color: "#000000", fontWeight: "bold" }}>
            Schedule Meeting
          </span>
        }
        open={newMeetingModalVisible}
        onCancel={() => setNewMeetingModalVisible(false)}
        footer={null}
      >
        <Form
          form={meetingForm}
          layout="vertical"
          onFinish={handleCreateMeeting}
          initialValues={{
            title: "",
            date: "",
            description: "",
          }}
        >
          <Form.Item
            name="title"
            label={<span style={{ color: "#000000" }}>Meeting Title</span>}
            rules={[{ required: true, message: "Please input meeting title!" }]}
          >
            <Input placeholder="Enter meeting title" />
          </Form.Item>

          <Form.Item
            name="date"
            label={<span style={{ color: "#000000" }}>Date & Time</span>}
            rules={[
              { required: true, message: "Please select date and time!" },
            ]}
            tooltip="Format: YYYY-MM-DD HH:MM:SS"
          >
            <Input type="datetime-local" placeholder="YYYY-MM-DD HH:MM:SS" />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span style={{ color: "#000000" }}>Description (optional)</span>
            }
          >
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

      {/* Edit Meeting Modal */}
      <Modal
        title={
          <span style={{ color: "#000000", fontWeight: "bold" }}>
            Edit Meeting
          </span>
        }
        open={editMeetingModalVisible}
        onCancel={() => setEditMeetingModalVisible(false)}
        footer={null}
      >
        <Form
          form={editMeetingForm}
          layout="vertical"
          onFinish={handleUpdateMeeting}
          initialValues={{
            title: currentMeeting?.title || "",
            scheduled_at: currentMeeting?.scheduled_at || "",
            description: currentMeeting?.description || "",
          }}
        >
          <Form.Item
            name="title"
            label={<span style={{ color: "#000000" }}>Meeting Title</span>}
            rules={[{ required: true, message: "Please input meeting title!" }]}
          >
            <Input placeholder="Enter meeting title" />
          </Form.Item>

          <Form.Item
            name="scheduled_at"
            label={<span style={{ color: "#000000" }}>Date & Time</span>}
            rules={[
              { required: true, message: "Please select date and time!" },
            ]}
            tooltip="Format: YYYY-MM-DD HH:MM:SS"
          >
            <Input type="datetime-local" placeholder="YYYY-MM-DD HH:MM:SS" />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span style={{ color: "#000000" }}>Description (optional)</span>
            }
          >
            <Input.TextArea placeholder="Add meeting description" rows={3} />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setEditMeetingModalVisible(false)}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#000000", borderColor: "#000000" }}
            >
              Update Meeting
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
