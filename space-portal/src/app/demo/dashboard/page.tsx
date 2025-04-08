'use client';

export default function DemoDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">MISSION CONTROL</h1>
          <p className="text-gray-400">
            Welcome back, Astronaut. Manage your aerospace licensing applications.
          </p>
        </div>
        <button className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-100">
          + NEW APPLICATION
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Actions */}
        <div className="bg-[#111] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-2">Pending Actions</h2>
          <p className="text-gray-400 mb-4">Applications awaiting your attention</p>
          
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold">FALCON X LAUNCH VEHICLE LICENSE</h3>
                <span className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full text-sm">
                  ACTION NEEDED
                </span>
              </div>
              <p className="text-gray-400">Part 450 • Last updated Feb 20, 2025</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold">STARCRUISER REENTRY VEHICLE</h3>
                <span className="bg-gray-700 text-gray-100 px-3 py-1 rounded-full text-sm">
                  DRAFT
                </span>
              </div>
              <p className="text-gray-400">Part 450 • Last updated Feb 27, 2025</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold">LAUNCH SITE EXPANSION AMENDMENT</h3>
                <span className="bg-yellow-900/70 text-yellow-100 px-3 py-1 rounded-full text-sm">
                  UNDER REVIEW
                </span>
              </div>
              <p className="text-gray-400">License Amendment • Last updated Mar 5, 2025</p>
            </div>
          </div>
        </div>

        {/* Launch Status */}
        <div className="bg-[#111] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-2">Launch Status</h2>
          <p className="text-gray-400 mb-4">Recent and upcoming launches</p>

          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <h3 className="text-white font-semibold">APPROVED LAUNCH WINDOW</h3>
              </div>
              <p className="text-gray-300">Orbital Facility Deployment</p>
              <p className="text-gray-500 text-sm mt-1">May 15, 2025 - June 30, 2025</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <h3 className="text-white font-semibold">PENDING APPROVAL</h3>
              </div>
              <p className="text-gray-300">Falcon X Launch Vehicle</p>
              <p className="text-gray-500 text-sm mt-1">Submitted on Feb 20, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Applications */}
      <div className="bg-[#111] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-2">All Applications</h2>
        <p className="text-gray-400 mb-4">Complete history of your license applications</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-800">
                <th className="pb-2 text-gray-400 font-normal">Name</th>
                <th className="pb-2 text-gray-400 font-normal">Type</th>
                <th className="pb-2 text-gray-400 font-normal">Status</th>
                <th className="pb-2 text-gray-400 font-normal">Created</th>
                <th className="pb-2 text-gray-400 font-normal">Last Update</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800/50">
                <td className="py-4 text-white">Falcon X Launch Vehicle License</td>
                <td className="py-4 text-gray-400">Part 450</td>
                <td className="py-4">
                  <span className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full text-sm">
                    AWAITING ACTION
                  </span>
                </td>
                <td className="py-4 text-gray-400">Jan 15, 2025</td>
                <td className="py-4 text-gray-400">Feb 20, 2025</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-4 text-white">Starcruiser Reentry Vehicle</td>
                <td className="py-4 text-gray-400">Part 450</td>
                <td className="py-4">
                  <span className="bg-gray-700 text-gray-100 px-3 py-1 rounded-full text-sm">
                    DRAFT
                  </span>
                </td>
                <td className="py-4 text-gray-400">Feb 27, 2025</td>
                <td className="py-4 text-gray-400">Feb 27, 2025</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-4 text-white">Orbital Facility Safety Approval</td>
                <td className="py-4 text-gray-400">Safety Approval</td>
                <td className="py-4">
                  <span className="bg-green-900 text-green-100 px-3 py-1 rounded-full text-sm">
                    ACTIVE
                  </span>
                </td>
                <td className="py-4 text-gray-400">Nov 5, 2024</td>
                <td className="py-4 text-gray-400">Jan 10, 2025</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-4 text-white">Launch Site Expansion Amendment</td>
                <td className="py-4 text-gray-400">License Amendment</td>
                <td className="py-4">
                  <span className="bg-yellow-900/70 text-yellow-100 px-3 py-1 rounded-full text-sm">
                    UNDER REVIEW
                  </span>
                </td>
                <td className="py-4 text-gray-400">Mar 3, 2025</td>
                <td className="py-4 text-gray-400">Mar 5, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 