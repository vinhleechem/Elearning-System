"""
AI Provider - CHỈ SỬ DỤNG GEMINI
"""

from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class GeminiProvider:
    """Google Gemini Provider - Provider duy nhất"""
    
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            logger.error("❌ GEMINI_API_KEY is missing or empty!")
        else:
            logger.info(f"✅ GEMINI_API_KEY loaded (length: {len(settings.GEMINI_API_KEY)})")
            
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model_name = 'gemini-2.5-flash'
        logger.info(f"🔥 GeminiProvider initialized with model: {self.model_name}")
        self.model = genai.GenerativeModel(self.model_name)  # Updated model
    
    def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 5000  # Increased from 1000 to 2000
    ) -> str:
        try:
            # Convert messages to Gemini format
            # Gemini sử dụng format khác, cần convert từ OpenAI format
            prompt = self._convert_messages_to_prompt(messages)
            
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens
            )
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            # Debug: Check finish reason
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                logger.info(f"🔍 Finish reason: {candidate.finish_reason}")
                if hasattr(candidate, 'safety_ratings'):
                    logger.info(f"🔍 Safety ratings: {candidate.safety_ratings}")
            
            # Check if response was blocked
            if not response.text:
                logger.warning("⚠️ Empty response from Gemini!")
                if hasattr(response, 'prompt_feedback'):
                    logger.warning(f"⚠️ Prompt feedback: {response.prompt_feedback}")
                return "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại với câu hỏi khác."
            
            logger.info(f"✅ Response length: {len(response.text)} characters")
            return response.text
        except Exception as e:
            logger.error(f"❌ Gemini error: {e}")
            raise
    
    def _convert_messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        """Convert message format to Gemini prompt"""
        prompt_parts = []
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                prompt_parts.append(f"System: {content}")
            elif role == "user":
                prompt_parts.append(f"User: {content}")
            elif role == "assistant":
                prompt_parts.append(f"Assistant: {content}")
        return "\n\n".join(prompt_parts)


class AIProviderFactory:
    """Factory để tạo AI provider - CHỈ GEMINI"""
    
    @staticmethod
    def create_provider(provider_name: str = None) -> GeminiProvider:
        """
        Create AI provider instance
        CHỈ hỗ trợ Gemini
        """
        # Luôn trả về Gemini, bỏ qua provider_name
        return GeminiProvider()
