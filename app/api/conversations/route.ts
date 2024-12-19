import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: true,
        persona: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Failed to fetch conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

// Export conversation as JSON or CSV
export async function POST(req: Request) {
  try {
    const { conversationId, format } = await req.json()

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        persona: {
          select: {
            id: true,
            name: true,
            systemPrompt: true
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvRows = [
        // Add metadata at the top
        ['Conversation Metadata:', ''],
        ['Username:', conversation.username || 'Anonymous'],
        ['Persona Name:', conversation.persona?.name || 'Default'],
        ['Persona ID:', conversation.persona?.id || 'N/A'],
        ['System Prompt:', conversation.persona?.systemPrompt || 'Default Assistant'],
        ['Created At:', conversation.createdAt.toISOString()],
        ['', ''], // Empty row for separation
        ['Messages:', ''],
        ['Timestamp', 'Role', 'Content'],
        ...conversation.messages.map(msg => 
          [
            msg.createdAt.toISOString(),
            msg.role,
            `"${msg.content.replace(/"/g, '""')}"` // Escape quotes for CSV
          ].join(',')
        )
      ]
      
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="conversation-${conversation.persona?.name || 'default'}-${conversationId}.csv"`
        }
      })
    }

    // Default to JSON format
    const exportData = {
      metadata: {
        username: conversation.username || 'Anonymous',
        createdAt: conversation.createdAt,
        persona: conversation.persona ? {
          id: conversation.persona.id,
          name: conversation.persona.name,
          systemPrompt: conversation.persona.systemPrompt
        } : {
          id: null,
          name: 'Default',
          systemPrompt: 'Default Assistant'
        }
      },
      messages: conversation.messages
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="conversation-${conversation.persona?.name || 'default'}-${conversationId}.json"`
      }
    })
  } catch (error) {
    console.error("Failed to export conversation:", error)
    return NextResponse.json(
      { error: "Failed to export conversation" },
      { status: 500 }
    )
  }
}
