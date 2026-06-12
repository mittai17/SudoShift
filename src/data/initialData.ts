import { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

export const getInitialData = (): { initialNodes: Node[], initialEdges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Helper to create a node
  const createNode = (type: string, id: string, x: number, y: number, title: string, description: string, matrix: string) => {
    return {
      id,
      type: `${type}NodeType`,
      position: { x, y },
      data: {
        task: {
          id: uuidv4(),
          title,
          description,
          matrix,
          deadline: null,
        }
      }
    };
  };

  // --- ROW 1: THE COMMAND CENTER ---
  nodes.push(createNode('note', 'n1', 400, 50, '🚀 Workload Control Center', 'Welcome to your smart scroll-based canvas.\nUse panning (Hand tool) or scrolling to explore your digital workspace.', 'NOTE'));
  
  // Section 1: Utilities (Y = 200)
  nodes.push(createNode('calendar', 'n2', 50, 200, 'Project Timeline', '', 'CALENDAR'));
  nodes.push(createNode('timer', 'n3', 450, 200, 'Focus Timer (Pomodoro)', '', 'TIMER'));
  nodes.push(createNode('calculator', 'n4', 800, 200, 'Quick Calculator', '', 'CALCULATOR'));

  // Section 2: Formulas and Budgets (Y = 600)
  nodes.push(createNode('formula', 'n5', 50, 600, 'Q3 App Budget', 'Total_Budget = 50000\nMarketing = 12000\nDev = 25000\nRemaining = Total_Budget - Marketing - Dev', 'FORMULA'));
  nodes.push(createNode('table', 'n6', 450, 600, 'Freelance Allocation', '[["Name","Role","Hours","Rate"],["Alice","Engineering","40","$75"],["Bob","Design","25","$80"],["Charlie","PM","35","$60"]]', 'TABLE'));
  nodes.push(createNode('formula', 'n7', 950, 600, 'Profit Margins Projection', 'Revenue = 150000\nCosts = 42500\nTax = 0.20\nNet_Before_Tax = Revenue - Costs\nTax_Owed = Net_Before_Tax * Tax\nNet_Income = Net_Before_Tax - Tax_Owed', 'FORMULA'));

  // Section 3: Priority Checklists & Active Matrix (Y = 1000)
  nodes.push(createNode('checklist', 'n8', 50, 1000, 'Current Sprint Backlog', '[{"id":"a","text":"Setup Supabase backend","checked":true},{"id":"b","text":"Create Next.js API endpoints","checked":false},{"id":"c","text":"Write E2E tests in Playwright","checked":false}]', 'CHECKLIST'));
  nodes.push(createNode('task', 'n9', 450, 1000, 'DO: Critical Hotfix', 'Fix the authentication flow crash occurring in production on iOS safari.', 'DO'));
  nodes.push(createNode('task', 'n10', 450, 1150, 'DECIDE: Feature Pivot', 'Decide whether to invest in Analytics Dashboard or a PDF Export feature for Q4.', 'DECIDE'));
  nodes.push(createNode('task', 'n11', 800, 1000, 'DELEGATE: QA Testing', 'Have the external QA team do a regression test on the new landing page.', 'DELEGATE'));
  nodes.push(createNode('task', 'n12', 800, 1150, 'DELETE: Legacy PHP Scripts', 'Remove the old v1 webhook scripts, they are no longer needed and pose a security risk.', 'DELETE'));

  // Section 4: Architecture & Design Canvas (Y = 1450)
  nodes.push(createNode('whiteboard', 'n13', 50, 1450, 'System Architecture Ideas', '', 'WHITEBOARD'));
  nodes.push(createNode('mermaid', 'n14', 550, 1450, 'Authentication User Flow', 'graph TD\n  Start[Landing Page] --> Login{Authenticated?}\n  Login -- Yes --> Dashboard[App Dashboard]\n  Login -- No --> Signup[Sign Up Page]\n  Signup --> Verify[Verify Email]\n  Verify --> Dashboard', 'MERMAID'));
  nodes.push(createNode('image', 'n15', 950, 1450, 'UI/UX Inspiration', 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400', 'IMAGE'));
  
  // Section 5: Code & Learning Materials (Y = 1900)
  nodes.push(createNode('code', 'n16', 50, 1900, 'Express Middleware Snippet', 'function auth(req, res, next) {\n  const token = req.headers.authorization;\n  if (!token) return res.status(401).send("Unauthorized");\n  // Verify token\n  next();\n}\n\nmodule.exports = auth;', 'CODE'));
  nodes.push(createNode('link', 'n17', 550, 1900, 'Monorepo GitHub Link', 'https://github.com/google/gts', 'LINK'));
  nodes.push(createNode('note', 'n18', 550, 2020, 'Tech Debt Log', 'We urgently need to refactor the payment webhook handler to be idempotent. It double-charged a test user.', 'NOTE'));
  nodes.push(createNode('video', 'n19', 950, 1900, 'WebSockets Tutorial', 'https://www.youtube.com/watch?v=1BvgxFGuZHU', 'VIDEO'));

  // Section 6: Operations & Advanced Formulas (Y = 2350)
  nodes.push(createNode('checklist', 'n20', 50, 2350, 'Product Launch Readiness', '[{"id":"x","text":"Staging deployment verified","checked":true},{"id":"y","text":"Load testing completed","checked":false},{"id":"z","text":"Marketing email blasted","checked":false}]', 'CHECKLIST'));
  nodes.push(createNode('table', 'n21', 450, 2350, 'Competitor Analysis', '[["Competitor","Price","Feature Match"],["Acme Corp","$99/mo","High"],["BetaTech","$49/mo","Low"],["GammaLabs","Free","High"]]', 'TABLE'));
  nodes.push(createNode('formula', 'n22', 950, 2350, 'Customer Acquisition Cost (CAC)', 'AdSpend = 12000\nSalesTeamSaaS = 8000\nSoftwareTools = 500\nTotalCost = AdSpend + SalesTeamSaaS + SoftwareTools\nNewCustomers = 350\nCAC = TotalCost / NewCustomers', 'FORMULA'));

  // Section 7: Daily Scattered Notes (Y = 2800)
  nodes.push(createNode('timer', 'n23', 50, 2800, 'Sprint Retrospective Timer', '', 'TIMER'));
  nodes.push(createNode('note', 'n24', 450, 2800, 'Meeting Notes: Client A', '- Discussed Q3 budget metrics\n- Team allocation was approved\n- Need more hiring in frontend engineering.', 'NOTE'));
  nodes.push(createNode('calculator', 'n25', 800, 2800, 'Tax Calculator Helper', '', 'CALCULATOR'));

  // Section 8: Final Review & Assets (Y = 3200)
  nodes.push(createNode('checklist', 'n26', 50, 3200, 'Onboarding Checklist for New Hire', '[{"id":"1","text":"Grant GitHub access","checked":false},{"id":"2","text":"Setup AWS IAM role","checked":false}]', 'CHECKLIST'));
  nodes.push(createNode('image', 'n27', 450, 3200, 'Target Audience Persona Map', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400', 'IMAGE'));
  nodes.push(createNode('link', 'n28', 800, 3200, 'Figma Design System Board', 'https://figma.com', 'LINK'));
  nodes.push(createNode('whiteboard', 'n29', 50, 3600, 'Scratchpad / Brainstorming', '', 'WHITEBOARD'));
  nodes.push(createNode('note', 'n30', 550, 3600, '🎉 End of Predefined Dashboard', 'You have hit the bottom of your initial workload scope! Keep panning, or drag new tools from the sidebar to expand further.', 'NOTE'));

  // Add flow connections to visualize sequence and dependencies 
  edges.push({ id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep' });
  edges.push({ id: 'e2-5', source: 'n2', target: 'n5', type: 'smoothstep' });
  edges.push({ id: 'e5-8', source: 'n5', target: 'n8', type: 'smoothstep' });
  edges.push({ id: 'e8-13', source: 'n8', target: 'n13', type: 'smoothstep' });
  edges.push({ id: 'e13-16', source: 'n13', target: 'n16', type: 'smoothstep' });
  edges.push({ id: 'e16-20', source: 'n16', target: 'n20', type: 'smoothstep' });
  
  edges.push({ id: 'e1-3', source: 'n1', target: 'n3', type: 'smoothstep' });
  edges.push({ id: 'e3-6', source: 'n3', target: 'n6', type: 'smoothstep' });
  edges.push({ id: 'e6-9', source: 'n6', target: 'n9', type: 'smoothstep' });
  edges.push({ id: 'e9-10', source: 'n9', target: 'n10', type: 'smoothstep' });
  edges.push({ id: 'e10-14', source: 'n10', target: 'n14', type: 'smoothstep' });
  
  edges.push({ id: 'e1-4', source: 'n1', target: 'n4', type: 'smoothstep' });
  edges.push({ id: 'e4-7', source: 'n4', target: 'n7', type: 'smoothstep' });
  edges.push({ id: 'e7-11', source: 'n7', target: 'n11', type: 'smoothstep' });
  edges.push({ id: 'e11-12', source: 'n11', target: 'n12', type: 'smoothstep' });
  edges.push({ id: 'e12-15', source: 'n12', target: 'n15', type: 'smoothstep' });

  return { initialNodes: nodes, initialEdges: edges };
}
