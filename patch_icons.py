import os
import glob

# Map of Node -> (React Icon component, package)
icons_map = {
    'NotionNode.tsx': ('SiNotion', 'react-icons/si'),
    'GitHubNode.tsx': ('SiGithub', 'react-icons/si'),
    'SlackNode.tsx': ('SiSlack', 'react-icons/si'),
    'AirtableNode.tsx': ('SiAirtable', 'react-icons/si'),
    'JiraNode.tsx': ('SiJira', 'react-icons/si'),
    'ZapierNode.tsx': ('SiZapier', 'react-icons/si'),
    'MakeNode.tsx': ('SiMake', 'react-icons/si'),
    'ObsidianNode.tsx': ('SiObsidian', 'react-icons/si'),
    'GoogleSheetsNode.tsx': ('SiGooglesheets', 'react-icons/si'),
    'TrelloNode.tsx': ('SiTrello', 'react-icons/si'),
    'LinearNode.tsx': ('SiLinear', 'react-icons/si'),
    'DiscordNode.tsx': ('SiDiscord', 'react-icons/si'),
    'MicrosoftNode.tsx': ('SiMicrosoft', 'react-icons/si'),
    'McpToolsNode.tsx': ('TbPlugConnected', 'react-icons/tb'),
}

for filename, (icon_comp, package) in icons_map.items():
    filepath = os.path.join('src', 'nodes', 'integrations', filename)
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Add import
    if f"import {{ {icon_comp} }}" not in content:
        content = f"import {{ {icon_comp} }} from '{package}';\n" + content
        
    # Replace the export icon:
    import re
    # Match: icon: <SomeIcon className="w-4 h-4 text-white" />
    content = re.sub(
        r'icon:\s*<[A-Za-z0-9]+\s+className="w-4\s+h-4\s+text-white"\s*/>',
        f'icon: <{icon_comp} className="w-4 h-4 text-white" />',
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Icons patched successfully.")
