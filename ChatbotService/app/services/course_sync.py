"""
Sync courses from Spring Boot backend vào knowledge base
Chạy: python sync_courses.py
"""

import sys
import os

# Add project root to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import asyncio
import logging

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    # Only reconfigure if not already configured
    if isinstance(sys.stdout, io.TextIOWrapper) and sys.stdout.encoding != 'utf-8':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    if isinstance(sys.stderr, io.TextIOWrapper) and sys.stderr.encoding != 'utf-8':
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def sync_courses():
    """Sync courses từ Spring Boot backend"""
    
    print("\n" + "="*70)
    print("[SYNC] SYNCING COURSES FROM SPRING BOOT BACKEND")
    print("="*70)
    
    try:
        from app.core.database import SessionLocal, init_db
        from app.models.sql_models import KnowledgeBase
        from app.rag.vector_store import vector_store
        from app.core.spring_boot_client import spring_boot_client
        
        # Check Spring Boot connection
        print("\n[1] Checking Spring Boot backend connection...")
        try:
            courses = await spring_boot_client.get_courses(size=10)
            print(f"   [OK] Connected! Found {len(courses)} courses")
        except Exception as e:
            print(f"   [ERROR] Cannot connect to Spring Boot backend: {e}")
            print("   [INFO] Make sure Spring Boot backend is running at http://localhost:8080")
            return False
        
        # Initialize database
        print("\n[2] Initializing database...")
        init_db()
        db = SessionLocal()
        
        # Sync courses
        print("\n[3] Syncing courses to knowledge base...")
        synced_count = 0
        
        for course in courses:
            course_id = course.get("courseId")  # ✅ FIX: API trả về "courseId" không phải "id"
            title = course.get("title", "")
            description = course.get("description", "")
            short_description = course.get("shortDescription", "")
            price = course.get("price", 0)
            category = course.get("category", {})
            category_name = category.get("name", "") if isinstance(category, dict) else ""
            instructor = course.get("instructor", {})
            instructor_name = instructor.get("name", "") if isinstance(instructor, dict) else ""
            level = course.get("level", "")
            slug = course.get("slug", "")
            
            # Lấy thêm thông tin chi tiết nếu có
            what_you_learn = ""
            requirements = ""
            try:
                course_detail = await spring_boot_client.get_course_detail(course_id)
                if course_detail:
                    what_you_learn = course_detail.get("whatYouLearn", "")
                    requirements = course_detail.get("requirements", "")
            except:
                course_detail = None
            
            # Build content đầy đủ - không hardcode keywords
            # Embedding model sẽ tự động hiểu semantic từ title và description
            content_parts = []
            content_parts.append(f"Khóa học: {title}")
            
            # Lặp lại title để tăng weight trong embedding (giúp tìm kiếm tốt hơn)
            content_parts.append(f"Tên khóa học: {title}")
            
            if short_description:
                content_parts.append(f"Mô tả ngắn: {short_description}")
            if description:
                content_parts.append(f"Mô tả chi tiết: {description}")
            
            if what_you_learn:
                content_parts.append(f"Nội dung học: {what_you_learn}")
            if requirements:
                content_parts.append(f"Yêu cầu: {requirements}")
            
            if category_name:
                content_parts.append(f"Danh mục: {category_name}")
            if instructor_name:
                content_parts.append(f"Giảng viên: {instructor_name}")
            if level:
                content_parts.append(f"Cấp độ: {level}")
            if price:
                content_parts.append(f"Giá: {price:,} VNĐ")
            
            # Build final content
            content = "\n".join(content_parts)
            
            # Check if exists
            existing = db.query(KnowledgeBase).filter(
                KnowledgeBase.content_type == "course",
                KnowledgeBase.content_id == course_id
            ).first()
            
            if existing:
                # Update
                existing.title = title
                existing.content = content
                existing.extra_data = course
                db.commit()
                
                vector_store.update_document(
                    document_id=f"course_{course_id}",
                    document=content,
                    metadata={
                        "type": "course", 
                        "course_id": course_id, 
                        "title": title,
                        "category": category_name,
                        "instructor": instructor_name,
                        "level": level,
                        "slug": slug
                    }
                )
                print(f"   [UPDATE] {title}")
            else:
                # Create new
                kb = KnowledgeBase(
                    content_type="course",
                    content_id=course_id,
                    title=title,
                    content=content,
                    embedding_id=f"course_{course_id}",
                    extra_data=course
                )
                db.add(kb)
                db.commit()
                
                vector_store.add_documents(
                    documents=[content],
                    metadatas=[{
                        "type": "course", 
                        "course_id": course_id, 
                        "title": title,
                        "category": category_name,
                        "instructor": instructor_name,
                        "level": level,
                        "slug": slug
                    }],
                    ids=[f"course_{course_id}"]
                )
                print(f"   [ADD] {title}")
            
            synced_count += 1
        
        # Check stats
        print("\n[4] Checking vector store stats...")
        stats = vector_store.get_collection_stats()
        print(f"   Total documents: {stats['total_documents']}")
        
        # Test search for ReactJS
        print("\n[5] Testing search for ReactJS...")
        results = vector_store.search("ReactJS", n_results=5)
        print(f"   Found {len(results['documents'])} documents")
        
        if len(results['documents']) > 0:
            print("   [OK] ReactJS found!")
            for i, doc in enumerate(results['documents'][:3], 1):
                print(f"   [{i}] {doc[:80]}...")
        else:
            print("   [WARNING] ReactJS NOT found")
            print("   [INFO] Make sure course title contains 'ReactJS' or 'React'")
        
        print("\n" + "="*70)
        print(f"[SUCCESS] Synced {synced_count} courses!")
        print("="*70)
        
        db.close()
        return True
        
    except Exception as e:
        print("\n" + "="*70)
        print("[ERROR] ERROR!")
        print("="*70)
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(sync_courses())
    sys.exit(0 if success else 1)



