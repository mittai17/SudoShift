import os

base_dir = '/home/mittai/Documents/vs/PROJECT-ZUZZ/SudoShift/src/nodes/integrations'
os.makedirs(base_dir, exist_ok=True)

nodes_info = [
    {
        "name": "NotionNode",
        "icon": "BookOpen",
        "color": "#000000",
        "state_key": "notion_api_key",
        "state_placeholder": "Notion Integration Token...",
        "actions": ['Search Pages', 'Create Page', 'Read Database'],
        "inputs": [
            {'name': 'query', 'placeholder': 'Search query...', 'icon': 'Search'},
            {'name': 'title', 'placeholder': 'Page title...', 'icon': 'Type'},
            {'name': 'content', 'placeholder': 'Page content...', 'icon': 'FileText', 'isTextarea': True},
            {'name': 'databaseId', 'placeholder': 'Database ID...', 'icon': 'Database'}
        ],
        "api_endpoint": "notion"
    },
    {
        "name": "GitHubNode",
        "icon": "Code2",
        "color": "#24292e",
        "state_key": "github_pat",
        "state_placeholder": "Personal Access Token...",
        "actions": ['issues', 'create-issue', 'prs', 'repo'],
        "inputs": [
            {'name': 'owner', 'placeholder': 'Owner/Organization...', 'icon': 'User'},
            {'name': 'repo', 'placeholder': 'Repository...', 'icon': 'Folder'},
            {'name': 'title', 'placeholder': 'Issue Title...', 'icon': 'Type'},
            {'name': 'body', 'placeholder': 'Issue Body...', 'icon': 'FileText', 'isTextarea': True}
        ],
        "api_endpoint": "github"
    },
    {
        "name": "SlackNode",
        "icon": "MessageSquare",
        "color": "#4A154B",
        "state_key": "slack_bot_token",
        "state_placeholder": "Bot Token...",
        "actions": ['post', 'channels'],
        "inputs": [
            {'name': 'channel', 'placeholder': 'Channel (e.g. #general)...', 'icon': 'Hash'},
            {'name': 'message', 'placeholder': 'Message...', 'icon': 'Type', 'isTextarea': True}
        ],
        "api_endpoint": "slack"
    },
    {
        "name": "AirtableNode",
        "icon": "Table2",
        "color": "#18BFFF",
        "state_key": "airtable_api_key",
        "state_placeholder": "API Key...",
        "actions": ['list', 'create'],
        "inputs": [
            {'name': 'baseId', 'placeholder': 'Base ID...', 'icon': 'Database'},
            {'name': 'tableName', 'placeholder': 'Table Name...', 'icon': 'Table'},
            {'name': 'filterFormula', 'placeholder': 'Filter Formula...', 'icon': 'Filter'},
        ],
        "api_endpoint": "airtable"
    },
    {
        "name": "JiraNode",
        "icon": "Layers",
        "color": "#0052CC",
        "state_key": "jira_token",
        "state_placeholder": "API Token...",
        "actions": ['issues', 'create'],
        "inputs": [
            {'name': 'email', 'placeholder': 'Email...', 'icon': 'Mail', 'localStorage': 'jira_email'},
            {'name': 'domain', 'placeholder': 'Domain (e.g. yourco.atlassian.net)...', 'icon': 'Globe', 'localStorage': 'jira_domain'},
            {'name': 'projectKey', 'placeholder': 'Project Key...', 'icon': 'Briefcase'},
            {'name': 'jql', 'placeholder': 'JQL Query...', 'icon': 'Search'},
            {'name': 'summary', 'placeholder': 'Issue Summary...', 'icon': 'Type'},
            {'name': 'description', 'placeholder': 'Description...', 'icon': 'FileText', 'isTextarea': True}
        ],
        "api_endpoint": "jira"
    },
    {
        "name": "ZapierNode",
        "icon": "Zap",
        "color": "#FF4A00",
        "state_key": "zapier_webhook_url",
        "state_placeholder": "Webhook URL...",
        "actions": ['Trigger'],
        "inputs": [
            {'name': 'payload', 'placeholder': 'JSON Payload...', 'icon': 'Code', 'isTextarea': True}
        ],
        "api_endpoint": "zapier",
        "direct_webhook": True
    },
    {
        "name": "MakeNode",
        "icon": "Share2",
        "color": "#6D00CC",
        "state_key": "make_webhook_url",
        "state_placeholder": "Webhook URL...",
        "actions": ['Trigger'],
        "inputs": [
            {'name': 'payload', 'placeholder': 'JSON Payload...', 'icon': 'Code', 'isTextarea': True}
        ],
        "api_endpoint": "make",
        "direct_webhook": True
    },
    {
        "name": "ObsidianNode",
        "icon": "BookMarked",
        "color": "#7C3AED",
        "state_key": "obsidian_token",
        "state_placeholder": "REST API Plugin Token...",
        "actions": ['read', 'write', 'list', 'search'],
        "inputs": [
            {'name': 'port', 'placeholder': 'Port (default 27123)...', 'icon': 'Terminal', 'localStorage': 'obsidian_port'},
            {'name': 'path', 'placeholder': 'Vault path (e.g. Folder/Note.md)...', 'icon': 'File'},
            {'name': 'query', 'placeholder': 'Search query...', 'icon': 'Search'},
            {'name': 'content', 'placeholder': 'Note Content...', 'icon': 'FileText', 'isTextarea': True}
        ],
        "api_endpoint": "obsidian"
    },
    {
        "name": "GoogleSheetsNode",
        "icon": "Table",
        "color": "#0F9D58",
        "state_key": "gsheets_api_key",
        "state_placeholder": "API Key...",
        "actions": ['read', 'append'],
        "inputs": [
            {'name': 'spreadsheetId', 'placeholder': 'Spreadsheet ID...', 'icon': 'FileSpreadsheet', 'localStorage': 'gsheets_spreadsheet_id'},
            {'name': 'range', 'placeholder': 'Range (e.g. Sheet1!A1:D10)...', 'icon': 'Maximize'},
            {'name': 'data', 'placeholder': 'CSV Data for append...', 'icon': 'FileText', 'isTextarea': True}
        ],
        "api_endpoint": "gsheets"
    },
    {
        "name": "TrelloNode",
        "icon": "LayoutGrid",
        "color": "#0052CC",
        "state_key": "trello_api_key",
        "state_placeholder": "API Key...",
        "actions": ['boards', 'lists', 'cards', 'create'],
        "inputs": [
            {'name': 'token', 'placeholder': 'Token...', 'icon': 'Key', 'localStorage': 'trello_token', 'isPassword': True},
            {'name': 'boardId', 'placeholder': 'Board ID...', 'icon': 'Layout'},
            {'name': 'listId', 'placeholder': 'List ID...', 'icon': 'List'},
            {'name': 'name', 'placeholder': 'Card Name...', 'icon': 'Type'},
            {'name': 'desc', 'placeholder': 'Description...', 'icon': 'FileText', 'isTextarea': True}
        ],
        "api_endpoint": "trello"
    },
    {
        "name": "LinearNode",
        "icon": "GitBranch",
        "color": "#5E6AD2",
        "state_key": "linear_api_key",
        "state_placeholder": "API Key...",
        "actions": ['issues', 'create', 'myIssues'],
        "inputs": [
            {'name': 'teamId', 'placeholder': 'Team ID...', 'icon': 'Users', 'localStorage': 'linear_team_id'},
            {'name': 'title', 'placeholder': 'Issue Title...', 'icon': 'Type'},
            {'name': 'description', 'placeholder': 'Description...', 'icon': 'FileText', 'isTextarea': True},
            {'name': 'priority', 'placeholder': 'Priority (0-4)...', 'icon': 'AlertCircle'}
        ],
        "api_endpoint": "linear"
    },
    {
        "name": "DiscordNode",
        "icon": "MessageSquare",
        "color": "#5865F2",
        "state_key": "discord_bot_token",
        "state_placeholder": "Bot Token...",
        "actions": ['send', 'channels'],
        "inputs": [
            {'name': 'channelId', 'placeholder': 'Channel ID...', 'icon': 'Hash'},
            {'name': 'message', 'placeholder': 'Message...', 'icon': 'Type', 'isTextarea': True}
        ],
        "api_endpoint": "discord"
    },
    {
        "name": "MicrosoftNode",
        "icon": "FileText",
        "color": "#00A4EF",
        "state_key": "ms_graph_token",
        "state_placeholder": "Graph API Token...",
        "actions": ['excel-read', 'onedrive-list'],
        "inputs": [
            {'name': 'fileId', 'placeholder': 'File ID...', 'icon': 'File'},
            {'name': 'sheet', 'placeholder': 'Sheet Name...', 'icon': 'Table'},
            {'name': 'range', 'placeholder': 'Range (e.g. A1:D10)...', 'icon': 'Maximize'}
        ],
        "api_endpoint": "microsoft"
    },
    {
        "name": "McpToolsNode",
        "icon": "Terminal",
        "color": "#FF6B35",
        "state_key": "mcp_api_key",
        "state_placeholder": "Optional API Key...",
        "actions": ['list', 'call'],
        "inputs": [
            {'name': 'serverUrl', 'placeholder': 'Server URL...', 'icon': 'Globe', 'localStorage': 'mcp_server_url'},
            {'name': 'toolName', 'placeholder': 'Tool Name...', 'icon': 'Wrench'},
            {'name': 'params', 'placeholder': 'JSON Params...', 'icon': 'Code', 'isTextarea': True}
        ],
        "api_endpoint": "mcp"
    }
]

template = """import React, { useState } from 'react';
import { {icons}, Key, Database, AlertCircle, FileText, Download, Loader2 } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const {name}Body = ({ task, updateTask }: any) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('{state_key}') || '');
  
{local_storage_states}
  
  const actionType = task.actionType || '{first_action}';
{task_states}

  const handleFetch = async () => {
    setError('');
    setResult('');
    setIsFetching(true);

    try {
      {fetch_logic}

      if (!res?.ok && !data?.success && data?.error) {
        throw new Error(data.error || 'API request failed');
      }

      setResult(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      updateTask({ lastResult: data });
    } catch (err: any) {
      setError(err.message || 'Failed to perform action');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Auth Input */}
      <div className="flex items-center gap-2 bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
        <Key className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <input
          type="password"
          placeholder="{state_placeholder}"
          className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            localStorage.setItem('{state_key}', e.target.value);
          }}
        />
      </div>

{extra_auth_inputs}

      {/* Action Selector */}
      <div className="flex flex-wrap gap-2 text-xs">
{action_buttons}
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-2">
{input_fields}
         <button 
            onClick={handleFetch} disabled={isFetching}
            className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg py-2 transition-colors font-bold disabled:opacity-50 text-xs shadow-lg shadow-cyan-900/20"
            style={{ backgroundColor: '{color}' }}
         >
            {isFetching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Database className="w-4 h-4 mr-2" /> Execute {actionType}</>}
         </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <span className="text-[10px] text-red-300">{error}</span>
        </div>
      )}

      {/* Result Area */}
      <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden">
        <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center justify-between">
          <div className="flex items-center"><FileText className="w-3 h-3 mr-1" /> Output</div>
          {result && (
            <button
              onClick={() => {
                const blob = new Blob([result], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = '{name}-result.json';
                a.click();
              }}
              className="hover:text-white" title="Export"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
        <textarea
          className="w-full text-[10px] text-gray-300 font-mono bg-transparent border-none p-3 focus:outline-none resize-none min-h-[80px] custom-scrollbar"
          placeholder={isFetching ? 'Processing...' : 'Result will appear here...'}
          value={result}
          readOnly
        />
      </div>
    </div>
  );
};

export default createResourceNode({
  label: '{name}',
  accentColor: '{color}',
  icon: <{icon} className="w-4 h-4 text-white" />,
  width: 'w-[360px]'
}, {name}Body);
"""

for node in nodes_info:
    name = node['name']
    icon = node['icon']
    color = node['color']
    state_key = node['state_key']
    state_placeholder = node['state_placeholder']
    actions = node['actions']
    first_action = actions[0]
    inputs = node['inputs']
    api_endpoint = node['api_endpoint']
    is_direct = node.get('direct_webhook', False)
    
    icons_to_import = {icon}
    for inp in inputs:
        icons_to_import.add(inp['icon'])
    
    local_storage_states = []
    extra_auth_inputs = []
    task_states = []
    input_fields = []
    
    for inp in inputs:
        if inp.get('localStorage'):
            local_storage_states.append(f"  const [{inp['name']}, set_{inp['name']}] = useState(() => localStorage.getItem('{inp['localStorage']}') || '');")
            input_type = "password" if inp.get("isPassword") else "text"
            extra_auth_inputs.append(f"""      <div className="flex items-center gap-2 bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
        <{inp['icon']} className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <input
          type="{input_type}"
          placeholder="{inp['placeholder']}"
          className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
          value={{{inp['name']}}}
          onChange={{(e) => {{
            set_{inp['name']}(e.target.value);
            localStorage.setItem('{inp['localStorage']}', e.target.value);
          }}}}
        />
      </div>""")
            task_states.append(f"  const {inp['name']}Task = task.{inp['name']} || '';")
        else:
            task_states.append(f"  const {inp['name']} = task.{inp['name']} || '';")
            if inp.get('isTextarea'):
                input_fields.append(f"""         <div className="flex items-start bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
            <{inp['icon']} className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0 mt-1" />
            <textarea 
               placeholder="{inp['placeholder']}"
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300 min-h-[60px] resize-y"
               value={{{inp['name']}}} onChange={{(e) => updateTask({{ {inp['name']}: e.target.value }})}} 
            />
         </div>""")
            else:
                input_fields.append(f"""         <div className="flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
            <{inp['icon']} className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
            <input 
               type="text" placeholder="{inp['placeholder']}"
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
               value={{{inp['name']}}} onChange={{(e) => updateTask({{ {inp['name']}: e.target.value }})}} 
            />
         </div>""")
                
    action_buttons = []
    for action in actions:
        action_buttons.append(f"""         <button 
            onClick={{() => updateTask({{ actionType: '{action}' }})}}
            className={{`flex-1 min-w-[80px] flex items-center justify-center py-1.5 rounded-lg border transition-colors ${{actionType === '{action}' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}}`}}
         >
            {action}
         </button>""")

    fetch_logic = ""
    if is_direct:
        fetch_logic = f"""const res = await fetch(apiKey, {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: payload,
      }});
      const data = await res.text();"""
    else:
        req_body = "action: actionType, apiKey"
        if state_key == 'slack_bot_token' or state_key == 'discord_bot_token' or state_key == 'obsidian_token' or state_key == 'ms_graph_token':
            req_body += ", token: apiKey"
        for inp in inputs:
            name_val = inp['name']
            if inp.get('localStorage'):
                req_body += f", {name_val}"
            else:
                req_body += f", {name_val}"
        
        fetch_logic = f"""const res = await fetch('/api/integrations/{api_endpoint}', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ {req_body} }}),
      }});
      const data = await res.json();"""

    file_content = template.replace('{name}', name).replace('{icons}', ', '.join(icons_to_import)).replace('{color}', color).replace('{state_key}', state_key).replace('{state_placeholder}', state_placeholder).replace('{first_action}', first_action).replace('{local_storage_states}', '\n'.join(local_storage_states)).replace('{task_states}', '\n'.join(task_states)).replace('{extra_auth_inputs}', '\n'.join(extra_auth_inputs)).replace('{action_buttons}', '\n'.join(action_buttons)).replace('{input_fields}', '\n'.join(input_fields)).replace('{fetch_logic}', fetch_logic).replace('{icon}', icon)
    
    with open(os.path.join(base_dir, f"{name}.tsx"), "w") as f:
        f.write(file_content)

print("Generated all node components successfully.")
