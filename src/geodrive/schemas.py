from pydantic import BaseModel, Field, field_validator

class RCChannels(BaseModel):
    """RC каналы управления (1000-2000, 1500 - нейтраль)"""
    channel1: int = Field(1500, ge=1000, le=2000)  # Yaw (рыскание)
    channel2: int = Field(1500, ge=1000, le=2000)  # Pitch (тангаж)
    channel3: int = Field(1500, ge=1000, le=2000)  # Throttle (тяга)
    channel4: int = Field(1500, ge=1000, le=2000)  # Roll (крен)
    channel5: int = Field(1500, ge=1000, le=2000)  # Aux 1 (режимы)
    channel6: int = Field(1500, ge=1000, le=2000)  # Aux 2
    channel7: int = Field(1500, ge=1000, le=2000)  # Aux 3
    channel8: int = Field(1500, ge=1000, le=2000)  # Aux 4

    @field_validator('channel1', 'channel2', 'channel3', 'channel4',
                     'channel5', 'channel6', 'channel7', 'channel8')
    def validate_channel_range(cls, v):
        if not 1000 <= v <= 2000:
            raise ValueError('RC channel values must be between 1000 and 2000')
        return v


class Telemetry(BaseModel):
    position: list[float]
    velocity: list[float] 
    attitude: list[float]

    @classmethod
    def from_proto(cls, proto_response) -> "Telemetry":
        """
        Создает Telemetry из gRPC response
        """
        return cls(
            position=list(proto_response.position),
            velocity=list(proto_response.velocity),
            attitude=list(proto_response.attitude)
        )

class RoverStatus(BaseModel):
    is_connected: bool
    mode: str
    state: str
    uptime: int
    errors: list[str]
    firmware_version: str

    @classmethod
    def from_proto(cls, proto_response) -> "RoverStatus":
        """
        Создает RoverStatus из gRPC response
        """
        return cls(
            is_connected=proto_response.is_connected,
            mode="auto",
            state=proto_response.state,
            uptime=proto_response.uptime,
            errors=list(proto_response.errors),
            firmware_version=proto_response.firmware_version
        )

class CommandResult(BaseModel):
    success: bool
    message: str | None = None
    error_code: str | None = None

    @classmethod
    def from_proto(cls, proto_response) -> "CommandResult":
        """
        Создает CommandResult из gRPC response
        """
        return cls(
            success=proto_response.success,
            message=proto_response.message or None,
            error_code=proto_response.error_code or None
        )

    @classmethod
    def failed(cls, message: str, error_code: str | None = None) -> "CommandResult":
        """
        Создает CommandResult с ошибкой
        """
        return cls(
            success=False,
            message=message,
            error_code=error_code
        )

    @classmethod
    def success(cls, message: str = "Command executed successfully") -> "CommandResult":
        """
        Создает успешный CommandResult
        """
        return cls(success=True, message=message)