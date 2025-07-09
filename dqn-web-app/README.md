# DQN Web App - Interactive Reinforcement Learning

A full-stack web application for training and visualizing Deep Q-Network agents on the CartPole-v1 environment.

## Features

- Interactive training dashboard
- Real-time metrics visualization  
- Live agent performance videos
- Model save/load functionality
- Advanced charting and analytics
- WebSocket real-time updates

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker (optional)

### Development Setup

1. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start Development Servers**

   Backend:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Docker Setup (Alternative)

```bash
docker-compose up --build
```

## Project Structure

```
dqn-web-app/
├── frontend/          # Next.js React application
├── backend/           # FastAPI Python server
├── shared/            # Shared utilities
└── docker-compose.yml
```

## Usage

1. Open the web app at http://localhost:3000
2. Navigate to the Simulation Dashboard
3. Configure training parameters
4. Start training and watch real-time progress
5. View agent performance videos
6. Download trained models

## API Endpoints

- `POST /api/training/start` - Start training
- `GET /api/training/status` - Get training status
- `POST /api/training/stop` - Stop training
- `GET /api/models` - List saved models
- `WebSocket /ws` - Real-time updates

## License

MIT License