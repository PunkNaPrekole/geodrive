# Руководство по внесению вклада

Благодарим за интерес к разработке GeoDrive SDK! Это руководство поможет вам эффективно участвовать в проекте.

## 🏗️ Архитектура проекта
```
src/geodrive/
├── core/ # Основные клиенты
│ ├── async_client.py # Асинхронный клиент
│ └── sync_client.py # Синхронный клиент
├── managers/ # Менеджеры функциональности
│ ├── async_movement.py # Управление движением (async)
│ ├── sync_movement.py # Управление движением (sync)
│ └── peripherals.py # Управление периферией
├── communicators/ # Коммуникационные модули
│ ├── grpc_async.py # Асинхронный gRPC
│ ├── grpc_sync.py # Синхронный gRPC
│ └── base.py # Базовые классы
├── generated/ ⚠️ Автосгенерированные файлы
│ ├── rover_pb2.py
│ └── rover_pb2_grpc.py
├── commands.py # Команды
├── schemas.py # Pydantic схемы
└── exceptions.py # Кастомные исключения
```


## 🛠️ Настройка окружения разработки

### Предварительные требования
- Python 3.10+
- [UV](https://github.com/astral-sh/uv)

### Установка для разработки

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/your-username/geodrive-sdk.git
cd geodrive-sdk
```
### Установите зависимости:

```bash
uv sync --dev
```
### Установите pre-commit хуки:

```bash
uv run pre-commit install
```

## Генерация gRPC кода
#### ⚠️ Внимание: Файлы в src/geodrive/generated/ автосгенерированы. Не редактируйте их вручную!

### Обновление .proto файлов
Получите актуальные .proto файлы из основного репозитория робота

Поместите их в proto/ директорию (создайте если нет)

Сгенерируйте Python код:

```bash
# Установите grpc-tools если нужно
uv pip install grpcio-tools
```
# Генерация кода
```
python -m grpc_tools.protoc \
    -Iproto \
    --python_out=src/geodrive/generated \
    --grpc_python_out=src/geodrive/generated \
    --pyi_out=src/geodrive/generated \
    proto/rover.proto
```
Убедитесь, что сгенерированные файлы импортируются корректно в src/geodrive/generated/__init__.py

🧪 Тестирование
Запуск тестов
bash
# Все тесты
uv run pytest

# С покрытием кода
uv run pytest --cov=src/geodrive

# Конкретный модуль
uv run pytest tests/test_async_client.py -v
Интеграционные тесты
Для интеграционных тестов с реальным роботом:

bash
uv run pytest tests/integration/ --robot-host=192.168.1.100
📝 Стиль кода
Code Style
Black для форматирования

isort для сортировки импортов

Flake8 для линтинга

MyPy для проверки типов

bash
# Автоматическое форматирование
uv run black src/ tests/
uv run isort src/ tests/

# Проверка стиля
uv run flake8 src/ tests/
uv run mypy src/
Документация
Используйте Google-style docstrings

Типизируйте все аргументы и возвращаемые значения

Добавляйте примеры использования для публичных методов

python
async def move_forward(
    self, 
    speed: float, 
    duration: Optional[float] = None
) -> MovementResponse:
    """Перемещает робота вперед с указанной скоростью.
    
    Args:
        speed: Скорость движения (0.0 - 1.0)
        duration: Длительность движения в секундах. Если None - бесконечно.
        
    Returns:
        MovementResponse: Результат выполнения команды
        
    Raises:
        ConnectionError: При проблемах с соединением
        ValidationError: При невалидных параметрах
        
    Example:
        >>> async with AsyncClient() as client:
        >>>     response = await client.move_forward(0.5, 2.0)
    """
🎯 Процесс внесения изменений
1. Создание issue
Опишите проблему или новую функциональность

Укажите приоритет (P0, P1, P2)

Добавьте соответствующие labels

2. Создание ветки
Именуйте ветки по шаблону:

bash
git checkout -b feature/add-sensor-support
git checkout -b fix/connection-timeout
git checkout -b docs/update-readme
3. Разработка
Следуйте TDD где это возможно

Добавляйте тесты для новой функциональности

Обновляйте документацию

Не забывайте про обратную совместимость

4. Коммиты
Используйте Conventional Commits:

text
feat: добавлена поддержка лидара
fix: исправление таймаута соединения
docs: обновление примеров использования
test: добавление тестов для движения
refactor: оптимизация менеджера периферии
5. Pull Request
Опишите изменения в PR

Укажите связанные issues (Closes #123)

Убедитесь, что все тесты проходят

Попросите ревью у основных разработчиков

🐛 Отладка
Логирование
python
import logging
logging.basicConfig(level=logging.DEBUG)
Тестовый стенд
Используйте примеры из examples/ для тестирования:

bash
uv run python examples/simple_usage.py
uv run python examples/wasd_control.py
📦 Релиз процесс
Подготовка релиза
Обновите версию в pyproject.toml

Обновите CHANGELOG.md

Создайте тег: git tag v0.2.0

Запустите сборку: uv build

Публикация
bash
uv publish
❓ Получение помощи
Создайте issue для багов и вопросов

Используйте discussions для общих вопросов

Проверьте документацию в docs/

Изучите примеры в examples/

🔒 Безопасность
При обнаружении уязвимостей безопасности:

Не создавайте публичные issue

Напишите на security@your-domain.com

Опишите проблему детально

Спасибо за ваш вклад! 🚀
