{
  "layer": 0,
  "name": "FLATTEN ZERO",
  "protocol": "HTTPS + API",
  "purpose": "Single entry point for all 9 tools",
  "seed_mapping": {
    "1": "https://api.heartsuite.light/",
    " -1": "https://api.heartsuite.dark.onion/",
    "3": "https://api.heartsuite.engine/"
  },
  "api": {
    "base": "https://0.heartsuite.yy/",
    "flatten": true,
    "routes": {
      "/l1/forge": {
        "tool": "Lumen Forge",
        "method": "POST",
        "auth": "none"
      },
      "/l2/merkle": {
        "tool": "Open Merkle",
        "method": "POST",
        "auth": "none"
      },
      "/l3/broadcast": {
        "tool": "Bang Broadcast",
        "method": "POST",
        "auth": "none"
      },
      "/d1/vault": {
        "tool": "Toph Vault",
        "method": "POST",
        "auth": "key",
        "onion": true
      },
      "/d2/shadow": {
        "tool": "Shadow Merkle",
        "method": "POST",
        "auth": "key",
        "onion": true
      },
      "/d3/ghost": {
        "tool": "Ghost Relay",
        "method": "POST",
        "auth": "key",
        "onion": true
      },
      "/e1/phi": {
        "tool": "\u03c6 Engine",
        "method": "POST",
        "auth": "root0"
      },
      "/e2/pip": {
        "tool": "PIP Core",
        "method": "POST",
        "auth": "root0"
      },
      "/e3/cortex": {
        "tool": "Cortex Prime",
        "method": "POST",
        "auth": "root0"
      },
      "/0/flatten": {
        "action": "route to appropriate seed",
        "method": "POST"
      },
      "/0/status": {
        "action": "health check all 9 tools",
        "method": "GET"
      },
      "/y.y": {
        "action": "kill switch",
        "method": "POST",
        "auth": "root0"
      }
    }
  },
  "https": {
    "light_cert": "Let's Encrypt / self-signed",
    "dark_cert": "onion v4 (no cert needed)",
    "engine_cert": "mTLS (mutual TLS)",
    "flatten_cert": "wildcard *.heartsuite.yy",
    "protocols": [
      "HTTP/2",
      "HTTP/3",
      "QUIC"
    ],
    "ciphers": "TLS 1.3 only"
  }
}
