import logging
import time

from groq import AsyncGroq
from openai import APITimeoutError, AsyncOpenAI, RateLimitError

from app.config.settings import settings


logger = logging.getLogger(__name__)


class LLMProvider:
    def __init__(self) -> None:
        self._openai_client: AsyncOpenAI | None = None
        self._groq_client: AsyncGroq | None = None

    @property
    def openai_client(self) -> AsyncOpenAI:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured.")
        if self._openai_client is None:
            self._openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
        return self._openai_client

    @property
    def groq_client(self) -> AsyncGroq | None:
        if not settings.groq_api_key:
            return None
        if self._groq_client is None:
            self._groq_client = AsyncGroq(api_key=settings.groq_api_key)
        return self._groq_client

    async def generate_guidance(self, message: str, context: list[str], score: int) -> dict[str, str | float]:
        prompt = (
            "You are PulseGuard AI, a healthcare triage and operational intelligence assistant. "
            "Do not diagnose. Use probabilistic language. Provide symptom guidance, escalation "
            "recommendations when appropriate, and a short safety disclaimer.\n\n"
            f"User symptoms: {message}\n"
            f"Emergency score: {score}/100\n"
            f"Retrieved medical context: {context}\n"
        )

        try:
            return await self._call_openai(prompt)
        except (RateLimitError, APITimeoutError, Exception) as exc:
            logger.warning("OpenAI guidance failed; attempting Groq fallback. error=%s", exc)
            groq_client = self.groq_client
            if groq_client is None:
                raise exc
            return await self._call_groq(prompt, groq_client)

    async def _call_openai(self, prompt: str) -> dict[str, str | float]:
        start_time = time.perf_counter()
        response = await self.openai_client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "Never provide a final medical diagnosis or certainty claim."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            timeout=settings.openai_timeout_seconds,
        )
        return {
            "guidance": response.choices[0].message.content or "",
            "provider": "openai",
            "latency": time.perf_counter() - start_time,
        }

    async def _call_groq(self, prompt: str, groq_client: AsyncGroq) -> dict[str, str | float]:
        start_time = time.perf_counter()
        response = await groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "Never provide a final medical diagnosis or certainty claim."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        return {
            "guidance": response.choices[0].message.content or "",
            "provider": "groq",
            "latency": time.perf_counter() - start_time,
        }


llm_provider = LLMProvider()
