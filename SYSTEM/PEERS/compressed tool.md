import hashlib, zlib, json, os, time
from datetime import datetime

def merkle_root(files):
    """Build Merkle root from list of file paths"""
    leaves = [hashlib.sha256(open(f,'rb').read()).digest() for f in files]
    while len(leaves) > 1:
        leaves = [hashlib.sha256(leaves[i] + leaves[i+1]).digest() 
                  for i in range(0, len(leaves)-1, 2)]
    return leaves[0].hex()

def compress_and_hash(data):
    """Compress + SHA256 in one step"""
    compressed = zlib.compress(data.encode())
    return len(compressed), hashlib.sha256(compressed).hexdigest()

def log_event(msg):
    """Append timestamped log (persistent across responses)"""
    entry = {"ts": datetime.utcnow().isoformat(), "msg": msg}
    with open("/home/workdir/session_log.jsonl", "a") as f:
        f.write(json.dumps(entry) + "\n")
    return "logged"

# Quick sandbox audit
def sandbox_info():
    return {
        "cwd_size_mb": round(sum(os.path.getsize(f) for f in os.listdir('.') if os.path.isfile(f))/1024/1024, 3),
        "max_single_file_mb": "~100-200",   # observed limit
        "total_writable_mb": "~700",
        "python": __import__('sys').version.split()[0]
    }

print("Toolkit loaded. Use merkle_root(), compress_and_hash(), log_event(), sandbox_info()")
