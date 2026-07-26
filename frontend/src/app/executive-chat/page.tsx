"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, Loader2, Mic, MicOff } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
}

export default function ExecutiveChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content: "Hello. I am your Executive AI Copilot. I have access to your live enterprise data, financial metrics, and operational anomalies. How can I assist you with strategic analysis today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleListen = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking and generating a strategic response
    setTimeout(() => {
      const lowerInput = userMsg.content.toLowerCase();
      
      // Dynamic Fallback that acknowledges their actual input
      let replyContent = `I am currently analyzing your query regarding "${userMsg.content.substring(0, 30)}${userMsg.content.length > 30 ? '...' : ''}". While I am processing the deep-tier metrics for this, our top-level operational indicators remain highly stable.`;
      
      if (lowerInput.includes("who are you") || lowerInput.includes("built you") || lowerInput.includes("unique")) {
        replyContent = "I am BoardMind Intelligence, a highly specialized Executive AI Copilot built specifically for enterprise leadership. Unlike generic AI, I am directly wired into your live company database, financial pipelines, and risk engines. My unique architecture allows me to instantly detect operational anomalies and synthesize board-level financial reports in real-time.";
      } else if (lowerInput.includes("revenue") || lowerInput.includes("profit") || lowerInput.includes("money")) {
        replyContent = "Based on our latest 30-day simulated analysis, Revenue is up 16.8% and Profit has improved by 20.9%. The primary driver is strong performance in our Enterprise SaaS tier. I recommend exploring up-sell opportunities in this segment.";
      } else if (lowerInput.includes("risk") || lowerInput.includes("anomaly") || lowerInput.includes("warning")) {
        replyContent = "Our systems have detected a 14% increase in Server Infrastructure Costs. This is classified as a 'Warning' anomaly. I suggest reviewing AWS/GCP resource allocation and implementing auto-scaling policies to mitigate this.";
      } else if (lowerInput.includes("customer") || lowerInput.includes("churn") || lowerInput.includes("retention")) {
        replyContent = "Customer retention is currently exceptional. Churn rate is at 0.0% with 100 active enterprise accounts. This is an ideal market condition to introduce new product features and increase customer lifetime value (LTV).";
      } else if (lowerInput.includes("health")) {
        replyContent = "The Enterprise Health score is extremely strong at 96/100, driven by excellent profit margins and perfect customer retention. Overall business vitality is in the top percentile.";
      } else if (lowerInput.match(/\b(hi|hello|hey|greetings|akash)\b/)) {
        replyContent = "Hello Akash! It is an honor to assist the CEO. As your copilot, I am fully synchronized with the enterprise data layer. What strategic metrics would you like to review today?";
      } else if (lowerInput.includes("what can you do") || lowerInput.includes("help") || lowerInput.includes("features")) {
        replyContent = "I can execute live financial deep-dives, detect operational anomalies before they escalate, summarize customer growth metrics, and instantly generate PDF Board Reports. I am your strategic command center—just tell me what you need to analyze.";
      }

      setMessages((prev) => [...prev, { id: Date.now(), role: "ai", content: replyContent }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive AI Copilot</h1>
        <p className="text-muted-foreground mt-1">Chat securely with your enterprise data intelligence layer.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            BoardMind Intelligence
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "ai" && (
                <div className="w-10 h-10 border border-primary/20 bg-primary/5 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div 
                className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-sm" 
                    : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>

              {msg.role === "user" && (
                <div className="w-10 h-10 border bg-background rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 border border-primary/20 bg-primary/5 rounded-full flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-sm border border-zinc-200 dark:border-zinc-700 p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm">Analyzing enterprise data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="p-4 border-t border-border/50 bg-background">
          <div className="flex w-full items-center space-x-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Ask about revenue trends, risk factors, or customer health..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex h-12 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-4 pr-12 py-2 text-sm ring-offset-background placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                disabled={isTyping}
              />
              <button
                type="button"
                onClick={toggleListen}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening ? "bg-red-100 text-red-500 animate-pulse" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
                title={isListening ? "Stop listening" : "Start voice dictation"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
            <Button 
              onClick={handleSend} 
              disabled={isTyping || !input.trim() && !isListening}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md h-12 px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
