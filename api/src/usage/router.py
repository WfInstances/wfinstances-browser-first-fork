from fastapi import APIRouter
from src.database import downloads_collection, visualizations_collection, simulations_collection
from src.usage.service import group_by_week, get_ip_country_name, get_top_countries
from src.models import ApiResponse

router = APIRouter()

@router.get('/public/', response_model=ApiResponse)
async def get_number_of_instances_downloaded() -> dict:
    """
    Get all data related to downloads, visualizations, and simulations.
    """
    downloads_data = list(downloads_collection.find({}))
    visualizations_data = list(visualizations_collection.find({}))
    simulations_data = list(simulations_collection.find({}))

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
    data = list(data_collection.find({}))
    summarized_data = group_by_week(data, data_type)
    chart_data = []
    for idx, week_data in enumerate(summarized_data):
        chart_data.append({
            "week_number": idx + 1,
            f"{data_type}_total": week_data[data_type],
            "ips": week_data["ips"]
        })
    return {
        'detail': 'Data retrieved successfully.' if chart_data else 'No data retrieved.',
        'result': chart_data
    }

@router.get('/public/ips/', response_model=ApiResponse)
async def get_ips_with_countries() -> dict:
    """
    Get all distinct IP addresses that have performed actions, along with country names.
    """
    downloads_ips = [item["ip"] for item in downloads_collection.find({})]
    visualizations_ips = [item["ip"] for item in visualizations_collection.find({})]
    simulations_ips = [item["ip"] for item in simulations_collection.find({})]
    all_ips = list(set(downloads_ips + visualizations_ips + simulations_ips))
    ip_country_mapping = get_ip_country_name(all_ips)  # Returns list of (ip, country)
    return {
        'detail': 'Data retrieved successfully.',
        'result': ip_country_mapping
    }

@router.get('/public/top-countries/', response_model=ApiResponse)
async def get_top_countries_route() -> dict:
    """
    Get the top 10 countries based on combined usage (downloads, visualizations, and simulations).
    """
    downloads_ips = [item["ip"] for item in downloads_collection.find({})]
    visualizations_ips = [item["ip"] for item in visualizations_collection.find({})]
    simulations_ips = [item["ip"] for item in simulations_collection.find({})]
    all_ips = list(set(downloads_ips + visualizations_ips + simulations_ips))
    top_countries = get_top_countries(all_ips)
    return {
        'detail': 'Data retrieved successfully.',
        'result': top_countries
    }
