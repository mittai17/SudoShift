import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowLeft, Search, Plus, Network, LayoutTemplate, Share2 } from 'lucide-react';

const COMMUNITY_NOTES = [
  {
    id: '1',
    title: 'Product Launch Roadmap',
    author: 'Sarah Jenkins',
    description: 'A comprehensive visual roadmap for launching a SaaS product, including marketing, tech, and ops.',
    likes: 342,
    nodes: 24,
    tags: ['Marketing', 'Product']
  },
  {
    id: '2',
    title: 'YouTube Creator Flow',
    author: 'Alex Video',
    description: 'My exact workflow from ideation to script generation to editing and final publish.',
    likes: 215,
    nodes: 12,
    tags: ['YouTube', 'Content']
  },
  {
    id: '3',
    title: 'Weekly Sprint Planning',
    author: 'Dev Team Alpha',
    description: 'Agile sprint planning template with Eisenhower matrix prioritization built-in.',
    likes: 189,
    nodes: 18,
    tags: ['Agile', 'Engineering']
  },
  {
    id: '4',
    title: 'System Design Interview Prep',
    author: 'CodeMaster',
    description: 'Visual notes covering load balancing, caching, databases, and microservices.',
    likes: 564,
    nodes: 45,
    tags: ['Engineering', 'Study']
  },
  {
    id: '5',
    title: 'Startup Fundraising CRM',
    author: 'FounderJane',
    description: 'Visual pipeline to track investor outreach, pitch meetings, and term sheet stages.',
    likes: 421,
    nodes: 30,
    tags: ['Startup', 'Finance']
  },
  {
    id: '6',
    title: 'Content Marketing Hub',
    author: 'ContentKing',
    description: 'SEO strategy, blog pipeline, and social media distribution map all in one place.',
    likes: 388,
    nodes: 22,
    tags: ['Marketing', 'SEO']
  },
  {
    id: '7',
    title: 'Personal Knowledge Base',
    author: 'ZettelX',
    description: 'My Zettelkasten setup for organizing reading notes, ideas, and drafts visually.',
    likes: 672,
    nodes: 80,
    tags: ['PKM', 'Notes']
  },
  {
    id: '8',
    title: 'Onboarding Flow for New Hires',
    author: 'HR_Pro',
    description: 'A 30-60-90 day plan for software engineers joining the team.',
    likes: 154,
    nodes: 15,
    tags: ['HR', 'Management']
  }
];

export default function Community() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans">
      <nav className="flex items-center space-x-4 px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-500" />
          <h1 className="font-bold text-lg tracking-tight">Community Notes</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">Explore Templates</h2>
            <p className="text-gray-500 text-sm">Discover and clone setups shared by the community.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative relative-w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search notes..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6d5a] bg-white shadow-sm"
              />
            </div>
            <button className="flex items-center space-x-2 bg-[#ff6d5a] hover:bg-[#e85f4e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Share Setup</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {COMMUNITY_NOTES.map(note => (
            <div key={note.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="h-32 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative overflow-hidden">
                <LayoutTemplate className="w-12 h-12 text-gray-300" />
                <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 leading-tight">{note.title}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{note.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-md uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-700">@{note.author}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Network className="w-3.5 h-3.5" />
                      <span>{note.nodes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{note.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link to={`/app?template=${note.id}`} className="block w-full py-2 bg-white border border-gray-200 hover:border-gray-300 text-center rounded-lg text-sm font-medium transition-colors">
                  Clone to Canvas
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
