import axios from "axios";

const get_transcript = (url, isPlaylist, setLoading) => {

  return axios
    .post("http://127.0.0.1:8000/transcript/", {
      url: url,
      isPlaylist: isPlaylist,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

const get_summary = () => {
  return axios
    .get("http://127.0.0.1:8000/summary/")
    .then((response) => response.data);
};

const get_answer = (question, isPlaylist) => {
  return axios
    .post("http://127.0.0.1:8000/answer/", {
      question: question,
      isPlaylist: isPlaylist,
    })
    .then((response) => response.data);
};

const get_playlist = (url, setLoading) => {
  if (url !== "") {
    setLoading(true);
    return axios
      .post("http://127.0.0.1:8000/playlist/", {
        playlist_url: url,
      })
      .then((response) => {
        setLoading(false);
        return response.data;
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  } else {
    alert("Enter URL first");
  }
};

const get_video_list = (url) => {
  return axios
    .post("http:////127.0.0.1:8000/video-list/", {
      playlist_url: url,
    })
    .then((response) => response.data)
    .catch((error) => console.log(error));
};

export {
  get_transcript,
  get_summary,
  get_answer,
  get_playlist,
  get_video_list,
};
