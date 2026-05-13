from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = "user"
    content: str


class MentorChatRequest(BaseModel):
    message: str
    context: str | None = None
    level: str = Field(default="beginner", pattern="^(beginner|intermediate|expert)$")
    history: list[ChatMessage] = []


class MentorChatResponse(BaseModel):
    response: str
    suggestions: list[str] = []


class CodeExplainRequest(BaseModel):
    code: str
    language: str = "python"
    level: str = Field(default="beginner", pattern="^(beginner|intermediate|expert)$")


class QuizGenerateRequest(BaseModel):
    topic: str
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    num_questions: int = Field(default=5, ge=1, le=20)


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_answer: int
    explanation: str


class QuizResponse(BaseModel):
    topic: str
    difficulty: str
    questions: list[QuizQuestion]


class WeakAreaAnalysis(BaseModel):
    weak_areas: list[str]
    recommendations: list[str]
    suggested_problems: list[str]
