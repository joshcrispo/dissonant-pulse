import React from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

const Player = () => {
  const playerContainerStyles = {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
  };

  const audioPlayerStyles = {
    flex: 1,
    backgroundColor: "#1f1f1f",
    color: "#ffffff",
    border: "none",
    boxShadow: "none",
  };

  return (
    <div style={playerContainerStyles}>
      {/* Audio Player */}
      <AudioPlayer
        autoPlay={false}
        src="/Metamorphosis.mp3"
        onPlay={(e) => console.log("onPlay")}
        showSkipControls={true}
        showJumpControls={false}
        customAdditionalControls={[]}
        customVolumeControls={[]}
        style={audioPlayerStyles}
      />

      {/* Artist Information */}
      <div>
        <img
          src="/artist-photo.jpg" // Replace with the actual path to the artist's photo
          alt="Artist"
        />
        <h3>Artist Name</h3>
        <p>Song Title</p>
      </div>
    </div>
  );
};

export default Player;
