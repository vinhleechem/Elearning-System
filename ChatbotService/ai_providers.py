"""
AI Provider - CHỈ SỬ DỤNG GEMINI
"""

from typing import List, Dict, Any
import google.generativeai as genai
from config import settings
import logging

logger = logging.getLogger(__name__)


class GeminiProvider:
    """Google Gemini Provider - Provider duy nhất"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')  # Updated model
    
    def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000
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
