"""
Script để seed knowledge base với dữ liệu mẫu
Chạy: python seed_knowledge.py
"""

import asyncio
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models import KnowledgeBase
from vector_store import vector_store
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Dữ liệu mẫu về E-Learning
SAMPLE_KNOWLEDGE = [
    {
        "content_type": "faq",
        "title": "Cách đăng ký khóa học",
        "content": """
        Để đăng ký khóa học trên nền tảng:
        1. Tìm khóa học phù hợp qua trang Khóa học hoặc tìm kiếm
        2. Xem chi tiết khóa học, giá, nội dung
        3. Nhấn 'Thêm vào giỏ hàng' hoặc 'Mua ngay'
        4. Chọn phương thức thanh toán: VNPay, MoMo, chuyển khoản
        5. Hoàn tất thanh toán và bắt đầu học ngay
        """,
        "metadata": {"category": "registration"}
    },
    {
        "content_type": "faq",
        "title": "Phương thức thanh toán",
        "content": """
        Nền tảng hỗ trợ các phương thức thanh toán:
        - VNPay: Thanh toán qua cổng VNPay (ATM, Visa, MasterCard)
        - MoMo: Thanh toán qua ví MoMo
        - Chuyển khoản ngân hàng: Chuyển khoản trực tiếp
        Tất cả giao dịch đều được bảo mật và mã hóa.
        """,
        "metadata": {"category": "payment"}
    },
    {
        "content_type": "faq",
        "title": "Chính sách hoàn tiền",
        "content": """
        Chính sách hoàn tiền:
        - Hoàn 100% trong vòng 7 ngày nếu chưa học quá 20% khóa học
        - Hoàn 50% trong vòng 14 ngày nếu chưa học quá 30%
        - Không hoàn tiền sau 14 ngày hoặc đã hoàn thành khóa học
        Liên hệ support@elearning.com để yêu cầu hoàn tiền.
        """,
        "metadata": {"category": "refund"}
    },
    {
        "content_type": "faq",
        "title": "Chứng chỉ sau khóa học",
        "content": """
        Sau khi hoàn thành khóa học:
        - Hoàn thành 100% bài học
        - Đạt điểm quiz/assignment tối thiểu
        - Bạn sẽ nhận được chứng chỉ hoàn thành
        - Chứng chỉ có thể tải xuống PDF hoặc chia sẻ trên LinkedIn
        """,
        "metadata": {"category": "certificate"}
    },
    {
        "content_type": "faq",
        "title": "Hỗ trợ kỹ thuật",
        "content": """
        Nếu gặp vấn đề kỹ thuật:
        - Kiểm tra kết nối internet
        - Thử trình duyệt khác (Chrome, Firefox, Safari)
        - Xóa cache và cookies
        - Liên hệ support@elearning.com
        - Chat với chatbot để được hỗ trợ 24/7
        """,
        "metadata": {"category": "technical"}
    },
    {
        "content_type": "policy",
        "title": "Điều khoản sử dụng",
        "content": """
        Khi sử dụng nền tảng, bạn đồng ý:
        - Không chia sẻ tài khoản với người khác
        - Không tải lại hoặc phân phối nội dung khóa học
        - Tôn trọng bản quyền giảng viên
        - Sử dụng nền tảng cho mục đích học tập
        """,
        "metadata": {"category": "terms"}
    },
    {
        "content_type": "feature",
        "title": "Tính năng học tập",
        "content": """
        Nền tảng cung cấp:
        - Video bài giảng HD với phụ đề
        - Tài liệu học tập PDF, code samples
        - Quiz và bài tập thực hành
        - Diễn đàn hỏi đáp với giảng viên
        - Học theo lộ trình cá nhân hóa
        - Theo dõi tiến độ học tập
        """,
        "metadata": {"category": "features"}
    },
    {
        "content_type": "feature",
        "title": "Giảng viên",
        "content": """
        Giảng viên trên nền tảng:
        - Là chuyên gia có kinh nghiệm thực tế
        - Được xác thực và đánh giá bởi học viên
        - Tương tác trực tiếp với học viên qua Q&A
        - Cập nhật nội dung khóa học thường xuyên
        """,
        "metadata": {"category": "instructor"}
    }
]


def seed_knowledge_base():
    """Seed knowledge base with sample data"""
    init_db()
    db = SessionLocal()
    
    try:
        logger.info("🌱 Seeding knowledge base...")
        
        for i, item in enumerate(SAMPLE_KNOWLEDGE):
            # Check if exists
            existing = db.query(KnowledgeBase).filter(
                KnowledgeBase.content_type == item["content_type"],
                KnowledgeBase.title == item["title"]
            ).first()
            
            if existing:
                logger.info(f"⏭️  Skipping existing: {item['title']}")
                continue
            
            # Create knowledge base entry
            embedding_id = f"{item['content_type']}_{i}"
            kb = KnowledgeBase(
                content_type=item["content_type"],
                title=item["title"],
                content=item["content"],
                embedding_id=embedding_id,
                extra_data=item["metadata"]
            )
            db.add(kb)
            db.commit()
            
            # Add to vector store
            vector_store.add_documents(
                documents=[item["content"]],
                metadatas=[{
                    "type": item["content_type"],
                    "title": item["title"],
                    **item["metadata"]
                }],
                ids=[embedding_id]
            )
            
            logger.info(f"✅ Added: {item['title']}")
        
        logger.info("🎉 Knowledge base seeded successfully!")
        logger.info(f"📊 Total documents: {vector_store.get_collection_stats()['total_documents']}")
        
    except Exception as e:
        logger.error(f"❌ Error seeding knowledge base: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_knowledge_base()

