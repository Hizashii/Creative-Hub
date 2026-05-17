import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ApiRequestError } from "../../api/client";
import { AuthMediaPanel } from "./AuthMediaPanel";
import { LogoMark } from "../LogoMark";

const home = (role: string) =>
  role === "admin" ? "/admin/dashboard" : role === "designer" ? "/designer/dashboard" : "/client/dashboard";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const user = await login(email, password);
      navigate(home(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface text-on-surface antialiased">
      {/* Left: Form */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-20 bg-surface-container-lowest relative">
        <div className="absolute left-6 top-8 flex items-center gap-3 md:left-12 lg:left-20">
          <Link
            to="/"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant no-underline transition-colors hover:border-primary hover:text-primary"
            aria-label="Back to home"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>
          <LogoMark className="h-9 w-9" />
          <span className="text-base font-bold text-on-surface">Creative Hub</span>
        </div>

        <div className="w-full max-w-[440px] mx-auto mt-16 lg:mt-0">
          <div className="mb-8">
            <h1 className="text-[32px] font-bold leading-[40px] tracking-tight text-on-surface mb-2">Welcome back</h1>
            <p className="text-base text-on-surface-variant">Sign in to continue to your workspace.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-on-surface mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="block w-full pl-11 pr-4 h-[44px] bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-on-surface mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 h-[44px] bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pending}
                className="w-full flex justify-center items-center gap-2 bg-primary-container text-on-primary h-[48px] rounded-lg text-base font-semibold transition-all hover:bg-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-55"
              >
                {pending ? "Signing in…" : "Sign in"}
                {!pending && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-on-surface-variant">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary-container hover:text-primary transition-colors underline-offset-4 hover:underline no-underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <AuthMediaPanel />
    </div>
  );
}
