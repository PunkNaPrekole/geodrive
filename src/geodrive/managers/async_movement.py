import asyncio
from typing import TYPE_CHECKING

from .base import BaseManager
from ..commands import RoverCommands
from ..schemas import CommandResult, RCChannels
from ..generated import GotoAck, GotoCommand, GotoProgress, RCChannelsCommand

if TYPE_CHECKING:
    from ..communicators.base import BaseCommunicator

class AsyncMovementManager(BaseManager):
    """
    Менеджер управления движением
    """

    def __init__(self, communicator: "BaseCommunicator"):
        super().__init__(communicator)
        self._is_rc_streaming: bool = False
        self._rc_stream_task = None
        self._rc_stream_interval: float = 0.05
        self.rc_channels = RCChannelsCommand(
            channel1=1500,
            channel2=1500,
            channel3=1500,
            channel4=1500
        )

    async def set_velocity(self, linear: float, angular: float) -> CommandResult:
        """
        Установка линейной и угловой скоростей
        """
        return await self._communicator.send_command(
            RoverCommands.SET_VELOCITY,
            linear=linear,
            angular=angular
        )

    async def set_differential_speed(self, left: float, right: float) -> CommandResult:
        """
        Дифференциальное управление по скоростям
        """
        return await self._communicator.send_command(
            RoverCommands.SET_DIFF_SPEED,
            left=left,
            right=right
        )

    async def goto(self, x, y, yaw):
        await self._communicator.goto(x=x, y=y, yaw=yaw)

    async def goto_stream_position(self, x, y, yaw):
        pass

    async def goto_cancel(self):
        await self._communicator.send_command(RoverCommands.GOTO_CANCEL)

    async def goto_status(self):
        pass

    async def start_rc_stream(self):
        """
        Запустить потоковую передачу RC-команд.

        Используется для непрерывного управления ровером через RC-каналы.

        :raises RuntimeError: При ошибках запуска потока
        """
        if self._is_rc_streaming:
            return

        self._is_rc_streaming = True
        self._rc_stream_task = asyncio.create_task(self._rc_stream_loop())

    async def stop_rc_stream(self):
        """
        Остановка потока RC команд
        """
        self._reset_rc_channels()
        self._is_rc_streaming = False
        if self._rc_stream_task:
            self._rc_stream_task.cancel()
            try:
                await self._rc_stream_task
            except asyncio.CancelledError:
                pass
            finally:
                self._rc_stream_task = None

    def _reset_rc_channels(self):
        """
        Сбрасывает RC каналы в нейтральное положение
        """
        self.rc_channels.channel1 = 1500
        self.rc_channels.channel2 = 1500
        self.rc_channels.channel3 = 1500
        self.rc_channels.channel4 = 1500

    async def _rc_stream_loop(self):
        """
        Основной цикл отправки RC команд
        """
        try:
            async def generate_commands():
                while self._is_rc_streaming:

                    yield self.rc_channels
                    await asyncio.sleep(self._rc_stream_interval)

            async for ack in self._communicator.stub.stream_rc_channels(generate_commands()):
                if not ack.success:
                    raise RuntimeError(f"RC command failed: {ack.message}")

        except asyncio.CancelledError:
            raise RuntimeError("RC stream cancelled")
        except Exception as e:
            raise RuntimeError(f"RC stream error: {e}")

    async def stop(self) -> CommandResult:
        """
        Остановка
        """
        return await self._communicator.send_command(RoverCommands.STOP)

    async def emergency_stop(self) -> CommandResult:
        """
        Аварийная остановка
        """
        return await self._communicator.send_command(RoverCommands.EMERGENCY_STOP)