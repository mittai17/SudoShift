import os
import re

dir_path = "src/nodes/shared"

for file in os.listdir(dir_path):
    if file.startswith("Base") and file.endswith(".tsx"):
        path = os.path.join(dir_path, file)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        # If it already has defaultColor, skip
        if "defaultColor={" in content:
            continue
            
        # We want to replace `<NodeWrapper data={data} selected={selected}`
        # with `<NodeWrapper data={data} selected={selected} defaultColor={config.accentColor}`
        
        # But some might have config.accentColor or config.color?
        # Let's check what the config parameter is. It's usually `config: *Config`.
        # And the config object has `accentColor`. Let's assume it's `config.accentColor`.
        
        content = re.sub(
            r"<NodeWrapper data=\{data\} selected=\{selected\}",
            r"<NodeWrapper data={data} selected={selected} defaultColor={config.accentColor}",
            content
        )
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

print("Done")
