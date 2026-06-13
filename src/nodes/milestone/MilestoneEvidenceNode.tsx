import React from 'react';
import { FileCheck } from 'lucide-react';
import { createAttachmentNode } from '../shared/BaseAttachmentNode';
export default createAttachmentNode({ label: 'Milestone Evidence', accentColor: '#ef4444', icon: <FileCheck className="w-4 h-4" />, placeholder: 'Upload evidence file...' });
