import json

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.ai_mentor import (
    CodeExplainRequest,
    MentorChatRequest,
    MentorChatResponse,
    QuizGenerateRequest,
    QuizResponse,
)

router = APIRouter(prefix="/ai", tags=["AI Mentor"])


def _get_openai_client():
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI mentor is not configured. Set OPENAI_API_KEY.",
        )
    from openai import OpenAI
    return OpenAI(api_key=settings.OPENAI_API_KEY)


@router.post("/chat", response_model=MentorChatResponse)
async def chat_with_mentor(
    data: MentorChatRequest,
    _current_user: User = Depends(get_current_user),
):
    client = _get_openai_client()

    system_prompt = f"""You are CodeArena AI Mentor, an expert coding tutor.
Adapt your explanations to {data.level} level.
Be encouraging, clear, and provide practical examples.
If asked about code, provide detailed explanations with examples.
Suggest related topics to explore next."""

    messages = [{"role": "system", "content": system_prompt}]
    for msg in data.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": data.message})

    if data.context:
        messages[-1]["content"] += f"\n\nContext: {data.context}"

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=1500,
    )

    ai_response = response.choices[0].message.content or ""
    suggestions = _extract_suggestions(ai_response)

    return MentorChatResponse(response=ai_response, suggestions=suggestions)


@router.post("/explain")
async def explain_code(
    data: CodeExplainRequest,
    _current_user: User = Depends(get_current_user),
):
    client = _get_openai_client()

    prompt = f"""Explain this {data.language} code at a {data.level} level.
Break down:
1. What the code does overall
2. Key concepts used
3. Step-by-step walkthrough
4. Potential improvements

Code:
```{data.language}
{data.code}
```"""

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are an expert code explainer."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
        max_tokens=2000,
    )

    return {"explanation": response.choices[0].message.content}


@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(
    data: QuizGenerateRequest,
    _current_user: User = Depends(get_current_user),
):
    client = _get_openai_client()

    prompt = f"""Generate {data.num_questions} multiple-choice quiz questions about "{data.topic}" at {data.difficulty} difficulty.

Return a JSON array with this exact structure:
[
  {{
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct_answer": 0,
    "explanation": "..."
  }}
]

Only return the JSON array, nothing else."""

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are a quiz generator. Return only valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.8,
        max_tokens=3000,
    )

    content = response.choices[0].message.content or "[]"
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1].rsplit("```", 1)[0]

    try:
        questions = json.loads(content)
    except json.JSONDecodeError:
        questions = []

    return QuizResponse(topic=data.topic, difficulty=data.difficulty, questions=questions)


@router.post("/analyze-weakness")
async def analyze_weakness(
    _current_user: User = Depends(get_current_user),
):
    return {
        "weak_areas": ["Dynamic Programming", "Graph Algorithms", "Recursion"],
        "recommendations": [
            "Practice more DP problems starting with fibonacci variants",
            "Study BFS/DFS traversal patterns",
            "Work through recursive tree problems",
        ],
        "suggested_problems": [
            "climbing-stairs",
            "number-of-islands",
            "binary-tree-inorder-traversal",
        ],
    }


def _extract_suggestions(text: str) -> list[str]:
    suggestions = []
    keywords = ["try", "explore", "practice", "learn", "study", "check out"]
    for line in text.split("\n"):
        line = line.strip()
        if any(kw in line.lower() for kw in keywords) and len(line) < 100:
            suggestions.append(line.lstrip("- •*"))
    return suggestions[:5]
