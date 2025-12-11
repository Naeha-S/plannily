import { AGENT_TOOLS } from './tools';
import { generateSmartAI } from '../ai';

export interface AgentResponse {
    message: string;
    toolCall?: {
        name: string;
        arguments: any;
    };
    thoughtProcess?: string;
}

export const runAgent = async (
    userMessage: string,
    context: any,
    availableTools: string[] = Object.keys(AGENT_TOOLS)
): Promise<AgentResponse> => {

    const toolsDef = availableTools.map(key => {
        const t = AGENT_TOOLS[key];
        return `${t.name}: ${t.description} Params: ${JSON.stringify(t.parameters)}`;
    }).join('\n');

    const prompt = `
    You are an autonomous AI Travel Agent. 
    Your goal is to assist the user by answering questions OR taking actions using the available tools.
    
    Available Tools:
    ${toolsDef}
    
    Current User Context:
    ${JSON.stringify(context, null, 2)}
    
    User Request: "${userMessage}"
    
    Instructions:
    1. Analyze the user request.
    2. Decide if you need to use a tool to fulfill the request.
    3. If yes, respond with a JSON object containing the tool "name" and "arguments".
    4. If no, respond with a direct conversational "message".
    5. Always include a brief "thought" explaining your decision.

    Return strictly valid JSON in this format:
    {
      "thought": "Reasoning here...",
      "toolCall": {
        "name": "toolName",
        "arguments": { ... }
      },
      "message": "Optional message to user (if no tool needed, or to accompany tool)"
    }
    
    If no tool is needed, "toolCall" should be null.
    `;

    try {
        const rawResponse = await generateSmartAI(prompt);
        // Reuse extractJson logic or duplicate it for safety if imports are circular (they aren't here)
        // For simplicity, let's just parse.
        const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleaned);

        return {
            message: json.message,
            toolCall: json.toolCall,
            thoughtProcess: json.thought
        };
    } catch (error) {
        console.error('Agent Brain Failed:', error);
        // Fallback to basic chat
        return {
            message: "I'm having trouble connecting to my tools. Let me just answer directly: " + await generateSmartAI(userMessage),
        };
    }
};
