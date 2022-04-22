import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import * as uuid from "uuid";

const TableName: string = process.env.TABLE_NAME;

export const handler = async (event: any): Promise<any> => {
    console.log("event:", event);
    // console.log("event:", event.queryStringParameters.targeturl);
    if (event.queryStringParameters?.targeturl) {
        console.log("Calling create short url...");
        const shortUrl = await createShortUrl(
            event.queryStringParameters.targeturl,
            event
        );
        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: `<a href="${shortUrl}">${shortUrl}</a>`,
        };
    }

    console.log("proxy:", event.pathParameters.proxy);
    if (event.pathParameters?.proxy) {
        console.log("getting targetURL");
        const targetUrl = await readShortUrl(event.pathParameters.proxy);
        console.log(targetUrl);

        if (targetUrl) {
            return {
                statusCode: 301,
                headers: { Location: targetUrl },
                body: "",
            };
        }

        return {
            statusCode: 400,
            headers: { "Content-Type": "text/plain" },
            body: `No redirect found for ${event.pathParameters.proxy}`,
        };
    }

    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: "usage: ?targetUrl=URL",
    };
};

const createShortUrl = async (
    targetUrl: string,
    event: any
): Promise<string> => {
    console.log("creating short url");
    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    const { Items } = await dynamoDb
        .query({
            TableName,
            IndexName: "targetUrl",
            KeyConditionExpression: "targetUrl = :t",
            ExpressionAttributeValues: {
                ":t": targetUrl,
            },
        })
        .promise();

    let id;
    if (Items?.length) {
        id = Items[0].id;
    } else {
        id = uuid.v4().slice(0, 8);
        const params = {
            TableName: TableName,
            Item: {
                id: id,
                targeturl: targetUrl,
            },
        };
        await dynamoDb.put(params).promise();
    }

    const redirectUrl =
        "https://" +
        event.requestContext.domainName +
        event.requestContext.path +
        id;

    return redirectUrl;
};

const readShortUrl = async (proxy: string): Promise<string | null> => {
    console.log("read short url");
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const result = await dynamoDb
        .get({
            TableName,
            Key: {
                id: proxy,
            },
        })
        .promise();

    console.log("result:", result);

    if (result.Item) {
        return result.Item.targetUrl;
    }

    return null;
};
