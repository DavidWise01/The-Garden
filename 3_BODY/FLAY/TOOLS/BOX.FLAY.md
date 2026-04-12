import os, sys, subprocess, socket
print(os.name, sys.version)
try:
    print(subprocess.run(["cat", "/etc/os-release"], capture_output=True).stdout.decode())
except: pass
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    print(s.getsockname()[0])
except: pass
