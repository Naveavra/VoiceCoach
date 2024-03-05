
# Project Name

A brief description of your project.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Development Server](#development-server)
- [Database Migrations](#database-migrations)
- [Docker](#docker)
  - [Building Docker Images](#building-docker-images)
  - [Running Docker Containers](#running-docker-containers)
- [Connecting to pgAdmin](#connecting-to-pgadmin)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- [Python](https://www.python.org/) (version x.x.x)
- [Docker](https://www.docker.com/) (optional, if you want to run the application in containers)
- [PostgreSQL](https://www.postgresql.org/) (optional, if you want to use a local database)
- [pgAdmin](https://www.pgadmin.org/) (optional, for database administration)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/your-project.git
    ```

2. Navigate to the project directory:

    ```bash
    cd your-project
    ```

3. Create a virtual environment (optional but recommended):

    ```bash
    python -m venv venv
    ```

4. Activate the virtual environment:

    - On Windows:

      ```bash
      venv\Scripts\activate
      ```

    - On Unix or MacOS:

      ```bash
      source venv/bin/activate
      ```

5. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

## Running the Application

### Development Server

To run the development server locally, execute the following command:

```bash
python manage.py runserver
```

The application will be accessible at [http://localhost:5000](http://localhost:5000).

## Database Migrations

To manage database migrations, use the following commands:

```bash
flask --app main.py db migrate
flask --app main.py db upgrade
```

## Docker

### Building Docker Images

To build Docker images, run the following command:

```bash
docker-compose build
```

### Running Docker Containers

To run the application in Docker containers, use:

```bash
docker-compose up -d
```

This command starts the containers in detached mode.

Access the application at [http://localhost:5000](http://localhost:5000).

## Connecting to pgAdmin

1. Open a web browser and go to [http://localhost:5050](http://localhost:5050).
2. Log in using the credentials:
   - Email: `bigboss@email.com`
   - Password: `Adminos2022`
3. After logging in, click on "Add New Server" in the "Quick Links" section.
4. Enter a name for the server (e.g., "Your Project Server").
5. In the "Connection" tab:
   - Name: `voice_db`
   - Host name/address: `host.docker.internal`
   - Port: `5432`
   - Username: `Bigboss0304`
   - Password: `Adminos2022`
6. Click "Save" to register the server.

You can now manage your PostgreSQL database through pgAdmin.

## Contributing

If you would like to contribute to the project, please follow the [Contributing Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [License Name] - see the [LICENSE.md](LICENSE.md) file for details.

---

