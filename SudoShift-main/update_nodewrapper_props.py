import os
import re

dir_path = "src/nodes/shared"

for file in os.listdir(dir_path):
    if file.startswith("Base") and file.endswith(".tsx"):
        path = os.path.join(dir_path, file)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        # Update the component signature
        content = re.sub(
            r"\(\{ data \}: \{ data: any \}\) => \{",
            r"({ data, selected }: { data: any, selected?: boolean }) => {",
            content
        )
        content = re.sub(
            r"\(\{ data: _ \}: \{ data: any \}\) => \{",
            r"({ data, selected }: { data: any, selected?: boolean }) => {",
            content
        )

        # Update NodeWrapper opening tag
        content = re.sub(
            r"<NodeWrapper>",
            r"<NodeWrapper data={data} selected={selected}>",
            content
        )
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
