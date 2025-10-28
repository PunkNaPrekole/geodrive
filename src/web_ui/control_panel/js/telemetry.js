export class TelemetryManager {
    constructor() {
        this.data = {
            posX: 0, posY: 0, velX: 0, velY: 0, 
            yaw: 0, battery: 0, speed: 0
        };
    }

    updateData(newData) {
        // Обновляем данные
        Object.keys(newData).forEach(key => {
            if (this.data[key] !== undefined) {
                this.data[key] = newData[key];
            }
        });

        // Вычисляем общую скорость
        this.data.speed = Math.sqrt(
            this.data.velX * this.data.velX +
            this.data.velY * this.data.velY
        ).toFixed(2);

        this.updateBatteryDisplay();
    }

    updateBatteryDisplay() {
        const batteryLevel = document.getElementById('batteryLevel');
        //const batteryPercentage = document.getElementById('batteryPercentage');
        //const batteryStatus = document.getElementById('batteryStatus');

        const batteryPercent = this.data.battery;
        batteryLevel.style.width = `${batteryPercent}%`;
        //batteryPercentage.textContent = `${batteryPercent}%`;

        // Меняем цвет в зависимости от уровня заряда
        if (batteryPercent > 85) {
            batteryLevel.style.background = 'linear-gradient(90deg, #2ed573, #7bed9f)';
            //batteryStatus.textContent = 'Отличное состояние';
        } else if (batteryPercent > 70) {
            batteryLevel.style.background = 'linear-gradient(90deg, #ffa502, #ffb142)';
            //batteryStatus.textContent = 'Средний заряд';
        } else if (batteryPercent > 55) {
            batteryLevel.style.background = 'linear-gradient(90deg, #ff4757, #ff6b81)';
            //batteryStatus.textContent = 'Низкий заряд';
        } else {
            batteryLevel.style.background = 'linear-gradient(90deg, #2f3542, #57606f)';
            //batteryStatus.textContent = 'Требуется зарядка';
        }
    }

    getData() {
        return { ...this.data };
    }

    reset() {
        this.data = { posX: 0, posY: 0, velX: 0, velY: 0, yaw: 0, battery: 0, speed: 0 };
        this.updateDisplay();
        this.updateBatteryDisplay();
    }
}