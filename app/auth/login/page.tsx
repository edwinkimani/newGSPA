"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, Eye, EyeOff, Lock, Mail, Check } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { emailValidation, rateLimiting } from "@/lib/validationUtils";

const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const email = watch("email");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setAttemptCount(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockTimeRemaining]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      redirect: false, // Important: handle redirect manually
      email,
      password,
      rememberMe: rememberMe.toString(), // Pass remember me preference as string
    });

    setLoading(false);

    if (result?.error) {
      // Handle sign-in errors (e.g., invalid credentials)
      setError("Invalid email or password. Please try again.");
      console.error(result.error);
    } else if (result?.ok) {
      // Redirect to dashboard - middleware will handle appropriate redirects based on user status
      router.push("/dashboard")
    }
  };

  // Redirection is now handled in onSubmit after successful signIn

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/10 to-background">
      <Navigation />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl"></div>
          </div>

          <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg"></div>
                  <div className="relative bg-background border border-border/50 rounded-2xl p-4 shadow-xl">
                    <img
                      src="/Global-Security-Practitioners-Alliance.png"
                      alt="GSPA Logo"
                      className="h-20 w-auto"
                    />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">Welcome Back</CardTitle>
              <CardDescription className="text-lg">
                Sign in to your GSPA account to continue your certification journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              )}

              {attemptCount >= 3 && !isBlocked && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="font-medium text-amber-800 dark:text-amber-200">
                    Warning: {5 - attemptCount} attempts remaining before temporary lockout.
                  </AlertDescription>
                </Alert>
              )}

              {isBlocked && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <Lock className="h-5 w-5" />
                  <AlertDescription className="font-medium">
                    Account temporarily locked. Try again in {Math.floor(blockTimeRemaining / 60)}:
                    {String(blockTimeRemaining % 60).padStart(2, "0")}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Hidden input for remember me */}
                <input type="hidden" name="rememberMe" value={rememberMe.toString()} />

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-12 bg-black/5 text-base rounded-xl placeholder-gray-300 focus:border-primary/60 focus:ring-0"
                    {...register("email")}
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    disabled={isBlocked}
                  />

                  {errors.email && (
                    <p className="text-sm text-red-600 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="h-12 text-base bg-black/5 text-black  focus:border-primary/50 transition-colors pr-12"
                      {...register("password")}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isBlocked}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-background/80 hover:bg-background border border-border/50"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isBlocked}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-600 font-medium">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      disabled={isBlocked}
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm font-medium text-muted-foreground cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={loading || isBlocked}
                >
                  {loading ? "Logging in..." : isBlocked ? "Account Locked" : "Log in"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground font-medium">Don't have an account?</span>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors group"
                >
                  Register here
                  <Shield className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Your connection is secured with 256-bit SSL encryption</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
