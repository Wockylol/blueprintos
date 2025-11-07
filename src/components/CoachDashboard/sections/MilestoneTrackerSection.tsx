import { Target } from 'lucide-react';

export function MilestoneTrackerSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Milestone Tracker</h2>
        <p className="text-gray-400">Define key milestones for your clients to achieve</p>
      </div>

      <div className="card-glass p-12 text-center">
        <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
        <p className="text-gray-400">
          Create milestones that clients unlock as they progress through your program
        </p>
      </div>
    </div>
  );
}
