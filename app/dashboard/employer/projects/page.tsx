import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PlusCircle, Calendar, DollarSign } from 'lucide-react'

export default async function EmployerProjectsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: projects, error } = await supabase
        .from('projects')
        .select(`
            *,
            milestones (
                id,
                status
            )
        `)
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching projects:', error)
    }

    return (
        <div className="container max-w-6xl mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
                    <p className="text-muted-foreground mt-2">Manage all your active and past projects.</p>
                </div>
                <Link href="/dashboard/employer/projects/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Post New Project
                    </Button>
                </Link>
            </div>

            {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project: any) => {
                        const totalMilestones = project.milestones?.length || 0;
                        const approvedMilestones = project.milestones?.filter((m: any) => m.status === 'approved').length || 0;
                        const progressPercentage = totalMilestones > 0 ? (approvedMilestones / totalMilestones) * 100 : 0;

                        return (
                            <Card key={project.id} className="flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge 
                                            variant={
                                                project.status === 'active' ? 'default' : 
                                                project.status === 'completed' ? 'secondary' : 
                                                project.status === 'disputed' ? 'destructive' : 'outline'
                                            }
                                        >
                                            {project.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl line-clamp-2">{project.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-3 rounded-lg">
                                        <div>
                                            <div className="text-muted-foreground flex items-center mb-1">
                                                <DollarSign className="h-3 w-3 mr-1" /> Budget
                                            </div>
                                            <div className="font-semibold">${project.total_budget.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground flex items-center mb-1">
                                                <Calendar className="h-3 w-3 mr-1" /> Milestones
                                            </div>
                                            <div className="font-semibold">{totalMilestones} phases</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Progress</span>
                                            <span>{approvedMilestones} / {totalMilestones} approved</span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-2" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/dashboard/employer/projects/${project.id}`} className="w-full">
                                        <Button variant="outline" className="w-full">View Details</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <h3 className="text-lg font-medium">No projects yet</h3>
                    <p className="text-muted-foreground mt-2 mb-6">Create your first project to get started.</p>
                    <Link href="/dashboard/employer/projects/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Post New Project
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
