"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  CornerDownLeft,
  Minimize2,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  workflow: any;
  onApplyField: (fieldLabel: string, value: string) => void;
  activeArea: string;
}

export function AIAssistant({ workflow, onApplyField, activeArea }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: `¡Hola! Soy Nebula. Estoy analizando el flujo "**${workflow.name}**". ¿En qué puedo ayudarte hoy en el área de ${activeArea}?` 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].slice(-6), // Enviamos los últimos 6 mensajes para contexto
          workflowContext: workflow
        }),
      });

      if (!response.ok) throw new Error("Error en la comunicación con Nebula");

      const data = await response.json();
      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.choices[0].message.content 
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Lo siento, hubo un problema al conectar con mis servidores locales. Asegúrate de que Ollama esté corriendo." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const detectAndApplyFields = (text: string) => {
    // Busca patrones como "Sugerencia para [Nombre]: [Valor]"
    const lines = text.split("\n");
    lines.forEach(line => {
      const match = line.match(/Sugerencia para ([^:]+):\s*(.+)/i);
      if (match) {
        const fieldLabel = match[1].trim();
        const value = match[2].trim();
        onApplyField(fieldLabel, value);
      }
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-3xl border border-blue-500/20 bg-card/80 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white overflow-hidden p-1">
                  <img src="/corporate-logo.png" alt="Logo" className="h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">Nebula AI</h3>
                  <p className="mt-1 text-[10px] text-blue-100 opacity-80">Asistente Local Activado</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 transition-colors hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Area */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex max-w-[85%] flex-col gap-1",
                      msg.role === "user" ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                        msg.role === "user" 
                          ? "bg-blue-600 text-white" 
                          : "bg-card border border-border text-foreground"
                      )}
                    >
                      {msg.content}
                    </div>
                    
                    {msg.role === "assistant" && i > 0 && (
                      <div className="flex gap-2 px-1">
                        <button 
                          onClick={() => copyToClipboard(msg.content, i)}
                          className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center gap-1"
                        >
                          {copiedIndex === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedIndex === i ? "Copiado" : "Copiar"}
                        </button>
                        <button 
                          onClick={() => detectAndApplyFields(msg.content)}
                          className="text-[10px] text-slate-400 hover:text-indigo-500 flex items-center gap-1"
                        >
                          <CornerDownLeft className="h-3 w-3" />
                          Aplicar campos
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex h-6 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <div className="h-1 w-1 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                      <div className="mx-1 h-1 w-1 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                      <div className="h-1 w-1 animate-bounce rounded-full bg-slate-400"></div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <div className="flex gap-2">
                <Input 
                  placeholder="Pregunta a Nebula..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="rounded-xl border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-center text-[9px] text-slate-400">
                Impulsado por Gemma Local via Ollama
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          isOpen 
            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" 
            : "bg-gradient-to-br from-blue-500 to-indigo-700 text-white ring-4 ring-blue-500/20"
        )}
      >
        {isOpen ? <Minimize2 /> : <Bot className="h-7 w-7" />}
      </motion.button>
    </div>
  );
}
