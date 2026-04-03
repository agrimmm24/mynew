const fs = require('fs');
const path = require('path');

const targetFiles = [
    path.join(__dirname, 'src', 'pages', 'AdminDash.tsx'),
    path.join(__dirname, 'src', 'pages', 'AdminLogin.tsx')
];

for (const file of targetFiles) {
    if (!fs.existsSync(file)) {
        console.warn(`File not found: ${file}`);
        continue;
    }

    let content = fs.readFileSync(file, 'utf-8');

    // 1. TYPOGRAPHY & SHAPES (Hard Edges, Monospace)
    content = content.replace(/rounded-\[3rem\]/g, 'rounded-sm border-r border-b');
    content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-sm border-r border-b');
    content = content.replace(/rounded-3xl/g, 'rounded-sm');
    content = content.replace(/rounded-2xl/g, 'rounded-none');
    content = content.replace(/rounded-xl/g, 'rounded-none');
    content = content.replace(/rounded-full/g, 'rounded-sm'); // careful with circles, but good for buttons
    content = content.replace(/font-sans/g, 'font-mono');
    content = content.replace(/font-inter/g, '');
    content = content.replace(/italic/g, ''); // Remove italics entirely
    content = content.replace(/font-black/g, 'font-bold');

    // 2. BACKGROUND & BORDERS (Dark Blood Red Theme)
    content = content.replace(/bg-\[#06070a\]/g, 'bg-[#050000] bg-[linear-gradient(to_right,#450a0a_1px,transparent_1px),linear-gradient(to_bottom,#450a0a_1px,transparent_1px)] bg-[size:24px_24px]'); 
    content = content.replace(/bg-\[#0a0b10\]/g, 'bg-[#050000]'); 
    content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-red-950/20');
    content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-red-950/30');
    content = content.replace(/bg-white\/\[0\.01\]/g, 'bg-red-950/10');
    content = content.replace(/border-white\/\[0\.05\]/g, 'border-red-900/50');
    content = content.replace(/border-white\/5/g, 'border-red-900/50');
    content = content.replace(/border-white\/10/g, 'border-red-900');

    // 3. ACCENTS (Deep Red base, Cyan & Amber Contrast)
    content = content.replace(/red-600/g, 'red-700'); 
    content = content.replace(/shadow-\[0_0_30px_rgba\(220,38,38,0\.4\)\]/g, 'shadow-[0_0_15px_rgba(220,38,38,0.2)]');
    
    // Convert generic gray texts to Red-Tinted grays for that terminal feel
    content = content.replace(/text-gray-500/g, 'text-red-300/60');
    content = content.replace(/text-gray-400/g, 'text-red-200/80');

    // 4. THE TWO CONTRAST COLORS (Cyan & Amber) for specific data/states
    // Replacing emerald with cyan for verified states
    content = content.replace(/emerald/g, 'cyan'); 

    // Charts: Make bar charts use Cyan contrast instead of red
    content = content.replace(/from-red-600\/20 to-red-600/g, 'from-cyan-900/50 to-cyan-500');
    content = content.replace(/bg-red-600 shadow-\[0_0_15px_rgba\(220,38,38,0\.5\)\]/g, 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]');

    // Strip out massively intrusive blur blobs
    content = content.replace(/blur-\[160px\]/g, 'blur-[40px]');
    content = content.replace(/blur-\[140px\]/g, 'blur-[40px]');
    content = content.replace(/blur-\[80px\]/g, 'blur-[30px]');

    fs.writeFileSync(file, content);
    console.log(`Successfully refactored ${file}`);
}
