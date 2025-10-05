from typing import Generator
from ..communicators.grpc_sync import GRPCCommunicator
from ..managers.sync_movement import MovementManager
from ..schemas import Telemetry, CommandResult, RCChannels


class RoverClient:
    """
    Синхронный клиент для управления роботом
    """

    def __init__(self, host: str = "10.1.100.160", port: int = 5656):
        self._communicator = GRPCCommunicator(host, port)
        self.movement = MovementManager(self._communicator)
        #self.peripherals = PeripheralsManager(self._communicator)

    def connect(self) -> bool:
        """Подключение к роботу"""
        return self._communicator.connect()

    def disconnect(self):
        """Отключение"""
        self._communicator.disconnect()

    @property
    def is_connected(self) -> bool:
        return self._communicator.is_connected

    def set_velocity(self, linear: float, angular: float) -> CommandResult:
        """Синхронная установка скорости"""
        return self.movement.set_velocity(linear, angular)

    def set_rc_channels(self, channels: RCChannels) -> CommandResult:
        """Синхронная установка RC каналов"""
        return self.movement.set_rc_channels(channels)

    def get_telemetry(self) -> Telemetry:
        """Синхронное получение телеметрии"""
        return self._communicator.get_telemetry()

    def stream_telemetry(self) -> Generator[Telemetry, None]:
        """Синхронная потоковая телеметрия"""
        yield from self._communicator.stream_telemetry()


    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()