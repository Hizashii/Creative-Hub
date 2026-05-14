import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ApiRequestError } from "../../api/client";

type RegistrationRole = "client" | "designer";

const ROLES: { value: RegistrationRole; label: string; icon: string; description: string }[] = [
  {
    value: "designer",
    label: "Creative Pro",
    icon: "palette",
    description: "I want to showcase my work and find clients.",
  },
  {
    value: "client",
    label: "Client",
    icon: "business_center",
    description: "I'm looking to hire top creative talent.",
  },
];

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const user = await register({ name, email, password, role: selectedRole });
      navigate(
        user.role === "admin"
          ? "/admin/dashboard"
          : user.role === "designer"
            ? "/designer/dashboard"
            : "/client/dashboard",
        { replace: true }
      );
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface text-on-surface antialiased">
      {/* Left: Form */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-20 bg-surface-container-lowest relative overflow-y-auto">
        {/* Brand */}
        <div className="absolute top-8 left-6 md:left-12 lg:left-20 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">widgets</span>
          </div>
          <span className="text-base font-bold text-on-surface">Creative Hub</span>
        </div>

        <div className="w-full max-w-[440px] mx-auto mt-16 lg:mt-0">
          <div className="mb-8">
            <h1 className="text-[32px] font-bold leading-[40px] tracking-tight text-on-surface mb-2">
              Create an account
            </h1>
            <p className="text-base text-on-surface-variant">
              Join our platform to manage projects, collaborate, and grow your business.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">
                {error}
              </div>
            )}

            {/* Role selection */}
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold text-on-surface">Select your role</legend>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => {
                  const active = selectedRole === r.value;
                  return (
                    <label
                      key={r.value}
                      className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-150 hover:-translate-y-px ${
                        active
                          ? "border-2 border-primary-container bg-surface-container-low shadow-sm"
                          : "border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={active}
                        onChange={() => setSelectedRole(r.value)}
                        className="sr-only"
                      />
                      <span
                        className={`material-symbols-outlined text-[28px] mb-3 ${active ? "text-primary-container" : "text-outline"}`}
                        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {r.icon}
                      </span>
                      <span className="text-sm font-semibold text-on-surface">{r.label}</span>
                      <span className="text-xs text-on-surface-variant mt-1 leading-snug">
                        {r.description}
                      </span>
                      {active && (
                        <span
                          className="absolute top-3 right-3 material-symbols-outlined text-primary-container text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Full name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-on-surface mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  person
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="block w-full pl-11 pr-4 h-[44px] bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-on-surface mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-on-surface mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 h-[44px] bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors shadow-sm"
                />
              </div>
              <p className="mt-1.5 text-xs text-on-surface-variant">
                Must be at least 8 characters long.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pending}
                className="w-full flex justify-center items-center gap-2 bg-primary-container text-on-primary h-[48px] rounded-lg text-base font-semibold transition-all hover:bg-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-55"
              >
                {pending ? "Creating…" : "Create Account"}
                {!pending && (
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-on-surface-variant">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary-container hover:text-primary transition-colors underline-offset-4 hover:underline no-underline"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Right: Hero */}
      <aside className="hidden lg:flex lg:w-1/2 relative bg-primary-container overflow-hidden items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary-container to-surface-tint" />
        <div className="relative z-10 p-16">
          <span
            className="material-symbols-outlined text-secondary-fixed text-[40px] mb-4 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            format_quote
          </span>
          <p className="text-[28px] font-bold leading-tight mb-6 text-on-primary">
            "Joining Creative Hub transformed how we manage our agency. The streamlined workflow and
            access to top-tier client projects is unmatched."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-high border-2 border-secondary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
            </div>
            <div>
              <p className="font-semibold text-on-primary">Sarah Jenkins</p>
              <p className="text-sm text-inverse-primary opacity-90">Design Director, Studio Alpha</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
