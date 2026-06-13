import React from 'react';
import { Paperclip } from 'lucide-react';
import { createAttachmentNode } from '../shared/BaseAttachmentNode';
export default createAttachmentNode({ label: 'Milestone Attachment', accentColor: '#ef4444', icon: <Paperclip className="w-4 h-4" />, placeholder: 'Attach any file...' });
