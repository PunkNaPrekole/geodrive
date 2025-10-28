import { WebSocketManager } from './websocket.js';
import { ControlsManager } from './control.js';
import { MapManager } from './map.js';
import { TelemetryManager } from './telemetry.js';
import { Configurator } from './configurator.js';

class GeodriveControlPanel {
    constructor() {
        this.modules = {};
        this.roverApiBase = 'http://localhost:8000';
    }

    async init() {
        this.modules.websocket = new WebSocketManager();
        this.modules.controls = new ControlsManager();
        this.modules.map = new MapManager();
        this.modules.telemetry = new TelemetryManager();
        this.modules.configurator = new Configurator();

        this.setupModuleConnections();

        await this.initModules();

        console.log('GEODRIVE Control Panel инициализирована');
    }

    setupModuleConnections() {
        // WebSocket сообщения распределяем по модулям
        this.modules.websocket.onMessage((data) => {
            if (data.type === 'config') {
                // Обновляем адрес API ровера
                if (data.rover_address) {
                    this.roverApiBase = `http://${data.rover_address}:8000`;
                    this.modules.configurator.setApiBase(this.roverApiBase);
                }
            }

            if (data.type === 'telemetry') {
                this.modules.telemetry.updateData(data);
                this.modules.map.updatePosition(data);
            }
        });

        // Управление -> WebSocket
        this.modules.controls.onCommand((command) => {
            this.modules.websocket.sendCommand(command);
        });

        // Конфигуратор -> API
        this.modules.configurator.onConfigApply((config) => {
            this.applyConfiguration(config);
        });
    }

    async initModules() {
        this.modules.map.init();
        this.modules.controls.init();
        await this.modules.configurator.init();
        this.modules.websocket.connect();
    }

    async applyConfiguration(config) {
        try {
            const response = await fetch(`${this.roverApiBase}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                this.modules.configurator.log('Конфигурация применена');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.modules.configurator.log(`Ошибка: ${error.message}`, 'error');
        }
    }

    connect() {
        this.modules.websocket.connect();
    }

    disconnect() {
        this.modules.websocket.disconnect();
    }
}

const app = new GeodriveControlPanel();
app.init().catch(console.error);

// Экспортируем для глобального доступа если понадобится
window.GeodriveControlPanel = GeodriveControlPanel;
window.app = app;
