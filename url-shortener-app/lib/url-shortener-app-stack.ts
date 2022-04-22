import { aws_lambda, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
    LambdaToDynamoDB,
    LambdaToDynamoDBProps,
} from "@aws-solutions-constructs/aws-lambda-dynamodb";
import { Construct } from "constructs";

export class UrlShortenerAppStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const backend = new NodejsFunction(this, "handler", {
            entry: "lambda/index.ts",
            handler: "handler",
            runtime: aws_lambda.Runtime.NODEJS_14_X,
        });

        // Construct
        const lambdaDynamoDBProps: LambdaToDynamoDBProps = {
            existingLambdaObj: backend,
            tableEnvironmentVariableName: "TABLE_NAME",
        };

        const ldConstruct = new LambdaToDynamoDB(
            this,
            "LambdaToDynamoDB",
            lambdaDynamoDBProps
        );

        // Function URL
        const fnUrl = ldConstruct.lambdaFunction.addFunctionUrl({
            authType: aws_lambda.FunctionUrlAuthType.NONE,
        });

        ldConstruct.dynamoTable.grantReadWriteData(backend);

        new CfnOutput(this, "ShortenerUrl", {
            value: fnUrl.url,
            description: "Shortener URL",
        });

        new CfnOutput(this, "DynamoDBTable", {
            value: ldConstruct.dynamoTable.tableName,
            description: "DyanmoDB Table",
        });

        new CfnOutput(this, "LambdaFunction", {
            value: ldConstruct.lambdaFunction.functionName,
            description: "Lambda Function",
        });
    }
}
