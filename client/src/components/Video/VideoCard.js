import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
const VideoCard = (props) => {
  const ref = useRef();
  const peer = props.peer;

  useEffect(() => {
    peer.on('stream', (stream) => {
      ref.current.srcObject = stream;
    });
    peer.on('track', (track, stream) => {
    });
  }, [peer]);

  return (
    <Video
      playsInline
      autoPlay
      ref={ref}
    />
  );
};

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
  
  @media (max-width: 768px) {
    border-radius: 4px;
  }
  
  @media (max-width: 480px) {
    border-radius: 3px;
  }
`;

export default VideoCard;
