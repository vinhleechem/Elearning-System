"""
Quick start script - Chạy chatbot KHÔNG CẦN database
Chỉ cần Gemini API key!
"""

import asyncio
from ai_providers import GeminiProvider
from vector_store import vector_store
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Sample knowledge base
SAMPLE_KNOWLEDGE = [
    {
        "id": "faq_1",
        "title": "Cách đăng ký khóa học",
        "content": """
        Để đăng ký khóa học trên nền tảng:
        1. Tìm khóa học phù hợp qua trang Khóa học hoặc tìm kiếm
        2. Xem chi tiết khóa học, giá, nội dung
        3. Nhấn 'Thêm vào giỏ hàng' hoặc 'Mua ngay'
        4. Chọn phương thức thanh toán: VNPay, MoMo, chuyển khoản
        5. Hoàn tất thanh toán và bắt đầu học ngay
        """
    },
    {
        "id": "faq_2",
        "title": "Phương thức thanh toán",
        "content": """
        Nền tảng hỗ trợ các phương thức thanh toán:
        - VNPay: Thanh toán qua cổng VNPay (ATM, Visa, MasterCard)
        - MoMo: Thanh toán qua ví MoMo
        - Chuyển khoản ngân hàng: Chuyển khoản trực tiếp
        Tất cả giao dịch đều được bảo mật và mã hóa.
        """
    },
    {
        "id": "faq_3",
        "title": "Chứng chỉ sau khóa học",
        "content": """
        Sau khi hoàn thành khóa học:
        - Hoàn thành 100% bài học
        - Đạt điểm quiz/assignment tối thiểu
        - Bạn sẽ nhận được chứng chỉ hoàn thành
        - Chứng chỉ có thể tải xuống PDF hoặc chia sẻ trên LinkedIn
        """
    }
]


async def quick_start():
    """Quick start chatbot without database"""
    
    print("\n" + "="*60)
    print("🤖 E-LEARNING CHATBOT - QUICK START")
    print("="*60)
    
    # Initialize AI provider
    try:
        print("\n📡 Connecting to Gemini AI...")
        ai_provider = GeminiProvider()
        print("✅ Connected to Gemini!")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n⚠️  Hãy kiểm tra GEMINI_API_KEY trong file .env")
        print("   Lấy API key tại: https://makersuite.google.com/app/apikey")
        return
    
    # Load knowledge base
    print("\n📚 Loading knowledge base...")
    try:
        # Check if already loaded
        stats = vector_store.get_collection_stats()
        if stats["total_documents"] == 0:
            print("   Adding sample knowledge...")
            for item in SAMPLE_KNOWLEDGE:
                vector_store.add_documents(
                    documents=[item["content"]],
                    metadatas=[{"title": item["title"]}],
                    ids=[item["id"]]
                )
            print(f"   ✅ Added {len(SAMPLE_KNOWLEDGE)} documents")
        else:
            print(f"   ✅ Found {stats['total_documents']} documents")
    except Exception as e:
        print(f"   ❌ Error loading knowledge: {e}")
        return
    
    # Interactive chat
    print("\n" + "="*60)
    print("💬 CHAT MODE")
    print("="*60)
    print("Commands:")
    print("  /quit - Exit")
    print("  /help - Show help")
    print("="*60 + "\n")
    
    conversation_history = []
    
    while True:
        try:
            # Get user input
            user_message = input("You: ").strip()
            
            if not user_message:
                continue
            
            if user_message == "/quit":
                print("\n👋 Goodbye!")
                break
            
            if user_message == "/help":
                print("\nCâu hỏi mẫu:")
                print("  - Làm sao để đăng ký khóa học?")
                print("  - Phương thức thanh toán nào được hỗ trợ?")
                print("  - Làm sao để nhận chứng chỉ?")
                continue
            
            # Search knowledge base
            print("\n🔍 Searching knowledge base...", end="", flush=True)
            results = vector_store.search(user_message, n_results=2)
            print(" Done!")
            
            # Build prompt with RAG
            system_prompt = """Bạn là trợ lý AI của nền tảng E-Learning.

NHIỆM VỤ:
- Trả lời câu hỏi về khóa học, thanh toán, đăng ký, chứng chỉ
- Sử dụng thông tin từ KNOWLEDGE BASE
- Trả lời ngắn gọn, rõ ràng, thân thiện

KNOWLEDGE BASE:
"""
            
            if results["documents"]:
                for i, doc in enumerate(results["documents"], 1):
                    system_prompt += f"\n[Nguồn {i}]: {doc}"
            
            messages = [
                {"role": "system", "content": system_prompt},
                *conversation_history[-6:],  # Last 3 exchanges
                {"role": "user", "content": user_message}
            ]
            
            # Get AI response
            print("🤖 AI: ", end="", flush=True)
            response = ai_provider.generate_response(
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            print(response)
            
            # Update history
            conversation_history.append({"role": "user", "content": user_message})
            conversation_history.append({"role": "assistant", "content": response})
            
            # Show sources
            if results["documents"]:
                print(f"\n📖 Sources: {len(results['documents'])} documents")
            
            print()
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Please try again.\n")


if __name__ == "__main__":
    print("\n🚀 Starting Quick Start Chatbot...")
    print("⚠️  This version runs WITHOUT database")
    print("   Only requires Gemini API key in .env\n")
    
    asyncio.run(quick_start())
