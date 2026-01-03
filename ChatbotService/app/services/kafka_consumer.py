"""
Kafka Consumer - Auto sync courses when events received
"""
import json
import logging
import asyncio
import os
from typing import Dict, Any
from kafka import KafkaConsumer
from kafka.errors import KafkaError
import threading

from app.core.database import SessionLocal
from app.models.sql_models import KnowledgeBase
from app.rag.vector_store import vector_store
from app.core.spring_boot_client import spring_boot_client
from app.constants.kafka_topics import COURSE_EVENTS

logger = logging.getLogger(__name__)


class CourseEventConsumer:
    """Kafka consumer for course events"""
    
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092').split(',')
        self.topic = COURSE_EVENTS
        self.group_id = 'chatbot-service'
        self.consumer = None
        self.running = False
        
    def start(self):
        """Start consuming messages in background thread"""
        if self.running:
            logger.warning("Consumer already running")
            return
            
        try:
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                auto_offset_reset='latest',  # Only new messages
                enable_auto_commit=True
            )
            
            self.running = True
            thread = threading.Thread(target=self._consume_loop, daemon=True)
            thread.start()
            
            logger.info(f"✅ Kafka consumer started - listening to '{self.topic}'")
            
        except KafkaError as e:
            logger.error(f"❌ Failed to start Kafka consumer: {e}")
            
    def _consume_loop(self):
        """Main consume loop"""
        try:
            for message in self.consumer:
                try:
                    event = message.value
                    logger.info(f"📥 Received event: {event.get('eventType')} - Course ID: {event.get('courseId')}")
                    
                    # Process event asynchronously
                    asyncio.run(self._handle_event(event))
                    
                except Exception as e:
                    logger.error(f"❌ Error processing message: {e}", exc_info=True)
                    
        except Exception as e:
            logger.error(f"❌ Consumer loop error: {e}", exc_info=True)
        finally:
            self.running = False
            
    async def _handle_event(self, event: Dict[str, Any]):
        """Handle course event"""
        event_type = event.get('eventType')
        course_id = event.get('courseId')
        
        if not course_id:
            logger.warning("⚠️ Event missing courseId")
            return
            
        if event_type == 'COURSE_CREATED':
            await self._sync_course(course_id)
            logger.info(f"✅ Synced new course: {course_id}")
            
        elif event_type == 'COURSE_UPDATED':
            await self._sync_course(course_id)
            logger.info(f"✅ Updated course: {course_id}")
            
        elif event_type == 'COURSE_DELETED':
            await self._delete_course(course_id)
            logger.info(f"✅ Deleted course: {course_id}")
            
        elif event_type == 'COURSE_PUBLISHED':
            await self._sync_course(course_id)
            logger.info(f"✅ Published course: {course_id}")
            
        elif event_type == 'COURSE_UNPUBLISHED':
            await self._delete_course(course_id)
            logger.info(f"✅ Unpublished course: {course_id}")
            
        else:
            logger.warning(f"⚠️ Unknown event type: {event_type}")
            
    async def _sync_course(self, course_id: int):
        """Sync single course to knowledge base and vector store"""
        try:
            # Fetch course from Spring Boot
            courses = await spring_boot_client.get_courses(size=100)
            course = next((c for c in courses if c.get('courseId') == course_id), None)
            
            if not course:
                logger.warning(f"⚠️ Course {course_id} not found in API (might be draft/deleted)")
                return
                
            # Extract course data
            title = course.get("title", "")
            description = course.get("description", "")
            short_description = course.get("shortDescription", "")
            price = course.get("price", 0)
            category_name = course.get("categoryName", "")
            instructor_name = course.get("instructorName", "")
            level = course.get("level", "")
            slug = course.get("slug", "")
            
            # Build content
            content_parts = [
                f"Khóa học: {title}",
                f"Tên khóa học: {title}",
            ]
            
            if short_description:
                content_parts.append(f"Mô tả ngắn: {short_description}")
            if description:
                content_parts.append(f"Mô tả chi tiết: {description}")
            if category_name:
                content_parts.append(f"Danh mục: {category_name}")
            if instructor_name:
                content_parts.append(f"Giảng viên: {instructor_name}")
            if level:
                content_parts.append(f"Cấp độ: {level}")
            if price:
                content_parts.append(f"Giá: {price:,} VNĐ")
                
            content = "\n".join(content_parts)
            
            # Save to PostgreSQL
            db = SessionLocal()
            try:
                existing = db.query(KnowledgeBase).filter(
                    KnowledgeBase.content_type == "course",
                    KnowledgeBase.content_id == course_id
                ).first()
                
                if existing:
                    existing.title = title
                    existing.content = content
                    existing.extra_data = course
                    db.commit()
                    
                    # Update vector store
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
                    
                    # Add to vector store
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
                    
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"❌ Error syncing course {course_id}: {e}", exc_info=True)
            
    async def _delete_course(self, course_id: int):
        """Delete course from knowledge base and vector store"""
        try:
            db = SessionLocal()
            try:
                # Delete from PostgreSQL
                deleted = db.query(KnowledgeBase).filter(
                    KnowledgeBase.content_type == "course",
                    KnowledgeBase.content_id == course_id
                ).delete()
                db.commit()
                
                if deleted > 0:
                    # Delete from vector store
                    vector_store.delete_documents(ids=[f"course_{course_id}"])
                    
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"❌ Error deleting course {course_id}: {e}", exc_info=True)
            
    def stop(self):
        """Stop consumer"""
        if self.consumer:
            self.running = False
            self.consumer.close()
            logger.info("✅ Kafka consumer stopped")


# Global consumer instance
course_event_consumer = CourseEventConsumer()
