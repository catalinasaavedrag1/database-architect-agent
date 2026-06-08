import { runClaudeDatabaseArchitect } from "../claude/databaseArchitectClaude.agent";

export async function handleDatabaseArchitectQuestion(
  body: unknown
): Promise<{
  success: boolean;
  answer?: string;
  error?: string;
}> {
  try {
    if (
      typeof body !== "object" ||
      body === null ||
      !("question" in body) ||
      typeof (body as { question: unknown }).question !== "string"
    ) {
      return {
        success: false,
        error: "Invalid body. Expected: { question: string }",
      };
    }

    const answer = await runClaudeDatabaseArchitect({
      question: (body as { question: string }).question,
    });

    return {
      success: true,
      answer,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
