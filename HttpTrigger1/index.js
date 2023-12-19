require('dotenv').config(); // Load environment variables from .env file

module.exports = async function (context, req) {
    const { TableClient } = require("@azure/data-tables");

    // Azure Cosmos DB Table API configuration
    const connectionString = process.env.DBCONNECTIONSTRING;
    const tableName = "VisitorCount";
    console.log(connectionString);

    // Create a table client
    const tableClient = TableClient.fromConnectionString(connectionString, tableName);

    if (req.method === "GET") {
        try {
            // Get the entity for reading the count attribute (assuming a specific partition key and row key)
            const partitionKey = 'Counts';
            const rowKey = 'VisitorCount';

            const entity = await tableClient.getEntity(partitionKey, rowKey);

            if (entity && entity.count !== undefined) {
                context.res = {
                    status: 200,
                    body: {
                        count: entity.count
                    }
                };
            } else {
                context.res = {
                    status: 404,
                    body: "Entitys not found or count attribute does not exist"
                };
            }
        } catch (error) {
            context.res = {
                status: 500,
                body: "Error reading the count attribute: " + error.message
            };
        }
    } else if (req.method === "POST") {
        try {
            // Get the entity that needs to be updated (assuming a specific partition key and row key)
            const partitionKey = 'Counts';
            const rowKey = 'VisitorCount';

            const entityToUpdate = await tableClient.getEntity(partitionKey, rowKey);

            if (entityToUpdate) {
                const newCount = req.body && req.body.count;
                if (newCount !== undefined) {
                    // Update the 'count' attribute
                    entityToUpdate.count = newCount;

                    // Update the entity in the table
                    // await tableClient.updateEntity(entityToUpdate);
                    await tableClient.updateEntity({
                        partitionKey: entityToUpdate.partitionKey,
                        rowKey: entityToUpdate.rowKey,
                        count: newCount
                    });

                    context.res = {
                        status: 200,
                        body: "Count attribute updated successfully"
                    };
                } else {
                    context.res = {
                        status: 400,
                        body: "Request body should contain a 'count' field"
                    };
                }
            } else {
                context.res = {
                    status: 404,
                    body: "Entity not found for the specified keys"
                };
            }
        } catch (error) {
            context.res = {
                status: 500,
                body: "Error updating the count attribute: " + error.message
            };
        }
    } else {
        context.res = {
            status: 405,
            body: "Method not allowed. Supported methods: GET, POST"
        };
    }
};
