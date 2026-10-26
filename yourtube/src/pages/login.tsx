import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, KeyRound, User, Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    sendLoginOtp,
    loginWithUsernameOtp,
    signupNewUser,
    handlegooglesignin,
    handlegithubsignin,
  } = useUser();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Sign In state
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInOtp, setSignInOtp] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up state
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpNewPassword, setSignUpNewPassword] = useState("");
  const [signUpRetypePassword, setSignUpRetypePassword] = useState("");
  const [showSignUpNewPassword, setShowSignUpNewPassword] = useState(false);
  const [showSignUpRetypePassword, setShowSignUpRetypePassword] = useState(false);

  // OTP state & timer
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [usernameWarning, setUsernameWarning] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Handle username change with strict special characters prevention
  const handleUsernameChange = (
    value: string,
    setter: (val: string) => void,
  ) => {
    // Check if user tried typing special characters
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(value);
    if (hasSpecialChar) {
      setUsernameWarning("Special characters are not allowed. Please use only letters and numbers (A-Z, a-z, 0-9).");
    } else {
      setUsernameWarning("");
    }
    // Automatically strip any special characters
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "");
    setter(cleaned);
  };

  // Trigger Send OTP for Sign In
  const handleSendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!signInUsername.trim()) {
      setErrorMessage("Please enter your username first to receive an OTP.");
      return;
    }

    if (!signInPassword) {
      setErrorMessage("Please enter your password first before requesting an OTP.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendLoginOtp(signInUsername.trim(), signInPassword);
      if (res.success) {
        setOtpSentNotice(res.message || "OTP has been sent to your email!");
        if (res.devOtp) {
          setSuccessMessage(`OTP sent to email! (Development code: ${res.devOtp})`);
        } else {
          setSuccessMessage(res.message || "OTP sent to your email!");
        }
        setOtpCountdown(60); // 60s cooldown
      } else {
        setErrorMessage(res.message || "Could not send OTP. Please check your credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error sending OTP to mail");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Submit Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!signInUsername.trim()) {
      setErrorMessage("Username is required.");
      return;
    }

    if (!signInPassword) {
      setErrorMessage("Password is required.");
      return;
    }

    // If OTP is empty, prompt user or auto-send OTP
    if (!signInOtp.trim()) {
      await handleSendOtp();
      setErrorMessage("We've sent an OTP to your email. Please enter the OTP to finish signing in.");
      return;
    }

    if (signInOtp.trim().length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithUsernameOtp({
        username: signInUsername.trim(),
        password: signInPassword,
        otp: signInOtp.trim(),
      });

      if (res.success && res.result) {
        setSuccessMessage("Signed in successfully! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 800);
      } else if (res.requiresOtp) {
        setOtpSentNotice(res.message || "OTP sent to your email.");
        if (res.devOtp) {
          setSuccessMessage(`OTP sent! (Development code: ${res.devOtp})`);
        }
        setErrorMessage("Please enter the 6-digit OTP sent to your email.");
      } else {
        setErrorMessage(res.message || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong during sign in.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!signUpUsername.trim()) {
      setErrorMessage("Username is required.");
      return;
    }

    if (!signUpEmail.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpEmail.trim())) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (!signUpNewPassword) {
      setErrorMessage("New password is required.");
      return;
    }

    if (signUpNewPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (signUpNewPassword !== signUpRetypePassword) {
      setErrorMessage("Retyped password does not match the new password.");
      return;
    }

    setLoading(true);
    try {
      const res = await signupNewUser({
        username: signUpUsername.trim(),
        email: signUpEmail.trim(),
        password: signUpNewPassword,
      });

      if (res.success) {
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 800);
      } else {
        setErrorMessage(res.message || "Signup failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong during signup.");
    } finally {
      setLoading(false);
    }
  };

  // Social Sign-Ins
  const handleGoogleClick = async () => {
    setErrorMessage("");
    try {
      await handlegooglesignin();
    } catch (err: any) {
      setErrorMessage("Google Sign In failed. Please try again.");
    }
  };

  const handleGitHubClick = async () => {
    setErrorMessage("");
    try {
      const res = await handlegithubsignin();
      if (res && !res.success && res.message) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage("GitHub Sign In failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 selection:bg-red-500 selection:text-white">
      <Head>
        <title>{`${activeTab === "signin" ? "Sign In" : "Sign Up"} - myTube`}</title>
      </Head>

      {/* Top back button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-1.5">
          <div className="bg-red-600 p-1 rounded">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">myTube</span>
        </div>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Tab Toggle */}
        <div className="flex bg-neutral-950 p-1 rounded-xl mb-6 border border-neutral-800/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrorMessage("");
              setSuccessMessage("");
              setUsernameWarning("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "signin"
                ? "bg-red-600 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setErrorMessage("");
              setSuccessMessage("");
              setUsernameWarning("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "signup"
                ? "bg-red-600 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            New User (Sign Up)
          </button>
        </div>

        {/* Alerts */}
        {usernameWarning && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-amber-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{usernameWarning}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {activeTab === "signin" && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <Label htmlFor="signin-username" className="text-xs font-medium text-neutral-300">
                Username (letters & numbers only)
              </Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <Input
                  id="signin-username"
                  type="text"
                  placeholder="Enter your username"
                  value={signInUsername}
                  onChange={(e) => handleUsernameChange(e.target.value, setSignInUsername)}
                  className="pl-9 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-red-500"
                  required
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Special characters are strictly disallowed.</p>
            </div>

            <div>
              <Label htmlFor="signin-password" className="text-xs font-medium text-neutral-300">
                Password
              </Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="signin-password"
                  type={showSignInPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="pl-9 pr-9 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* OTP Section */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-otp" className="text-xs font-medium text-neutral-300">
                  Email OTP Code
                </Label>
                {otpSentNotice && (
                  <span className="text-[11px] text-red-400 font-medium">OTP Sent to Mail</span>
                )}
              </div>
              <div className="mt-1 flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <Input
                    id="signin-otp"
                    type="text"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={signInOtp}
                    onChange={(e) => setSignInOtp(e.target.value.replace(/\D/g, ""))}
                    className="pl-9 tracking-widest bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-red-500 font-mono"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || otpCountdown > 0 || !signInUsername.trim() || !signInPassword}
                  className="border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs px-3 text-white shrink-0"
                >
                  {isSendingOtp
                    ? "Sending..."
                    : otpCountdown > 0
                    ? `Resend (${otpCountdown}s)`
                    : "Send OTP"}
                </Button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Enter your username & password, click "Send OTP" to receive code in your mail.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {/* SIGN UP (NEW USER) FORM */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <Label htmlFor="signup-username" className="text-xs font-medium text-neutral-300">
                Username (no special characters)
              </Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="e.g. JohnDoe123"
                  value={signUpUsername}
                  onChange={(e) => handleUsernameChange(e.target.value, setSignUpUsername)}
                  className="pl-9 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-red-500"
                  required
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Only alphanumeric characters allowed (no @, #, $, spaces, etc.).
              </p>
            </div>

            <div>
              <Label htmlFor="signup-email" className="text-xs font-medium text-neutral-300">
                Email Address (for OTP verification)
              </Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="pl-9 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signup-password" className="text-xs font-medium text-neutral-300">
                New Password
              </Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="signup-password"
                  type={showSignUpNewPassword ? "text" : "password"}
                  placeholder="Create a password (min 6 chars)"
                  value={signUpNewPassword}
                  onChange={(e) => setSignUpNewPassword(e.target.value)}
                  className="pl-9 pr-9 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpNewPassword(!showSignUpNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                >
                  {showSignUpNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="signup-retype" className="text-xs font-medium text-neutral-300">
                Retype Password
              </Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="signup-retype"
                  type={showSignUpRetypePassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={signUpRetypePassword}
                  onChange={(e) => setSignUpRetypePassword(e.target.value)}
                  className="pl-9 pr-9 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpRetypePassword(!showSignUpRetypePassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
                >
                  {showSignUpRetypePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 px-3 text-neutral-500">Or continue with</span>
          </div>
        </div>

        {/* Social Logins: Google & GitHub */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleClick}
            className="flex items-center justify-center gap-2 border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-white py-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span className="text-xs font-medium">Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleGitHubClick}
            className="flex items-center justify-center gap-2 border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-white py-2"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="text-xs font-medium">GitHub</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
