
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from typing import List, Dict
import os
import json
from datetime import datetime
from main import training_manager

router = APIRouter()

@router.get("/models")
async def list_models():
    """List all saved models"""
    models_dir = "models/saved"
    if not os.path.exists(models_dir):
        return {"models": []}

    models = []
    for filename in os.listdir(models_dir):
        if filename.endswith('.pth'):
            filepath = os.path.join(models_dir, filename)
            stat = os.stat(filepath)
            models.append({
                "name": filename[:-4],  # Remove .pth extension
                "filename": filename,
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })

    return {"models": models}

@router.post("/models/save")
async def save_model(name: str):
    """Save current trained model"""
    if not training_manager.agent:
        raise HTTPException(status_code=400, detail="No trained model available")

    try:
        filepath = training_manager.save_model(name)
        return {
            "message": "Model saved successfully",
            "name": name,
            "filepath": filepath
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models/load")
async def load_model(filename: str):
    """Load a saved model"""
    filepath = f"models/saved/{filename}"

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Model not found")

    try:
        # Initialize agent first if not exists
        if not training_manager.agent:
            training_manager.initialize_agent({})

        training_manager.load_model(filepath)
        return {
            "message": "Model loaded successfully",
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/download/{filename}")
async def download_model(filename: str):
    """Download a saved model"""
    filepath = f"models/saved/{filename}"

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Model not found")

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type='application/octet-stream'
    )

@router.delete("/models/{filename}")
async def delete_model(filename: str):
    """Delete a saved model"""
    filepath = f"models/saved/{filename}"

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Model not found")

    try:
        os.remove(filepath)
        return {"message": "Model deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
