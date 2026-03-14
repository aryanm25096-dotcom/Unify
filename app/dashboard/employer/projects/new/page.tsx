'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Loader2, FileText, ChevronRight } from 'lucide-react'

// Map of stages
type Stage = 'describe' | 'review' | 'confirm'

export default function PostNewProjectPage() {
    const router = useRouter()
    const [stage, setStage] = useState<Stage>('describe')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form data
    const [description, setDescription] = useState('')
    const [budget, setBudget] = useState<string>('')

    // Fetched plan
    const [projectPlan, setProjectPlan] = useState<any>(null)

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (description.length < 50) {
            setError('Please provide more detail (at least 50 characters).')
            return
        }

        const budgetNum = parseFloat(budget)
        if (isNaN(budgetNum) || budgetNum <= 0) {
            setError('Please enter a valid positive budget amount.')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/analyze-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, budget: budgetNum })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze project')
            }

            setProjectPlan(data)
            setStage('review')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleConfirm = async () => {
        // Will be implemented in Session 4 (saving to Supabase)
        setStage('confirm')
    }

    const StageIndicator = () => (
        <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center \${stage === 'describe' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 \${stage === 'describe' ? 'bg-indigo-100' : 'bg-slate-100'}`}>1</div>
                Describe
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
            <div className={`flex items-center \${stage === 'review' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 \${stage === 'review' ? 'bg-indigo-100' : 'bg-slate-100'}`}>2</div>
                Review Plan
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
            <div className={`flex items-center \${stage === 'confirm' ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 \${stage === 'confirm' ? 'bg-indigo-100' : 'bg-slate-100'}`}>3</div>
                Confirm & Fund
            </div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Post New Project</h1>
            <p className="text-slate-500">Let our AI assist you in breaking down your project into actionable milestones.</p>

            <StageIndicator />

            {/* STAGE 1: Describe */}
            {stage === 'describe' && (
                <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>
                            Describe what you want to build in plain English. The more detail you provide, the better the AI can plan it out.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="describe-form" onSubmit={handleAnalyze} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-md border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="description">Describe your project in detail</Label>
                                <Textarea
                                    id="description"
                                    placeholder="e.g. I need a mobile app for booking hair salon appointments. Users should be able to browse stylists, book slots, pay online, and get reminders..."
                                    className="min-h-[200px] resize-y"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-xs text-slate-500 text-right">{description.length} characters (min 50)</p>
                            </div>

                            <div className="space-y-2 max-w-xs">
                                <Label htmlFor="budget">Total project budget (USD)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                    <Input
                                        id="budget"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        placeholder="5000"
                                        className="pl-8"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t px-6 py-4 bg-slate-50 rounded-b-xl">
                        <Button
                            form="describe-form"
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 min-w-[200px]"
                            disabled={loading || description.length < 50 || !budget}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing Project...
                                </>
                            ) : (
                                'Generate Project Plan'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* STAGE 2: Review */}
            {stage === 'review' && projectPlan && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-indigo-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                                {projectPlan.title}
                            </CardTitle>
                            <CardDescription className="text-slate-700">
                                {projectPlan.summary}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-6 text-sm">
                            <div className="bg-white px-4 py-2 rounded-md ring-1 ring-slate-200">
                                <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold mb-1">Complexity</span>
                                <span className="font-medium capitalize">{projectPlan.complexity}</span>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-md ring-1 ring-slate-200">
                                <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold mb-1">Est. Time</span>
                                <span className="font-medium">{projectPlan.estimated_hours} hours</span>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-md ring-1 ring-slate-200">
                                <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold mb-1">Total Budget</span>
                                <span className="font-medium">\${parseFloat(budget).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Proposed Milestones</h3>
                    <div className="space-y-4">
                        {projectPlan.milestones.map((milestone: any, index: number) => (
                            <Card key={index} className="border-0 shadow-sm ring-1 ring-slate-200">
                                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                                                Milestone {milestone.order}
                                            </div>
                                            <CardTitle className="text-lg">{milestone.title}</CardTitle>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-slate-900">
                                                \${milestone.payment_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {milestone.payment_percentage}% of budget
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-slate-600 mb-4">{milestone.description}</p>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-slate-900">Success Criteria:</h4>
                                        <ul className="space-y-2">
                                            {milestone.success_criteria.map((criteria: string, idx: number) => (
                                                <li key={idx} className="flex items-start text-sm text-slate-600">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                                                    <span>{criteria}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex items-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
                                        ⏱ {milestone.estimated_hours} hours est. work • 📅 Due in {milestone.deadline_days} days
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-between pt-6 border-t">
                        <Button variant="outline" onClick={() => setStage('describe')}>
                            Edit Description
                        </Button>
                        <Button onClick={handleConfirm} className="bg-indigo-600 hover:bg-indigo-700">
                            Confirm & Proceed to Funding
                        </Button>
                    </div>
                </div>
            )}

            {/* STAGE 3: Confirm (Placeholder) */}
            {stage === 'confirm' && (
                <Card className="border-0 shadow-sm ring-1 ring-emerald-200 bg-emerald-50 text-center py-12">
                    <CardContent>
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Plan Confirmed!</h3>
                        <p className="text-slate-600 max-w-sm mx-auto mb-6">
                            To be implemented in Session 4: Saving this plan to the database and integrating Stripe Connect for escrow funding.
                        </p>
                        <Button variant="outline" onClick={() => router.push('/dashboard/employer')}>
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
