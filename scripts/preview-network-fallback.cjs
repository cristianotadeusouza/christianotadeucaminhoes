const os = require("node:os");

try {
  os.networkInterfaces();
} catch {
  // Ambientes restritos podem bloquear uv_interface_addresses. Vite/Miniflare
  // precisam apenas de uma interface local válida para selecionar a porta.
  os.networkInterfaces = () => ({
    loopback: [
      {
        address: "127.0.0.1",
        netmask: "255.0.0.0",
        family: "IPv4",
        mac: "00:00:00:00:00:00",
        internal: true,
        cidr: "127.0.0.1/8",
      },
    ],
  });
}
