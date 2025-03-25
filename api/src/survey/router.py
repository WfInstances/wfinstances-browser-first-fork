from fastapi import APIRouter, HTTPException, Query
from src.database import surveys_collection
from src.models import ApiResponse
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

@router.get('/public/surveys/', response_model=ApiResponse)
async def get_survey_data(ip: str = Query(..., description="Client IP Address")):

    """
    Get the survey data for a specific IP address.
    """
    survey_data = surveys_collection.find_one({"ip": ip}, {"_id": 0})  
    
    if not survey_data:
        return {
            'detail': 'Survey data not found.',
            'result': {"ip": ip, "total_clicks": 0}
        }

    return {
        'detail': 'Survey data retrieved successfully.',
        'result': survey_data
    }

class SurveyRequest(BaseModel):
    ip: str
    click_type: str

@router.post('/public/surveys/', response_model=ApiResponse)
async def track_user_activity(data: SurveyRequest):
    """
    Track user clicks for DownloadButton, GraphModal, and SimulateModal.
    Trigger a survey if total clicks reach 5, 50, or 500.
    """
    ip = data.ip
    click_type = data.click_type

    valid_click_types = ["DownloadButton", "GraphModal", "SimulateModal"]
    if click_type not in valid_click_types:
        raise HTTPException(status_code=400, detail="Invalid click type.")

    user_data = surveys_collection.find_one({"ip": ip})
    
    if user_data:
        updated_clicks = user_data.get("total_clicks", 0) + 1
        surveys_collection.update_one({"ip": ip}, {"$set": {"total_clicks": updated_clicks}})
    else:
        surveys_collection.insert_one({"ip": ip, "total_clicks": 1})
        updated_clicks = 1

    if updated_clicks in [5, 50, 500]:
        return {
            'detail': 'Survey triggered. Please participate in the survey.',
            'result': {'ip': ip, 'total_clicks': updated_clicks}
        }

    return {
        'detail': 'Click recorded successfully.',
        'result': {'ip': ip, 'total_clicks': updated_clicks}
    }

class RatingRequest(BaseModel):
    ip: str
    usefulness: int
    usability: int

@router.post('/public/surveys/rating', response_model=dict)
async def submit_rating(request: RatingRequest):
    """
    Store user rating in the surveys collection.
    Updates the existing document if the IP already exists.
    """
    if not (1 <= request.usefulness <= 10):
        raise HTTPException(status_code=400, detail="Invalid usefulness rating.")
    if not (1 <= request.usability <= 10):
        raise HTTPException(status_code=400, detail="Invalid usability rating.")

    surveys_collection.update_one(
    {"ip": request.ip},
    {
        "$push": {
            "ratings": {
                "usefulness": request.usefulness,
                "usability": request.usability,
                "date": datetime.utcnow().isoformat()
            }
        }
    },
    upsert=True
)

    return {"detail": "Rating submitted successfully."}