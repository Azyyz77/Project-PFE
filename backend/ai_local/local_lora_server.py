import os
from typing import Optional

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel


BASE_MODEL_ID = os.getenv("BASE_MODEL_ID", "Qwen/Qwen2.5-3B-Instruct")
LORA_ADAPTER_PATH = os.getenv("LORA_ADAPTER_PATH", "")
SYSTEM_PROMPT = os.getenv(
    "LOCAL_AI_SYSTEM_PROMPT",
    "Tu es l'assistant SAV officiel de Chery Tunisie. Reponds en francais ou arabe tunisien de maniere professionnelle et utile.",
)
MAX_NEW_TOKENS = int(os.getenv("LOCAL_AI_MAX_NEW_TOKENS", "256"))
TEMPERATURE = float(os.getenv("LOCAL_AI_TEMPERATURE", "0.7"))
TOP_P = float(os.getenv("LOCAL_AI_TOP_P", "0.9"))

app = FastAPI(title="Local LoRA Inference API", version="1.0.0")

model = None
tokenizer = None
model_device = "cpu"


class ChatRequest(BaseModel):
    question: str
    userType: Optional[str] = None
    userName: Optional[str] = None


@app.on_event("startup")
def load_model() -> None:
    global model, tokenizer, model_device

    if not LORA_ADAPTER_PATH:
        raise RuntimeError("LORA_ADAPTER_PATH is required")

    if not os.path.exists(LORA_ADAPTER_PATH):
        raise RuntimeError(f"LORA adapter path does not exist: {LORA_ADAPTER_PATH}")

    use_cuda = torch.cuda.is_available()
    model_device = "cuda" if use_cuda else "cpu"

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID)

    dtype = torch.float16 if use_cuda else torch.float32
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_ID,
        torch_dtype=dtype,
        device_map="auto" if use_cuda else None,
        low_cpu_mem_usage=True,
    )

    model = PeftModel.from_pretrained(model, LORA_ADAPTER_PATH)
    model.eval()

    if not use_cuda:
        model.to(model_device)


@app.get("/health")
def health_check() -> dict:
    ready = model is not None and tokenizer is not None
    return {
        "status": "ready" if ready else "loading",
        "base_model": BASE_MODEL_ID,
        "adapter_path": LORA_ADAPTER_PATH,
        "device": model_device,
    }


@app.post("/chat")
def chat(req: ChatRequest) -> dict:
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is still loading")

    question = (req.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="question is required")

    user_context = []
    if req.userType:
        user_context.append(f"Role utilisateur: {req.userType}")
    if req.userName:
        user_context.append(f"Nom utilisateur: {req.userName}")

    context_block = "\n".join(user_context)
    if context_block:
        context_block = f"Contexte:\n{context_block}\n\n"

    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"{context_block}"
        f"Question client: {question}\n"
        "Reponse:"
    )

    inputs = tokenizer(prompt, return_tensors="pt")
    inputs = {k: v.to(model_device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            temperature=TEMPERATURE,
            top_p=TOP_P,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
        )

    new_tokens = outputs[0][inputs["input_ids"].shape[-1] :]
    text = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

    return {"response": text}
