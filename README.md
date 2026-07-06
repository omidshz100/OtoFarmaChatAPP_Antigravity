# Otofarma AI System

A full-stack Retrieval-Augmented Generation (RAG) application built for Otofarma, featuring a beautiful React frontend and a powerful FastAPI + LlamaIndex backend. 

The system supports seamless switching between cloud models (OpenAI) and local models (Ollama), with isolated vector database namespaces for each provider.

---

## 🏗 Project Structure
- `/frontend`: React application built with Vite and TailwindCSS.
- `/backend`: FastAPI Python server powered by LlamaIndex.

---

## 🚀 How to Run the Application

You will need to open **two separate terminal windows** to run the backend and frontend simultaneously.

### 1. Start the Backend (Terminal 1)
The backend handles the AI logic, vector database, and document processing.

```bash
# Navigate to the backend directory
cd backend

# Activate the virtual environment
source venv/bin/activate

# Start the FastAPI server with hot-reload
uvicorn app.main:app --reload
```
*The backend server will start on `http://localhost:8000`.*

### 2. Start the Frontend (Terminal 2)
The frontend serves the user interface.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (only needed the first time)
npm install

# Start the Vite development server
npm run dev
```
*The frontend will typically start on `http://localhost:5173`. Open this URL in your browser to use the app.*

---

## ⚙️ Configuration & Features

- **Model Switching**: Go to the **Settings** tab in the app to switch between `OpenAI` and local `Ollama` models (e.g., `qwen2.5:latest`).
- **Vector Database**: Documents are chunked and stored automatically. If you switch AI providers, the app will automatically build a new, isolated vector database namespace for that provider to prevent embedding math crashes.
- **Data Visualizer**: Use the **Database** tab to view exactly how your documents are being chunked and fed to the AI.

### Using Local Models (Ollama)
If you wish to run the app entirely offline using Ollama:
1. Ensure the Ollama app is running on your machine.
2. Pull your desired model in the terminal: `ollama pull qwen2.5:latest`
3. In the app Settings, set the Provider to `Ollama` and the Model ID to `qwen2.5:latest`.
