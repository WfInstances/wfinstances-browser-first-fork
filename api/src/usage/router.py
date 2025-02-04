from fastapi import APIRouter
from src.database import downloads_collection, visualizations_collection, simulations_collection
from src.usage.service import group_by_week
from src.models import ApiResponse

router = APIRouter()

@router.get('/public/', response_model=ApiResponse)
async def get_number_of_instances_downloaded() -> dict:
    """
    Get all data related to downloads, visualizations, and simulations.
    """

    # Fetch all documents in the collections
    downloads_data = list(downloads_collection.find({}))
    visualizations_data = list(visualizations_collection.find({}))
    simulations_data = list(simulations_collection.find({}))

    # Convert the BSON documents to dictionaries
    downloads_list = [{
        "id": str(download['_id']),
        "date": download['date'],
        "ip": download['ip'],
        "wfinstances": download['wfinstances'],
        "num_instances": download['num_instances'],
    } for download in downloads_data]

    visualizations_list = [{
        "id": str(visualization['_id']),
        "date": visualization['date'],
        "ip": visualization['ip'],
        "wfinstance": visualization['wfinstance'],
    } for visualization in visualizations_data]

    simulations_list = [{
        "id": str(simulation['_id']),
        "date": simulation['date'],
        "ip": simulation['ip'],
        "wfinstance": simulation['wfinstance'],
    } for simulation in simulations_data]

    # Combine all the data into a single dictionary
    combined_data = {
        "downloads": downloads_list,
        "visualizations": visualizations_list,
        "simulations": simulations_list
    }

    return {
        'detail': 'Data retrieved successfully.' if combined_data else 'No data retrieved.',
        'result': combined_data
    }

@router.get('/public/downloads/', response_model=ApiResponse)
async def get_summarized_downloads() -> dict:
    downloads_data = list(downloads_collection.find({}))

    summarized_data = group_by_week(downloads_data, "downloads")

    return {
        'detail': 'Data retrieved successfully.' if summarized_data else 'No data retrieved.',
        'result': summarized_data
    }

@router.get('/public/visualizations/', response_model=ApiResponse)
async def get_summarized_visualizations() -> dict:
    visualizations_data = list(visualizations_collection.find({}))

    summarized_data = group_by_week(visualizations_data, "visualizations")

    return {
        'detail': 'Data retrieved successfully.' if summarized_data else 'No data retrieved.',
        'result': summarized_data
    }

@router.get('/public/simulations/', response_model=ApiResponse)
async def get_summarized_simulations() -> dict:
    simulations_data = list(simulations_collection.find({}))

    summarized_data = group_by_week(simulations_data, "simulations")

    return {
        'detail': 'Data retrieved successfully.' if summarized_data else 'No data retrieved.',
        'result': summarized_data
    }

@router.get('/public/totals/', response_model=ApiResponse)
async def get_totals() -> dict:
    """
    Get the total counts for downloads, visualizations, and simulations.
    """
    downloads_count = downloads_collection.count_documents({})
    visualizations_count = visualizations_collection.count_documents({})
    simulations_count = simulations_collection.count_documents({})

    totals = {
        "downloads": downloads_count,
        "visualizations": visualizations_count,
        "simulations": simulations_count
    }

    return {
        'detail': 'Data retrieved successfully.',
        'result': totals
    }

