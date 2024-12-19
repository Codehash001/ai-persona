import { NextResponse } from "next/server"
import { openai } from '@ai-sdk/openai';
import { generateText} from 'ai';
import { prisma } from "@/lib/prisma"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, username, conversationId } = await req.json()
    const userMessage = messages[messages.length - 1].content

    // Get current settings from the settings table
    const settings = await prisma.settings.findUnique({
      where: { id: "1" },
      include: {
        selectedPersona: true
      }
    });

    console.log("Settings:", settings)

    // Default settings if none exist
    let temperature = 0.7
    let maxTokens = 1000
    let systemPrompt = "You are a helpful assistant."

    // Use settings from database if they exist
    if (settings) {
      temperature = settings.temperature
      maxTokens = settings.maxTokens
      
      // Use the selected persona's system prompt if available
      if (settings.selectedPersona) {
        systemPrompt = settings.selectedPersona.systemPrompt
        console.log('Using persona:', settings.selectedPersona.name)
      }
    }

    let conversation
    if (!conversationId) {
      // Create new conversation with persona
      conversation = await prisma.conversation.create({
        data: {
          username: username || "Anonymous",
          personaId: settings?.selectedPersonaId || null
        },
        include: {
          messages: true,
          persona: true
        }
      })
    } else {
      // Get existing conversation
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: true,
          persona: true
        }
      })
      
      if (!conversation) {
        throw new Error("Conversation not found")
      }
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: userMessage,
        role: "user"
      }
    })

    // Update system prompt if conversation has a specific persona
    if (conversation.persona?.systemPrompt) {
      systemPrompt = conversation.persona.systemPrompt
    }

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
      temperature,
      maxTokens
    });

    // Extract the text content from the result
    const responseText = typeof result === 'string' ? result : result.text || '';

    // Save assistant message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: responseText,
        role: "assistant"
      }
    })

    return NextResponse.json({
      role: "assistant",
      content: responseText,
      conversationId: conversation.id
    })

  } catch (error) {
    console.error("Error in chat:", error)
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    )
  }
}
