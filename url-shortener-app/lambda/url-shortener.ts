// Initail Lambda

exports.handler = async function (event: any) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    let body = JSON.parse(event.body);
    console.log("body:", body);
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello, CDK! You've hit ${body.path}\n`,
    };
};
