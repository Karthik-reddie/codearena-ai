from pydantic import BaseModel


class RoadmapResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    icon: str
    color: str
    topics: list
    total_topics: int

    model_config = {"from_attributes": True}


class RoadmapProgressResponse(BaseModel):
    roadmap: RoadmapResponse
    completed_topics: list
    percentage: int

    model_config = {"from_attributes": True}


class UpdateProgressRequest(BaseModel):
    topic_id: str
    completed: bool = True
