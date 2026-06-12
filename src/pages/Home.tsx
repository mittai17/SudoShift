import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Globe, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans selection:bg-[#ff6d5a] selection:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#ff6d5a] text-white rounded-lg">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">Visual Second Brain</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
          <Link to="/app" className="hover:text-gray-900 transition-colors">Workspace</Link>
          <Link to="/community" className="hover:text-gray-900 transition-colors">Community</Link>
        </div>
        <div className="flex items-center">
          <Link to="/app" className="bg-[#ff6d5a] hover:bg-[#e85f4e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Open Canvas
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 lg:px-12 py-24 text-center">
        <div className="inline-flex items-center space-x-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-8 border border-orange-200">
          <Sparkles className="w-4 h-4" />
          <span>New: Extract tasks from YouTube videos instantly</span>
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Think visually.<br />
          <span className="text-gray-400">Organize effortlessly.</span>
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          The intelligent whiteboard that acts as a second brain. Brain dump your chaotic thoughts, let AI organize them into a roadmap, and connect the dots seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/app" className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl text-md font-medium transition-colors w-full sm:w-auto justify-center">
            <span>Start Brainstorming</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/community" className="flex items-center space-x-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-3.5 rounded-xl text-md font-medium transition-colors w-full sm:w-auto justify-center shadow-sm">
            <Globe className="w-4 h-4" />
            <span>Explore Community Notes</span>
          </Link>
        </div>

        {/* Hero Image/Mockup */}
        <div className="mt-20 rounded-2xl overflow-hidden border border-gray-200 shadow-2xl relative">
          <div className="bg-gray-100 flex items-center px-4 py-3 border-b border-gray-200">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>
          <div className="aspect-video bg-[#cbd5e1] relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
             {/* Abstract Node Mockups */}
             <div className="absolute top-1/4 left-1/4 w-48 bg-white rounded-xl shadow-lg border border-gray-200 p-4 transform -rotate-2">
               <div className="flex items-center space-x-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
                 <div className="h-2 w-20 bg-gray-200 rounded"></div>
               </div>
               <div className="h-2 w-full bg-gray-100 rounded mb-1"></div>
               <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
             </div>
             
             <div className="absolute top-1/3 right-1/4 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-0 overflow-hidden transform rotate-1">
               <div className="bg-[#12b886] px-3 py-2">
                 <div className="h-2 w-24 bg-white/50 rounded"></div>
               </div>
               <div className="p-3">
                 <div className="h-2 w-full bg-gray-100 rounded mb-1"></div>
                 <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
               </div>
             </div>

             <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
               <path d="M 300 200 C 400 200, 450 250, 550 250" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5,5" fill="none" />
             </svg>
          </div>
        </div>
      </main>
    </div>
  );
}
