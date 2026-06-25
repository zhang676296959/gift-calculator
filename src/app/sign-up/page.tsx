"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignUp() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#FF1A6C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="text-white font-extrabold text-2xl tracking-tight block mb-8">
          Gift Calculator
        </Link>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
          <h1 className="text-white font-extrabold text-2xl mb-2">Create your account</h1>
          <p className="text-white/60 text-sm mb-8">
            Make your birthday unforgettable
          </p>

          <button
            onClick={() => signIn("google", { redirectTo: "/dashboard" })}
            className="w-full bg-white text-[#0f0a0a] font-bold py-3.5 rounded-full transition-all hover:bg-[#FFE600] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          <p className="mt-6 text-white/40 text-xs">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-white/70 underline hover:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
