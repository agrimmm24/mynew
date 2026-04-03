import os
import re

target_files = [
    os.path.join("src", "pages", "AdminDash.tsx"),
    os.path.join("src", "pages", "AdminLogin.tsx")
]

for file_path in target_files:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Typography & Edges
    content = content.replace("rounded-[3rem]", "rounded-md border-r border-b border-red-900/40")
    content = content.replace("rounded-[2.5rem]", "rounded-md border-r border-b border-red-900/40")
    content = content.replace("rounded-3xl", "rounded-md")
    content = content.replace("rounded-2xl", "rounded-none")
    content = content.replace("rounded-xl", "rounded-none")
    content = content.replace("rounded-full", "rounded-sm")
    content = content.replace("font-sans", "font-mono")
    content = content.replace("font-inter", "")
    content = content.replace("italic", "")
    content = content.replace("font-black", "font-bold")

    # Dark Blood Red Theme Backgrounds
    content = content.replace("bg-[#06070a]", "bg-[#030000] bg-[linear-gradient(to_right,#3f0000_1px,transparent_1px),linear-gradient(to_bottom,#3f0000_1px,transparent_1px)] bg-[size:24px_24px]")
    content = content.replace("bg-[#0a0b10]", "bg-[#030000] bg-[linear-gradient(to_right,#3f0000_1px,transparent_1px),linear-gradient(to_bottom,#3f0000_1px,transparent_1px)] bg-[size:24px_24px]")
    content = content.replace("bg-white/[0.02]", "bg-red-950/20")
    content = content.replace("bg-white/[0.03]", "bg-red-950/30")
    content = content.replace("bg-white/[0.01]", "bg-red-950/10")
    
    # Borders
    content = content.replace("border-white/[0.05]", "border-red-900/50")
    content = content.replace("border-white/5", "border-red-900/50")
    content = content.replace("border-white/10", "border-red-900")
    content = content.replace("hover:border-red-600/30", "hover:border-red-500")

    # Texts
    content = content.replace("text-gray-500", "text-red-300/80")
    content = content.replace("text-gray-400", "text-red-200")
    content = content.replace("text-gray-600", "text-red-400/50")
    
    # Red accents -> Deeper Red base
    content = content.replace("bg-red-600", "bg-red-800 border border-red-500")
    content = content.replace("text-red-600", "text-red-500")
    
    
    # Contrast Colors: Cyan & Amber
    content = content.replace("emerald", "cyan")
    content = content.replace("emerald-500", "cyan-400")
    content = content.replace("emerald-400", "cyan-300")
    
    # Chart gradients Cyan
    content = content.replace("from-red-600/20 to-red-600", "from-cyan-900/50 to-cyan-500")
    # Role distribution chart Amber
    content = content.replace("bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]", "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]")

    # Blurs
    content = content.replace("blur-[160px]", "blur-[40px]")
    content = content.replace("blur-[140px]", "blur-[40px]")
    content = content.replace("blur-[80px]", "blur-[20px]")
    content = content.replace("blur-[100px]", "blur-[20px]")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Successfully refactored {file_path}")
