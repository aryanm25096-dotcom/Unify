import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, DollarSign, Clock } from 'lucide-react'

export default async function EmployerDashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user profile to get full_name
    const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user?.id)
        .single()

    const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
                <p className="text-slate-500 mt-2">Here is a summary of your workspace today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Active Projects</CardTitle>
                        <Activity className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">0</div>
                    </CardContent>
                </Card>

                <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">$0.00</div>
                    </CardContent>
                </Card>

                <Card className="border-0 ring-1 ring-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Pending Reviews</CardTitle>
                        <Clock className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">0</div>
                    </CardContent>
                </Card>
            </div>

            <div className="h-96 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-500">
                <div className="text-center">
                    <h3 className="font-semibold text-lg text-slate-700">No active projects</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1">Get started by creating a new project and hiring AI-vetted freelancers.</p>
                </div>
            </div>
        </div>
    )
}
