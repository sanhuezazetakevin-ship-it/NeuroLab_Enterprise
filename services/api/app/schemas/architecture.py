from uuid import UUID
from datetime import datetime
from typing import List, Optional, Any, Dict, Literal
from pydantic import BaseModel, Field

ArchitectureFamily = Literal["FEEDFORWARD", "RNN", "CNN", "GAN"]

class LayerConfig(BaseModel):
    id: Optional[str] = None
    type: str # Dense, Dropout, Conv2D, MaxPooling2D, Flatten, LSTM, GRU, BatchNormalization
    units: Optional[int] = None
    activation: Optional[str] = None # relu, sigmoid, tanh, softmax, linear, leaky_relu
    rate: Optional[float] = None # For Dropout
    filters: Optional[int] = None # For Conv2D
    kernel_size: Optional[List[int]] = None # For Conv2D
    pool_size: Optional[List[int]] = None # For MaxPooling2D
    return_sequences: Optional[bool] = None # For LSTM/GRU

class NetworkTopology(BaseModel):
    input_shape: List[int]
    layers: List[LayerConfig]

class ArchitectureBase(BaseModel):
    name: str
    family: ArchitectureFamily
    config_json: NetworkTopology

class ArchitectureCreate(ArchitectureBase):
    pass

class ArchitectureValidationResult(BaseModel):
    valid: bool
    total_parameters: int
    trainable_parameters: int
    output_shape: List[Optional[int]]
    warnings: List[str] = []
    errors: List[str] = []

class ArchitectureResponse(ArchitectureBase):
    id: UUID
    project_id: UUID
    version: int
    created_at: datetime

    class Config:
        from_attributes = True
