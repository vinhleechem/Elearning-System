import httpx
from typing import List, Dict, Any, Optional
from config import settings
import logging

logger = logging.getLogger(__name__)


class SpringBootClient:
    """Client để gọi API từ Spring Boot backend"""
    
    def __init__(self):
        self.base_url = settings.SPRING_BOOT_BASE_URL
        self.api_key = settings.SPRING_BOOT_API_KEY
        self.headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"
    
    async def get_courses(
        self,
        page: int = 0,
        size: int = 10,
        category_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Lấy danh sách khóa học"""
        try:
            params = {"page": page, "size": size}
            if category_id:
                params["categoryId"] = category_id
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/courses",
                    params=params,
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"❌ Error fetching courses: {e}")
            return []
    
    async def get_course_detail(self, course_id: int) -> Optional[Dict[str, Any]]:
        """Lấy chi tiết khóa học"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/courses/{course_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"❌ Error fetching course detail: {e}")
            return None
    
    async def get_categories(self) -> List[Dict[str, Any]]:
        """Lấy danh sách categories"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/categories",
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"❌ Error fetching categories: {e}")
            return []
    
    async def search_courses(self, query: str) -> List[Dict[str, Any]]:
        """Tìm kiếm khóa học"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/courses/search",
                    params={"q": query},
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"❌ Error searching courses: {e}")
            return []
    
    async def get_user_info(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Lấy thông tin user"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/users/{user_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"❌ Error fetching user info: {e}")
            return None


# Global instance
spring_boot_client = SpringBootClient()
