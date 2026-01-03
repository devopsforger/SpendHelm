import { Card } from '@/components/ui/card';
import { User, Mail, Shield } from 'lucide-react';
import { UserPreferences } from '@/lib/types/preferences';

interface AccountInfoCardProps {
  user: UserPreferences;
}

export default function AccountInfoCard({ user }: AccountInfoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-[#101828] mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-[#551931]" />
        Account Information
      </h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-lg flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-[#551931]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-[#101828] font-medium">{user.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-[#551931]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="text-[#101828] font-medium">
              {user.full_name || 'Not set'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#551931]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-[#101828] font-medium capitalize">
              {user.role || 'User'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-[#101828] font-medium text-sm">
              {formatDate(user.created_at)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}