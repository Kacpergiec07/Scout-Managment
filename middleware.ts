<<<<<<< HEAD
// import { type NextRequest } from 'next/server'
// import { updateSession } from '@/lib/supabase/middleware'

// export async function middleware(request: NextRequest) {
//   return await updateSession(request)
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * Feel free to modify this pattern to include more paths.
//      */
//     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// }
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  return NextResponse.next()
=======
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
>>>>>>> 0fced7fac57a646d79d15a5adebe45adaee32fbd
}

export const config = {
  matcher: [
<<<<<<< HEAD
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
=======
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
>>>>>>> 0fced7fac57a646d79d15a5adebe45adaee32fbd
  ],
}
