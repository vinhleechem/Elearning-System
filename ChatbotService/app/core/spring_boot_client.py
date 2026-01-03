import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
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
        size: int = 100,  # Increase default size to get more courses
        category_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Lấy danh sách khóa học"""
        try:
            params = {"page": page, "size": size}
            if category_id:
                params["categoryId"] = category_id
            
            async with httpx.AsyncClient() as client:
                # Use public endpoint
                response = await client.get(
                    f"{self.base_url}/api/v1/courses",
                    params=params,
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Handle StandardResponse<PaginatedResponse<CourseResponse>> format
                # Actual response: { "success": true, "message": "...", "data": { "data": [...], "totalElements": N } }
                if isinstance(data, dict):
                    # Extract from StandardResponse wrapper
                    if 'data' in data and isinstance(data['data'], dict):
                        inner_data = data['data']
                        
                        # Check for data.data (actual courses array)
                        if 'data' in inner_data and isinstance(inner_data['data'], list):
                            print(f"✅ Extracted {len(inner_data['data'])} courses from data.data")
                            return inner_data['data']
                        
                        # Fallback: check for content
                        if 'content' in inner_data and isinstance(inner_data['content'], list):
                            print(f"✅ Extracted {len(inner_data['content'])} courses from data.content")
                            return inner_data['content']
                    
                    # Direct data array
                    if 'data' in data and isinstance(data['data'], list):
                        print(f"✅ Extracted {len(data['data'])} courses from data")
                        return data['data']
                
                print(f"⚠️ Could not extract courses from response structure")
                return data if isinstance(data, list) else []
        except Exception as e:
            logger.error(f"❌ Error fetching courses: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    async def get_course_detail(self, course_id: int) -> Optional[Dict[str, Any]]:
        """Lấy chi tiết khóa học"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/courses/{course_id}",
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
                    f"{self.base_url}/api/v1/categories",
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
                    f"{self.base_url}/api/v1/courses/search",
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
                    f"{self.base_url}/api/v1/users/{user_id}",
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
