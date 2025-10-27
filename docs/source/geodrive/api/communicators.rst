Коммуникаторы (communicators)
=============================

Низкоуровневые классы для связи с ровером через gRPC.

Базовый коммуникатор
--------------------

.. automodule:: geodrive.communicators.base
   :members:
   :undoc-members:
   :show-inheritance:

Асинхронный gRPC коммуникатор
-----------------------------

.. autoclass:: geodrive.communicators.grpc_async.AsyncGRPCCommunicator
   :members:
   :undoc-members:
   :show-inheritance:
   :member-order: bysource

   .. rubric:: Основные методы

   **connect()** - Подключение к роверу

   **send_command()** - Отправка команды роверу

   **goto_stream_position()** - Потоковое движение

Синхронный gRPC коммуникатор
----------------------------

.. autoclass:: geodrive.communicators.grpc_sync.GRPCCommunicator
   :members:
   :undoc-members:
   :show-inheritance:
   :member-order: bysource

.. note::
   Коммуникаторы не предназначены для прямого использования.
   Используйте высокоуровневые клиенты из модуля :doc:`clients`.