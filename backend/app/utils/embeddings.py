import math

# Shared core vocabulary of 128 Green IT and research terms
VOCAB = [
    "green", "electronics", "e-waste", "laptop", "smartphone", "university", "sri", "lanka",
    "recycling", "consumer", "behavior", "concern", "knowledge", "barriers", "tpb", "energy",
    "efficiency", "refurbished", "cost", "price", "disposal", "materials", "lifespan", "repair",
    "eco-labeled", "upgrade", "battery", "standards", "circular", "modular", "plastic", "toxic",
    "metals", "lead", "mercury", "grid", "power", "tariff", "bills", "saving", "curriculum",
    "courses", "education", "concern", "attitude", "social", "norms", "peer", "lecturers",
    "influence", "willingness", "pay", "premium", "availability", "market", "importers",
    "refurbished", "used", "carbon", "footprint", "manufacturing", "emissions", "certified",
    "standards", "labels", "epeat", "star", "rohs", "hazardous", "landfills", "leaching",
    "pollution", "environment", "toxic", "chemicals", "cadmium", "dialog", "mobitel", "cea",
    "licensed", "hazardous", "recycle", "bins", "collectors", "academic", "workstations",
    "sleep", "standby", "workstations", "hardware", "durability", "maintenance", "silicon",
    "wafer", "cleanroom", "accessories", "monitors", "display", "panels", "oled", "ips",
    "eco-mode", "sdg", "responsible", "attitude-behavior", "gap", "dissonance", "greenwashing",
    "subjective", "behavioral", "control", "intention", "procurement", "refining", "smelters"
]

VOCAB = list(dict.fromkeys(VOCAB))
while len(VOCAB) < 128:
    VOCAB.append(f"pad_word_{len(VOCAB)}")
VOCAB = VOCAB[:128]

def get_mock_embedding(text: str, keywords: list = None) -> list:
    """
    Generates a normalized 128-dimensional mock embedding vector 
    based on vocabulary frequency counts in the provided text.
    """
    text_lower = text.lower()
    vector = [0.0] * 128
    
    for i, word in enumerate(VOCAB):
        count = text_lower.count(word)
        vector[i] = float(count)
        
    if keywords:
        for kw in keywords:
            kw_lower = kw.lower()
            for i, word in enumerate(VOCAB):
                if word in kw_lower:
                    vector[i] += 5.0
                    
    sq_sum = sum(v ** 2 for v in vector)
    norm = math.sqrt(sq_sum)
    
    if norm > 0:
        vector = [v / norm for v in vector]
    else:
        vector = [1.0 / math.sqrt(128)] * 128
        
    return vector
