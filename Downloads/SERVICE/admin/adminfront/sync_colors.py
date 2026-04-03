import os
import re

target_files = [
    os.path.join("src", "pages", "AdminDash.tsx"),
    os.path.join("src", "pages", "AdminLogin.tsx")
]

for file_path in target_files:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove the massive red ambient background blurs
    content = re.sub(
        r'<div className="absolute inset-0 pointer-events-none[^>]*>[\s\S]*?</div>\s*</div>',
        '', 
        content
    )
    content = re.sub(
        r'<div className="fixed inset-0 pointer-events-none [^>]*>[\s\S]*?</div>\s*</div>',
        '', 
        content
    )
    
    # Also just specifically nuke the two divs if regex fails
    content = re.sub(r'<div className="absolute top-\[-10%\] left-\[-10%\].*?</div>', '', content)
    content = re.sub(r'<div className="absolute bottom-\[-10%\] right-\[-10%\].*?</div>', '', content)
    content = re.sub(r'<div className="absolute top-\[10%\] left-\[20%\].*?</div>', '', content)
    content = re.sub(r'<div className="absolute bottom-\[20%\] right-\[10%\].*?</div>', '', content)
    
    # 2. Change card background colors and border colors to match Workshop Dash
    content = content.replace("bg-white/[0.02]", "bg-[#111218]")
    content = content.replace("bg-white/[0.01]", "bg-[#111218]")
    content = content.replace("bg-[#0a0b10]", "bg-[#0a0b10]") # Should already be there
    content = content.replace("bg-[#06070a]", "bg-[#0a0b10]")
    
    content = content.replace("border-white/[0.05]", "border-gray-800")
    content = content.replace("border-white/[0.1]", "border-gray-800")
    content = content.replace("border-white/10", "border-gray-800")
    content = content.replace("border-white/5", "border-gray-700")

    # 3. Change generic luxury styling inputs
    content = content.replace("bg-white/[0.03]", "bg-gray-900 border-gray-800")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Patched strings in {file_path}")
