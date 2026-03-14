import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { plan, budget } = body

        if (!plan || !budget) {
            return NextResponse.json({ error: 'Missing plan or budget' }, { status: 400 })
        }

        // 1. Insert into projects table
        const { data: newProject, error: projectError } = await supabase
            .from('projects')
            .insert({
                employer_id: user.id,
                title: plan.title,
                description: plan.summary,
                total_budget: budget,
                status: 'active'
            })
            .select()
            .single()

        if (projectError) {
            console.error('Error creating project:', projectError)
            return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
        }

        // 2. Insert milestones
        const milestonesToInsert = plan.milestones.map((m: any) => {
            const deadlineDate = new Date();
            deadlineDate.setDate(deadlineDate.getDate() + m.deadline_days);

            return {
                project_id: newProject.id,
                title: m.title,
                description: m.description,
                success_criteria: m.success_criteria,
                payment_percentage: m.payment_percentage,
                deadline: deadlineDate.toISOString(),
                status: 'pending'
            }
        });

        const { data: insertedMilestones, error: milestonesError } = await supabase
            .from('milestones')
            .insert(milestonesToInsert)
            .select()

        if (milestonesError) {
            console.error('Error creating milestones:', milestonesError)
            // Rollback the project creation if milestone fails
            await supabase.from('projects').delete().eq('id', newProject.id);
            return NextResponse.json({ error: 'Failed to create milestones' }, { status: 500 })
        }

        return NextResponse.json({
            project_id: newProject.id,
            milestone_count: insertedMilestones.length,
            total_budget: budget
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
