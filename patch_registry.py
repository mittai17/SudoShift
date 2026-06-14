import re
import os

filepath = 'src/nodes/registry/registry.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Add imports for registry
imports = """
import { SiNotion, SiGithub, SiSlack, SiAirtable, SiJira, SiZapier, SiMake, SiObsidian, SiGooglesheets, SiTrello, SiLinear, SiDiscord, SiMicrosoft } from 'react-icons/si';
import { TbPlugConnected } from 'react-icons/tb';
"""

if "SiNotion" not in content:
    content = imports + content

# Map of node ID to React Icon tag
icon_replacements = {
    'integration-notion-node': '<SiNotion />',
    'integration-github-node': '<SiGithub />',
    'integration-slack-node': '<SiSlack />',
    'integration-airtable-node': '<SiAirtable />',
    'integration-jira-node': '<SiJira />',
    'integration-zapier-node': '<SiZapier />',
    'integration-make-node': '<SiMake />',
    'integration-obsidian-node': '<SiObsidian />',
    'integration-gsheets-node': '<SiGooglesheets />',
    'integration-trello-node': '<SiTrello />',
    'integration-linear-node': '<SiLinear />',
    'integration-discord-node': '<SiDiscord />',
    'integration-microsoft-node': '<SiMicrosoft />',
    'integration-mcp-node': '<TbPlugConnected />',
}

for node_id, icon_tag in icon_replacements.items():
    # regex to match: { id: 'integration-notion-node', label: 'Notion', category: 'integrations', icon: '📓', ... }
    # and replace icon: '📓' with icon: <SiNotion />
    pattern = r"({ id: '" + node_id + r"',[^}]+icon: )'[^']+'"
    content = re.sub(pattern, r"\1" + icon_tag, content)

with open(filepath, 'w') as f:
    f.write(content)

print("Registry patched successfully.")
