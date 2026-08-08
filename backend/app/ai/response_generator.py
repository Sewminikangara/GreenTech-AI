import os
import json
import httpx
from typing import List, Dict, Optional
from app.config.settings import settings

# System instruction guiding the AI behavior to support research variables
SYSTEM_INSTRUCTION = (
    "You are GreenTech Advisor AI.\n"
    "Your purpose is to help users make environmentally responsible electronic purchasing decisions.\n"
    "Your answers should:\n"
    "- Explain environmental concepts clearly\n"
    "- Encourage sustainable thinking\n"
    "- Discuss benefits and limitations of electronics\n"
    "- Consider price, performance, lifespan, and usability\n"
    "- Never make unsupported environmental claims\n"
    "- Never say a company or product is completely green\n"
    "Connect answers naturally to green purchase intention, addressing environmental concern, "
    "knowledge, perceived benefits, and perceived barriers (such as cost and availability)."
)

def generate_ai_response(question: str, context_chunks: List[Dict], history: List[Dict]) -> str:
    """
    Combines System Instructions, RAG context, and message history to generate 
    the AI response, using OpenAI or Google Gemini APIs if keys are present,
    or a deterministic local synthesizer if neither is configured.
    """
    openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    
    # 1. Format the retrieved context passages
    context_str = ""
    for idx, chunk in enumerate(context_chunks):
        context_str += f"Reference [{idx + 1}]:\nDocument: {chunk['title']}\nSource: {chunk['source']}\nContent: {chunk['text']}\n\n"
        
    # 2. Format history logs
    history_str = ""
    for msg in history:
        sender = "User" if msg["sender"] == "user" else "Assistant"
        history_str += f"{sender}: {msg['text']}\n"
        
    # 3. Formulate prompt (for Gemini or log context)
    prompt = (
        f"You have the following retrieved knowledge context from the database:\n"
        f"======================\n{context_str}======================\n\n"
        f"Conversation History:\n{history_str}"
        f"User Question: {question}\n\n"
        f"Please answer the User Question using the context provided where possible. Follow the system instruction rules."
    )
    
    # Option A: Call OpenAI API
    if openai_key:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai_key}"
        }
        
        # Structure messages array with roles
        messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
        for msg in history:
            role = "user" if msg["sender"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["text"]})
            
        messages.append({
            "role": "user",
            "content": f"Retrieved Context:\n{context_str}\n\nUser Question: {question}"
        })
        
        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.3
        }
        
        try:
            response = httpx.post(url, json=payload, headers=headers, timeout=25.0)
            if response.status_code == 200:
                data = response.json()
                text = data["choices"][0]["message"]["content"]
                return text
            else:
                print(f"OpenAI API error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Failed to connect to OpenAI API: {e}")
            
    # Option B: Call Google Gemini API
    elif gemini_key:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]}
        }
        
        try:
            response = httpx.post(url, json=payload, headers=headers, timeout=25.0)
            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                print(f"Gemini API error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Failed to connect to Gemini API: {e}")
            
    # Option C: Fallback Local Response Synthesis (matches structural response types requested)
    return synthesize_local_response(question, context_chunks, history)


def synthesize_local_response(question: str, context_chunks: List[Dict], history: List[Dict]) -> str:
    """
    Analyzes user intent and synthesizes response following the 4 requested output types:
    Type 1: Educational, Type 2: Recommendation, Type 3: Comparison, Type 4: Problem-Solving.
    """
    q_lower = question.lower()
    best_chunk_text = context_chunks[0]["text"] if context_chunks else ""
    
    # Type 3: Comparison
    if "vs" in q_lower or "compare" in q_lower or "comparison" in q_lower or "normal laptop" in q_lower:
        return (
            "### Comparison: Standard Laptop vs. Green Laptop\n\n"
            "Here is a comparative breakdown of key lifecycle factors:\n\n"
            "| Feature | Standard Consumer Laptop | Green/Sustainable Laptop (e.g. EPEAT Gold) |\n"
            "| :--- | :--- | :--- |\n"
            "| **Housing Materials** | Virgin plastics, toxic glues | Recycled aluminum, post-consumer ocean plastics |\n"
            "| **Repairability** | Soldered RAM/SSD, glued batteries | Modular components, easy screw access, spare parts available |\n"
            "| **Energy Draw** | Standard consumption | Energy Star certified (low active & standby draw) |\n"
            "| **Disposal E-Waste** | Difficult to split, toxic compounds | Designed for recycling, lead-free solder alloys |\n"
            "| **Lifespan** | 2-3 years average utility | 5-7 years due to component upgrades |\n\n"
            "While standard laptops may have lower initial costs, green laptops reduce life-cycle environmental concern and lower power expenses."
        )
        
    # Type 4: Problem-Solving (Price/Barriers)
    elif "cost" in q_lower or "expensive" in q_lower or "price" in q_lower or "premium" in q_lower:
        return (
            "### Problem-Solving: Addressing the Cost Barriers of Green Electronics\n\n"
            "It is true that sustainable tech can carry a 'green premium' of 10% to 20% higher upfront costs. "
            "However, this barrier can be mitigated using the following alternatives:\n\n"
            "1. **Evaluate Refurbished Enterprise Gear**: Purchasing a refurbished business laptop (e.g., ThinkPad or Latitude) "
            "reclaims corporate hardware at 50% discount. It avoids embodied carbon emissions of new manufacturing.\n"
            "2. **Calculate Long-Term Energy Savings**: An Energy Star laptop reduces active wattage, lowering electricity "
            "bills in the Sri Lankan grid context over time.\n"
            "3. **Prioritize Modularity**: Upgrading RAM or batteries for Rs. 15,000 saves you from buying a new laptop "
            "for Rs. 150,000, extending device utility to 6+ years.\n\n"
            "Practical advice: Focus on purchasing upgradeable devices to spread costs and reduce landfill electronic waste."
        )
        
    # Type 2: Recommendation (e.g. software engineering / programming)
    elif "programming" in q_lower or "software" in q_lower or "recommend" in q_lower or "buy" in q_lower or "student" in q_lower:
        # Check if conversation history indicates user wants programming recommendations
        is_programming = (
            "programming" in q_lower or 
            "software" in q_lower or 
            any("programming" in h.get("text", "").lower() or "software" in h.get("text", "").lower() for h in history)
        )
        
        if is_programming:
            return (
                "### Recommendation Guide: Laptop for Software Engineering\n\n"
                "For programming and compiled languages, sustainable recommendations are based on performance, durability, and repair:\n\n"
                "- **System Requirements**: Prioritize at least 16GB RAM and a 512GB SSD. Look for modular SO-DIMM slots to allow future memory upgrades.\n"
                "- **Sustainability Considerations**: Select aluminum housings to withstand campus transport, and verify EPEAT Gold and RoHS ratings to avoid hazardous compounds.\n"
                "- **Buying Tip**: Consider refurbished enterprise business-class systems. They provide excellent compilation speeds, durable keyboards, and are easily repairable by local shops in Sri Lanka."
            )
        else:
            return (
                "### Buying Guide: Sustainable Electronics\n\n"
                "Before buying a device, consider the following parameters:\n"
                "1. **Check Eco-Certifications**: Look for EPEAT Gold, Energy Star, or TCO Certified labels.\n"
                "2. **Assess Repairability**: Check if the battery can be replaced easily without special heat guns.\n"
                "3. **Refurbished over New**: Evaluate pre-owned enterprise gear to save capital and carbon footprint."
            )
            
    # Type 1: Educational (Default RAG retrieval output)
    else:
        if best_chunk_text:
            return best_chunk_text
            
        return (
            "### Green Electronics Explained\n\n"
            "Green electronics are devices designed to minimize their ecological footprint throughout their life cycle. "
            "This covers eco-responsible manufacturing, low-power operation, repairable parts, and safe recycling paths.\n\n"
            "IT undergraduates can promote these practices by expanding environmental knowledge and choosing upgradeable "
            "electronics to lower e-waste landfill contamination."
        )
