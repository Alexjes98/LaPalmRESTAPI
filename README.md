# Lapalm rest api

Welcome to the Lapalmrestapi project! This repository contains a Node.js-based REST API for Lapalm. This guide will walk you through the steps to install and run the project, including how to use Docker to containerize the application.

## Installation

To install and run the Rest API Lapalm project, please follow these steps:

1. Clone the repository to your local machine using the following command:

    ```
    git clone https://github.com/Alexjes98/LaPalmRESTAPI.git
    ```

2. Navigate to the project directory:

    ```
    cd lapalm-rest-api
    ```

3. Install the project dependencies by running the following command:
    ```
    npm install
    ```

## Running the Project

The project provides multiple scripts in the `package.json` file to facilitate running and testing the application. Choose the appropriate script based on your requirements.

-   **Starting the API in Development Mode:**

    ```
    npm run dev
    ```

    This command uses `nodemon` to run the application in development mode. It automatically restarts the server whenever a file is modified, making it convenient for development purposes.

-   **Starting the API in Production Mode:**

    ```
    npm run prod
    ```

    This command starts the application in production mode using the compiled version of the code located in the `dist/` directory.

-   **Building the Project:**

    ```
    npm run build
    ```

    The build script uses Webpack to bundle and optimize the application code. It generates the compiled version of the code in the `dist/` directory, which can be used for production deployment.

-   **Starting the API using Node.js:**

    ```
    npm start
    ```

    This command starts the application using Node.js without any additional development features.
## Database

You need to install PostgreSQL, refer to: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

### Database Configuration

Please use the following commands to set up the database and tables:

npx sequelize-cli db:create (to create the DB)
npx sequelize-cli db:drop (to delete the DB)
npx sequelize-cli db:migrate (to migrate the data into the DB)
npx sequelize-cli db:migrate:undo:all (removes all entries and tables)
npx sequelize-cli db:seed:all (applies all seeds)