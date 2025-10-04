<img width="1525" height="855" alt="image" src="https://github.com/user-attachments/assets/3e50606e-6016-4d5f-adbf-5edc317e6a42" />


# WB Tarrifs Service

Сервис для:
- регулярного получения тарифов WB через API и сохранения их в PostgreSQL,
- регулярного обновления данных в Google Sheets,
- хранения актуальных данных в базе данных как в источнике истины.

Проект полностью контейнеризован с помощью `Docker` и поднимается одной командой 🚀

# ⚡️ Быстрый старт
1. Клонируйте репозиторий и перейдите в папку репозитория:
```zsh
git clone https://github.com/theManAndHisShadow/wb-tarrifs-service.git
cd wb-prices-service
```

2. Подготовьте файл `credentials.json` для доступа к `Google Sheets` API.
Для этого нужно:
- залогиниться в свой гугл аккаунт
- перейти в [Google Cloud Console](https://console.cloud.google.com/)
- выбери свой проект или создать новый
- перейти в IAM & Admin → Service Accounts → Create Service Account
- нужно дать название севрисному аккаунту, например sheets-updater
- в списке сервисных аккаунтов нужно найти созданный аккаунт
- кликните на него → вкладка Keys → Add Key → Create New Key → JSON
- файл автоматически скачивается на компьютер — это и есть `credentials.json`


3. Подготовьте `.env`
Скопируйте пример `example.env` или создайте новый `.env` и приведите файл к виду:
```env
# PostgreSQL
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Приложение
APP_PORT=5000
NODE_ENV=production

# API WB
API_KEY=ВАШ_КЛЮЧ_К_API_WB

# Google Sheets
# Проще всего положить credentials.json в корень проекта
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH=./credentials.json

# Ссылка на таблицу имеет вид:
# https://docs.google.com/spreadsheets/d/1GL2tnТ21jXI91Qnr14GzbH1HZSLOgLhMVoQy-SsuL8/
# взять всё, что между /d/ и /
# ВАЖНО! Ваш сервисный аккаунт должен иметь доступ к таблице по ссылке
SHEET_IDS=["1GL2tnТ21jXI91Qnr14GzbH1HZSLOgLhMVoQy-SsuL8", ...]
```
![telegram-cloud-photo-size-2-5406811978657299152-x](https://github.com/user-attachments/assets/3a3a6b08-1dc1-41be-8157-1e106ecc9984)

4. Поднимите сервис через Docker 🐳
   
Убедитесь, что `Docker` установлен и запущен командой:
```zsh
docker compose up --build
```
Помните, что для запуска на Linux через терминал нужен отдельно скачивать пакет `docker-compose`. 

# Проверка работоспособности
1. Через psql или любой GUI-клиент (например, TablePlus / DBeaver) подключитесь к PostgreSQL:
```yaml
Host: localhost
Port: 5432
User: postgres
Password: postgres
Database: postgres
```
2.В логах контейнера app вы должны увидеть:
```zsh
Data from WB API synchronized to https://docs.google.com/spreadsheets/d/<ID>/
```
3. Достаточно перейти по ссылке из логов (https://docs.google.com/spreadsheets/d/<ID>/) и на вклакде "stocks_coefs" будут свежие данные ьекущего дня за час.

# Стек технологий
- `Node.js 20` + `TypeScript` - логика сервиса
- `PostgreSQL 16` - тут хранится источник истины
- `Knex.js` — миграции, сиды и запросы
- `Google Sheets` API - витрина данных
- `Docker` / `Docker Compose` - контейнеризация и сборка
