import { login, signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-zinc-950 text-zinc-50">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-50">Scout Pro</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your email to sign in to your scouting dashboard
          </CardDescription>
        </CardHeader>
        <form>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" name="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-50 focus-visible:ring-emerald-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              formAction={login}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              Sign In
            </Button>
            <Button
              formAction={signup}
              variant="outline"
              className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
            >
              Request Access / Sign Up
            </Button>
            {/* Display errors if any */}
            {(await searchParams).error && (
              <p className="text-sm text-red-400 text-center w-full">
                {decodeURIComponent((await searchParams).error as string)}
              </p>
            )}
            {(await searchParams).message && (
              <p className="text-sm text-emerald-400 text-center w-full">
                {decodeURIComponent((await searchParams).message as string)}
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
