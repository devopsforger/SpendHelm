'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '@/lib/api/preferences';
import { UserPreferences, PreferencesFormData } from '@/lib/types/preferences';
import PreferencesHeader from './components/preferences-header';
import AccountInfoCard from './components/account-info-card';
import DisplaySettingsCard from './components/display-settings-card';
import LoadingSpinner from '@/components/dashboard/loading-spinner';

export default function PreferencesPage() {
  const [formData, setFormData] = useState<PreferencesFormData>({
    preferred_currency: 'USD',
    timezone: 'UTC',
  });

  const queryClient = useQueryClient();

  // Fetch user preferences
  const {
    data: user,
    isLoading,
    error
  } = useQuery<UserPreferences, Error>({
    queryKey: ['userPreferences'],
    queryFn: preferencesService.getUserPreferences,
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: preferencesService.updateUserPreferences,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['userPreferences'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
    onError: (error: Error) => {
      alert(`Failed to save preferences: ${error.message}`);
    }
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        preferred_currency: user.preferred_currency || 'USD',
        timezone: user.timezone || 'UTC',
      });
    }
  }, [user]);

  const handleChange = (field: keyof PreferencesFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const hasChanges = user && (
    formData.preferred_currency !== (user.preferred_currency || 'USD') ||
    formData.timezone !== (user.timezone || 'UTC')
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">!</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Preferences</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => queryClient.refetchQueries({ queryKey: ['userPreferences'] })}
            className="bg-[#551931] text-white px-4 py-2 rounded-lg hover:bg-[#6b2040]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PreferencesHeader />

      <AccountInfoCard user={user!} />

      <DisplaySettingsCard
        formData={formData}
        onFormChange={handleChange}
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}