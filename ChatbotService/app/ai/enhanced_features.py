"""
Enhanced Features cho Chatbot
- Sentiment Analysis
- Intent Detection (improved)
- Multi-language Support
- Personalization
- Smart Response Generation
"""

from typing import Dict, Any, Optional, List
import re
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """Phân tích cảm xúc từ tin nhắn người dùng"""
    
    # Vietnamese sentiment keywords
    POSITIVE_KEYWORDS = [
        "tốt", "hay", "tuyệt", "cảm ơn", "thanks", "xuất sắc", 
        "tuyệt vời", "hoàn hảo", "thích", "hài lòng", "ok", "được"
    ]
    
    NEGATIVE_KEYWORDS = [
        "tệ", "kém", "xấu", "không", "chán", "thất vọng",
        "tồi", "dở", "phí", "lừa đảo", "không được", "không thích"
    ]
    
    FRUSTRATED_KEYWORDS = [
        "lỗi", "không hoạt động", "không được", "sao lại", "tại sao",
        "bug", "không hiểu", "không rõ", "khó"
    ]
    
    @staticmethod
    def analyze(text: str) -> Dict[str, Any]:
        """
        Phân tích cảm xúc của tin nhắn
        
        Returns:
            {
                "sentiment": "positive" | "negative" | "neutral" | "frustrated",
                "confidence": float (0-1),
                "emotion": str
            }
        """
        text_lower = text.lower()
        
        # Count sentiment keywords
        positive_count = sum(1 for word in SentimentAnalyzer.POSITIVE_KEYWORDS if word in text_lower)
        negative_count = sum(1 for word in SentimentAnalyzer.NEGATIVE_KEYWORDS if word in text_lower)
        frustrated_count = sum(1 for word in SentimentAnalyzer.FRUSTRATED_KEYWORDS if word in text_lower)
        
        # Detect frustration first
        if frustrated_count > 0:
            return {
                "sentiment": "frustrated",
                "confidence": min(0.7 + (frustrated_count * 0.1), 1.0),
                "emotion": "frustrated",
                "keywords": SentimentAnalyzer.FRUSTRATED_KEYWORDS
            }
        
        # Determine sentiment
        if positive_count > negative_count:
            sentiment = "positive"
            confidence = min(0.6 + (positive_count * 0.1), 1.0)
            emotion = "happy"
        elif negative_count > positive_count:
            sentiment = "negative"
            confidence = min(0.6 + (negative_count * 0.1), 1.0)
            emotion = "sad"
        else:
            sentiment = "neutral"
            confidence = 0.5
            emotion = "neutral"
        
        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "emotion": emotion,
            "positive_count": positive_count,
            "negative_count": negative_count
        }


class IntentDetector:
    """Phát hiện ý định người dùng (Enhanced version)"""
    
    INTENT_PATTERNS = {
        "course_search": {
            "patterns": [
                r"(tìm|tìm kiếm|xem|có|giới thiệu).*(khóa học|course)",
                r"khóa học.*(nào|gì|về)",
                r"(học|muốn học).*(gì|về|course)",
            ],
            "keywords": ["tìm khóa học", "khóa học nào", "học gì", "giới thiệu khóa học"]
        },
        "course_detail": {
            "patterns": [
                r"(khóa học|course).*(này|đó).*(như thế nào|thế nào|ra sao)",
                r"(nội dung|chương trình|giảng viên).*(khóa học|course)",
                r"(thời lượng|thời gian|bao lâu).*(khóa học|course)",
            ],
            "keywords": ["nội dung khóa học", "giảng viên", "thời lượng"]
        },
        "registration": {
            "patterns": [
                r"(đăng ký|mua|thanh toán).*(khóa học|course)",
                r"(làm sao|cách|hướng dẫn).*(đăng ký|mua)",
                r"(register|enroll|buy)",
            ],
            "keywords": ["đăng ký", "mua khóa học", "thanh toán"]
        },
        "payment": {
            "patterns": [
                r"(thanh toán|payment|pay).*(như thế nào|thế nào|làm sao)",
                r"(phương thức|cách).*(thanh toán|payment)",
                r"(giá|phí|tiền|cost|price)",
            ],
            "keywords": ["thanh toán", "giá", "phí", "payment"]
        },
        "certificate": {
            "patterns": [
                r"(chứng chỉ|certificate).*(có|được|nhận)",
                r"(có|nhận).*(chứng chỉ|certificate)",
            ],
            "keywords": ["chứng chỉ", "certificate", "hoàn thành"]
        },
        "technical_support": {
            "patterns": [
                r"(lỗi|error|bug|không hoạt động)",
                r"(không|không thể).*(xem|học|vào|access)",
                r"(sự cố|vấn đề|problem)",
            ],
            "keywords": ["lỗi", "không hoạt động", "bug", "sự cố"]
        },
        "refund": {
            "patterns": [
                r"(hoàn tiền|refund|trả lại|hoàn lại)",
                r"(chính sách|điều kiện).*(hoàn|refund)",
            ],
            "keywords": ["hoàn tiền", "refund", "trả lại"]
        },
        "promotion": {
            "patterns": [
                r"(giảm giá|khuyến mãi|promotion|discount|ưu đãi|voucher|mã)",
                r"(có|đang có).*(giảm|khuyến|ưu đãi)",
            ],
            "keywords": ["giảm giá", "khuyến mãi", "voucher", "mã giảm giá"]
        },
        "greeting": {
            "patterns": [
                r"^(xin chào|chào|hello|hi|hey)$",
                r"^(xin chào|chào|hello|hi)",
            ],
            "keywords": ["xin chào", "chào", "hello", "hi"]
        },
        "thanks": {
            "patterns": [
                r"(cảm ơn|thanks|thank you|cám ơn)",
            ],
            "keywords": ["cảm ơn", "thanks"]
        }
    }
    
    @staticmethod
    def detect(text: str) -> Dict[str, Any]:
        """
        Phát hiện intent từ text
        
        Returns:
            {
                "intent": str,
                "confidence": float,
                "matched_pattern": str,
                "entities": dict
            }
        """
        text_lower = text.lower().strip()
        
        best_intent = "general"
        best_confidence = 0.3
        matched_pattern = None
        
        # Check each intent
        for intent, config in IntentDetector.INTENT_PATTERNS.items():
            # Check regex patterns
            for pattern in config["patterns"]:
                if re.search(pattern, text_lower):
                    confidence = 0.8
                    if confidence > best_confidence:
                        best_intent = intent
                        best_confidence = confidence
                        matched_pattern = pattern
            
            # Check keywords
            keyword_matches = sum(1 for kw in config["keywords"] if kw in text_lower)
            if keyword_matches > 0:
                confidence = 0.6 + (keyword_matches * 0.1)
                if confidence > best_confidence:
                    best_intent = intent
                    best_confidence = min(confidence, 0.9)
        
        # Extract entities (course_id, price, etc.)
        entities = IntentDetector._extract_entities(text)
        
        return {
            "intent": best_intent,
            "confidence": best_confidence,
            "matched_pattern": matched_pattern,
            "entities": entities
        }
    
    @staticmethod
    def _extract_entities(text: str) -> Dict[str, Any]:
        """Extract entities from text"""
        entities = {}
        
        # Extract numbers (could be price, course_id, etc.)
        numbers = re.findall(r'\d+(?:,\d{3})*(?:\.\d+)?', text)
        if numbers:
            entities["numbers"] = numbers
        
        # Extract currency
        if any(word in text.lower() for word in ["vnđ", "đồng", "vnd", "k"]):
            entities["currency"] = "VND"
        
        return entities


class PersonalizationEngine:
    """Cá nhân hóa response dựa trên user history và preferences"""
    
    @staticmethod
    def personalize_response(
        response: str,
        user_context: Dict[str, Any],
        sentiment: Dict[str, Any]
    ) -> str:
        """
        Personalize response based on context and sentiment
        
        Args:
            response: Original AI response
            user_context: User context (preferences, history)
            sentiment: Sentiment analysis result
        """
        # Add empathy based on sentiment - Keep it brief and positive
        if sentiment["sentiment"] == "frustrated":
            # Don't add negative empathy, just be helpful
            pass
        elif sentiment["sentiment"] == "negative":
            # Don't add apologetic prefix, let the response speak for itself
            pass
        elif sentiment["sentiment"] == "positive":
            appreciation = "\n\n✨ Rất vui được hỗ trợ bạn!"
            response = response + appreciation
        
        # Add user name if available
        if user_context.get("user_name"):
            # Replace generic greetings with personalized ones
            response = response.replace(
                "Xin chào!",
                f"Xin chào {user_context['user_name']}!"
            )
        
        return response


class SmartResponseEnhancer:
    """Enhance response with additional helpful information"""
    
    @staticmethod
    def enhance(
        response: str,
        intent: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Enhance response with suggestions and actions
        
        Returns:
            {
                "response": str,
                "suggestions": List[str],
                "actions": List[dict],
                "quick_replies": List[dict]
            }
        """
        suggestions = []
        actions = []
        quick_replies = []
        
        # Add intent-specific enhancements
        if intent["intent"] == "course_search":
            suggestions.append("💡 Bạn có thể lọc khóa học theo danh mục, giá, hoặc đánh giá")
            actions.append({
                "type": "link",
                "label": "Xem tất cả khóa học",
                "url": "/courses"
            })
            quick_replies = [
                {"label": "Khóa học Lập trình", "value": "Tìm khóa học lập trình"},
                {"label": "Khóa học Marketing", "value": "Tìm khóa học marketing"},
                {"label": "Khóa học Design", "value": "Tìm khóa học design"},
            ]
        
        elif intent["intent"] == "registration":
            suggestions.append("📝 Đăng ký chỉ mất 2 phút với 3 bước đơn giản")
            actions.append({
                "type": "link",
                "label": "Hướng dẫn đăng ký",
                "url": "/help/registration"
            })
            quick_replies = [
                {"label": "Xem hướng dẫn", "value": "Hướng dẫn đăng ký chi tiết"},
                {"label": "Cần hỗ trợ", "value": "Tôi cần hỗ trợ đăng ký"},
            ]
        
        elif intent["intent"] == "payment":
            suggestions.append("💳 Chúng tôi hỗ trợ nhiều phương thức thanh toán an toàn")
            actions.append({
                "type": "link",
                "label": "Phương thức thanh toán",
                "url": "/help/payment"
            })
            quick_replies = [
                {"label": "Thanh toán online", "value": "Hướng dẫn thanh toán online"},
                {"label": "Thanh toán ATM", "value": "Hướng dẫn thanh toán ATM"},
            ]
        
        elif intent["intent"] == "promotion":
            suggestions.append("🎁 Xem các chương trình ưu đãi đang diễn ra")
            actions.append({
                "type": "link",
                "label": "Khuyến mãi hiện tại",
                "url": "/promotions"
            })
        
        elif intent["intent"] == "technical_support":
            suggestions.append("🔧 Vui lòng mô tả chi tiết vấn đề để chúng tôi hỗ trợ tốt hơn")
            actions.append({
                "type": "link",
                "label": "Liên hệ hỗ trợ",
                "url": "/support"
            })
            quick_replies = [
                {"label": "Không vào được", "value": "Tôi không vào được trang"},
                {"label": "Lỗi video", "value": "Video không phát được"},
                {"label": "Lỗi thanh toán", "value": "Lỗi khi thanh toán"},
            ]
        
        return {
            "message": response,  # Changed from "response" to "message"
            "suggestions": suggestions,
            "actions": actions,
            "quick_replies": quick_replies
        }


class MultiLanguageSupport:
    """Hỗ trợ đa ngôn ngữ"""
    
    LANGUAGES = {
        "vi": "Tiếng Việt",
        "en": "English"
    }
    
    TRANSLATIONS = {
        "greeting": {
            "vi": "Xin chào! Tôi có thể giúp gì cho bạn?",
            "en": "Hello! How can I help you?"
        },
        "thanks": {
            "vi": "Cảm ơn bạn đã sử dụng dịch vụ!",
            "en": "Thank you for using our service!"
        },
        "error": {
            "vi": "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
            "en": "Sorry, an error occurred. Please try again."
        }
    }
    
    @staticmethod
    def detect_language(text: str) -> str:
        """Detect language from text"""
        # Simple detection based on character set
        if re.search(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', text):
            return "vi"
        return "en"
    
    @staticmethod
    def translate(key: str, lang: str = "vi") -> str:
        """Get translation for key"""
        return MultiLanguageSupport.TRANSLATIONS.get(key, {}).get(lang, "")


# ===== HELPER FUNCTIONS =====

def analyze_message_comprehensive(message: str, user_context: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Comprehensive message analysis
    
    Returns:
        {
            "sentiment": dict,
            "intent": dict,
            "language": str,
            "entities": dict
        }
    """
    sentiment = SentimentAnalyzer.analyze(message)
    intent = IntentDetector.detect(message)
    language = MultiLanguageSupport.detect_language(message)
    
    return {
        "sentiment": sentiment,
        "intent": intent,
        "language": language,
        "timestamp": datetime.now().isoformat()
    }


def generate_smart_response(
    ai_response: str,
    message_analysis: Dict[str, Any],
    user_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate enhanced smart response
    
    Returns:
        Enhanced response with suggestions, actions, quick replies
    """
    # Personalize response
    personalized = PersonalizationEngine.personalize_response(
        ai_response,
        user_context or {},
        message_analysis["sentiment"]
    )
    
    # Enhance with suggestions
    enhanced = SmartResponseEnhancer.enhance(
        personalized,
        message_analysis["intent"],
        user_context or {}
    )
    
    return enhanced


# Export all classes
__all__ = [
    "SentimentAnalyzer",
    "IntentDetector",
    "PersonalizationEngine",
    "SmartResponseEnhancer",
    "MultiLanguageSupport",
    "analyze_message_comprehensive",
    "generate_smart_response"
]

