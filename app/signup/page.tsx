"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, Package, Building2, ShoppingCart, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { SparklesCore } from "@/components/ui/sparkles"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { motion } from "framer-motion"

type UserRole = "admin" | "warehouse_manager" | "sales_person"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole | "">("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [step, setStep] = useState<"role" | "details">("role")
  const router = useRouter()
  const { toast } = useToast()

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep("details")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!role) {
      toast({
        title: "Role selection required",
        description: "Please select a role to continue.",
        variant: "destructive",
      })
      setStep("role")
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    if (!acceptTerms) {
      toast({
        title: "Terms and conditions",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      toast({
        title: "Account created",
        description: `Your account has been created successfully as ${role.replace("_", " ")}!`,
      })

      router.push("/login")
    } catch (error) {
      console.error("Error creating account:", error)
      toast({
        title: "Error creating account",
        description:
          error instanceof Error ? error.message : "There was an error creating your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-none shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <Package className="h-8 w-8" />
                <CardTitle className="text-2xl font-bold">Inventory Pro</CardTitle>
              </div>
              <CardDescription>
                {step === "role"
                  ? "Select your role to create an account"
                  : "Enter your information to create an account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "role" ? (
                <div className="space-y-4">
                  <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)} className="space-y-3">
                    {roleOptions.map((option) => (
                      <div key={option.id} className="relative">
                        <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                        <Label
                          htmlFor={option.id}
                          className="flex items-start space-x-4 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800 [&:has([data-state=checked])]:bg-primary/5 [&:has([data-state=checked])]:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary"
                        >
                          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 text-primary">{option.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium">{option.title}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-primary opacity-0 [.peer[data-state=checked]+*>&]:opacity-100" />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button className="w-full mt-4" onClick={() => (role ? setStep("details") : null)} disabled={!role}>
                    Continue
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selected Role</Label>
                    <div className="flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm">
                      {role === "admin" && <Package className="h-4 w-4 text-primary" />}
                      {role === "warehouse_manager" && <Building2 className="h-4 w-4 text-primary" />}
                      {role === "sales_person" && <ShoppingCart className="h-4 w-4 text-primary" />}
                      <span className="capitalize">{role?.replace("_", " ")}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-8 px-2"
                        onClick={() => setStep("role")}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        className="pl-10"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
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
                    <Label htmlFor="password">Password</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the{" "}
                      <Link href="/terms-of-service" className="text-primary hover:underline">
                        terms and conditions
                      </Link>
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


