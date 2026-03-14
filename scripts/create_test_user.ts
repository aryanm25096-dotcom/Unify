import { createClient } from '@supabase/supabase-js'

// Using service role key to bypass RLS and auth limits
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createTestUser() {
    console.log("Creating test user...")

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: 'employer@test.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
            full_name: 'Test Employer',
            role: 'employer'
        }
    })

    if (authError) {
        console.error("Auth creation failed:", authError)
        return
    }

    if (!authData?.user?.id) {
        console.error("No user ID returned")
        return
    }

    console.log("Auth user created:", authData.user.id)

    // 2. Insert into users table
    const { error: dbError } = await supabaseAdmin.from('users').insert({
        id: authData.user.id,
        email: 'employer@test.com',
        full_name: 'Test Employer',
        role: 'employer'
    })

    if (dbError) {
        console.error("DB insertion failed:", dbError)
        return
    }

    console.log("Successfully created test employer! You can login with employer@test.com / password123")
}

createTestUser()
