import { Calendar, Video } from 'lucide-react';

export function CalendarSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Calendar & Calls</h2>
        <p className="text-gray-400">Manage your availability and session bookings</p>
      </div>

      <div className="card-glass p-8">
        <h3 className="text-lg font-semibold text-white mb-4">Calendly Integration</h3>
        <p className="text-gray-400 mb-6">
          Connect your Calendly account to enable automatic booking for your coaching sessions
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Calendly Link</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
              placeholder="https://calendly.com/yourname"
            />
          </div>
          <button className="btn-primary">Save Calendar Settings</button>
        </div>
      </div>

      <div className="card-glass p-8">
        <h3 className="text-lg font-semibold text-white mb-4">Video Call Settings</h3>
        <p className="text-gray-400 mb-6">
          Configure your preferred video conferencing platform
        </p>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-4 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-700/50 transition-colors">
            <input type="radio" name="video" className="w-4 h-4" />
            <Video className="w-5 h-5 text-gray-400" />
            <span className="text-white">Zoom</span>
          </label>
          <label className="flex items-center space-x-3 p-4 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-700/50 transition-colors">
            <input type="radio" name="video" className="w-4 h-4" />
            <Video className="w-5 h-5 text-gray-400" />
            <span className="text-white">Google Meet</span>
          </label>
          <label className="flex items-center space-x-3 p-4 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-700/50 transition-colors">
            <input type="radio" name="video" className="w-4 h-4" />
            <Video className="w-5 h-5 text-gray-400" />
            <span className="text-white">Custom Link</span>
          </label>
        </div>
      </div>
    </div>
  );
}
