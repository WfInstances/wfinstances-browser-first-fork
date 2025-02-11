from fastapi import APIRouter
from src.database import downloads_collection, visualizations_collection, simulations_collection
from src.usage.service import group_by_week
from src.models import ApiResponse
from src.usage.service import get_ip_country_name

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

@router.get('/public/weekly_usage/{data_type}/', response_model=ApiResponse)
async def get_weekly_usage(data_type: str) -> dict:
    """
    Get the total data (downloads, visualizations, or simulations) and unique IPs per week for visualization in the front-end.
    The X-axis will represent the total data for the week, and the Y-axis will represent the week number.
    """
    # Define which collection to use based on the `data_type`
    if data_type == "downloads":
        data_collection = downloads_collection
    elif data_type == "visualizations":
        data_collection = visualizations_collection
    elif data_type == "simulations":
        data_collection = simulations_collection
    else:
        return {
            'detail': 'Invalid data type specified.',
            'result': []
        }

    # Fetch all records from the chosen collection
    data = list(data_collection.find({}))

    # Group the data by week and summarize information
    summarized_data = group_by_week(data, data_type)

    # Prepare data for chart
    chart_data = []
    for idx, week_data in enumerate(summarized_data):
        chart_data.append({
            "week_number": idx + 1,  # Week number (Y-axis)
            f"{data_type}_total": week_data[data_type],  # Total for the week (X-axis)
            "ips": week_data["ips"]  # Unique IP addresses in that week
        })

    return {
        'detail': 'Data retrieved successfully.' if chart_data else 'No data retrieved.',
        'result': chart_data
    }
