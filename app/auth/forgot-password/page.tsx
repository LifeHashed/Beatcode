import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password - BeatCode',
  description: 'Reset your BeatCode password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
