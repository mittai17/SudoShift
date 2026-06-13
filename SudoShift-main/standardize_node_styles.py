import os
import re

dir_path = "src/nodes/shared"

for file in os.listdir(dir_path):
    if file.startswith("Base") and file.endswith(".tsx"):
        path = os.path.join(dir_path, file)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Remove style={{ borderColor: ... }} entirely
        content = re.sub(
            r',\s*style=\{\{\s*borderColor:[^}]+\}\}',
            '',
            content
        )
        content = re.sub(
            r'\s*style=\{\{\s*borderColor:[^}]+\}\}',
            '',
            content
        )

        # 2. Fix the inner div classes: ensure consistent border and shadow
        # Replace border-2 with border border-gray-200
        content = re.sub(
            r'border-2',
            r'border border-gray-200',
            content
        )
        # Ensure it has border border-gray-200 if it only had border
        # This regex might be tricky, let's just replace generic shadow/border combinations
        content = re.sub(
            r'shadow-md bg-white border border-gray-200 hover:shadow-lg',
            r'shadow-sm bg-white border border-gray-200 hover:shadow-md',
            content
        )
        content = re.sub(
            r'shadow-md bg-white border border-gray-200 hover:shadow-xl',
            r'shadow-sm bg-white border border-gray-200 hover:shadow-md',
            content
        )

        # 3. Replace background gradients in the header with solid colors
        content = re.sub(
            r'style=\{\{\s*background:\s*`linear-gradient[^`]+`\s*\}\}',
            r'style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}',
            content
        )

        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
