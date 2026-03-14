import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckBox } from '@/components/ui/checkbox'
import { CheckCircle2, Clock, AlertCircle, ArrowLeft, Calendar, FileText, CheckSquare } from 'lucide-react'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .eq('employer_id', user.id)
        .single()

    if (projectError || !project) {
        redirect('/dashboard/employer/projects')
    }

    const { data: milestones, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', project.id)
        .order('deadline', { ascending: true })

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'approved': return <CheckCircle2 className="w-5 h-5 text-green-500" />
            case 'submitted': return <FileText className="w-5 h-5 text-blue-500" />
            case 'disputed': return <AlertCircle className="w-5 h-5 text-destructive" />
            default: return <Clock className="w-5 h-5 text-muted-foreground" />
        }
    }

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'approved': return 'bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
            case 'submitted': return 'bg-blue-100/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            case 'disputed': return 'bg-destructive/10 text-destructive border-destructive/20'
            default: return 'bg-muted text-muted-foreground border-border'
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 space-y-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                <Link href="/dashboard/employer/projects" className="hover:text-foreground flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Projects
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium truncate max-w-[200px]">{project.title}</span>
            </div>

            {/* Project Header */}
            <Card>
                <CardHeader className="pb-4 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                            <Badge 
                                variant={
                                    project.status === 'active' ? 'default' : 
                                    project.status === 'completed' ? 'secondary' : 
                                    project.status === 'disputed' ? 'destructive' : 'outline'
                                }
                                className="uppercase tracking-wider text-xs"
                            >
                                {project.status}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Budget</p>
                            <p className="text-2xl font-bold">${project.total_budget.toFixed(2)}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 flex gap-6 text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Created: {new Date(project.created_at).toLocaleDateString()}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-6">Project Timeline</h3>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
                    {milestones?.map((milestone: any, index: number) => (
                        <div key={milestone.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${getStatusColor(milestone.status)}`}>
                                {getStatusIcon(milestone.status)}
                            </div>
                            
                            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 bg-muted/30">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardDescription className="uppercase tracking-widest text-xs font-semibold mb-1 text-primary">
                                                Phase {index + 1}
                                            </CardDescription>
                                            <CardTitle className="text-base">{milestone.title}</CardTitle>
                                        </div>
                                        <Badge variant="outline" className={`uppercase text-[10px] ${getStatusColor(milestone.status)}`}>
                                            {milestone.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                    
                                    <div className="bg-muted/50 rounded-md p-3 space-y-2">
                                        <div className="flex items-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                            <CheckSquare className="w-3 h-3 mr-1" /> Success Criteria
                                        </div>
                                        <ul className="space-y-1.5">
                                            {milestone.success_criteria?.map((c: string, i: number) => (
                                                <li key={i} className="text-sm flex items-start">
                                                    <span className="text-primary mr-2">•</span>
                                                    <span>{c}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs">Payment</span>
                                            <span className="font-semibold">${milestone.payment_percentage ? ((milestone.payment_percentage / 100) * project.total_budget).toFixed(2) : '0.00'}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-muted-foreground text-xs">Deadline</span>
                                            <span className="font-medium">{new Date(milestone.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    {milestone.status === 'submitted' && (
                                        <Button className="w-full mt-2" size="sm">
                                            Review Submission
                                        </Button>
                                    )}
                                    {milestone.status === 'approved' && (
                                        <div className="w-full mt-2 flex items-center justify-center text-sm text-green-600 bg-green-50 dark:bg-green-900/10 py-1.5 rounded font-medium">
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approved & Paid
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
