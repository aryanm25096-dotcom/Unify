import Link from 'next/link'
import { FolderKanban, PlusCircle, CreditCard, Settings } from 'lucide-react'

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white h-full hidden shrink-0 md:block">
                <nav className="p-4 space-y-1">
                    <Link href="/dashboard/employer" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-medium">
                        <FolderKanban className="h-5 w-5 text-indigo-600" />
                        <span>My Projects</span>
                    </Link>
                    <Link href="/dashboard/employer/new" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
                        <PlusCircle className="h-5 w-5 text-slate-400" />
                        <span>Post New Project</span>
                    </Link>
                    <Link href="/dashboard/employer/payments" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
                        <CreditCard className="h-5 w-5 text-slate-400" />
                        <span>Payments</span>
                    </Link>
                    <Link href="/dashboard/employer/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
                        <Settings className="h-5 w-5 text-slate-400" />
                        <span>Settings</span>
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto w-full p-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
