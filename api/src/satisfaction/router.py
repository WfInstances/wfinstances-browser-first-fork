from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from src.database import satisfaction_collection, add_to_satisfaction_collection
from src.models import ApiResponse

router = APIRouter()

@router.get('/public/satisfaction/', response_model=ApiResponse)
async def get_satisfaction_data(category: str = Query(..., description="Satisfaction category (usability or usefulness)")):
    """
    Get the aggregated satisfaction data for a given category.
    """
    satisfaction_data = satisfaction_collection.find_one({"category": category}, {"_id": 0})

    if not satisfaction_data:
        return {
            "detail": "Satisfaction data not found.",
            "result": {"category": category, "distribution": [0] * 10}
        }

    return {
        "detail": "Satisfaction data retrieved successfully.",
        "result": satisfaction_data
    }

class SatisfactionRequest(BaseModel):
    category: str   # usability or usefulness
    rating: int     # from 1 - 10

@router.post('/public/satisfaction/update', response_model=ApiResponse)
async def update_satisfaction(request: SatisfactionRequest):
    """
    Update the aggregated satisfaction distribution for a given category
    and increment it.
    """
    if request.rating < 1 or request.rating > 10:
        raise HTTPException(status_code=400, detail="Invalid rating. Must be within 1 and 10.")
    if request.category not in ["usability", "usefulness"]:
        raise HTTPException(status_code=400, detail="Invalid category. Must be 'usability' or 'usefulness'.")

    add_to_satisfaction_collection(request.category, request.rating)

    return {
        "detail": "Satisfaction rating updated successfully.",
        "result": {"category": request.category, "rating": request.rating}
    }
