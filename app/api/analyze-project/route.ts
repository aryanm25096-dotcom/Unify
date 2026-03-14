import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeProject } from '@/lib/claude'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'employer') {
            return NextResponse.json({ error: 'Forbidden: Employers only' }, { status: 403 })
        }

        const body = await request.json()
        const { description, budget } = body

        if (!description || description.length < 50) {
            return NextResponse.json({ error: 'Description must be at least 50 characters long' }, { status: 400 })
        }

        if (!budget || budget <= 0) {
            return NextResponse.json({ error: 'Budget must be a positive number' }, { status: 400 })
        }

        const plan = await analyzeProject(description)

        if (plan.error === 'description_too_vague') {
            return NextResponse.json({ error: plan.message || 'Description too vague' }, { status: 400 })
        }

        // Calculate actual payment amounts
        const enrichedMilestones = plan.milestones.map((milestone: any) => ({
            ...milestone,
            payment_amount: (milestone.payment_percentage / 100) * budget
        }))

        return NextResponse.json({
            ...plan,
            milestones: enrichedMilestones
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
