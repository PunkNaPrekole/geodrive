from abc import ABC
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..communicators.base import BaseCommunicator


class BaseManager(ABC):
    """Базовый класс для всех менеджеров"""

    def __init__(self, communicator: "BaseCommunicator"):
        self._communicator = communicator

    @property
    def is_connected(self) -> bool:
        return self._communicator.is_connected