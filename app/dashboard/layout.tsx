import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/dashboard/LogoutButton'
import { Bot } from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navbar */}
            <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10 w-full shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">FreelanceAI</span>
                </div>

                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-slate-600">{user?.email}</span>
                    <div className="h-4 w-px bg-slate-200" />
                    <LogoutButton />
                </div>
            </header>

            {/* Main Content (includes sidebar layout defined down the tree) */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}
