from typing import AsyncGenerator
from contextlib import asynccontextmanager

from ..commands import RoverCommands
from ..communicators.grpc_async import AsyncGRPCCommunicator
from ..managers import AsyncMovementManager
from ..schemas import Telemetry, CommandResult, RCChannels


class AsyncRoverClient:
    """
    Асинхронный клиент для управления роботом
    """

    def __init__(self, host: str = "localhost", port: int = 5656):
        self._communicator = AsyncGRPCCommunicator(host, port)
        self.movement = AsyncMovementManager(self._communicator)
        #self.peripherals = PeripheralsManager(self._communicator)

    async def connect(self) -> bool:
        """Подключение к роботу"""
        return await self._communicator.connect()

    async def disconnect(self):
        """Отключение"""
        await self._communicator.disconnect()

    @property
    def is_connected(self) -> bool:
        return self._communicator.is_connected

    async def set_velocity(self, linear: float, angular: float) -> CommandResult:
        """
        Алиас для movement.set_velocity
        """
        return await self.movement.set_velocity(linear, angular)

    async def set_rc_channels(self, channels: RCChannels) -> CommandResult:
        """
        Алиас для movement.set_rc_channels
        """
        return await self.movement.set_rc_channels(channels)

    async def get_telemetry(self) -> Telemetry:
        """
        Алиас для _communicator.get_telemetry
        """
        return await self._communicator.get_telemetry()

    async def get_battery_voltage(self) -> int:
        return await self._communicator.get_voltage()

    async def moo(self):
        await self._communicator.send_command(RoverCommands.MOO)

    async def beep(self):
        await self._communicator.send_command(RoverCommands.BEEP)

    async def goto(self, x, y, yaw):
        await self.movement.goto(x, y, yaw)

    async def get_voltage(self):
        return await self._communicator.get_voltage()

    async def stream_telemetry(self) -> AsyncGenerator[Telemetry, None]:
        """
        Потоковое получение телеметрии
        """
        async for data in self._communicator.stream_telemetry():
            yield data

    @asynccontextmanager
    async def rc_stream_context(self):
        """
        Контекстный менеджер для потоковой передачи RC-каналов.

        Автоматически запускает и останавливает RC-поток, обеспечивая
        безопасное управление роботом.

        Example:
            .. code-block:: python
                async with rover.rc_stream_context() as rc_control:
                    # Устанавливаем каналы управления
                    rc_control.channel1 = 1600  # Вперед
                    rc_control.channel2 = 1400  # Поворот влево
                    await asyncio.sleep(2.0)

                    # Меняем команду
                    rc_control.channel1 = 1500  # Стоп
        """
        try:
            await self.movement.start_rc_stream()

            yield self.movement.rc_channels

        finally:
            await self.movement.stop_rc_stream()

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()