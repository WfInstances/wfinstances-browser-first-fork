from fastapi import APIRouter
from src.database import metrics_collection
from src.metrics.serializer import serialize_metrics, serialize_metric
from src.metrics.service import insert_metrics_from_github
from src.models import ApiResponse

router = APIRouter()


@router.get('/', response_model=ApiResponse)
async def get_all_metrics() -> dict:
    """
    Get all the metrics from the collection.
    """
    metrics = serialize_metrics(metrics_collection.find())
    return {
        'detail': ('Metrics retrieved.'
                   if len(metrics) > 0 else
                   'No metrics retrieved.'),
        'result': metrics
    }


@router.get('/{id}', response_model=ApiResponse)
async def get_metric(id: str) -> dict:
    """
    Get a metric from the collection.

    - **id**: The id of the metric, usually stored in the collection as a filename that ends in .json
    """
    metric = serialize_metric(metrics_collection.find_one({'_id': id}))
    return {
        'detail': ('Metric retrieved.'
                   if metric else
                   'Metric not found.'),
        'result': metric
    }


@router.post('/', response_model=ApiResponse)
async def post_query_metrics(ids: list[str]) -> dict:
    """
    Get a list of metrics from the collection.

   - **Request body**: The ids of each metric, usually stored in the collection as a filename that ends in .json
    """
    metrics = serialize_metric(metrics_collection.find({'_id': {'$in': ids}}))
    return {
        'detail': ('Metrics retrieved.'
                   if len(ids) == len(metrics) else
                   'Some or all of the metrics were not retrieved.'),
        'result': metrics
    }


@router.post('/github/{owner}/{repo}', response_model=ApiResponse)
async def post_metrics_github(owner: str, repo: str) -> dict:
    """
    Insert metrics generated from WfInstances contained in a GitHub repository into the MongoDB collections.

    - **owner**: The owner of the GitHub repository
    - **repo**: The name of the GitHub repository
    """
    valid_wf_instances, invalid_wf_instances = insert_metrics_from_github(owner, repo)
    return {
        'detail': ('Some WfInstances were invalid, check that they follow the WfFormat.'
                   if len(invalid_wf_instances) > 0 else
                   'All metrics were successfully generated.'),
        'result': {
            'successes': valid_wf_instances,
            'errors': invalid_wf_instances
        }
    }


@router.delete('/', response_model=ApiResponse)
async def delete_metrics(ids: list[str]) -> dict:
    """
    Delete a list of metrics.

    - **Request body**: List of ids to delete, usually stored in the collection as a filename that ends in .json
    """
    metrics_collection.delete({'_id': {'$in': ids}})
    return {
        'detail': 'The metrics were deleted successfully.',
        'result': ids
    }


@router.delete('/{id}', response_model=ApiResponse)
async def delete_metric(id: str) -> dict:
    """
    Delete a single metric.

    - **id**: The id to delete, usually stored in the collection as a filename that ends in .json
    """
    metrics_collection.delete_one({'_id': id})
    return {
        'detail': 'The metric was deleted successfully.',
        'result': id
    }
