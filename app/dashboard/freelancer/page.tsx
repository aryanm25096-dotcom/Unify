import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, DollarSign, Target } from 'lucide-react'

export default async function FreelancerDashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user profile to get full_name
    const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user?.id)
        .single()

    const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    // Default score per spec
    const pfiScore = 500

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
                <p className="text-slate-500 mt-2">Here is a summary of your freelance activity today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Active Projects</CardTitle>
                        <Briefcase className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">0</div>
                    </CardContent>
                </Card>

                <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Earned</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">$0.00</div>
                    </CardContent>
                </Card>

                <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">PFI Score</CardTitle>
                        <Target className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-bold text-indigo-700">{pfiScore}</span>
                            <span className="text-sm font-medium text-slate-500">/ 1000</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full" style={{ width: `${(pfiScore / 1000) * 100}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-0 ring-1 ring-slate-200 shadow-sm flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">AI Full Stack App</CardTitle>
                                    <div className="text-sm text-slate-500">By StartupInc • {i}d ago</div>
                                </div>
                                <div className="bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-md text-sm">
                                    ${1500 * i}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 flex-1">
                            Looking for a senior engineer to build a React and Python-based marketing agent with stripe integrations...
                        </CardContent>
                        <div className="px-6 pb-6 pt-0 mt-auto">
                            <button className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 transition-colors">
                                View Project
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
