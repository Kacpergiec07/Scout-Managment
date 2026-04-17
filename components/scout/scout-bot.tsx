'use client'

import * as React from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from '@ai-sdk/react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

export function ScoutBot() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialInput: '',
    initialMessages: [
      { id: 'welcome', role: 'assistant', content: 'Hello! I am ScoutPro AI. How can I help you find the perfect talent for your squad today?' }
    ]
  } as any) as any
  
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="w-80 sm:w-96 h-[550px] flex flex-col glass-panel border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden rounded-2xl bg-white dark:bg-zinc-950">
              <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  SCOUTPRO AI INTEL
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-zinc-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden bg-white dark:bg-zinc-950">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                    {messages.map((m: any, i: number) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                          m.role === 'user' 
                            ? 'bg-emerald-600 text-white ml-4 rounded-tr-none' 
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 mr-4 rounded-tl-none border border-zinc-200 dark:border-zinc-800'
                        }`}>
                          <div className="prose dark:prose-invert prose-xs max-w-none">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-4 mr-4 animate-pulse border border-zinc-200 dark:border-zinc-800">
                          <div className="flex gap-1">
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce" />
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce delay-100" />
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                  <Input 
                    placeholder="Ask about technical profiles..." 
                    value={input}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 h-10 rounded-xl focus-visible:ring-emerald-500"
                  />
                  <Button type="submit" size="icon" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-emerald-500/20">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 ${
          isOpen ? 'bg-zinc-800 rotate-90' : 'bg-emerald-500 hover:bg-emerald-600'
        }`}
      >
        {isOpen ? <X className="h-6 w-6 text-zinc-50" /> : <MessageCircle className="h-6 w-6 text-zinc-950" />}
      </Button>
    </div>
  )
}
