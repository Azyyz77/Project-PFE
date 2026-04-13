# Local AI Inference Server (Qwen + LoRA)

This service runs a local inference API for your fine-tuned model.

## 1) Prepare model adapter path

Clone your LoRA repository if needed:

```powershell
git clone https://huggingface.co/dali4444444/chery-sav-qwen2.5-3b-lora
```

Set environment variables before launch:

```powershell
$env:BASE_MODEL_ID='Qwen/Qwen2.5-3B-Instruct'
$env:LORA_ADAPTER_PATH='C:\Users\pc\chery-sav-qwen2.5-3b-lora'
```

## 2) Install dependencies

```powershell
pip install -r backend/ai_local/requirements.txt
```

## 3) Start local API

```powershell
uvicorn backend.ai_local.local_lora_server:app --host 127.0.0.1 --port 8000
```

## 4) Test API directly

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/chat' -Method Post -ContentType 'application/json' -Body '{"question":"Bonjour, je veux prendre un rendez-vous"}'
```

Expected response:

```json
{"response":"..."}
```

## 5) Connect backend

In `backend/.env`:

```env
HUGGINGFACE_API_URL=http://127.0.0.1:8000/chat
```

Then run backend and test:

```powershell
npm run test:ai
```
