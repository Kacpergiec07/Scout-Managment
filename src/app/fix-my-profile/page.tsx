'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { fixUserProfile } from '@/app/actions/fix-profile'

export default function FixMyProfilePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; error?: string } | null>(null)

  const handleFix = async () => {
    setLoading(true)
    setResult(null)

    try {
      const fixResult = await fixUserProfile()
      setResult(fixResult)

      if (fixResult.success) {
        // Refresh the page after successful fix
        setTimeout(() => {
          window.location.href = '/profile'
        }, 2000)
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Fix Your Profile</CardTitle>
            <CardDescription>
              Click the button below to automatically fix profile issues and update your statistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result && !loading && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h3 className="font-semibold text-blue-500 mb-2">What this fixes:</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground space-y-1">
                    <li>Empty email field in profile</li>
                    <li>Missing or incorrect profile data</li>
                    <li>"Access Interrupted" error in settings</li>
                    <li>Statistics not updating (Players Watched, etc.)</li>
                    <li>Schema mismatches between old and new accounts</li>
                  </ul>
                </div>

                <Button
                  onClick={handleFix}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Fix My Profile Now
                </Button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-muted-foreground">Fixing your profile...</p>
              </div>
            )}

            {result && (
              <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${result.success ? 'text-green-500' : 'text-red-500'} mb-1`}>
                      {result.success ? 'Success!' : 'Error'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.error && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}