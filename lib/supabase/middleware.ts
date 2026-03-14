import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
    const isEmployerRoute = request.nextUrl.pathname.startsWith('/dashboard/employer')
    const isFreelancerRoute = request.nextUrl.pathname.startsWith('/dashboard/freelancer')

    // Not logged in but trying to access a protected route
    if (!user && !isAuthRoute) {
        // Make sure we only redirect if they are trying to access dashboard
        if (isDashboardRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }
    }

    // Logged in
    if (user) {
        if (isAuthRoute || request.nextUrl.pathname === '/') {
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = userData?.role || 'employer'
            const url = request.nextUrl.clone()
            url.pathname = role === 'employer' ? '/dashboard/employer' : '/dashboard/freelancer'
            return NextResponse.redirect(url)
        }

        if (isDashboardRoute) {
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (isEmployerRoute && userData?.role !== 'employer') {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard/freelancer'
                return NextResponse.redirect(url)
            }

            if (isFreelancerRoute && userData?.role !== 'freelancer') {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard/employer'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
