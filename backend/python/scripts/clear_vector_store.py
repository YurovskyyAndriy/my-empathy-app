import asyncio
import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.settings import Settings
from app.services.message_processor import MessageProcessor

async def main():
    settings = Settings()
    processor = MessageProcessor(settings)
    
    print("Clearing vector store...")
    await processor.clear_vector_store()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(main()) 