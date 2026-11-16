import axios from 'axios';

const localApiOrigin = 'http://localhost:5000';
const apiOrigin = (process.env.REACT_APP_API_ORIGIN || localApiOrigin).replace(/\/+$/, '');

// The same-origin Godot iframe reads this when it initializes its HTTP and Socket.IO clients.
window.apecGameApiOrigin = apiOrigin;

export default axios.create({ baseURL: apiOrigin });
