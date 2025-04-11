# MongoDB Setup Instructions

The application is currently configured to connect to a local MongoDB instance at `mongodb://localhost:27017/atlas-ai`. You have two options to fix the connection error:

## Option 1: Start MongoDB Locally

If you have MongoDB installed locally:

### Windows
1. Open Command Prompt as Administrator
2. Run: `net start MongoDB`
3. Alternatively, start it from Services:
   - Press Win+R, type "services.msc" and press Enter
   - Find "MongoDB" in the list
   - Right-click and select "Start"

### macOS
1. Open Terminal
2. Run: `brew services start mongodb-community`

### Linux
1. Open Terminal
2. Run: `sudo systemctl start mongod`

## Option 2: Use MongoDB Atlas (Cloud Database)

If you don't want to run MongoDB locally or are having issues with local setup:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient)
3. Set up database access (create a user with password)
4. Set up network access (allow access from anywhere for development)
5. Get your connection string by clicking "Connect" > "Connect your application"
6. Update your `.env` file with the new connection string:

```
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-url>/atlas-ai?retryWrites=true&w=majority"
```

Replace `<username>`, `<password>`, and `<cluster-url>` with your actual values.

## Option 3: Use MongoDB Memory Server for Development

For development purposes, you can use mongodb-memory-server which runs MongoDB in memory:

1. Install the package:
```
npm install --save-dev mongodb-memory-server
```

2. Update your MongoDB connection code to use the in-memory server.

## Verifying Connection

To verify that MongoDB is running and accessible:

1. Open a terminal
2. Run: `mongosh`
3. If it connects successfully, MongoDB is running properly

## Common Issues

1. **Port already in use**: If port 27017 is already in use, you can change the port in your MongoDB configuration.
2. **Firewall blocking**: Make sure your firewall allows connections to port 27017.
3. **Authentication required**: If your MongoDB requires authentication, update your connection string accordingly.
