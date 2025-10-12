# HAFJET Cloud Accounting API Testing

This document provides a guide for testing the HAFJET backend API endpoints.

## Tools

- **Postman/Thunder Client**: For manual API requests. A starter collection is provided.
- **Node.js script**: For automated smoke tests.

## 1. Postman / Thunder Client

1.  **Import the Collection**: Import the `hafjet_api.postman_collection.json` file into your API client.
2.  **Set Up Environment**: Create an environment in your client with the following variables:
    *   `base_url`: The URL of your local or production backend (e.g., `http://localhost:5001`).
    *   `jwt_token`: Leave this empty initially. You will populate it after logging in.
3.  **Authentication**:
    *   Run the `POST /api/auth/login` request with valid user credentials.
    *   The response will contain a `token`.
    *   Copy this token and paste it into your environment's `jwt_token` variable.
    *   Subsequent requests will now be authenticated.

## 2. Automated Script

A basic script is provided to run simple checks against the API.

### Prerequisites

- Node.js
- `pnpm` or `npm`

### Running the script

1.  **Install dependencies** from the root of the project:
    ```bash
    npm install
    ```
2.  **Set the target URL** via an environment variable.
3.  **Run the script**:

    ```bash
    # Test against local server
    TARGET_URL=http://localhost:5001 node scripts/test-api-endpoints.js

    # Test against production
    TARGET_URL=https://hafjet-cloud-accounting-system-production.up.railway.app node scripts/test-api-endpoints.js
    ```

The script will perform the following checks:

-   `GET /api/health`: Checks if the API is online.
-   `POST /api/auth/login`: Attempts to log in with dummy credentials.

This script can be expanded to cover more critical endpoints.
