import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const handleMicrosoftSignIn = async () => {
    try {
      await signIn('azure-ad', {
        callbackUrl: '/dashboard',
        redirect: true
      });
    } catch (error) {
      console.error('Error signing in with Microsoft:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-black/80 rounded-lg shadow-lg border border-white/20">
        <h2 className="text-3xl font-bold text-white text-center">Sign in to SPLI</h2>
        <button
          onClick={handleMicrosoftSignIn}
          className="w-full py-3 mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-lg transition"
        >
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}
