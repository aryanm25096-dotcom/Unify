'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, User } from 'lucide-react'

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'employer' | 'freelancer' | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!role) {
            setError('Please select a role')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // 2. Insert into public.users table (trigger might do it, but let's do explicitly to be safe,
                // unless RLS blocks it. Let's do it directly since we need the correct role in our DB and might
                // not have set up an auth trigger).
                // Wait, if RLS is on, without a policy we might fail. Since we created tables without explicit RLS
                // or disabled RLS, it should work. Wait, the user is authenticated from the JWT.
                const { error: dbError } = await supabase
                    .from('users')
                    .insert({
                        id: authData.user.id,
                        email: email,
                        full_name: fullName,
                        role: role
                    })

                if (dbError) {
                    // Some setups have triggers that automatically create the user. Check if it's uniquely constrained.
                    console.error("User insertion error (might already exist by trigger):", dbError)
                }

                // redirect
                router.push(role === 'employer' ? '/dashboard/employer' : '/dashboard/freelancer')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-slate-200">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">Create an account</CardTitle>
                    <CardDescription className="text-center text-slate-500">
                        Join FreelanceAI to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="pt-2 space-y-3">
                            <Label>I am a...</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'employer' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                    onClick={() => setRole('employer')}
                                >
                                    <Briefcase className="h-6 w-6 mb-2" />
                                    <span className="font-medium text-sm">Employer</span>
                                </div>
                                <div
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'freelancer' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                    onClick={() => setRole('freelancer')}
                                >
                                    <User className="h-6 w-6 mb-2" />
                                    <span className="font-medium text-sm">Freelancer</span>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" type="submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center border-t px-6 py-4">
                    <div className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-indigo-600 hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
