import os
import re

dir_path = "src/nodes/shared"

for file in os.listdir(dir_path):
    if file.startswith("Base") and file.endswith(".tsx"):
        path = os.path.join(dir_path, file)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        # Safely replace only specific instances
        # 1. backgroundColor: config.accentColor -> backgroundColor: `var(--node-color, ${config.accentColor})`
        content = re.sub(
            r"backgroundColor:\s*config\.accentColor",
            r"backgroundColor: `var(--node-color, ${config.accentColor})`",
            content
        )
        
        # 2. style={{ accentColor: config.accentColor }} -> style={{ accentColor: `var(--node-color, ${config.accentColor})` }}
        content = re.sub(
            r"style={{ accentColor:\s*config\.accentColor }}",
            r"style={{ accentColor: `var(--node-color, ${config.accentColor})` }}",
            content
        )
        
        # 3. color: config.accentColor -> color: `var(--node-color, ${config.accentColor})`
        # Need to be careful to only match object values
        content = re.sub(
            r"color:\s*config\.accentColor",
            r"color: `var(--node-color, ${config.accentColor})`",
            content
        )
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
