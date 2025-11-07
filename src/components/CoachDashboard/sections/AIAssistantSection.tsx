import { Sparkles, MessageSquare, FileText, TrendingUp } from 'lucide-react';

export function AIAssistantSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">AI Assistant</h2>
        <p className="text-gray-400">Your intelligent coaching companion (Coming Soon)</p>
      </div>

      <div className="card-glass p-8 text-center">
        <div className="w-20 h-20 bg-gradient-violet rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">AI-Powered Coaching Tools</h3>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Get intelligent suggestions for client roadmaps, automated message replies,
          funnel copywriting, and personalized coaching recommendations.
        </p>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-500/20 rounded-full text-accent-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">Coming Q2 2025</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-glass p-6">
          <MessageSquare className="w-10 h-10 text-primary-500 mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">Smart Replies</h4>
          <p className="text-sm text-gray-400">
            Generate contextual responses to client messages and questions
          </p>
        </div>

        <div className="card-glass p-6">
          <FileText className="w-10 h-10 text-accent-500 mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">Content Generator</h4>
          <p className="text-sm text-gray-400">
            Create program outlines, task descriptions, and coaching materials
          </p>
        </div>

        <div className="card-glass p-6">
          <TrendingUp className="w-10 h-10 text-primary-500 mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">Progress Insights</h4>
          <p className="text-sm text-gray-400">
            Get AI-powered analytics on client performance and engagement
          </p>
        </div>
      </div>
    </div>
  );
}
