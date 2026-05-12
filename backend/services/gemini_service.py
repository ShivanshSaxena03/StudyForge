import os
import google.generativeai as genai
from typing import List

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def get_gemini_model():

    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found")

    genai.configure(api_key=GEMINI_API_KEY)

    return genai.GenerativeModel(
        model_name="gemini-2.5-flash"
    )


SECTION_PROMPTS = {

    "summary": """
Create an ELITE STUDY SUMMARY for students.

Requirements:
- Start with a 2-3 line high-level overview
- Extract the MOST IMPORTANT ideas only
- Organize content into logical headings and subheadings
- Explain concepts in simple but academically strong language
- Highlight important keywords and definitions
- Include bullet points wherever useful
- Add "Key Takeaways" section at the end
- Make the notes concise but highly informative
- Avoid repetition
- Use proper formatting for readability

Output Structure:
1. Overview
2. Main Concepts
3. Important Explanations
4. Key Takeaways
""",

    "key_concepts": """
Create a HIGH-QUALITY KEY CONCEPTS section.

Requirements:
- Identify ALL important terms, principles, formulas, and definitions
- Explain each concept clearly in student-friendly language
- Mention real-world relevance wherever possible
- Include relationships between concepts
- Add examples if helpful
- Prioritize exam-relevant concepts
- Make definitions precise and easy to memorize

Formatting:
- Use:
  **Concept Name**
  Definition:
  Explanation:
  Example:
  Importance:

- Separate each concept clearly
""",

    "flowchart": """
Create ADVANCED PROCESS FLOWS and VISUAL EXPLANATIONS.

Requirements:
- Convert processes into step-by-step flows
- Create logical chains of events
- Explain cause-and-effect relationships
- Use arrows and flow structures
- Simplify complex systems visually
- Include decision branches where relevant
- Make the flow easy for revision and memorization

Formatting:
Use clean flowchart style like:

[Start]
   ↓
[Step 1]
   ↓
[Step 2]
   ↓
{Decision?}
 ↙       ↘
Yes      No
 ↓        ↓
[A]      [B]

Create multiple flows if needed.
""",

    "comparison": """
Create PROFESSIONAL COMPARISON TABLES and DIFFERENCE ANALYSIS.

Requirements:
- Compare related concepts, technologies, theories, methods, or systems
- Highlight similarities and differences
- Add pros and cons where applicable
- Focus on exam-oriented comparisons
- Include practical applications
- Make comparisons highly readable

Formatting:
- Use markdown tables
- Include columns like:
  Feature | Concept A | Concept B
- Add a short conclusion after each table
- Create multiple comparison tables if needed
""",

    "qa": """
Create a MASTER PRACTICE Q&A SECTION for exam preparation.

Requirements:
- Generate 15-20 high-quality questions
- Include:
  - Short answer questions
  - Long conceptual questions
  - Application-based questions
  - Critical thinking questions
- Provide detailed but concise answers
- Cover ALL major concepts
- Make questions exam-oriented
- Add tricky conceptual questions too

Formatting:
Q1. Question
Answer:
- Point 1
- Point 2
- Explanation

Make answers structured and easy to revise.
""",

    "timeline": """
Create a DETAILED TIMELINE / SEQUENCE ANALYSIS section.

Requirements:
- Organize events/processes chronologically
- Explain evolution and progression
- Highlight milestones and transitions
- Show stages/phases clearly
- Include dates/times if available
- Explain significance of each step
- Make it easy to understand progression

Formatting:
[Stage/Date/Event]
↓
Explanation
↓
Impact / Result

Create a complete sequential understanding.
"""
}


async def generate_study_content(
    raw_text: str,
    options: List[str],
    book_title: str,
    subject: str
):

    model = get_gemini_model()

    results = {}

    if len(raw_text) > 60000:
        raw_text = raw_text[:60000]

    for option in options:

        instruction = SECTION_PROMPTS.get(option)

        if not instruction:
            continue

        prompt = f"""
You are an expert AI study assistant.

Book Title:
{book_title}

Subject:
{subject}

Study Material:
{raw_text}

Task:
{instruction}

Generate well-structured student-friendly notes.
"""

        try:

            response = model.generate_content(prompt)

            results[option] = response.text

        except Exception as e:

            results[option] = f"Generation failed: {str(e)}"

    return results