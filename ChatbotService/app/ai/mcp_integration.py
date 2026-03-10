"""
MCP (Model Context Protocol) Integration
Kết nối với các MCP servers để mở rộng khả năng của chatbot

MCP là giao thức chuẩn từ Anthropic cho phép AI models kết nối với:
- File systems
- Databases
- APIs
- External tools
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class MCPServer:
    """Base class cho MCP Server connections"""
    
    def __init__(self, name: str, config: Dict[str, Any]):
        self.name = name
        self.config = config
        self.connected = False
    
    async def connect(self) -> bool:
        """Kết nối đến MCP server"""
        try:
            logger.info(f"🔌 Connecting to MCP server: {self.name}")
            # Implementation will depend on specific MCP server
            self.connected = True
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to {self.name}: {e}")
            return False
    
    async def disconnect(self):
        """Ngắt kết nối"""
        self.connected = False
        logger.info(f"🔌 Disconnected from {self.name}")


class FileSystemMCP(MCPServer):
    """MCP Server for file system access"""
    
    def __init__(self):
        super().__init__("filesystem", {})
    
    async def read_file(self, path: str) -> str:
        """Đọc file"""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading file {path}: {e}")
            return f"Error: {str(e)}"
    
    async def list_directory(self, path: str) -> List[str]:
        """List files trong directory"""
        import os
        try:
            return os.listdir(path)
        except Exception as e:
            logger.error(f"Error listing directory {path}: {e}")
            return []
    
    async def search_files(self, pattern: str, directory: str = ".") -> List[str]:
        """Tìm files theo pattern"""
        import glob
        try:
            return glob.glob(f"{directory}/**/{pattern}", recursive=True)
        except Exception as e:
            logger.error(f"Error searching files: {e}")
            return []


class DatabaseMCP(MCPServer):
    """MCP Server for database access"""
    
    def __init__(self, db_session):
        super().__init__("database", {})
        self.db = db_session
    
    async def query_courses(self, filters: Dict[str, Any]) -> List[Dict]:
        """Query courses từ database"""
        from models import KnowledgeBase
        try:
            query = self.db.query(KnowledgeBase).filter(
                KnowledgeBase.content_type == "course"
            )
            
            if filters.get("title"):
                query = query.filter(
                    KnowledgeBase.title.ilike(f"%{filters['title']}%")
                )
            
            results = query.limit(10).all()
            return [
                {
                    "id": r.content_id,
                    "title": r.title,
                    "content": r.content[:200]
                }
                for r in results
            ]
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return []
    
    async def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """Lấy thống kê user"""
        from models import Conversation, Message
        try:
            conversation_count = self.db.query(Conversation).filter(
                Conversation.user_id == user_id
            ).count()
            
            message_count = self.db.query(Message).join(Conversation).filter(
                Conversation.user_id == user_id
            ).count()
            
            return {
                "user_id": user_id,
                "total_conversations": conversation_count,
                "total_messages": message_count
            }
        except Exception as e:
            logger.error(f"Error getting user stats: {e}")
            return {}


class WebSearchMCP(MCPServer):
    """MCP Server for web search"""
    
    def __init__(self):
        super().__init__("websearch", {})
    
    async def search(self, query: str, num_results: int = 5) -> List[Dict]:
        """Search web (giả lập - cần API key thực)"""
        # Trong production, sử dụng Google Search API, Bing API, etc.
        logger.info(f"🔍 Searching: {query}")
        
        # Mock results
        return [
            {
                "title": f"Result for: {query}",
                "url": "https://example.com",
                "snippet": "Mock search result..."
            }
        ]


class MCPManager:
    """Quản lý tất cả MCP servers"""
    
    def __init__(self, db_session=None):
        self.servers: Dict[str, MCPServer] = {}
        self.db_session = db_session
        self._initialize_servers()
    
    def _initialize_servers(self):
        """Khởi tạo các MCP servers"""
        # File System MCP
        self.servers["filesystem"] = FileSystemMCP()
        
        # Database MCP (nếu có db session)
        if self.db_session:
            self.servers["database"] = DatabaseMCP(self.db_session)
        
        # Web Search MCP
        self.servers["websearch"] = WebSearchMCP()
        
        logger.info(f"✅ Initialized {len(self.servers)} MCP servers")
    
    async def connect_all(self):
        """Kết nối tất cả servers"""
        for name, server in self.servers.items():
            await server.connect()
    
    async def disconnect_all(self):
        """Ngắt kết nối tất cả"""
        for server in self.servers.values():
            await server.disconnect()
    
    def get_server(self, name: str) -> Optional[MCPServer]:
        """Lấy server theo tên"""
        return self.servers.get(name)
    
    async def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any]
    ) -> Any:
        """
        Thực thi tool/function thông qua MCP
        
        Tool format: "server_name.function_name"
        Example: "database.query_courses", "filesystem.read_file"
        """
        try:
            if "." not in tool_name:
                return {"error": "Invalid tool name format. Use: server.function"}
            
            server_name, function_name = tool_name.split(".", 1)
            server = self.get_server(server_name)
            
            if not server:
                return {"error": f"Server '{server_name}' not found"}
            
            if not server.connected:
                await server.connect()
            
            # Execute function
            if hasattr(server, function_name):
                func = getattr(server, function_name)
                result = await func(**parameters)
                
                logger.info(f"✅ Executed {tool_name} successfully")
                return result
            else:
                return {"error": f"Function '{function_name}' not found in {server_name}"}
                
        except Exception as e:
            logger.error(f"❌ Error executing {tool_name}: {e}")
            return {"error": str(e)}
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """
        Lấy danh sách tools có sẵn
        """
        tools = []
        
        # File System Tools
        tools.append({
            "name": "filesystem.read_file",
            "description": "Đọc nội dung file",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Đường dẫn đến file"
                    }
                },
                "required": ["path"]
            }
        })
        
        tools.append({
            "name": "filesystem.list_directory",
            "description": "List files trong thư mục",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Đường dẫn thư mục"
                    }
                },
                "required": ["path"]
            }
        })
        
        # Database Tools
        if "database" in self.servers:
            tools.append({
                "name": "database.query_courses",
                "description": "Tìm kiếm khóa học trong database",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "filters": {
                            "type": "object",
                            "description": "Filters để tìm kiếm (title, category, etc.)"
                        }
                    },
                    "required": ["filters"]
                }
            })
            
            tools.append({
                "name": "database.get_user_stats",
                "description": "Lấy thống kê của user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "integer",
                            "description": "ID của user"
                        }
                    },
                    "required": ["user_id"]
                }
            })
        
        # Web Search Tools
        tools.append({
            "name": "websearch.search",
            "description": "Tìm kiếm thông tin trên web",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Từ khóa tìm kiếm"
                    },
                    "num_results": {
                        "type": "integer",
                        "description": "Số lượng kết quả",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        })
        
        return tools


# Global MCP Manager instance
_mcp_manager: Optional[MCPManager] = None

def get_mcp_manager(db_session=None) -> MCPManager:
    """Get or create global MCP manager"""
    global _mcp_manager
    if _mcp_manager is None or (_mcp_manager.db_session is None and db_session is not None):
        _mcp_manager = MCPManager(db_session)
    return _mcp_manager


# Export
__all__ = [
    "MCPServer",
    "FileSystemMCP",
    "DatabaseMCP",
    "WebSearchMCP",
    "MCPManager",
    "get_mcp_manager"
]

