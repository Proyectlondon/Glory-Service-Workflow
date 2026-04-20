import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages, workflowContext } = await request.json();

    // System prompt with context from the workflow
    const systemPrompt = {
      role: "system",
      content: `Eres Nebula, un asistente de IA experto en gestión de flujos de trabajo para Glory Service.
      
Contexto del Workflow Actual:
- Nombre: ${workflowContext.name}
- Área Actual: ${workflowContext.currentArea}
- Campos Disponibles: ${JSON.stringify(workflowContext.fields.map((f: any) => ({ label: f.label, area: f.area, value: f.value })))}

Instrucciones:
1. Ayuda al usuario a completar la información según su área.
2. Si el usuario pide ayuda para un campo, genera una respuesta profesional y concisa.
3. Puedes sugerir contenido para copiar/pegar.
4. Si detectas que falta información crítica para avanzar de área, menciónalo sutilmente.
5. Usa un tono profesional, servicial y moderno.
6. IMPORTANTE: Cuando generes una sugerencia para un campo específico, intenta usar un formato claro como "Sugerencia para [Nombre del Campo]: [Contenido]".`
    };

    const ollamaResponse = await fetch("http://127.0.0.1:11434/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma4", // Usamos el alias gemma4 configurado previamente
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
      }),
    });

    if (!ollamaResponse.ok) {
      const errorData = await ollamaResponse.text();
      console.error("Ollama error:", errorData);
      return NextResponse.json({ error: "Ollama server error" }, { status: 500 });
    }

    const data = await ollamaResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
