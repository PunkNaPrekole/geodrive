Участие в разработке
====================

Установка для разработки
------------------------

.. code-block:: bash

    git clone <repository>
    cd geodrive
    uv sync --all-groups

Запуск тестов
-------------

.. code-block:: bash

    uv run pytest tests/

Проверка кодстайла
------------------

.. code-block:: bash

    uv run ruff check src/
    uv run ruff format src/

Сборка документации
-------------------

.. code-block:: bash

    bash scripts/shell/build_docs.sh

Структура проекта
-----------------

::

    src/geodrive/
    ├── clients/           # Основные клиенты
    ├── communicators/  # Коммуникация (gRPC)
    ├── managers/       # Бизнес-логика
    ├── schemas.py     # Модели данных
    └── commands.py    # Команды ровера