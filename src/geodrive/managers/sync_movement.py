import threading
from typing import TYPE_CHECKING

from .base import BaseManager
from ..commands import RoverCommands
from ..schemas import CommandResult, RCChannels
from ..generated import GotoAck, GotoCommand, GotoProgress, RCChannelsCommand


if TYPE_CHECKING:
    from ..communicators.base import BaseCommunicator


class MovementManager(BaseManager):
    """
    Синхронный менеджер управления движением
    """

    def __init__(self, communicator: "BaseCommunicator"):
        super().__init__(communicator)
        self._is_rc_streaming = False
        self._rc_stream_thread = None
        self._rc_stream_interval = 0.1  # 10 Hz
        self.rc_channels = RCChannelsCommand(
            channel1=1500,
            channel2=1500,
            channel3=1500,
            channel4=1500
        )
        self._stop_event = threading.Event()
        self._lock = threading.RLock()

    def set_velocity(self, linear: float, angular: float) -> CommandResult:
        """
        Синхронная установка линейной и угловой скоростей
        """
        return self._communicator.send_command(
            RoverCommands.SET_VELOCITY,
            linear=linear,
            angular=angular
        )

    def set_differential_speed(self, left: float, right: float) -> CommandResult:
        """
        Синхронное дифференциальное управление
        """
        return self._communicator.send_command(
            RoverCommands.SET_DIFF_SPEED,
            left=left,
            right=right
        )
    
    def goto(self, x, y, yaw):
        self._communicator.goto(x=x, y=y, yaw=yaw)

    def goto_stream_position(self, x, y, yaw):
        pass

    def goto_cancel(self):
        self._communicator.send_command(RoverCommands.GOTO_CANCEL)

    def goto_status(self):
        pass

    def start_rc_stream(self):
        """
        Запуск потоковой передачи RC-команд в отдельном потоке
        """
        with self._lock:
            if self._is_rc_streaming:
                return

            self._is_rc_streaming = True
            self._stop_event.clear()
            self._rc_stream_thread = threading.Thread(
                target=self._rc_stream_loop,
                daemon=True
            )
            self._rc_stream_thread.start()

    def stop_rc_stream(self):
        """
        Остановка потока RC команд
        """
        with self._lock:
            self._is_rc_streaming = False
            self._stop_event.set()

            if self._rc_stream_thread:
                self._rc_stream_thread.join(timeout=2.0)
                if self._rc_stream_thread.is_alive():
                    print("Warning: RC stream thread didn't stop gracefully")
                self._rc_stream_thread = None

            self._reset_rc_channels()

    def _reset_rc_channels(self):
        """
        Сбрасывает RC каналы в нейтральное положение
        """
        self.rc_channels.channel1 = 1500
        self.rc_channels.channel2 = 1500
        self.rc_channels.channel3 = 1500
        self.rc_channels.channel4 = 1500

    def _rc_stream_loop(self):
        """
        Основной цикл отправки RC команд, выполняется в отдельном потоке
        """
        try:
            while not self._stop_event.is_set() and self._is_rc_streaming:
                try:
                    ack = self._communicator.stub.stream_rc_channels(self.rc_channels)
                    if not ack.success:
                        print(f"RC command failed: {ack.message}")

                except Exception as e:
                    print(f"RC stream error: {e}")
                    break

                self._stop_event.wait(self._rc_stream_interval)

        except Exception as e:
            print(f"RC stream loop error: {e}")
        finally:
            with self._lock:
                self._is_rc_streaming = False

    def stop(self) -> CommandResult:
        """
        Остановка
        """
        return self._communicator.send_command(RoverCommands.STOP)

    def emergency_stop(self) -> CommandResult:
        """
        Аварийная остановка
        """
        return self._communicator.send_command(RoverCommands.EMERGENCY_STOP)