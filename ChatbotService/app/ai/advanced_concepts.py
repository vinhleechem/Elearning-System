"""
Advanced AI Concepts - Các khái niệm AI tiên tiến
Tích hợp các techniques nâng cao để chatbot thông minh hơn

Concepts implemented:
1. Chain of Thought (CoT) - Suy nghĩ từng bước
2. ReAct - Reasoning + Acting
3. Self-Reflection - Tự đánh giá
4. Advanced Prompting - Kỹ thuật prompt engineering
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import json
import re

logger = logging.getLogger(__name__)


# ============================================================================
# 1. CHAIN OF THOUGHT (CoT) - Suy nghĩ từng bước
# ============================================================================

class ChainOfThought:
    """
    Chain of Thought (CoT) Prompting
    
    Cho phép AI suy nghĩ từng bước trước khi trả lời
    → Giúp AI trả lời chính xác hơn, đặc biệt với câu hỏi phức tạp
    
    Paper: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"
    """
    
    @staticmethod
    def enable_cot_for_query(query: str, context: Dict[str, Any]) -> Tuple[str, bool]:
        """
        Xác định xem có nên dùng CoT cho query này không
        
        Returns:
            (enhanced_query, should_use_cot)
        """
        # Các loại câu hỏi nên dùng CoT
        cot_indicators = [
            "tại sao", "why", "vì sao", "giải thích",
            "so sánh", "compare", "khác nhau",
            "tính", "calculate", "bao nhiêu",
            "phân tích", "analyze",
            "nên", "should", "recommend"
        ]
        
        query_lower = query.lower()
        should_use_cot = any(indicator in query_lower for indicator in cot_indicators)
        
        if should_use_cot:
            # Thêm instruction để AI suy nghĩ từng bước
            enhanced_query = f"""{query}

Hãy suy nghĩ từng bước (step-by-step):
1. Hiểu vấn đề
2. Phân tích thông tin
3. Suy luận logic
4. Đưa ra kết luận

Trả lời theo format:
🤔 SUY NGHĨ:
[Quá trình suy nghĩ của bạn]

💡 KẾT LUẬN:
[Câu trả lời cuối cùng]
"""
            logger.info(f"✅ Enabled Chain of Thought for query: {query[:50]}...")
            return enhanced_query, True
        
        return query, False
    
    @staticmethod
    def parse_cot_response(response: str) -> Dict[str, str]:
        """Parse response có Chain of Thought"""
        thinking = ""
        conclusion = ""
        
        # Extract thinking process
        thinking_match = re.search(r'🤔 SUY NGHĨ:(.*?)(?=💡 KẾT LUẬN:|$)', response, re.DOTALL)
        if thinking_match:
            thinking = thinking_match.group(1).strip()
        
        # Extract conclusion
        conclusion_match = re.search(r'💡 KẾT LUẬN:(.*?)$', response, re.DOTALL)
        if conclusion_match:
            conclusion = conclusion_match.group(1).strip()
        
        return {
            "thinking": thinking,
            "conclusion": conclusion,
            "full_response": response
        }


# ============================================================================
# 2. ReAct - Reasoning + Acting
# ============================================================================

class ReActAgent:
    """
    ReAct: Synergizing Reasoning and Acting in Language Models
    
    Kết hợp suy luận (Reasoning) và hành động (Acting)
    AI sẽ:
    1. Thought (Suy nghĩ) - Phân tích vấn đề
    2. Action (Hành động) - Gọi tools nếu cần
    3. Observation (Quan sát) - Nhận kết quả
    4. Repeat cho đến khi có câu trả lời
    
    Paper: "ReAct: Synergizing Reasoning and Acting in Language Models"
    """
    
    def __init__(self):
        self.max_iterations = 5
        self.thought_history = []
    
    def create_react_prompt(
        self,
        query: str,
        available_tools: List[str],
        context: Dict[str, Any]
    ) -> str:
        """
        Tạo ReAct prompt cho AI
        """
        tools_description = "\n".join([f"- {tool}" for tool in available_tools])
        
        prompt = f"""Bạn là AI assistant sử dụng ReAct pattern (Reasoning + Acting).

Câu hỏi: {query}

Tools có sẵn:
{tools_description}

Hãy suy nghĩ và hành động theo format:

Thought: [Suy nghĩ về vấn đề, cần làm gì tiếp theo]
Action: [Gọi tool nếu cần, hoặc "Answer" nếu đã đủ thông tin]
Action Input: [Parameters cho tool]

Observation: [Kết quả từ tool]

Thought: [Tiếp tục suy nghĩ dựa trên observation]
...

Thought: Tôi đã có đủ thông tin để trả lời
Action: Answer
Final Answer: [Câu trả lời cuối cùng]

Bắt đầu!
"""
        return prompt
    
    def parse_react_response(self, response: str) -> Dict[str, Any]:
        """Parse ReAct response"""
        steps = []
        
        # Extract thought-action-observation cycles
        lines = response.split('\n')
        current_step = {}
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('Thought:'):
                if current_step:
                    steps.append(current_step)
                current_step = {'thought': line.replace('Thought:', '').strip()}
            
            elif line.startswith('Action:'):
                current_step['action'] = line.replace('Action:', '').strip()
            
            elif line.startswith('Action Input:'):
                current_step['action_input'] = line.replace('Action Input:', '').strip()
            
            elif line.startswith('Observation:'):
                current_step['observation'] = line.replace('Observation:', '').strip()
            
            elif line.startswith('Final Answer:'):
                current_step['final_answer'] = line.replace('Final Answer:', '').strip()
        
        if current_step:
            steps.append(current_step)
        
        return {
            'steps': steps,
            'final_answer': steps[-1].get('final_answer', '') if steps else ''
        }


# ============================================================================
# 3. SELF-REFLECTION - Tự đánh giá
# ============================================================================

class SelfReflection:
    """
    Self-Reflection - AI tự đánh giá câu trả lời
    
    AI sẽ:
    1. Generate câu trả lời ban đầu
    2. Tự đánh giá (critique) câu trả lời đó
    3. Cải thiện dựa trên critique
    4. Trả về câu trả lời tốt hơn
    
    Paper: "Reflexion: an autonomous agent with dynamic memory and self-reflection"
    """
    
    @staticmethod
    def create_reflection_prompt(
        query: str,
        initial_answer: str,
        context: Dict[str, Any]
    ) -> str:
        """
        Tạo prompt để AI tự đánh giá câu trả lời
        """
        prompt = f"""Bạn vừa trả lời câu hỏi sau:

Câu hỏi: {query}

Câu trả lời ban đầu:
{initial_answer}

Hãy TỰ ĐÁNH GIÁ câu trả lời này:

1. ĐÁNH GIÁ (0-10 điểm):
   - Độ chính xác: [điểm]/10
   - Độ đầy đủ: [điểm]/10
   - Độ rõ ràng: [điểm]/10
   - Độ hữu ích: [điểm]/10

2. ĐIỂM YẾU:
   - [Liệt kê những gì còn thiếu hoặc chưa tốt]

3. CẢI THIỆN:
   - [Đề xuất cách cải thiện]

4. CÂU TRẢ LỜI CẢI THIỆN:
   [Viết lại câu trả lời tốt hơn dựa trên đánh giá]

Trả lời theo format trên.
"""
        return prompt
    
    @staticmethod
    def parse_reflection(reflection_response: str) -> Dict[str, Any]:
        """Parse self-reflection response"""
        result = {
            'scores': {},
            'weaknesses': [],
            'improvements': [],
            'improved_answer': ''
        }
        
        # Extract scores
        score_patterns = [
            (r'Độ chính xác:\s*(\d+)/10', 'accuracy'),
            (r'Độ đầy đủ:\s*(\d+)/10', 'completeness'),
            (r'Độ rõ ràng:\s*(\d+)/10', 'clarity'),
            (r'Độ hữu ích:\s*(\d+)/10', 'helpfulness')
        ]
        
        for pattern, key in score_patterns:
            match = re.search(pattern, reflection_response)
            if match:
                result['scores'][key] = int(match.group(1))
        
        # Extract improved answer
        improved_match = re.search(
            r'4\.\s*CÂU TRẢ LỜI CẢI THIỆN:(.*?)(?=$|\n\n)',
            reflection_response,
            re.DOTALL
        )
        if improved_match:
            result['improved_answer'] = improved_match.group(1).strip()
        
        # Calculate average score
        if result['scores']:
            result['average_score'] = sum(result['scores'].values()) / len(result['scores'])
        
        return result


# ============================================================================
# 4. ADVANCED PROMPT ENGINEERING
# ============================================================================

class AdvancedPromptEngineering:
    """
    Advanced Prompt Engineering Techniques
    
    Các kỹ thuật tối ưu prompts:
    1. Few-Shot Learning - Đưa examples
    2. Role Prompting - Gán vai trò cho AI
    3. Constraint Prompting - Đặt ràng buộc
    4. Format Specification - Chỉ định format rõ ràng
    """
    
    @staticmethod
    def create_few_shot_prompt(
        query: str,
        examples: List[Dict[str, str]],
        task_description: str
    ) -> str:
        """
        Few-Shot Learning - Học từ examples
        """
        examples_text = "\n\n".join([
            f"Example {i+1}:\nInput: {ex['input']}\nOutput: {ex['output']}"
            for i, ex in enumerate(examples)
        ])
        
        prompt = f"""Task: {task_description}

{examples_text}

Now answer this:
Input: {query}
Output: """
        
        return prompt
    
    @staticmethod
    def create_role_prompt(
        query: str,
        role: str,
        expertise: List[str],
        tone: str = "professional"
    ) -> str:
        """
        Role Prompting - Gán vai trò cụ thể cho AI
        """
        expertise_text = ", ".join(expertise)
        
        prompt = f"""Bạn là {role} với chuyên môn về {expertise_text}.

Phong cách: {tone}
Nhiệm vụ: Trả lời câu hỏi sau một cách chuyên nghiệp và chính xác.

Câu hỏi: {query}

Hãy trả lời dựa trên vai trò và chuyên môn của bạn.
"""
        return prompt
    
    @staticmethod
    def create_structured_output_prompt(
        query: str,
        output_schema: Dict[str, Any]
    ) -> str:
        """
        Structured Output - Yêu cầu output theo format cụ thể
        """
        schema_text = json.dumps(output_schema, indent=2, ensure_ascii=False)
        
        prompt = f"""Câu hỏi: {query}

Hãy trả lời theo format JSON sau:
{schema_text}

Trả lời (JSON only):
"""
        return prompt


# ============================================================================
# 5. ADVANCED AI ORCHESTRATOR - Điều phối tất cả
# ============================================================================

class AdvancedAIOrchestrator:
    """
    Orchestrator để quyết định khi nào dùng technique nào
    """
    
    def __init__(self):
        self.cot = ChainOfThought()
        self.react = ReActAgent()
        self.reflection = SelfReflection()
        self.prompt_engineer = AdvancedPromptEngineering()
    
    def analyze_query_complexity(self, query: str) -> Dict[str, Any]:
        """
        Phân tích độ phức tạp của query để quyết định technique
        """
        complexity = {
            'requires_reasoning': False,  # Cần CoT
            'requires_tools': False,      # Cần ReAct
            'requires_reflection': False, # Cần Self-Reflection
            'complexity_score': 0,
            'recommended_technique': 'standard'
        }
        
        query_lower = query.lower()
        
        # Check reasoning indicators
        reasoning_keywords = [
            'tại sao', 'why', 'vì sao', 'giải thích', 'phân tích',
            'so sánh', 'compare', 'khác nhau', 'ưu nhược điểm'
        ]
        if any(kw in query_lower for kw in reasoning_keywords):
            complexity['requires_reasoning'] = True
            complexity['complexity_score'] += 3
        
        # Check tool usage indicators
        tool_keywords = [
            'tìm', 'search', 'query', 'lấy', 'đọc', 'file',
            'bao nhiêu', 'how many', 'thống kê', 'statistics'
        ]
        if any(kw in query_lower for kw in tool_keywords):
            complexity['requires_tools'] = True
            complexity['complexity_score'] += 2
        
        # Check if needs high accuracy (reflection)
        critical_keywords = [
            'chính xác', 'accurate', 'đảm bảo', 'guarantee',
            'quan trọng', 'important', 'critical'
        ]
        if any(kw in query_lower for kw in critical_keywords):
            complexity['requires_reflection'] = True
            complexity['complexity_score'] += 2
        
        # Recommend technique
        if complexity['complexity_score'] >= 5:
            if complexity['requires_tools']:
                complexity['recommended_technique'] = 'react'
            elif complexity['requires_reasoning']:
                complexity['recommended_technique'] = 'cot'
            if complexity['requires_reflection']:
                complexity['recommended_technique'] += '+reflection'
        elif complexity['complexity_score'] >= 3:
            complexity['recommended_technique'] = 'cot'
        
        logger.info(f"📊 Query complexity analysis: {complexity}")
        return complexity
    
    def enhance_prompt_with_technique(
        self,
        query: str,
        technique: str,
        context: Dict[str, Any]
    ) -> str:
        """
        Enhance prompt với technique được chọn
        """
        if technique == 'cot':
            enhanced_query, _ = self.cot.enable_cot_for_query(query, context)
            return enhanced_query
        
        elif technique == 'react':
            available_tools = context.get('available_tools', [])
            return self.react.create_react_prompt(query, available_tools, context)
        
        elif technique.startswith('role:'):
            role = technique.split(':')[1]
            return self.prompt_engineer.create_role_prompt(
                query,
                role,
                expertise=context.get('expertise', []),
                tone=context.get('tone', 'professional')
            )
        
        return query


# ============================================================================
# EXPORT
# ============================================================================

__all__ = [
    'ChainOfThought',
    'ReActAgent',
    'SelfReflection',
    'AdvancedPromptEngineering',
    'AdvancedAIOrchestrator'
]

