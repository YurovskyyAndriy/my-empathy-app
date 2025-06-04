# Empathy App

An AI-powered application that helps improve communication through emotional intelligence analysis.

## Features

- Real-time text analysis for emotional intelligence
- Voice input support with transcription
- Detailed emotional impact analysis
- Suggestions for more empathetic communication
- Modern, responsive UI with Ant Design

## Tech Stack

### Frontend
- React.js
- TypeScript
- Ant Design
- Styled Components
- React Router
- Redux Toolkit

### Backend
- FastAPI
- OpenAI API
- Pinecone Vector Database
- SQLAlchemy
- Alembic
- Python 3.8+

## Setup

### Prerequisites
- Node.js 16+
- Python 3.8+
- OpenAI API key
- Pinecone API key

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a .env file with the following variables:
   ```
   OPENAI_API_KEY=your-api-key-here
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_ENVIRONMENT=your-pinecone-environment
   DATABASE_URL=sqlite:///./app.db
   SECRET_KEY=your-secret-key-here
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

## Development

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
