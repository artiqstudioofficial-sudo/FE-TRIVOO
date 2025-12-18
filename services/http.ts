import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true, // ✅ WAJIB: kirim/terima cookie session (sid)
});

export default http;
