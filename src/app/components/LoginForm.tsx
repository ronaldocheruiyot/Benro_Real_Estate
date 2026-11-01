import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, User, Shield, Wrench, Calculator, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "../context/AppDataContext";
import { ApiError } from "../api/client";

export interface UserCredentials {
  email: string;
  password: string;
  role: "admin" | "manager" | "caretaker" | "accountant";
  name: string;
}

export const sampleAccounts: UserCredentials[] = [
  { email: "admin@company.com", password: "admin123", role: "admin", name: "Admin User" },
  { email: "manager@company.com", password: "manager123", role: "manager", name: "John Manager" },
  { email: "caretaker@company.com", password: "caretaker123", role: "caretaker", name: "Mike Caretaker" },
  { email: "accountant@company.com", password: "accountant123", role: "accountant", name: "Sarah Accountant" },
];

export function LoginForm() {
  const { login } = useAppData();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      toast.error("Invalid credentials", {
        description: message || "Please check your email and password. Is the API running?",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = (account: UserCredentials) => {
    setUsername(account.email);
    setPassword(account.password);
    toast.info("Quick fill completed", {
      description: "Click Login to continue",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative w-full max-w-lg"
    >
      <div className="rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl shadow-brand-navy/10 backdrop-blur sm:p-10">
        <div className="mb-8">
          <div className="mb-2 text-3xl font-semibold tracking-tight text-brand-navy">Welcome back</div>
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in to manage your BENRO property portfolio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-brand-navy">
              Email address
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-cyan" />
              <Input
                id="username"
                type="email"
                placeholder="name@company.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 border-brand-navy/10 bg-brand-cyan-soft/40 pl-10 text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-cyan focus-visible:ring-brand-cyan/20"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-brand-navy">
              Password
            </Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-cyan" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-brand-navy/10 bg-brand-cyan-soft/40 pl-10 pr-11 text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-cyan focus-visible:ring-brand-cyan/20"
                autoComplete="current-password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-brand-navy/60 hover:text-brand-navy"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full gap-2 bg-brand-navy text-white hover:bg-brand-navy/90"
          >
            {submitting ? "Signing in…" : "Login"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="mt-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Demo accounts (seeded in MongoDB)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {sampleAccounts.map((account) => {
              const Icon =
                account.role === "admin"
                  ? Shield
                  : account.role === "manager"
                    ? User
                    : account.role === "caretaker"
                      ? Wrench
                      : Calculator;
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => quickLogin(account)}
                  className="flex items-center gap-2 rounded-xl border border-brand-navy/10 bg-brand-cyan-soft/30 px-3 py-2 text-left text-xs transition hover:border-brand-cyan hover:bg-brand-cyan-soft/60"
                >
                  <Icon className="size-3.5 text-brand-cyan" />
                  <span className="truncate text-brand-navy">{account.role}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
