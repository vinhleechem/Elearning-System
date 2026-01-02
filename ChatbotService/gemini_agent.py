"""
Gemini API với Function Calling - Agent System
Cho phép Gemini gọi tools/functions để thực hiện tasks
"""

import google.generativeai as genai
import logging
from typing import Dict, Any, List, Optional, Callable
import json
from datetime import datetime

from config import settings

logger = logging.getLogger(__name__)


class GeminiAgent:
    """
    Gemini Agent với Function Calling capability
    - Có thể gọi tools để lấy thông tin
    - Có thể thực hiện actions
    - Có thể reason và plan
    """
    
    def __init__(self, api_key: str = None, model_name: str = "gemini-1.5-pro"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize model
        self.model = genai.GenerativeModel(
            model_name=self.model_name,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
        )
        
        # Tool registry
        self.tools: Dict[str, Callable] = {}
        self.tool_descriptions: List[Dict[str, Any]] = []
        
        logger.info(f"🤖 Initialized Gemini Agent with model: {model_name}")
    
    def register_tool(
        self,
        name: str,
        function: Callable,
        description: str,
        parameters: Dict[str, Any]
    ):
        """
        Đăng ký tool để Gemini có thể sử dụng
        
        Args:
            name: Tên tool (vd: "search_courses")
            function: Python function để execute
            description: Mô tả tool
            parameters: JSON schema của parameters
        """
        self.tools[name] = function
        
        # Format theo Gemini Function Calling spec
        self.tool_descriptions.append({
            "name": name,
            "description": description,
            "parameters": parameters
        })
        
        logger.info(f"🔧 Registered tool: {name}")
    
    def _convert_tools_to_gemini_format(self) -> List[Any]:
        """Convert tools sang format của Gemini"""
        from google.generativeai.types import FunctionDeclaration, Tool
        
        functions = []
        for tool in self.tool_descriptions:
            functions.append(
                FunctionDeclaration(
                    name=tool["name"],
                    description=tool["description"],
                    parameters=tool["parameters"]
                )
            )
        
        return [Tool(function_declarations=functions)] if functions else []
    
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        use_tools: bool = True,
        max_iterations: int = 5
    ) -> str:
        """
        Generate response với function calling support
        
        Args:
            messages: Conversation history
            use_tools: Có sử dụng tools không
            max_iterations: Max số lần call tools
        
        Returns:
            Final response text
        """
        try:
            # Build prompt từ messages
            prompt = self._build_prompt(messages)
            
            # Prepare tools nếu cần
            tools = self._convert_tools_to_gemini_format() if use_tools and self.tools else None
            
            # Start chat
            chat = self.model.start_chat(history=[])
            
            iteration = 0
            current_prompt = prompt
            
            while iteration < max_iterations:
                # Generate response
                if tools:
                    response = chat.send_message(current_prompt, tools=tools)
                else:
                    response = chat.send_message(current_prompt)
                
                # Check if Gemini wants to call a function
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    
                    if hasattr(candidate.content, 'parts'):
                        for part in candidate.content.parts:
                            # Check for function call
                            if hasattr(part, 'function_call') and part.function_call:
                                function_call = part.function_call
                                function_name = function_call.name
                                function_args = dict(function_call.args)
                                
                                logger.info(f"🔧 Gemini wants to call: {function_name}")
                                logger.info(f"📋 Arguments: {function_args}")
                                
                                # Execute function
                                if function_name in self.tools:
                                    try:
                                        tool_result = await self._execute_tool(
                                            function_name,
                                            function_args
                                        )
                                        
                                        # Send result back to Gemini
                                        from google.generativeai.types import (
                                            content as content_types
                                        )
                                        
                                        function_response = content_types.FunctionResponse(
                                            name=function_name,
                                            response={"result": tool_result}
                                        )
                                        
                                        response = chat.send_message(
                                            content_types.Part(
                                                function_response=function_response
                                            )
                                        )
                                        
                                        iteration += 1
                                        continue
                                        
                                    except Exception as e:
                                        logger.error(f"Error executing tool {function_name}: {e}")
                                        return f"Xin lỗi, đã có lỗi khi thực hiện {function_name}."
                
                # If no more function calls, return text
                if response.text:
                    return response.text
                
                break
            
            # Default fallback
            return response.text if response.text else "Xin lỗi, tôi không thể xử lý yêu cầu này."
            
        except Exception as e:
            logger.error(f"❌ Gemini Agent error: {e}")
            raise
    
    async def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """Execute tool và return result"""
        tool_func = self.tools.get(tool_name)
        if not tool_func:
            return {"error": f"Tool {tool_name} not found"}
        
        try:
            # Check if async
            import asyncio
            if asyncio.iscoroutinefunction(tool_func):
                result = await tool_func(**arguments)
            else:
                result = tool_func(**arguments)
            
            logger.info(f"✅ Tool {tool_name} executed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in tool {tool_name}: {e}")
            return {"error": str(e)}
    
    def _build_prompt(self, messages: List[Dict[str, str]]) -> str:
        """Build prompt từ messages"""
        prompt_parts = []
        
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            
            if role == "system":
                prompt_parts.append(f"SYSTEM: {content}")
            elif role == "user":
                prompt_parts.append(f"USER: {content}")
            elif role == "assistant":
                prompt_parts.append(f"ASSISTANT: {content}")
        
        return "\n\n".join(prompt_parts)
    
    def register_mcp_tools(self, mcp_manager):
        """
        Đăng ký tất cả MCP tools vào Gemini Agent
        
        Args:
            mcp_manager: MCPManager instance
        """
        available_tools = mcp_manager.get_available_tools()
        
        for tool in available_tools:
            # Create wrapper function
            async def tool_wrapper(tool_name=tool["name"], **kwargs):
                return await mcp_manager.execute_tool(tool_name, kwargs)
            
            # Register
            self.register_tool(
                name=tool["name"],
                function=tool_wrapper,
                description=tool["description"],
                parameters=tool["parameters"]
            )
        
        logger.info(f"✅ Registered {len(available_tools)} MCP tools to Gemini Agent")


# Predefined tools for common tasks
def create_course_search_tool(db_session):
    """Tool để search courses"""
    from models import KnowledgeBase
    
    def search_courses(query: str, limit: int = 5) -> List[Dict]:
        """Tìm kiếm khóa học"""
        results = db_session.query(KnowledgeBase).filter(
            KnowledgeBase.content_type == "course",
            KnowledgeBase.title.ilike(f"%{query}%")
        ).limit(limit).all()
        
        return [
            {
                "id": r.content_id,
                "title": r.title,
                "description": r.content[:200]
            }
            for r in results
        ]
    
    return {
        "name": "search_courses",
        "function": search_courses,
        "description": "Tìm kiếm khóa học trong database theo từ khóa",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Từ khóa tìm kiếm (vd: 'Python', 'Marketing')"
                },
                "limit": {
                    "type": "integer",
                    "description": "Số lượng kết quả tối đa",
                    "default": 5
                }
            },
            "required": ["query"]
        }
    }


def create_calculator_tool():
    """Tool để tính toán"""
    def calculate(expression: str) -> float:
        """Tính toán biểu thức toán học"""
        try:
            # Safe eval (chỉ cho phép số và toán tử cơ bản)
            allowed_chars = set("0123456789+-*/(). ")
            if not all(c in allowed_chars for c in expression):
                return {"error": "Invalid expression"}
            
            result = eval(expression)
            return {"result": result}
        except Exception as e:
            return {"error": str(e)}
    
    return {
        "name": "calculate",
        "function": calculate,
        "description": "Tính toán biểu thức toán học (vd: '2 + 2', '100 * 0.8')",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Biểu thức toán học để tính"
                }
            },
            "required": ["expression"]
        }
    }


def create_datetime_tool():
    """Tool để lấy thời gian"""
    def get_current_time(timezone: str = "Asia/Ho_Chi_Minh") -> str:
        """Lấy thời gian hiện tại"""
        from datetime import datetime
        import pytz
        
        try:
            tz = pytz.timezone(timezone)
            now = datetime.now(tz)
            return {
                "datetime": now.isoformat(),
                "formatted": now.strftime("%Y-%m-%d %H:%M:%S %Z")
            }
        except Exception as e:
            return {"error": str(e)}
    
    return {
        "name": "get_current_time",
        "function": get_current_time,
        "description": "Lấy thời gian hiện tại theo timezone",
        "parameters": {
            "type": "object",
            "properties": {
                "timezone": {
                    "type": "string",
                    "description": "Timezone (vd: 'Asia/Ho_Chi_Minh', 'UTC')",
                    "default": "Asia/Ho_Chi_Minh"
                }
            }
        }
    }


# Export
__all__ = [
    "GeminiAgent",
    "create_course_search_tool",
    "create_calculator_tool",
    "create_datetime_tool"
]

