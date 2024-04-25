import { Box } from "@mui/material";
import React, { useRef, useState } from "react";
import YoutubePlayer from "./YoutubePlayer";
import NavBar from "./NavBar";
import Loader from "./Loader";
import ChatTextArea from "./ChatTextArea";
import Typography from "@mui/material/Typography";

function Home() {
  const [url, setUrl] = useState("");
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const playerRef = useRef(null);

  return (
    <Box>
      <NavBar
        setUrl={setUrl}
        setIsPlaylist={setIsPlaylist}
        setList={setList}
        setLoading={setLoading}
      />
      <Box sx={{ display: "flex" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "50%",
            width: "50%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            {url && (
              <YoutubePlayer
                playerRef={playerRef}
                url={url}
                setUrl={setUrl}
                isPlaylist={isPlaylist}
                list={list}
                setLoading={setLoading}
              />
            )}
          </Box>
        </Box>
        <Box>
          <ChatTextArea
            playerRef={playerRef}
            isPlaylist={isPlaylist}
            loading={loading}
            url={url}
            setUrl={setUrl}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
