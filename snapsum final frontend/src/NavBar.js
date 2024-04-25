import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { get_playlist, get_video_list } from "./api/useApi";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "30ch",
      "&:focus": {
        width: "30ch",
      },
    },
  },
}));

export default function NavBar({ setUrl, setIsPlaylist, setList, setLoading }) {
  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      setUrl(e.target.value);
      setIsPlaylist(e.target.value.includes("?list"));
      if (e.target.value.includes("?list")) {
        setUrl(e.target.value.substring(0, e.target.value.indexOf("?list")));
        const list = await get_video_list(e.target.value);
        setList(list);
        const res = await get_playlist(e.target.value, setLoading);
      }
      e.target.value = "";
    }
  };

  return (
    <Box sx={{ marginBottom: "0.5em" }}>
      <AppBar sx={{ bgcolor: "black" }} position="static">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" sx={{ marginLeft: "0.5em" }}>
            SnapSum
          </Typography>
          <Toolbar>
            <Search onKeyDown={handleSearch}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Enter YouTube video link"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          </Toolbar>
        </Box>
      </AppBar>
    </Box>
  );
}
