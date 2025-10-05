.. raw:: html

    <style>
    .md-content .md-typeset h1 { display: none; }
    </style>

    <p align="center">
      <a href="https://github.com/PunkNaPrekole/geodrive"><img src="_static/logo.png" alt="geodrive" style="width: 500px;"></a>
    </p>
    <p align="center">
        <em>Python SDK для управления роботами-роверами через gRPC</em>
    </p>
    <p align="center">
    <a href="https://github.com/PunkNaPrekole/geodrive/actions" target="_blank">
        <img src="https://github.com/PunkNaPrekole/geodrive/actions/workflows/test.yml/badge.svg" alt="Tests">
    </a>
    <a href="https://pypi.org/project/geodrive" target="_blank">
        <img src="https://img.shields.io/pypi/v/geodrive?color=%2334D058&label=pypi%20package" alt="Package version">
    </a>
    <a href="https://pypi.org/project/geodrive" target="_blank">
        <img src="https://img.shields.io/pypi/pyversions/geodrive.svg?color=%2334D058" alt="Supported Python versions">
    </a>
    <a href="https://github.com/PunkNaPrekole/geodrive/blob/main/LICENSE" target="_blank">
        <img src="https://img.shields.io/github/license/PunkNaPrekole/geodrive?color=%2334D058" alt="License">
    </a>
    </p>


geodrive - это современный Python SDK для управления роботами-роверами через gRPC протокол.

Ключевые особенности:

* **🚀 Производительность**: Асинхронный и синхронный клиенты для любых задач
* **🎯 Простота использования**: Интуитивный интерфейс с автодополнением
* **🔧 Готов к продакшену**: Надежная обработка ошибок и переподключение  
* **📡 Реальное время**: Потоковая телеметрия и управление
* **🤖 Универсальность**: Поддержка различных моделей роботов-роверов

Установка
---------

.. code-block:: bash

    uv add geodrive
    # или
    pip install geodrive


Быстрый старт
-------------

.. code-block:: python

    from geodrive import Rover

    with Rover(host="10.1.100.160", port=5656) as rover:
        rover.goto(5.0, 3.0, 1.57)
        telemetry = rover.get_telemetry()
        print(f"Позиция: ({telemetry.x:.2f}, {telemetry.y:.2f})")

Что внутри?
------------

**Управление движением**
    * Точное позиционирование в координатах X, Y, Yaw
    * Потоковое отслеживание прогресса движения
    * RC-стиль управления для плавного движения

**Телеметрия в реальном времени**
    * Потоковая передада данных о позиции и ориентации
    * Мониторинг состояния батареи и датчиков

**Надежная коммуникация**
    * gRPC для высокопроизводительной связи
    * Автоматическое переподключение при обрывах
    * Валидация команд и данных

**Гибкость использования**
    * Синхронный для простых скриптов
    * Асинхронный для веб-приложений
    * Поддержка контекстных менеджеров

Требования
----------

* Python 3.10+
* gRPC сервер на стороне робота
* Сетевое соединение с роботом

Зависимости
-----------

geodrive построен на современных технологиях:

* **grpcio** - высокопроизводительный gRPC клиент
* **protobuf** - работа с бинарными протоколами
* **pydantic** - валидация и сериализация данных
* **structlog** - структурированное логирование

Документация
------------

.. toctree::
   :maxdepth: 2
   :caption: Начало работы:
   
   geodrive/getting_started
   geodrive/installation
   geodrive/examples

.. toctree::
   :maxdepth: 2
   :caption: API документация:
   
   geodrive/api/index

.. toctree::
   :maxdepth: 2
   :caption: Community Playbook:

   recipes/index

.. toctree::
   :maxdepth: 1
   :caption: Для разработчиков:
   
   geodrive/contributing

Лицензия
--------

Проект распространяется под лицензией MIT.
