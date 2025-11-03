export class MapManager {
    constructor() {
        this.currentPosition = { x: 0, y: 0, yaw: 0 };
        this.currentVelocity = { vx: 0, vy: 0};
        this.batteryData = 0
        this.arenaSize = 11;
        this.targetPosition = null;
        this.contextMenuHandlers = [];

        this.waypoints = [];
        this.isRouteActive = false;
        this.currentWaypointIndex = 0;
        this.routeLines = [];
    }

    init() {
        this.createGrid();
        this.updatePosition(this.currentPosition);
        this.setupContextMenu();
        this.setupRoutePanel();
    }

    setupContextMenu() {
        const mapContainer = document.getElementById('mapContainer');
        const contextMenu = document.getElementById('mapContextMenu');
        const targetMarker = document.getElementById('targetMarker');
        const sendToPointBtn = document.getElementById('sendToPoint');

        // Открытие контекстного меню по правой кнопке
        mapContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            // Получаем координаты клика относительно карты
            const rect = mapContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Конвертируем в проценты
            const xPercent = (clickX / rect.width) * 100;
            const yPercent = (clickY / rect.height) * 100;

            // Конвертируем в координаты ровера
            const halfSize = this.arenaSize / 2;
            const targetX = ((xPercent - 50) / 50) * halfSize;
            const targetY = -((yPercent - 50) / 50) * halfSize;

            // Сохраняем целевую позицию
            this.targetPosition = { x: targetX, y: targetY };

            // Показываем маркер цели
            targetMarker.style.left = `${xPercent}%`;
            targetMarker.style.top = `${yPercent}%`;
            targetMarker.style.display = 'block';

            // Показываем контекстное меню
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.display = 'block';
        });

        // Закрытие контекстного меню
        document.addEventListener('click', (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.style.display = 'none';
            }
        });

        // Обработка выбора "Отправить ровер в точку"
        sendToPointBtn.addEventListener('click', () => {
            if (this.targetPosition) {
                this.sendToPoint(this.targetPosition);
                contextMenu.style.display = 'none';
            }
        });

        document.getElementById('addWaypoint').addEventListener('click', () => {
            if (this.targetPosition) {
                this.addWaypoint(this.targetPosition);
                contextMenu.style.display = 'none';
            }
        });

        document.getElementById('clearRoute').addEventListener('click', () => {
            this.clearRoute();
            contextMenu.style.display = 'none';
        });

        document.getElementById('startRoute').addEventListener('click', () => {
            this.startRoute();
            contextMenu.style.display = 'none';
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                contextMenu.style.display = 'none';
                targetMarker.style.display = 'none';
            }
        });
    }

    setupRoutePanel() {

        // Очистка маршрута
        document.getElementById('routeClear').addEventListener('click', () => {
            this.clearRoute();
        });

        // Запуск маршрута
        document.getElementById('routeStart').addEventListener('click', () => {
            this.startRoute();
        });

        // Остановка маршрута
        document.getElementById('routeStop').addEventListener('click', () => {
            this.stopRoute();
        });

        // Сохранение маршрута
        document.getElementById('routeSave').addEventListener('click', () => {
            this.saveRoute();
        });

        // Загрузка маршрута
        document.getElementById('routeLoad').addEventListener('click', () => {
            this.loadRoute();
        });
    }

    getCoordinatesFromClick(e) {
        const mapContainer = document.getElementById('mapContainer');
        const rect = mapContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Конвертируем в проценты
        const xPercent = (clickX / rect.width) * 100;
        const yPercent = (clickY / rect.height) * 100;

        // Конвертируем в координаты ровера
        const halfSize = this.arenaSize / 2;
        const targetX = ((xPercent - 50) / 50) * halfSize;
        const targetY = -((yPercent - 50) / 50) * halfSize;

        return { targetX, targetY, xPercent, yPercent };
    }

    // Сохранение/загрузка маршрутов
    saveRoute() {
        const routeData = {
            waypoints: this.waypoints,
            timestamp: new Date().toISOString(),
            name: `geodrive_route_${new Date().toLocaleDateString()}`
        };

        const dataStr = JSON.stringify(routeData);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `route_${Date.now()}.json`;
        link.click();

        this.notifyContextMenuHandlers({
            type: 'route_saved',
            route: routeData
        });
    }

    loadRoute() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const routeData = JSON.parse(event.target.result);
                    this.waypoints = routeData.waypoints || [];
                    this.updateRouteDisplay();
                    this.drawRouteLines();

                    this.notifyContextMenuHandlers({
                        type: 'route_loaded',
                        route: routeData
                    });
                } catch (error) {
                    console.error('Ошибка загрузки маршрута:', error);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    showTargetMarker(xPercent, yPercent) {
        const targetMarker = document.getElementById('targetMarker');
        targetMarker.style.left = `${xPercent}%`;
        targetMarker.style.top = `${yPercent}%`;
        targetMarker.style.display = 'block';
    }

    hideTargetMarker() {
        document.getElementById('targetMarker').style.display = 'none';
    }

    addWaypoint(position) {
        const waypoint = {
            id: Date.now() + Math.random(),
            x: position.x,
            y: position.y,
            order: this.waypoints.length + 1
        };

        this.waypoints.push(waypoint);
        this.updateRouteDisplay();
        this.drawRouteLines();

        this.notifyContextMenuHandlers({
            type: 'waypoint_added',
            waypoint: waypoint
        });
    }

    removeWaypoint(waypointId) {
        this.waypoints = this.waypoints.filter(wp => wp.id !== waypointId);
        this.updateRouteDisplay();
        this.drawRouteLines();
    }

    clearRoute() {
        this.waypoints = [];
        this.isRouteActive = false;
        this.currentWaypointIndex = 0;
        this.updateRouteDisplay();
        this.clearRouteLines();
        this.hideTargetMarker();

        this.notifyContextMenuHandlers({
            type: 'route_cleared'
        });
    }

    startRoute() {
        if (this.waypoints.length === 0) {
            console.warn('Нет точек маршрута');
            return;
        }

        this.isRouteActive = true;
        this.currentWaypointIndex = 0;
        this.navigateToWaypoint(this.currentWaypointIndex);

        this.notifyContextMenuHandlers({
            type: 'route_started',
            waypoints: this.waypoints
        });
    }

    stopRoute() {
        this.isRouteActive = false;
        this.notifyContextMenuHandlers({
            type: 'route_stopped'
        });
    }

    navigateToWaypoint(index) {
        if (index >= this.waypoints.length) {
            this.stopRoute();
            return;
        }

        const waypoint = this.waypoints[index];
        this.sendToPoint(waypoint);
        this.highlightCurrentWaypoint(index);
    }

    highlightCurrentWaypoint(index) {
        // Подсвечиваем текущую точку маршрута
        const waypointElements = document.querySelectorAll('.waypoint-marker');
        waypointElements.forEach((el, i) => {
            if (i === index) {
                el.classList.add('current');
            } else {
                el.classList.remove('current');
            }
        });
    }

    updateRouteDisplay() {
        const waypointsList = document.getElementById('waypointsList');
        const routeOverlay = document.getElementById('routeOverlay');

        // Очищаем списки
        waypointsList.innerHTML = '';
        routeOverlay.innerHTML = '';

        // Добавляем точки маршрута
        this.waypoints.forEach((waypoint, index) => {
            // Добавляем в список
            const waypointElement = document.createElement('div');
            waypointElement.className = 'waypoint-item';
            waypointElement.innerHTML = `
                <span class="waypoint-order">${index + 1}</span>
                <span class="waypoint-coords">X: ${waypoint.x.toFixed(2)} Y: ${waypoint.y.toFixed(2)}</span>
                <button class="waypoint-remove" data-id="${waypoint.id}">×</button>
            `;
            waypointsList.appendChild(waypointElement);

            // Добавляем на карту
            const waypointMarker = document.createElement('div');
            waypointMarker.className = 'waypoint-marker';
            waypointMarker.setAttribute('data-id', waypoint.id);

            const xPercent = 50 + (waypoint.x / (this.arenaSize / 2)) * 50;
            const yPercent = 50 - (waypoint.y / (this.arenaSize / 2)) * 50;

            waypointMarker.style.left = `${xPercent}%`;
            waypointMarker.style.top = `${yPercent}%`;
            waypointMarker.innerHTML = `
                <div class="waypoint-number">${index + 1}</div>
            `;
            routeOverlay.appendChild(waypointMarker);

            // Обработчик удаления
            waypointElement.querySelector('.waypoint-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeWaypoint(waypoint.id);
            });
        });
    }

    drawRouteLines() {
        this.clearRouteLines();

        if (this.waypoints.length < 2) return;

        const routeOverlay = document.getElementById('routeOverlay');
        const mapContainer = document.getElementById('mapContainer');

        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const start = this.waypoints[i];
            const end = this.waypoints[i + 1];

            const startX = 50 + (start.x / (this.arenaSize / 2)) * 50;
            const startY = 50 - (start.y / (this.arenaSize / 2)) * 50;
            const endX = 50 + (end.x / (this.arenaSize / 2)) * 50;
            const endY = 50 - (end.y / (this.arenaSize / 2)) * 50;

            const line = document.createElement('div');
            line.className = 'route-line';

            // Вычисляем длину и угол линии
            const dx = endX - startX;
            const dy = endY - startY;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            line.style.width = `${length}%`;
            line.style.left = `${startX}%`;
            line.style.top = `${startY}%`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.transformOrigin = '0 0';

            routeOverlay.appendChild(line);
            this.routeLines.push(line);
        }
    }

    clearRouteLines() {
        this.routeLines.forEach(line => line.remove());
        this.routeLines = [];
    }


    sendToPoint(targetPos) {
        // Уведомляем обработчики о команде перемещения
        this.notifyContextMenuHandlers({
            type: 'navigate_to_point',
            target: targetPos
        });

        console.log(`Отправка ровера в точку: X=${targetPos.x.toFixed(2)}, Y=${targetPos.y.toFixed(2)}`);
    }

    createGrid() {
        const mapContainer = document.getElementById('mapContainer');
        
        // Очищаем старую сетку
        const oldGrid = mapContainer.querySelectorAll('.grid-line');
        oldGrid.forEach(el => el.remove());

        const totalMeters = this.arenaSize;
        const metersFromCenter = totalMeters / 2;

        for (let meter = -5; meter <= 5; meter++) {
            const percent = 50 + (meter / 5.5) * 50;

            // Вертикальные линии (X)
            const vLine = document.createElement('div');
            vLine.className = 'grid-line vertical';
            vLine.style.left = `${percent}%`;
            mapContainer.appendChild(vLine);

            // Горизонтальные линии (Y)
            const hLine = document.createElement('div');
            hLine.className = 'grid-line horizontal';
            hLine.style.top = `${percent}%`;
            mapContainer.appendChild(hLine);
        }

        // Центральные оси
        const centerV = document.createElement('div');
        centerV.className = 'grid-line vertical';
        centerV.style.left = '50%';
        centerV.style.background = 'rgba(255, 126, 0, 0.3)';
        mapContainer.appendChild(centerV);

        const centerH = document.createElement('div');
        centerH.className = 'grid-line horizontal';
        centerH.style.top = '50%';
        centerH.style.background = 'rgba(255, 126, 0, 0.3)';
        mapContainer.appendChild(centerH);
    }

    updateBatteryDisplay() {
        const batteryLevel = document.getElementById('batteryLevel');

        const batteryPercent = this.batteryData;
        batteryLevel.style.width = `${batteryPercent}%`;

        if (batteryPercent > 85) {
            batteryLevel.style.background = 'linear-gradient(90deg, #2ed573, #7bed9f)';
        } else if (batteryPercent > 70) {
            batteryLevel.style.background = 'linear-gradient(90deg, #ffa502, #ffb142)';
        } else if (batteryPercent > 55) {
            batteryLevel.style.background = 'linear-gradient(90deg, #ff4757, #ff6b81)';
        } else {
            batteryLevel.style.background = 'linear-gradient(90deg, #2f3542, #57606f)';
        }
    }

    onContextMenu(handler) {
        this.contextMenuHandlers.push(handler);
    }

    notifyContextMenuHandlers(data) {
        this.contextMenuHandlers.forEach(handler => handler(data));
    }

    updatePosition(data) {
        if (data.posX !== undefined) this.currentPosition.x = data.posX;
        if (data.posY !== undefined) this.currentPosition.y = data.posY;
        if (data.yaw !== undefined) this.currentPosition.yaw = data.yaw;

        if (data.velX !== undefined) this.currentVelocity.vx = data.velX;
        if (data.velY !== undefined) this.currentVelocity.vy = data.velY;
        if (data.battery !== undefined) this.batteryData = data.battery;

        // Проверяем достижение цели (простая проверка расстояния)
        if (this.targetPosition) {
            const distance = Math.sqrt(
                Math.pow(this.currentPosition.x - this.targetPosition.x, 2) +
                Math.pow(this.currentPosition.y - this.targetPosition.y, 2)
            );

            if (distance < 0.1) { // 10 см погрешность
                document.getElementById('targetMarker').style.display = 'none';
                this.targetPosition = null;
            }
        }

        this.updateRobotMarker();
        this.updateCoordinatesDisplay();
        this.updateBatteryDisplay();
    }

    updateRobotMarker() {
        const robotSprite = document.getElementById('robotSprite');

        const halfSize = 11 / 2;

        // Масштабирование координат из [-5.5, 5.5] в [0%, 100%]
        const xPercent = 50 + (this.currentPosition.x / halfSize) * 50;
        const yPercent = 50 - (this.currentPosition.y / halfSize) * 50;

        robotSprite.style.left = `${Math.max(0, Math.min(100, xPercent))}%`;
        robotSprite.style.top = `${Math.max(0, Math.min(100, yPercent))}%`;

        // Конвертация радиан в градусы
        const yawDegrees = -this.currentPosition.yaw * (180 / Math.PI) + 90;
        robotSprite.style.transform = `translate(-50%, -50%) rotate(${yawDegrees}deg)`;

        const speed = Math.sqrt(
            this.currentVelocity.vx * this.currentVelocity.vx +
            this.currentVelocity.vy * this.currentVelocity.vy
        ).toFixed(2);
        if (speed > 0.1) {
            robotSprite.classList.add('moving');
        } else {
            robotSprite.classList.remove('moving');
        }
    }

    updateCoordinatesDisplay() {
        const coordinates = document.getElementById('coordinates');
        coordinates.textContent = 
            `X: ${this.currentPosition.x.toFixed(2)} Y: ${this.currentPosition.y.toFixed(2)} YAW: ${this.currentPosition.yaw.toFixed(2)}`;
        
        const velocities = document.getElementById('velocities');
        velocities.textContent = 
            `VX: ${this.currentVelocity.vx.toFixed(2)} VY: ${this.currentVelocity.vy.toFixed(2)}`;
    }

    setArenaSize(size) {
        this.arenaSize = size;
        this.createGrid(); // Перерисовываем сетку под новый размер
    }
}