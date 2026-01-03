import { Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#551931] rounded flex items-center justify-center">
            <Wallet className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm text-gray-500">SpendHelm</span>
        </div>
        <p className="text-sm text-gray-400">v1.0.0</p>
      </div>
    </footer>
  );
}