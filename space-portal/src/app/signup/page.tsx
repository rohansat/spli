'use client';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-black/80 rounded-lg shadow-lg border border-white/20">
        <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
        <p className="text-white/70 text-center">Account creation is handled by your Microsoft account. Please sign in with Microsoft or contact support for access.</p>
      </div>
    </div>
  );
}
