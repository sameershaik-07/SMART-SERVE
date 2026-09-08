const http = require("http");
const app = require("./app");
const { initSocket } = require("./config/socket");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.io with the HTTP server
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.io initialized for real-time messaging on port ${PORT}`);
});