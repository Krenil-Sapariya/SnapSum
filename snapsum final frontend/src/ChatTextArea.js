import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { DotPulse } from "@uiball/loaders";
import "./chatTextArea.css";
import { get_answer, get_summary } from "./api/useApi";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import CircularProgress from "@mui/material/CircularProgress";

export default function ChatTextArea({ playerRef, isPlaylist, loading, setUrl, url }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loader, setLoader] = useState(null);
  const messagesEndRef = useRef(null);

  const handleJumpToTime = (jumpToTime) => {
    playerRef.current.seekTo(jumpToTime);
  };

  const handleSend = () => {
    if (message !== "") {
      setMessages((prev) => [...prev, message]);
      setMessage("");
    }
  };
  const delay = ms => new Promise(res => setTimeout(res, ms));

  const handleEnter = async (e) => {
    if (message !== "" && e.key === "Enter") {
      setMessages((prev) => [...prev, message]);
      setMessage("");
      setLoader(<DotPulse size={40} speed={1.3} color="white" />);
      const answer = await get_answer(message, isPlaylist);
      setLoader(null);
      setMessages((prev) => [...prev, answer.answer]);
      if (answer.ref_time !== -1) {
        console.log("hiiii");
        if(isPlaylist) {
          await setUrl(`https://www.youtube.com/watch?v=${answer.video_id}`)
        }
        await delay(3000);
        handleJumpToTime(parseInt(answer.ref_time));
      }
    }
  };

  const handleSummary = async () => {
    setMessages((prev) => [...prev, "I'm coming up with a summary..."]);
    setLoader(<DotPulse size={40} speed={1.3} color="white" />);
    const summary = await get_summary();
    setLoader(null);
    setMessages((prev) => [...prev, summary]);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div>
      <Box sx={{ marginLeft: "1em" }}>
        {loading ? (
          <Box sx={{display: "flex", alignItems: "center", width: "22em", justifyContent: "space-between"}}>
          <CircularProgress color="secondary" />
          Please wait while we're getting things ready...
          </Box>
          
        ) : (
          <>
            <Box
              id="list"
              sx={{
                height: "75vh",
                width: "50vw",
                backgroundColor: "#000000cc",
                borderRadius: "16px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  height: "98%",
                }}
              >
                <ul
                  style={{
                    overflow: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#ffffff #000000cc",
                    WebkitScrollbarWidth: "thin",
                    WebkitScrollbarColor: "#ffffff #000000cc",
                  }}
                >
                  {messages.map((message, index) => (
                    <li
                      key={index}
                      style={{ color: "white", listStyleType: "none" }}
                    >
                      <Box sx={{ display: "flex" }}>
                        {index % 2 === 1 ? (
                          <SmartToyIcon
                            sx={{
                              marginLeft: "-30px",
                              marginRight: "9px",
                              marginTop: "3px",
                            }}
                          />
                        ) : (
                          <PersonIcon
                            sx={{
                              marginLeft: "-30px",
                              marginRight: "9px",
                              marginTop: "4px",
                            }}
                          />
                        )}
                        <Typography variant="h6">{message}</Typography>
                      </Box>
                      {index % 2 === 1 && (
                        <>
                          <br />
                          <br />
                        </>
                      )}
                    </li>
                  ))}
                  <div ref={messagesEndRef} />
                </ul>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  {loader}
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: "0.5em",
                backgroundColor: "#000000cc",
                borderRadius: "16px",
                height: "9.3em",
              }}
            >
              <TextField
                multiline
                rows={2}
                onKeyDown={handleEnter}
                disabled={loader}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="standard"
                sx={{
                  margin: "1em",

                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "gray",
                  },
                  "& .MuiInputBase-input": {
                    overflow: "auto",
                    color: "white",
                  },
                }}
                InputProps={{
                  disableUnderline: true,
                }}
                placeholder="Ask any Question"
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "auto",
                  marginBottom: "0.8em",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "20%",
                    marginLeft: "0.8em",
                  }}
                >
                  <Button
                    onClick={handleSummary}
                    disabled={loader}
                    variant="contained"
                    sx={{
                      backgroundColor: "grey",
                      "&:hover": {
                        backgroundColor: "grey",
                        cursor: "pointer",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "gray",
                      },
                    }}
                  >
                    Summary                    
                  </Button>
                </Box>
                <Button
                  variant="contained"
                  disabled={loader}
                  sx={{
                    backgroundColor: "purple",
                    marginRight: "1em",
                    "&:hover": {
                      backgroundColor: "purple",
                      cursor: "pointer",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "purple",
                    },
                  }}
                  onClick={handleSend}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </div>
  );
}
