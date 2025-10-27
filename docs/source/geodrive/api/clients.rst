Клиенты (clients)
=================

Основные классы для работы с ровером.

Синхронный клиент
-----------------

.. autoclass:: geodrive.clients.sync_client.RoverClient
   :members:
   :undoc-members:
   :member-order: bysource

   .. rubric:: Примеры использования

   .. code-block:: python

      from geodrive import RoverClient

      with RoverClient(host="localhost", port=5656) as rover:
          # Движение к точке
          rover.goto(5.0, 3.0, 1.57)

          # Получение телеметрии
          telemetry = rover.get_telemetry()
          print(f"Position: {telemetry.x}, {telemetry.y}")

Асинхронный клиент
------------------

.. autoclass:: geodrive.clients.async_client.AsyncRoverClient
   :members:
   :undoc-members:
   :member-order: bysource

   .. rubric:: Примеры использования

   .. code-block:: python

      import asyncio
      from geodrive import AsyncRoverClient

      async def main():
          async with AsyncRoverClient() as rover:
              # Потоковая телеметрия
              async for telemetry in rover.stream_telemetry():
                  print(f"Battery: {telemetry.battery_voltage}V")

      asyncio.run(main())