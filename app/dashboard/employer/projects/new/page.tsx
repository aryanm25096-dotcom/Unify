'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PostNewProjectPage() {
    const router = useRouter()
    const [stage, setStage] = useState<1 | 2 | 3>(1)
    
    // Stage 1 State
    const [description, setDescription] = useState('')
    const [budget, setBudget] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Stage 2 State
    const [plan, setPlan] = useState<any>(null)
    
    // Stage 3 State
    const [isSaving, setIsSaving] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)
        setError(null)
        
        try {
            const res = await fetch('/api/analyze-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    description, 
                    budget: parseFloat(budget) 
                })
            })
            
            const data = await res.json()
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate plan')
            }
            
            setPlan(data)
            setStage(2)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)
        
        try {
            const res = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    plan, 
                    budget: parseFloat(budget) 
                })
            })
            
            const data = await res.json()
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to save project')
            }
            
            router.push('/dashboard/employer/projects')
        } catch (err: any) {
            setError(err.message)
            setIsSaving(false)
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 space-y-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
                <Link href="/dashboard/employer" className="hover:text-foreground flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">Post New Project</span>
            </div>

            {/* Stages Indicator */}
            <div className="flex items-center justify-between mb-8 overflow-hidden rounded-full border bg-muted/50 p-1">
                {[1, 2, 3].map((s, i) => (
                    <div 
                        key={s} 
                        className={`flex-1 text-center py-2 text-sm font-medium rounded-full transition-colors ${
                            stage === s 
                                ? 'bg-background shadow-sm text-primary' 
                                : stage > s 
                                    ? 'text-primary' 
                                    : 'text-muted-foreground'
                        }`}
                    >
                        {i + 1}. {['Describe', 'Review Plan', 'Confirm & Fund'][i]}
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm mb-6">
                    {error}
                </div>
            )}

            {/* STAGE 1: Describe */}
            {stage === 1 && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Describe your project in detail</CardTitle>
                            <CardDescription>
                                The more detail you provide, the better our AI can structure your milestones.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea 
                                placeholder="e.g. I need a mobile app for booking hair salon appointments. Users should be able to browse stylists, book slots, pay online, and get reminders..." 
                                className="min-h-[200px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isGenerating}
                            />
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Total project budget (USD)</label>
                                <Input 
                                    type="number" 
                                    placeholder="3000" 
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    disabled={isGenerating}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                onClick={handleGenerate} 
                                className="w-full" 
                                disabled={isGenerating || description.length < 50 || !budget}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        AI is analyzing your project...
                                    </>
                                ) : 'Generate Project Plan'}
                            </Button>
                        </CardFooter>
                    </Card>

                    {isGenerating && (
                        <div className="space-y-4 animate-pulse">
                            <Skeleton className="h-8 w-[200px]" />
                            <Skeleton className="h-[200px] w-full" />
                            <Skeleton className="h-[100px] w-full" />
                        </div>
                    )}
                </div>
            )}

            {/* STAGE 2: Review Plan */}
            {stage === 2 && plan && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold">{plan.title}</h2>
                            <p className="text-muted-foreground mt-2">{plan.summary}</p>
                        </div>
                        <Badge variant={plan.complexity === 'high' ? 'destructive' : plan.complexity === 'medium' ? 'default' : 'secondary'} className="text-sm uppercase">
                            {plan.complexity} Complexity
                        </Badge>
                    </div>

                    <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Estimated Effort</p>
                            <p className="text-xl font-bold">{plan.estimated_hours} Hours</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Budget</p>
                            <p className="text-xl font-bold">${budget}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Milestones</h3>
                        {plan.milestones.map((m: any, idx: number) => (
                            <Card key={idx} className="overflow-hidden border-l-4" style={{borderLeftColor: 'hsl(var(--primary))'}}>
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardDescription className="font-semibold text-primary uppercase tracking-wider mb-1">
                                                Milestone {m.order}
                                            </CardDescription>
                                            <CardTitle className="text-lg">{m.title}</CardTitle>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div className="font-semibold text-lg">${m.payment_amount.toFixed(2)}</div>
                                            <div className="text-muted-foreground">({m.payment_percentage}%)</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <p className="text-sm">{m.description}</p>
                                    
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Success Criteria:</p>
                                        <ul className="space-y-2">
                                            {m.success_criteria.map((criteria: string, cIdx: number) => (
                                                <li key={cIdx} className="flex items-start">
                                                    <Checkbox className="mt-1 mr-2" disabled />
                                                    <span className="text-sm text-muted-foreground">{criteria}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded w-fit">
                                        <span className="font-medium mr-2">Target Deadline:</span> Day {m.deadline_days}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setStage(1)}>
                            Regenerate Plan
                        </Button>
                        <Button className="flex-1" onClick={() => setStage(3)}>
                            Looks Good, Continue
                        </Button>
                    </div>
                </div>
            )}

            {/* STAGE 3: Confirm & Fund */}
            {stage === 3 && plan && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Confirm & Lock Funds</CardTitle>
                            <CardDescription>
                                Review your project summary before creating it.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">{plan.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{plan.summary}</p>
                                
                                <div className="space-y-2 border-t pt-4">
                                    {plan.milestones.map((m: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>Milestone {m.order}: {m.title}</span>
                                            <span className="font-medium">${m.payment_amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                                        <span>Total Budget</span>
                                        <span>${parseFloat(budget).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
                                <p className="text-sm">
                                    Funds will be held securely until each milestone is approved. 
                                    Stripe payment integration will be activated in the next phase.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch space-y-3">
                            <Button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Post Project & Lock Funds
                            </Button>
                            <Button variant="ghost" onClick={() => setStage(2)}>
                                Go Back
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    )
}
