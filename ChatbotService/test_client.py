"""
Test client để demo chatbot features
Chạy: python test_client.py
"""

import asyncio
import httpx
import websockets
import json
from datetime import datetime


class ChatbotTestClient:
    """Test client cho chatbot"""
    
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.user_id = 1
    
    async def test_health(self):
        """Test health endpoint"""
        print("\n🏥 Testing Health Endpoint...")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/health")
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    async def test_chat(self, message: str):
        """Test standard chat"""
        print(f"\n💬 Testing Chat: '{message}'")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat",
                json={
                    "user_id": self.user_id,
                    "message": message,
                    "context": {"page": "test"}
                },
                timeout=30.0
            )
            result = response.json()
            print(f"Response: {result['message']}")
            print(f"Cached: {result.get('cached', False)}")
            if result.get('sources'):
                print(f"Sources: {len(result['sources'])} documents")
    
    async def test_streaming(self, message: str):
        """Test streaming chat"""
        print(f"\n🌊 Testing Streaming: '{message}'")
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/stream",
                json={
                    "user_id": self.user_id,
                    "message": message
                },
                timeout=30.0
            ) as response:
                print("Streaming response: ", end="", flush=True)
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data != "[DONE]":
                            print(data, end="", flush=True)
                print()
    
    async def test_websocket(self, message: str):
        """Test WebSocket chat"""
        print(f"\n🔌 Testing WebSocket: '{message}'")
        uri = f"ws://localhost:8001/ws/chat/{self.user_id}"
        
        try:
            async with websockets.connect(uri) as websocket:
                # Send message
                await websocket.send(json.dumps({
                    "type": "message",
                    "content": message,
                    "context": {}
                }))
                
                # Receive responses
                full_response = ""
                while True:
                    response = await websocket.recv()
                    data = json.loads(response)
                    
                    if data["type"] == "start":
                        print(f"Conversation ID: {data['conversation_id']}")
                        print("Response: ", end="", flush=True)
                    elif data["type"] == "chunk":
                        print(data["content"], end="", flush=True)
                        full_response += data["content"]
                    elif data["type"] == "end":
                        print()
                        if data.get("sources"):
                            print(f"Sources: {len(data['sources'])} documents")
                        break
                    elif data["type"] == "error":
                        print(f"\nError: {data['message']}")
                        break
        except Exception as e:
            print(f"WebSocket error: {e}")
    
    async def test_analytics(self):
        """Test analytics endpoint"""
        print("\n📊 Testing Analytics...")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/analytics")
            stats = response.json()
            print(f"Total messages: {stats['chatbot_analytics']['total_messages']}")
            print(f"Avg response time: {stats['chatbot_analytics']['avg_response_time']:.2f}s")
            print(f"Avg satisfaction: {stats['chatbot_analytics']['avg_satisfaction']}")
            print(f"Popular topics: {stats['chatbot_analytics']['top_topics']}")
    
    async def test_feedback(self, rating: int = 5, feedback: str = "Great!"):
        """Test feedback submission"""
        print(f"\n⭐ Testing Feedback: {rating} stars")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/feedback",
                json={
                    "user_id": self.user_id,
                    "rating": rating,
                    "feedback": feedback
                }
            )
            print(f"Response: {response.json()}")
    
    async def run_all_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("🤖 CHATBOT TEST SUITE")
        print("=" * 60)
        
        # Test 1: Health check
        await self.test_health()
        
        # Test 2: Standard chat
        await self.test_chat("Làm sao để đăng ký khóa học?")
        
        # Test 3: Cached response (same question)
        await self.test_chat("Làm sao để đăng ký khóa học?")
        
        # Test 4: Streaming
        await self.test_streaming("Giới thiệu về nền tảng E-Learning")
        
        # Test 5: WebSocket
        await self.test_websocket("Phương thức thanh toán nào được hỗ trợ?")
        
        # Test 6: Feedback
        await self.test_feedback(5, "Very helpful chatbot!")
        
        # Test 7: Analytics
        await self.test_analytics()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS COMPLETED")
        print("=" * 60)


async def interactive_mode():
    """Interactive chat mode"""
    client = ChatbotTestClient()
    
    print("\n" + "=" * 60)
    print("🤖 INTERACTIVE CHATBOT MODE")
    print("=" * 60)
    print("Commands:")
    print("  /stream - Switch to streaming mode")
    print("  /ws - Switch to WebSocket mode")
    print("  /rest - Switch to REST mode (default)")
    print("  /analytics - Show analytics")
    print("  /quit - Exit")
    print("=" * 60 + "\n")
    
    mode = "rest"
    
    while True:
        try:
            message = input(f"[{mode.upper()}] You: ").strip()
            
            if not message:
                continue
            
            if message == "/quit":
                print("Goodbye! 👋")
                break
            elif message == "/stream":
                mode = "stream"
                print("Switched to streaming mode")
                continue
            elif message == "/ws":
                mode = "ws"
                print("Switched to WebSocket mode")
                continue
            elif message == "/rest":
                mode = "rest"
                print("Switched to REST mode")
                continue
            elif message == "/analytics":
                await client.test_analytics()
                continue
            
            # Process message based on mode
            if mode == "rest":
                await client.test_chat(message)
            elif mode == "stream":
                await client.test_streaming(message)
            elif mode == "ws":
                await client.test_websocket(message)
        
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            break
        except Exception as e:
            print(f"Error: {e}")


async def main():
    """Main function"""
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "interactive":
        await interactive_mode()
    else:
        client = ChatbotTestClient()
        await client.run_all_tests()


if __name__ == "__main__":
    print("\n🚀 Starting Chatbot Test Client...")
    print("Usage:")
    print("  python test_client.py           - Run all tests")
    print("  python test_client.py interactive - Interactive mode\n")
    
    asyncio.run(main())
