import React from 'react';
import { FileText } from 'lucide-react';
import { createAttachmentNode } from '../shared/BaseAttachmentNode';
export default createAttachmentNode({ label: 'Resource PDF', accentColor: '#8b5cf6', icon: <FileText className="w-4 h-4" />, accept: '.pdf', placeholder: 'Upload PDF...' });
