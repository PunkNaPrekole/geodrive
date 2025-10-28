export class MapManager {
    constructor() {
        this.currentPosition = { x: 0, y: 0, yaw: 0 };
        this.currentVelocity = { vx: 0, vy: 0};
        this.arenaSize = 11;
    }

    init() {
        this.createGrid();
        this.updatePosition(this.currentPosition);
    }

    createGrid() {
        const mapContainer = document.getElementById('mapContainer');
        
        // Очищаем старую сетку
        const oldGrid = mapContainer.querySelectorAll('.grid-line');
        oldGrid.forEach(el => el.remove());

        // Создаем новую сетку
        for (let i = -5; i <= 5; i++) {
            // Вертикальные линии
            const vLine = document.createElement('div');
            vLine.className = 'grid-line vertical';
            vLine.style.left = `${50 + (i / 5) * 50}%`;
            mapContainer.appendChild(vLine);

            // Горизонтальные линии  
            const hLine = document.createElement('div');
            hLine.className = 'grid-line horizontal';
            hLine.style.top = `${50 + (i / 5) * 50}%`;
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

    updatePosition(data) {
        if (data.posX !== undefined) this.currentPosition.x = data.posX;
        if (data.posY !== undefined) this.currentPosition.y = data.posY;
        if (data.yaw !== undefined) this.currentPosition.yaw = data.yaw;

        if (data.velX !== undefined) this.currentVelocity.vx = data.velX;
        if (data.velY !== undefined) this.currentVelocity.vy = data.velY;

        this.updateRobotMarker();
        this.updateCoordinatesDisplay();
    }

    updateRobotMarker() {
        const robotMarker = document.getElementById('robotMarker');
        const robotDirection = document.getElementById('robotDirection');

        // Масштабирование координат из [-5.5, 5.5] в [0%, 100%]
        const xPercent = 50 + (this.currentPosition.x / 5.5) * 50;
        const yPercent = 50 - (this.currentPosition.y / 5.5) * 50;

        robotMarker.style.left = `${Math.max(0, Math.min(100, xPercent))}%`;
        robotMarker.style.top = `${Math.max(0, Math.min(100, yPercent))}%`;

        // Конвертация радиан в градусы
        const yawDegrees = -this.currentPosition.yaw * (180 / Math.PI) + 90;
        robotDirection.style.transform = `translateX(-50%) rotate(${yawDegrees}deg)`;
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