from fastapi import APIRouter, Request
from src.wfinstances.service import retrieve_wf_instance, retrieve_wf_instances, generate_xml
from src.metrics.serializer import serialize_metrics, serialize_metric
from src.models import ApiResponse
from src.database import metrics_collection, add_item_to_downloads_collection, add_item_to_visualizations_collection, update_simulation_collection
from src.wfinstances.simulation import do_simulation

router = APIRouter()


@router.post('/public/', response_model=ApiResponse)
async def post_query_wf_instances(request: Request, ids: list[str]) -> dict:
    # Call the function to update the downloads collection
    add_item_to_downloads_collection(ids, request.client.host)

    # Preserve the order!
    # OLD CODE: wf_instances = retrieve_wf_instances(serialize_metrics(metrics_collection.find({'_id': {'$in': ids}})))
    wf_instances = []
    for id_ in ids:
        wf_instance = retrieve_wf_instances(serialize_metrics([metrics_collection.find_one({'_id': id_})]))
        wf_instances.extend(wf_instance)

    return {
        'detail': ('WfInstances retrieved.'
                   if len(ids) == len(wf_instances) else
                   'Some of the WfInstances were not retrieved.'),
        'result': wf_instances
    }


@router.post('/public/viz/{id}', response_model=ApiResponse)
async def post_wf_instance_viz(request: Request, id: str) -> dict:

    # Wait for the request body to be there
    request_body = await request.json()
    print(request_body)

    # Call the function to update the visualizations collection
    add_item_to_visualizations_collection(id, request_body["client_ip"])

    # Get the wf_instance and return it
    wf_instance = retrieve_wf_instance(serialize_metric(metrics_collection.find_one({'_id': id})))
    return {
        'detail': ('WfInstance retrieved.'
                   if wf_instance else
                   'WfInstance not found.'),
        'result': wf_instance
    }


@router.post('/public/simulate/{id}', response_model=ApiResponse)
async def post_wf_instance_simulate(request: Request, id: str) -> dict:

    # Wait for the request body to be there
    request_body = await request.json()

    # Call the function to update the simulation collection
    update_simulation_collection(id, request_body["client_ip"])

    wf_instance = retrieve_wf_instance(serialize_metric(metrics_collection.find_one({'_id': id})))

    runtime = do_simulation(generate_xml(request_body["platform_spec"]),
                            request_body["platform_spec"]["clusters"],
                            request_body["controller_hostname"],
                            request_body["task_selection_scheme"],
                            request_body["cluster_selection_scheme"],
                            wf_instance)

    return {
        'detail': 'Simulation results',
        'result': {'Runtime': runtime}
    }
