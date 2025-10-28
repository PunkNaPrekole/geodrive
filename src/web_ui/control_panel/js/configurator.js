import { ApiClient } from './api.js';

export class Configurator {
    constructor() {
        this.apiClient = new ApiClient();
        this.openApiSchema = null;
        this.currentConfig = {};
        this.configApplyHandler = null;
        this.versionData = null;
    }

    async init() {
        await this.loadSchema();
        this.setupEventListeners();
        this.generateUI();
    }

    setApiBase(url) {
        this.apiClient.setBaseUrl(url);
        this.log(`API базовый URL обновлен: ${url}`);
    }

    async loadSchema() {
        try {
            this.openApiSchema = await this.apiClient.fetchOpenApiSchema();
            this.versionData = await this.apiClient.fetchVersion();
            this.updateStatus('success', `API: ${this.apiClient.baseUrl}`);
            this.updateVersion();
            this.log('OpenAPI схема загружена');
        } catch (error) {
            this.updateStatus('error', 'API: Ошибка подключения');
            this.log(`Ошибка загрузки схемы: ${error.message}`, 'error');
        }
    }

    generateUI() {
        if (!this.openApiSchema) return;

        const sectionsContainer = document.getElementById('configSections');
        sectionsContainer.innerHTML = '';

        // Парсим компоненты схемы
        const components = this.openApiSchema.components?.schemas;

        if (!components) {
            sectionsContainer.innerHTML = '<div class="loading-config">Нет доступных конфигураций</div>';
            return;
        }

        // Генерируем UI для каждой схемы
        Object.entries(components).forEach(([schemaName, schema]) => {
            if (this.shouldDisplaySchema(schemaName, schema)) {
                const section = this.createConfigSection(schemaName, schema);
                sectionsContainer.appendChild(section);
            }
        });
    }

    shouldDisplaySchema(schemaName, schema) {
        // Фильтруем схемы для конфигурации
        const excluded = ['Error', 'Response', 'Message', 'HTTPValidationError', 'ValidationError'];
        return !excluded.includes(schemaName) && schema.properties;
    }

    createConfigSection(schemaName, schema) {
        const section = document.createElement('div');
        section.className = 'config-section';

        const title = this.formatSchemaName(schemaName);
        const description = schema.description || '';

        section.innerHTML = `
            <div class="section-header" onclick="this.parentNode.querySelector('.section-content').style.display = this.parentNode.querySelector('.section-content').style.display === 'none' ? 'grid' : 'none'">
                <span>${title}</span>
                <span>▶</span>
            </div>
            <div class="section-content">
                ${description ? `<div class="field-description">${description}</div>` : ''}
                ${this.generateFields(schema.properties, schema.required || [])}
            </div>
        `;

        return section;
    }

    generateFields(properties, requiredFields) {
        let fieldsHTML = '';

        Object.entries(properties).forEach(([fieldName, fieldSchema]) => {
            const isRequired = requiredFields.includes(fieldName);
            fieldsHTML += this.generateField(fieldName, fieldSchema, isRequired);
        });

        return fieldsHTML;
    }

    generateField(fieldName, fieldSchema, isRequired) {
        const label = this.formatFieldName(fieldName);
        const description = fieldSchema.description || '';
        const fieldId = `config_${fieldName}`;

        let inputHTML = '';

        // Генерируем подходящий input на основе типа поля
        switch (fieldSchema.type) {
            case 'string':
                if (fieldSchema.enum) {
                    // Select для enum значений
                    inputHTML = this.generateSelect(fieldId, fieldSchema.enum, fieldSchema.default);
                } else {
                    // Text input для строк
                    inputHTML = `<input type="text" id="${fieldId}" class="field-input"
                        value="${fieldSchema.default || ''}"
                        placeholder="${fieldSchema.example || ''}">`;
                }
                break;

            case 'number':
            case 'integer':
                if (fieldSchema.minimum !== undefined || fieldSchema.maximum !== undefined) {
                    // Range для чисел с ограничениями
                    inputHTML = this.generateRange(fieldId, fieldSchema);
                } else {
                    // Number input
                    inputHTML = `<input type="number" id="${fieldId}" class="field-input"
                        value="${fieldSchema.default || 0}"
                        step="${fieldSchema.type === 'integer' ? 1 : 0.1}">`;
                }
                break;

            case 'boolean':
                // Checkbox для булевых значений
                inputHTML = this.generateCheckbox(fieldId, fieldSchema.default || false);
                break;

            default:
                inputHTML = `<input type="text" id="${fieldId}" class="field-input"
                    value="${JSON.stringify(fieldSchema.default || '')}">`;
        }

        return `
            <div class="config-field">
                <label class="field-label" for="${fieldId}">
                    ${label} ${isRequired ? '<span style="color: #ff4444">*</span>' : ''}
                </label>
                ${description ? `<div class="field-description">${description}</div>` : ''}
                ${inputHTML}
            </div>
        `;
    }

    generateSelect(fieldId, enumValues, defaultValue) {
        const options = enumValues.map(value =>
            `<option value="${value}" ${value === defaultValue ? 'selected' : ''}>${value}</option>`
        ).join('');

        return `<select id="${fieldId}" class="field-select">${options}</select>`;
    }

    generateRange(fieldId, fieldSchema) {
        const min = fieldSchema.minimum || 0;
        const max = fieldSchema.maximum || 100;
        const step = fieldSchema.type === 'integer' ? 1 : 0.1;
        const defaultValue = fieldSchema.default || min;

        return `
            <input type="range" id="${fieldId}" class="field-range"
                min="${min}" max="${max}" step="${step}" value="${defaultValue}">
            <div class="range-value" id="${fieldId}_value">${defaultValue}</div>
        `;
    }

    generateCheckbox(fieldId, defaultValue) {
        const checked = defaultValue ? 'checked' : '';
        return `
            <div class="field-checkbox">
                <input type="checkbox" id="${fieldId}" ${checked}>
                <label class="checkbox-label" for="${fieldId}">Включено</label>
            </div>
        `;
    }

    // Сбор конфигурации со всех полей
    collectConfiguration() {
        const config = {};
        const fields = document.querySelectorAll('[id^="config_"]');

        fields.forEach(field => {
            const fieldName = field.id.replace('config_', '');
            let value;

            switch (field.type) {
                case 'checkbox':
                    value = field.checked;
                    break;
                case 'range':
                case 'number':
                    value = parseFloat(field.value);
                    break;
                case 'select-one':
                    value = field.value;
                    // Конвертируем числа если нужно
                    if (!isNaN(value) && value !== '') {
                        value = parseFloat(value);
                    }
                    break;
                default:
                    value = field.value;
                    // Конвертируем числа если нужно
                    if (!isNaN(value) && value !== '') {
                        value = parseFloat(value);
                    }
            }

            // Сохраняем только если значение отличается от default
            if (value !== '' && value !== null && value !== undefined) {
                config[fieldName] = value;
            }
        });

        return config;
    }

    // Применение конфигурации к роверу
    async applyConfiguration() {
        const config = this.collectConfiguration();

        this.log('⚡ Отправка конфигурации...');

        try {
            if (this.configApplyHandler) {
                // Используем внешний обработчик если есть
                await this.configApplyHandler(config);
            } else {
                // Или применяем напрямую через API
                await this.apiClient.applyConfiguration(config);
                this.log('Конфигурация применена успешно');
            }
        } catch (error) {
            this.log(`Ошибка применения: ${error.message}`, 'error');
        }
    }

    // Сохранение конфигурации в файл
    saveConfiguration() {
        const config = this.collectConfiguration();
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `rover-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.log('Конфигурация сохранена в файл');
    }

    // Загрузка конфигурации из файла
    loadConfigurationFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                this.populateForm(config);
                this.log('Конфигурация загружена из файла');
            } catch (error) {
                this.log(`Ошибка загрузки файла: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    }

    // Заполнение формы значениями из конфигурации
    populateForm(config) {
        Object.entries(config).forEach(([fieldName, value]) => {
            const field = document.getElementById(`config_${fieldName}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = Boolean(value);
                } else if (field.type === 'range') {
                    field.value = value;
                    const valueDisplay = document.getElementById(`${field.id}_value`);
                    if (valueDisplay) {
                        valueDisplay.textContent = value;
                    }
                } else {
                    field.value = value;
                }
            }
        });
    }

    // Вспомогательные методы
    formatSchemaName(name) {
        return name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().toUpperCase();
    }

    formatFieldName(name) {
        return name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')
            .replace(/^\w/, c => c.toUpperCase());
    }

    setupEventListeners() {
        // Кнопка обновления схемы
        const refreshBtn = document.getElementById('refreshConfig');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadSchema().then(() => this.generateUI());
            });
        }

        // Кнопка применения конфигурации
        const applyBtn = document.getElementById('applyConfig');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyConfiguration();
            });
        }

        // Кнопка сохранения конфигурации
        const saveBtn = document.getElementById('saveConfig');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveConfiguration();
            });
        }

        // Кнопка загрузки конфигурации
        const loadBtn = document.getElementById('loadConfig');
        if (loadBtn) {
            const fileInput = document.getElementById('configFileInput');
            if (!fileInput) {
                // Создаем скрытый input для загрузки файлов
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.id = 'configFileInput';
                input.style.display = 'none';
                document.body.appendChild(input);

                input.addEventListener('change', (e) => {
                    if (e.target.files[0]) {
                        this.loadConfigurationFromFile(e.target.files[0]);
                    }
                });

                loadBtn.addEventListener('click', () => {
                    input.click();
                });
            }
        }

        // Обновление значений range
        document.addEventListener('input', (e) => {
            if (e.target.type === 'range') {
                const valueDisplay = document.getElementById(`${e.target.id}_value`);
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
            }
        });
    }

    updateVersion() {
        let software_version = this.versionData.software;
        const versionElement = document.getElementById('configVersion');
        if (versionElement) {
            versionElement.textContent = `Версия: ${software_version}`;
        }
    }

    updateStatus(type, message) {
        const endpointElement = document.getElementById('apiEndpoint');
        if (endpointElement) {
            endpointElement.textContent = message;
            endpointElement.className = `api-endpoint ${type}`;
        }
    }

    log(message, type = 'info') {
        const consoleContent = document.querySelector('.config-console .console-content');
        if (!consoleContent) return;

        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        line.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
        
        consoleContent.appendChild(line);
        consoleContent.scrollTop = consoleContent.scrollHeight;
    }

    onConfigApply(handler) {
        this.configApplyHandler = handler;
    }

    // Дополнительные методы для удобства
    async getCurrentConfig() {
        try {
            return await this.apiClient.getCurrentConfig();
        } catch (error) {
            this.log(`Ошибка получения текущей конфигурации: ${error.message}`, 'error');
            return null;
        }
    }

    async refreshCurrentConfig() {
        const config = await this.getCurrentConfig();
        if (config) {
            this.populateForm(config);
            this.log('Текущая конфигурация загружена');
        }
    }
}