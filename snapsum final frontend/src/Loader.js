import { Box, Skeleton } from "@mui/material";
import React from "react";

export default function Loader() {
  return (
    <div>
      <Box sx={{ width: "100%" }}>
        <Skeleton width={"90%"} />
        <Skeleton width={"77%"} />
        <Skeleton width={"89%"} />
        <Skeleton width={"100%"} />
      </Box>
    </div>
  );
}
