Менеджеры (managers)
====================

Классы для управления конкретными аспектами работы ровера.

Базовый менеджер
----------------

.. automodule:: geodrive.managers.base
   :members:
   :undoc-members:
   :show-inheritance:

Менеджер движения (асинхронный)
-------------------------------

.. autoclass:: geodrive.managers.async_movement.AsyncMovementManager
   :members:
   :undoc-members:
   :show-inheritance:
   :member-order: bysource

   .. rubric:: Основные методы

   **goto_stream_position()** - Движение к точке с потоковым прогрессом

   .. code-block:: python

      async for progress in movement.goto_stream_position(5.0, 3.0, 1.57):
          print(f"Progress: {progress.progress_percentage}%")

   **start_rc_stream()** - Запуск потокового RC управления

   .. code-block:: python

      await movement.start_rc_stream()
      movement.rc_channels.channel1 = 1600  # Вперед
      await asyncio.sleep(2.0)
      await movement.stop_rc_stream()

Менеджер движения (синхронный)
------------------------------

.. autoclass:: geodrive.managers.sync_movement.MovementManager
   :members:
   :undoc-members:
   :show-inheritance:
   :member-order: bysource

Менеджер периферии
------------------

.. automodule:: geodrive.managers.peripherals
   :members:
   :undoc-members:
   :show-inheritance: