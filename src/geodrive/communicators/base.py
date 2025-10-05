from abc import ABC, abstractmethod

from ..commands import RoverCommands
from ..schemas import CommandResult


class BaseCommunicator(ABC):
    """Базовый класс для всех коммуникаторов"""

    def __init__(self):
        self.stub = None
    
    @abstractmethod
    def connect(self) -> bool:
        pass
    
    @abstractmethod
    def disconnect(self):
        pass
    
    @abstractmethod
    def send_command(self, command: RoverCommands, **kwargs) -> CommandResult:
        pass

    @abstractmethod
    def stream_telemetry(self):
        pass

    @abstractmethod
    def get_telemetry(self):
        pass

    @abstractmethod
    def get_voltage(self):
        pass

    @abstractmethod
    def get_status(self):
        pass

    @abstractmethod
    def goto(self, **kwargs):
        pass

    @abstractmethod
    def goto_stream_position(self, **kwargs):
        pass

    @property
    @abstractmethod
    def is_connected(self) -> bool:
        pass