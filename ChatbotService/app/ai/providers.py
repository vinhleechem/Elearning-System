"""
AI Provider - Cloudflare Workers AI
"""

from typing import List, Dict, Any
import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class CloudflareProvider:
    """Cloudflare Workers AI Provider - Miễn phí 10,000 neurons/ngày"""

    # Model mặc định - Llama 3.3 70B chất lượng cao
    DEFAULT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"

    def __init__(self):
        self.account_id = settings.CLOUDFLARE_ACCOUNT_ID
        self.api_token = settings.CLOUDFLARE_API_TOKEN
        self.model_name = settings.CLOUDFLARE_MODEL or self.DEFAULT_MODEL

        if not self.account_id or not self.api_token:
            logger.error("❌ CLOUDFLARE_ACCOUNT_ID hoặc CLOUDFLARE_API_TOKEN bị thiếu!")
        else:
            logger.info(f"☁️ CloudflareProvider initialized với model: {self.model_name}")

        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/ai/run"
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

    def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        try:
            url = f"{self.base_url}/{self.model_name}"

            payload = {
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }

            with httpx.Client(timeout=60.0) as client:
                response = client.post(url, headers=self.headers, json=payload)
                response.raise_for_status()

            data = response.json()

            if not data.get("success"):
                errors = data.get("errors", [])
                logger.error(f"❌ Cloudflare API error: {errors}")
                raise Exception(f"Cloudflare API error: {errors}")

            result = data.get("result", {})
            text = result.get("response", "")

            if not text:
                logger.warning("⚠️ Cloudflare trả về response rỗng!")
                return "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại."

            logger.info(f"✅ Cloudflare response: {len(text)} ký tự")
            return text

        except httpx.HTTPStatusError as e:
            logger.error(f"❌ Cloudflare HTTP error {e.response.status_code}: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"❌ Cloudflare error: {e}")
            raise


class AIProviderFactory:
    """Factory để tạo AI provider - Cloudflare Workers AI"""

    @staticmethod
    def create_provider(provider_name: str = None) -> CloudflareProvider:
        """
        Tạo AI provider - luôn dùng Cloudflare Workers AI
        """
        logger.info("☁️ Sử dụng Cloudflare Workers AI")
        return CloudflareProvider()
