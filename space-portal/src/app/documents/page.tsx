import { Search, Upload, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentManagement() {
  return (
    <div className="min-h-screen bg-black pt-24 px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-medium text-white mb-2">DOCUMENT MANAGEMENT</h1>
            <p className="text-zinc-400 text-sm">
              Manage all documents related to your aerospace licensing applications
            </p>
          </div>
          <Button 
            className="bg-white hover:bg-white/90 text-black text-sm font-medium flex items-center gap-2 px-4 h-10"
          >
            <Upload className="h-4 w-4" />
            UPLOAD DOCUMENT
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full h-10 bg-[#161616] border border-zinc-800 rounded-md pl-10 pr-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <Button 
            variant="outline" 
            className="border-zinc-800 hover:bg-[#161616] text-white gap-2 px-4 h-10"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Document Library */}
        <div className="bg-[#161616] rounded-lg border border-zinc-800/50 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-white mb-1">Document Library</h2>
            <p className="text-sm text-zinc-400">View and manage your documents</p>
            
            {/* Tabs */}
            <div className="flex gap-6 mt-6 border-b border-zinc-800">
              <button className="text-sm text-white pb-4 border-b-2 border-white">
                All Documents
              </button>
              <button className="text-sm text-zinc-400 pb-4 hover:text-white">
                Applications
              </button>
              <button className="text-sm text-zinc-400 pb-4 hover:text-white">
                Attachments
              </button>
              <button className="text-sm text-zinc-400 pb-4 hover:text-white">
                Emails
              </button>
              <button className="text-sm text-zinc-400 pb-4 hover:text-white">
                Licenses
              </button>
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-[2fr,1fr,1fr,2fr,0.5fr] gap-4 py-4 text-sm text-zinc-400">
              <div>Document</div>
              <div>Type</div>
              <div>Size</div>
              <div>Associated Application</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Empty State */}
            <div className="py-12 text-center">
              <p className="text-zinc-400 text-sm">No documents found</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center py-8 text-xs text-zinc-500">
          <div>SPLI © 2025</div>
          <div className="flex gap-6">
            <button className="hover:text-zinc-400">PRIVACY POLICY</button>
            <button className="hover:text-zinc-400">TERMS OF SERVICE</button>
            <button className="hover:text-zinc-400">CONTACT</button>
          </div>
        </div>
      </div>
    </div>
  );
} 