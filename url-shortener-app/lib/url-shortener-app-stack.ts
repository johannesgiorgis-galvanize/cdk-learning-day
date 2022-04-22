import { aws_lambda, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class UrlShortenerAppStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const backend = new NodejsFunction(this, "handler", {
            entry: "lambda/url-shortener.ts",
            handler: "handler",
            runtime: aws_lambda.Runtime.NODEJS_14_X,
        });

        const fnUrl = backend.addFunctionUrl({
            authType: aws_lambda.FunctionUrlAuthType.NONE,
        });

        new CfnOutput(this, "ShortenerUrl", {
            value: fnUrl.url,
            description: "Shortener URL",
        });
    }
}
