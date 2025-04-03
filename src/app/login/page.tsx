"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Package, Building2, ShoppingCart, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { SparklesCore } from "@/components/ui/sparkles"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { motion, AnimatePresence } from "framer-motion"
import type { UserRole } from "@/lib/auth"

export default function LoginPage() {
  const [step, setStep] = useState<"role" | "credentials">("role")
  const [role, setRole] = useState<UserRole | "">("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Load saved email if remember me was checked previously
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep("credentials")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Save email if remember me is checked
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email)
    } else {
      localStorage.removeItem("rememberedEmail")
    }

    // Simulate API call
    setTimeout(() => {
      // In a real app, validate credentials against your backend
      if (email && password && role) {
        toast({
          title: "Login successful",
          description: `Welcome back! You are logged in as ${role.replace("_", " ")}.`,
        })

        // Redirect based on role
        switch (role) {
          case "admin":
            router.push("/dashboard")
            break
          case "warehouse_manager":
            router.push("/warehouses")
            break
          case "sales_person":
            router.push("/pos")
            break
        }
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }, 1500)
  }

  const roleOptions = [
    {
      id: "admin",
      title: "Administrator",
      description: "Full system access and control",
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: "warehouse_manager",
      title: "Warehouse Manager",
      description: "Manage inventory and stock levels",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      id: "sales_person",
      title: "Sales Person",
      description: "Access POS and process sales",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#2563eb"
        />
      </div>

      <div className="z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === "role" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === "role" ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardHeader className="space-y-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Package className="h-8 w-8" />
                  <CardTitle className="text-2xl font-bold">Inventory Pro</CardTitle>
                </div>
                {step === "role" ? (
                  <CardDescription>Select your role to continue</CardDescription>
                ) : (
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {step === "role" ? (
                  <div className="space-y-4">
                    <RadioGroup
                      value={role}
                      onValueChange={(value) => setRole(value as UserRole)}
                      className="space-y-3"
                    >
                      {roleOptions.map((option) => (
                        <div key={option.id} className="relative">
                          <RadioGroupItem value={option.id} id={`login-${option.id}`} className="peer sr-only" />
                          <Label
                            htmlFor={`login-${option.id}`}
                            className="flex items-start space-x-4 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800 [&:has([data-state=checked])]:bg-primary/5 [&:has([data-state=checked])]:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary cursor-pointer transition-all"
                          >
                            <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 text-primary">
                              {option.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{option.title}</div>
                              <div className="text-sm text-muted-foreground">{option.description}</div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-primary opacity-0 [.peer[data-state=checked]+*>&]:opacity-100" />
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button
                      className="w-full mt-4"
                      onClick={() => (role ? setStep("credentials") : null)}
                      disabled={!role}
                    >
                      Continue
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Selected Role</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 flex items-center gap-1 text-xs"
                          onClick={() => setStep("role")}
                        >
                          <ArrowLeft className="h-3 w-3" />
                          Change role
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm bg-primary/5 border-primary">
                        {role === "admin" && <Package className="h-4 w-4 text-primary" />}
                        {role === "warehouse_manager" && <Building2 className="h-4 w-4 text-primary" />}
                        {role === "sales_person" && <ShoppingCart className="h-4 w-4 text-primary" />}
                        <span className="capitalize">{role?.replace("_", " ")}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Signing in...
                        </div>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

