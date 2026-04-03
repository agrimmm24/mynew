import os
import re

log_path = r"C:\Users\Lenovo\.gemini\antigravity\brain\0515feed-dd74-477e-ae7e-1da12f6c0b57\.system_generated\logs\overview.txt"
output_path = r"c:\Users\Lenovo\Downloads\SERVICE\admin\adminfront\src\pages\AdminDash.tsx"

if not os.path.exists(log_path):
    print("Log file not found")
    exit(1)

with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

recovered_lines = {}
capture = False

for line in lines:
    if "File Path: `file:///c:/Users/Lenovo/Downloads/SERVICE/admin/adminfront/src/pages/AdminDash.tsx`" in line:
        pass
    
    # Identify lines like "1: import { useState "
    match = re.match(r"^(\d+):\s(.*)", line)
    if match:
        line_num = int(match.group(1))
        content = match.group(2)
        
        # In logs, I viewed 1-800, then 800-1113 in another turn. 
        # This will incrementally capture all of them.
        recovered_lines[line_num] = content

if recovered_lines:
    with open(output_path, "w", encoding="utf-8") as f:
        for i in range(1, max(recovered_lines.keys()) + 1):
            if i in recovered_lines:
                f.write(recovered_lines[i] + "\n")
            else:
                f.write("\n")
    print(f"Successfully recovered {len(recovered_lines)} lines of AdminDash.tsx")
else:
    print("Could not find AdminDash.tsx lines in the log.")
