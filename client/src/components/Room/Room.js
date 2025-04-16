import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import styled from "styled-components";
import socket from "../../socket";
import VideoCard from "../Video/VideoCard";
import BottomBar from "../BottomBar/BottomBar";
import Chat from "../Chat/Chat";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { message } from "antd";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [peers, setPeers] = useState([]);
  const [userVideoAudio, setUserVideoAudio] = useState({
    localUser: { video: true, audio: true },
  });
  const [videoDevices, setVideoDevices] = useState([]);
  const [displayChat, setDisplayChat] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [showVideoDevices, setShowVideoDevices] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const peersRef = useRef([]);
  const userVideoRef = useRef();
  const screenTrackRef = useRef();
  const userStream = useRef();

  const startMediaDevices = async () => {
    try {
      // First try to get both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      handleSuccess(stream);
    } catch (e) {
      console.log("Failed to get both video and audio:", e);
      try {
        // If that fails, try just audio
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        handleSuccess(stream);
        setUserVideoAudio((prev) => ({
          ...prev,
          localUser: { ...prev.localUser, video: false },
        }));
        message.warning("Could not access camera. Joining with audio only.");
      } catch (e) {
        console.log("Failed to get audio:", e);
        try {
          // If that fails too, try just video
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          handleSuccess(stream);
          setUserVideoAudio((prev) => ({
            ...prev,
            localUser: { ...prev.localUser, audio: false },
          }));
          message.warning(
            "Could not access microphone. Joining with video only."
          );
        } catch (e) {
          console.log("Failed to get any media devices:", e);
          setMediaError(true);
          message.error(
            "Could not access any media devices. Please check your permissions."
          );
          // Optionally navigate back
          // navigate('/');
        }
      }
    }
  };

  const handleSuccess = (stream) => {
    userVideoRef.current.srcObject = stream;
    userStream.current = stream;

    socket.emit("BE-join-room", { roomId, userName: currentUser.name });
  };

  useEffect(() => {
    // Get available video devices
    const getVideoDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const filtered = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setVideoDevices(filtered);
      } catch (e) {
        console.log("Error getting video devices:", e);
        setVideoDevices([]);
      }
    };

    getVideoDevices();
    startMediaDevices();

    // Socket event listeners
    socket.on("FE-user-join", (users) => {
      const peers = [];
      users.forEach(({ userId, info }) => {
        let { userName, video, audio } = info;

        if (userName !== currentUser.name) {
          const peer = createPeer(userId, socket.id, userStream.current);
          peer.userName = userName;
          peer.peerID = userId;

          peersRef.current.push({
            peerID: userId,
            peer,
            userName,
          });
          peers.push(peer);

          setUserVideoAudio((preList) => ({
            ...preList,
            [peer.userName]: { video, audio },
          }));
        }
      });
      setPeers(peers);
    });

    socket.on("FE-receive-call", ({ signal, from, info }) => {
      let { userName, video, audio } = info;
      const peerIdx = findPeer(from);

      if (!peerIdx) {
        const peer = addPeer(signal, from, userStream.current);

        peer.userName = userName;

        peersRef.current.push({
          peerID: from,
          peer,
          userName: userName,
        });
        setPeers((users) => {
          return [...users, peer];
        });
        setUserVideoAudio((preList) => {
          return {
            ...preList,
            [peer.userName]: { video, audio },
          };
        });
      }
    });

    socket.on("FE-call-accepted", ({ signal, answerId }) => {
      const peerIdx = findPeer(answerId);
      peerIdx.peer.signal(signal);
    });

    socket.on("FE-user-leave", ({ userId, userName }) => {
      const peerIdx = findPeer(userId);
      peerIdx?.peer.destroy();
      setPeers((users) => {
        users = users.filter((user) => user.peerID !== peerIdx?.peer.peerID);
        return [...users];
      });
      peersRef.current = peersRef.current.filter(
        ({ peerID }) => peerID !== userId
      );
    });

    socket.on("FE-toggle-camera", ({ userId, switchTarget }) => {
      const peerIdx = findPeer(userId);
      if (!peerIdx) return;

      setUserVideoAudio((preList) => {
        let video = preList[peerIdx.userName].video;
        let audio = preList[peerIdx.userName].audio;

        if (switchTarget === "video") video = !video;
        else audio = !audio;

        return {
          ...preList,
          [peerIdx.userName]: { video, audio },
        };
      });
    });

    return () => {
      // Cleanup
      userStream.current?.getTracks().forEach((track) => track.stop());
      socket.disconnect();
    };
  }, [roomId, currentUser]);

  function createPeer(userId, caller, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("BE-call-user", {
        userToCall: userId,
        from: caller,
        signal,
      });
    });
    peer.on("disconnect", () => {
      peer.destroy();
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("BE-accept-call", { signal, to: callerId });
    });

    peer.on("disconnect", () => {
      peer.destroy();
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
  }

  function createUserVideo(peer, index, arr) {
    return (
      <VideoBox
        className={`width-peer${peers.length > 8 ? "" : peers.length}`}
        onClick={expandScreen}
        key={index}
      >
        {writeUserName(peer.userName)}
        <FaIcon className="fas fa-expand" />
        <VideoCard key={index} peer={peer} number={arr.length} />
      </VideoBox>
    );
  }

  function writeUserName(userName, index) {
    if (userVideoAudio.hasOwnProperty(userName)) {
      if (!userVideoAudio[userName].video) {
        return <UserName key={userName}>{userName}</UserName>;
      }
    }
  }

  // Open Chat
  const clickChat = (e) => {
    e.stopPropagation();
    setDisplayChat(!displayChat);
  };

  // BackButton
  const goToBack = (e) => {
    e.preventDefault();
    socket.emit("BE-leave-room", { roomId, leaver: currentUser.name });
    sessionStorage.removeItem("user");
    navigate("/");
  };

  const toggleCameraAudio = (e) => {
    const target = e.target.getAttribute("data-switch");

    setUserVideoAudio((preList) => {
      let videoSwitch = preList["localUser"].video;
      let audioSwitch = preList["localUser"].audio;

      if (target === "video") {
        const userVideoTrack =
          userVideoRef.current.srcObject.getVideoTracks()[0];
        videoSwitch = !videoSwitch;
        userVideoTrack.enabled = videoSwitch;
      } else {
        const userAudioTrack =
          userVideoRef.current.srcObject.getAudioTracks()[0];
        audioSwitch = !audioSwitch;

        if (userAudioTrack) {
          userAudioTrack.enabled = audioSwitch;
        } else {
          userStream.current.getAudioTracks()[0].enabled = audioSwitch;
        }
      }

      return {
        ...preList,
        localUser: { video: videoSwitch, audio: audioSwitch },
      };
    });

    socket.emit("BE-toggle-camera-audio", { roomId, switchTarget: target });
  };

  const clickScreenSharing = () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];

          peersRef.current.forEach(({ peer }) => {
            // replaceTrack (oldTrack, newTrack, oldStream);
            peer.replaceTrack(
              peer.streams[0]
                .getTracks()
                .find((track) => track.kind === "video"),
              screenTrack,
              userStream.current
            );
          });

          // Listen click end
          screenTrack.onended = () => {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                screenTrack,
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === "video"),
                userStream.current
              );
            });
            userVideoRef.current.srcObject = userStream.current;
            setScreenShare(false);
          };

          userVideoRef.current.srcObject = stream;
          screenTrackRef.current = screenTrack;
          setScreenShare(true);
        });
    } else {
      screenTrackRef.current.onended();
    }
  };

  const expandScreen = (e) => {
    const elem = e.target;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };

  const clickBackground = () => {
    if (!showVideoDevices) return;

    setShowVideoDevices(false);
  };

  const clickCameraDevice = async (event) => {
    try {
      if (event?.target?.dataset?.value) {
        const deviceId = event.target.dataset.value;
        const currentAudioTrack =
          userVideoRef.current.srcObject.getAudioTracks()[0];
        const enabledAudio = currentAudioTrack
          ? currentAudioTrack.enabled
          : false;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
          audio: enabledAudio,
        });

        const newStreamTrack = stream
          .getTracks()
          .find((track) => track.kind === "video");
        const oldStreamTrack = userStream.current
          .getTracks()
          .find((track) => track.kind === "video");

        if (oldStreamTrack) {
          userStream.current.removeTrack(oldStreamTrack);
          oldStreamTrack.stop();
        }

        userStream.current.addTrack(newStreamTrack);

        peersRef.current.forEach(({ peer }) => {
          peer.replaceTrack(oldStreamTrack, newStreamTrack, userStream.current);
        });

        userVideoRef.current.srcObject = userStream.current;
      }
    } catch (e) {
      console.log("Error switching camera:", e);
      message.error("Failed to switch camera. Please try again.");
    }
  };

  return (
    <RoomContainer onClick={clickBackground}>
      <VideoAndBarContainer>
        <VideoContainer>
          {mediaError ? (
            <ErrorMessage>
              Could not access media devices. Please check your camera and
              microphone permissions.
            </ErrorMessage>
          ) : (
            <>
              {/* Current User Video */}
              <VideoBox
                className={`width-peer${peers.length > 8 ? "" : peers.length}`}
              >
                {userVideoAudio["localUser"].video ? null : (
                  <UserName>{currentUser.name}</UserName>
                )}
                <FaIcon className="fas fa-expand" />
                <MyVideo
                  onClick={expandScreen}
                  ref={userVideoRef}
                  muted
                  autoPlay
                  playInline
                ></MyVideo>
              </VideoBox>
              {/* Joined User Videos */}
              {peers &&
                peers.map((peer, index, arr) =>
                  createUserVideo(peer, index, arr)
                )}
            </>
          )}
        </VideoContainer>
        <BottomBar
          clickScreenSharing={clickScreenSharing}
          clickChat={clickChat}
          clickCameraDevice={clickCameraDevice}
          goToBack={goToBack}
          toggleCameraAudio={toggleCameraAudio}
          userVideoAudio={userVideoAudio["localUser"]}
          screenShare={screenShare}
          videoDevices={videoDevices}
          showVideoDevices={showVideoDevices}
          setShowVideoDevices={setShowVideoDevices}
          disabled={mediaError}
        />
      </VideoAndBarContainer>
      <Chat display={displayChat} roomId={roomId} />
    </RoomContainer>
  );
};

const RoomContainer = styled.div`
  display: flex;
  width: 100%;
  max-height: 100vh;
  flex-direction: row;
`;

const VideoContainer = styled.div`
  max-width: 100%;
  height: 92%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;
  gap: 10px;
`;

const VideoAndBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`;

const MyVideo = styled.video``;

const VideoBox = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  > video {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  :hover {
    > i {
      display: block;
    }
  }
`;

const UserName = styled.div`
  position: absolute;
  font-size: calc(20px + 5vmin);
  z-index: 1;
`;

const FaIcon = styled.i`
  display: none;
  position: absolute;
  right: 15px;
  top: 15px;
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  text-align: center;
  padding: 20px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  margin: 20px;
`;

export default Room;
