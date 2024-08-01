import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.exceptions import GithubResourceNotFoundException, github_resource_not_found_exception_handler
from src.wfinstances.router import router as wf_instances_router
from src.metrics.router import router as metrics_router
from src.usage.router import router as usage_router

app = FastAPI(swagger_ui_parameters={"displayRequestDuration": True})
app.include_router(wf_instances_router, prefix='/wf-instances')
app.include_router(metrics_router, prefix='/metrics')
app.include_router(usage_router, prefix='/usage')
app.add_exception_handler(GithubResourceNotFoundException, github_resource_not_found_exception_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:8080'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

if __name__ == '__main__':
    uvicorn.run('main:app', host='localhost', port=8081, reload=True)
