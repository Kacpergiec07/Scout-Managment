'use client'

import * as React from 'react'
import { X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ScoutBot() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Witaj w ScoutPro AI Intel! 🏆\n\nJestem Twoim asystentem skautingowym. Pomogę Ci znaleźć zawodników i przeanalizować ich profile.\n\nO co chcesz zapytać?'
    }
  ])
  const [isLoading, setIsLoading] = React.useState(false)
  
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      })
      
      if (!response.ok) throw new Error('API Error')
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')
      
      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantMessageId = (Date.now() + 1).toString()
      
      // Add empty assistant message
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }])
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        setMessages(prev => prev.map(m => 
          m.id === assistantMessageId ? { ...m, content: assistantContent } : m
        ))
      }
    } catch (error) {
      console.error('Chat Error:', error)
      setMessages(prev => [...prev, { 
        id: 'error', 
        role: 'assistant', 
        content: 'Przepraszam, wystąpił błąd podczas połączenia z AI. Sprawdź połączenie i spróbuj ponownie.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestion = (text: string) => {
    sendMessage(text)
  }

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input
    setInput('')
    sendMessage(text)
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="w-80 sm:w-96 h-[550px] flex flex-col glass-panel border-border shadow-2xl overflow-hidden rounded-2xl bg-card">
              <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between bg-muted/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-secondary">
                  <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  SCOUTPRO AI INTEL
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden bg-background">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-2xl shadow-sm ${
                          m.role === 'user' 
                            ? 'bg-secondary text-secondary-foreground ml-12 rounded-tr-none px-3 py-2 text-xs max-w-[75%]' 
                            : 'bg-muted text-foreground mr-4 rounded-tl-none p-4 text-sm max-w-[85%] border border-border'
                        }`}>
                          <div className="prose dark:prose-invert prose-xs max-w-none">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && !messages[messages.length-1].content && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl p-4 mr-4 animate-pulse border border-border">
                          <div className="flex gap-1">
                            <div className="h-1.5 w-1.5 bg-secondary rounded-full animate-bounce" />
                            <div className="h-1.5 w-1.5 bg-secondary rounded-full animate-bounce delay-100" />
                            <div className="h-1.5 w-1.5 bg-secondary rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="flex-col p-4 border-t border-border bg-muted/50 gap-3">
                <div className="flex flex-wrap gap-2 w-full">
                  {[
                    'Kto jest GOATem?',
                    'Hidden gems (ST)?',
                    'Statystyki (Top Scorer)',
                  ].map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => handleSuggestion(text)}
                      className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-card border border-border text-muted-foreground hover:text-secondary hover:border-secondary transition-all cursor-pointer z-10"
                    >
                      {text}
                    </button>
                  ))}
                </div>
                <form 
                  onSubmit={onFormSubmit} 
                  className="flex w-full gap-2"
                >
                  <Input 
                    placeholder="Ask about technical profiles..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="bg-background border-border text-foreground h-10 rounded-xl focus-visible:ring-secondary disabled:opacity-50"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading || !input.trim()} 
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-secondary/20 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-16 w-16 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center group z-50 ${
          isOpen ? 'bg-foreground rotate-90' : 'bg-secondary hover:bg-secondary/90'
        }`}
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-20 group-hover:hidden" />
        )}
        {isOpen ? (
          <X className="h-7 w-7 text-background" />
        ) : (
          <Bot className="h-8 w-8 text-secondary-foreground group-hover:scale-110 transition-transform" />
        )}
      </motion.button>
    </div>
  )
}
