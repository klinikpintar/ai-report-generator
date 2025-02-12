# AI Report Generator

AI Report Generator is a web application for generating AI-powered reports.

## Installation Guide

Follow these steps to set up the project:

### 1. Set Up a Virtual Environment
Create and activate a virtual environment:
```sh
python -m venv env
source env/bin/activate  # On Windows use: env\Scripts\activate
```

### 2. Install Dependencies
Install the required Python packages:
```sh
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Create a `.env` file in the project's root directory and add the following content:

```ini
# Development Database
DB_NAME_DEV=dev
DB_USER_DEV=postgres
DB_PASS_DEV=password
DB_HOST_DEV=localhost
DB_PORT_DEV=5432

## Debug
DEBUG=True
```

### 4. Apply Migrations
Run the following command to set up the database schema:
```sh
python manage.py migrate
```

### 5. Run the Development Server
Start the Django development server:
```sh
python manage.py runserver
```

Now, you can access the application at `http://127.0.0.1:8000/`.

## License
This project is licensed under the MIT License.
