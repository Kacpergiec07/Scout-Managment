'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScoutProPlayer, Position } from '@/lib/types/player'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(15).max(45),
  nationality: z.string().min(2),
  position: z.string(),
  club: z.string().min(2),
  league: z.string().min(2),
  // Stats
  offensive: z.object({
    goals: z.coerce.number().default(0),
    assists: z.coerce.number().default(0),
    xG: z.coerce.number().default(0),
    xA: z.coerce.number().default(0),
  }),
  defensive: z.object({
    tackles: z.coerce.number().default(0),
    interceptions: z.coerce.number().default(0),
  }),
})

export function PlayerForm({ initialData }: { initialData?: Partial<ScoutProPlayer> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      age: initialData?.age || 20,
      nationality: initialData?.nationality || '',
      position: initialData?.position || 'ST',
      club: initialData?.club || '',
      league: initialData?.league || '',
      offensive: initialData?.stats?.offensive || { goals: 0, assists: 0, xG: 0, xA: 0 },
      defensive: initialData?.stats?.defensive || { tackles: 0, interceptions: 0 },
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Submitting Player Profile:', values)
    // Next Step: Persistence to Supabase
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border-zinc-800">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="offensive">Offensive</TabsTrigger>
            <TabsTrigger value="defensive">Defensive</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Erling Haaland" {...field} className="bg-zinc-800 border-zinc-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Main Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="ST">ST - Striker</SelectItem>
                        <SelectItem value="LW">LW - Left Wing</SelectItem>
                        <SelectItem value="RW">RW - Right Wing</SelectItem>
                        <SelectItem value="CAM">CAM - Attacking Mid</SelectItem>
                        <SelectItem value="CM">CM - Center Mid</SelectItem>
                        <SelectItem value="CB">CB - Center Back</SelectItem>
                        <SelectItem value="GK">GK - Goalkeeper</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Add more basic fields... */}
          </TabsContent>

          <TabsContent value="offensive" className="grid gap-4 md:grid-cols-2 pt-4">
            <FormField
              control={form.control}
              name="offensive.goals"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Goals (Current Season)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="offensive.xG"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">xG (Expected Goals)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} className="bg-zinc-800 border-zinc-700" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="defensive" className="grid gap-4 md:grid-cols-2 pt-4">
            <FormField
              control={form.control}
              name="defensive.tackles"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Tackles / 90min</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} className="bg-zinc-800 border-zinc-700" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-secondary-600 hover:bg-secondary-500">
            Generate Compatibility Analysis
          </Button>
        </div>
      </form>
    </Form>
  )
}
