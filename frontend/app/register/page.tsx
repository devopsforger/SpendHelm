'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, Check, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/lib/hooks/use-register';
import { authService } from '@/lib/auth';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

interface FeatureItemProps {
  text: string;
}

function FeatureItem({ text }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 bg-linear-to-br from-[#F14926] to-[#e63e1b] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
        <Check className="w-3 h-3 text-white" />
      </div>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { isLoading, error, form, onSubmit, clearError } = useRegister();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100/50 flex">
      {/* Left Panel - Brand & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#101828] via-[#151f3a] to-[#1a243f] p-12 md:p-36 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
            backgroundSize: '100px 100px'
          }} />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-linear-to-br from-[#551931] to-[#7a2547] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">SpendHelm</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-semibold text-white leading-tight mb-6">
            Start your journey
            <br />
            <span className="bg-linear-to-r from-[#F14926] to-orange-400 bg-clip-text text-transparent">
              to financial clarity.
            </span>
          </h1>
          <div className="space-y-4">
            <FeatureItem text="Track expenses in seconds" />
            <FeatureItem text="See spending patterns at a glance" />
            <FeatureItem text="Your data, always under your control" />
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-400">
          © 2025 SpendHelm
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2 justify-center mb-8">
              <div className="w-8 h-8 bg-linear-to-br from-[#551931] to-[#7a2547] rounded-lg flex items-center justify-center shadow-sm">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#101828] tracking-tight">SpendHelm</span>
            </Link>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-[#101828] mb-2">
                Create your account
              </h2>
              <p className="text-gray-600">
                Start tracking your expenses today
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="email" className="text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <FormControl>
                          <Input
                            id="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            disabled={isLoading}
                            onFocus={clearError}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="password" className="text-gray-700">
                        Password
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="At least 6 characters"
                            className="pl-10"
                            disabled={isLoading}
                            onFocus={clearError}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="confirmPassword" className="text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <FormControl>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            className="pl-10"
                            disabled={isLoading}
                            onFocus={clearError}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                {/* Terms & Privacy */}
                <div className="text-sm text-gray-600 pt-2">
                  <p>
                    By registering, you agree to our{' '}
                    <Link
                      href="/terms"
                      className="text-[#551931] font-medium hover:underline hover:text-[#7a2547] transition-colors"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-[#551931] font-medium hover:underline hover:text-[#7a2547] transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-linear-to-r from-[#F14926] to-[#f14926] hover:from-[#d93d1d] hover:to-[#c83212] text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>

            {/* Sign In Link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#551931] font-medium hover:underline hover:text-[#7a2547] transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}