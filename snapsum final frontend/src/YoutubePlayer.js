import { Box, Typography, Tab, Tabs, Link } from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import YouTube from "react-youtube";
import { get_transcript } from "./api/useApi";
import Loader from "./Loader";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";

const YoutubePlayer = ({
  url,
  setUrl,
  isPlaylist,
  list,
  playerRef,
  setLoading,
}) => {

  // console.log('--------------', list, isPlaylist);
  // const playerRef = useRef(null);
  const [transcript, setTranscript] = useState([]);
  const [jumpToTime, setJumpToTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [value, setValue] = useState(0);
  const [title, setTitle] = useState("");
  const [isCaption, setIsCaption] = useState(false);

  const handleChange = (event, number) => {
    setValue(number);
  };

  const videoId = url.split("=")[1];

  const opts = {
    height: "470em",
    width: "100%",
  };

  const handlePlayerReady = async (event) => {
    setTitle(event.target.getVideoData().title);
    playerRef.current = event.target;
    playerRef.current.loadVideoById(videoId);
    playerRef.current.setVolume(100);

    const [transcript, isCaption] = await get_transcript(
      url,
      isPlaylist,
      setLoading
    );
    setIsCaption(isCaption);
    setTranscript(transcript);
  };

  const handleJumpToTime = () => {
    playerRef.current.seekTo(jumpToTime);
  };

  const handleJumpToTimeChange = (event) => {
    setJumpToTime(parseInt(event.target.value));
  };

  const handleVideoChange = async (id, title) => {
    console.log(id, title);
    playerRef.current.loadVideoById(id);
    playerRef.current.setVolume(100);
    setTitle(title);
    setUrl(`https://www.youtube.com/watch?v=${id}`);
  };

  transcript?.map((item, index) => {
    if (
      item.start <= currentTime &&
      currentTime <= item.start + item.duration
    ) {
      const element = document.getElementById(index);
      if (element) {
        element.style.color = "red";
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    } else {
      const element = document.getElementById(index);
      if (element) {
        element.style.color = "black";
      }
    }
  });
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      {videoId ? (
        <YouTube videoId={videoId} opts={opts} onReady={handlePlayerReady} />
      ) 
      :(
        list.length>0 ? <YouTube videoId={list[0]['id']} opts={opts} onReady={handlePlayerReady} /> 
        :
          (
            <Typography
              sx={{
                fontSize: "1.6em",
                display: "flex",
                justifyContent: "center",
                marginTop: "50%",
              }}
            >
              Enter YouTube Url
            </Typography>
          )
      )
      }
      {/* <input
        type="number"
        value={jumpToTime}
        onChange={handleJumpToTimeChange}
      /> */}
      {/* <button onClick={handleJumpToTime}>Jump to time</button> */}
      {isPlaylist && (
        <Tabs value={value} onChange={handleChange}>
          <Tab
            icon={<PlaylistPlayIcon />}
            label="PLAYLIST"
            iconPosition="start"
            index={0}
          />
          <Tab
            icon={<ClosedCaptionIcon />}
            label="TRANSCRIPT"
            iconPosition="start"
            index={1}
          />
        </Tabs>
      )}
      <Box
        sx={{
          height: isPlaylist ? "33vh" : "41vh",
          overflowY: "auto",
          overflowX: "hidden",
          marginTop: "1em",
        }}
      >
        {isPlaylist && value === 0 ? (
          list?.map((item) => {
            console.log(list)
            return (
              <Link
                href="#"
                onClick={() => handleVideoChange(item.id, item.title)}
                underline="none"
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.5em",
                  }}
                >
                  <OndemandVideoIcon sx={{ marginLeft: "0.5em" }} />
                  <Typography
                    sx={{
                      color: title === item.title ? "red" : "black",
                      marginLeft: "0.6em",
                    }}
                    variant="h6"
                  >
                    {item.title}
                  </Typography>
                </Box>
              </Link>
            );
          })
        ) : transcript?.length === 0 ? (
          <>
            <Loader />
            <Loader />
            <Loader />
            <Loader />
          </>
        ) : (
          <>
            {isCaption
              ? transcript?.map((i, index) => {
                  if (index % 2 === 0) {
                    return (
                      <div>
                        <Typography id={index} variant="h6">
                          {index + 1 < transcript.length &&
                            i["text"] + " " + transcript[index + 1]["text"]}
                        </Typography>
                      </div>
                    );
                  } else {
                    return <></>;
                  }
                })
              : transcript?.map((i, index) => {
                  return (
                    <div>
                      <Typography id={index} variant="h6">
                        {i["text"]}
                      </Typography>
                    </div>
                  );
                })}
          </>
        )}
      </Box>
    </>
  );
};

export default YoutubePlayer;
