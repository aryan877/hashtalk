import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as path from 'path';
import * as logs from 'aws-cdk-lib/aws-logs';
import { getConfig } from '../config';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a Dead Letter Queue
    const dlq = new sqs.Queue(this, 'BlogContentDLQ');

    // Create an SQS queue with a redrive policy
    const queue = new sqs.Queue(this, 'BlogContentQueue', {
      visibilityTimeout: cdk.Duration.seconds(120), // 2 minutes visibility timeout
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 3, // After 3 failed attempts, move to DLQ
      },
    });

    // Create a Lambda function with a 2-minute timeout
    const blogProcessorLambda = new lambdaNodejs.NodejsFunction(
      this,
      'BlogContentProcessor',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '../lambda/index.ts'), // Path to your Lambda entry file
        handler: 'handler',
        timeout: cdk.Duration.seconds(120), // Set Lambda timeout to 2 minutes
        environment: {
          PINECONE_INDEX: getConfig().PINECONE_INDEX,
          MONGODB_URI: getConfig().MONGODB_URI,
          PINECONE_API_KEY: getConfig().PINECONE_API_KEY,
          PINECONE_ENVIRONMENT: getConfig().PINECONE_ENVIRONMENT,
          OPENAI_API_KEY: getConfig().OPENAI_API_KEY,
        },
        bundling: {
          externalModules: ['aws-sdk'], // Exclude AWS SDK from bundling
        },
      }
    );

    // Set the SQS queue as an event source for the Lambda function
    blogProcessorLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(queue)
    );

    // Create a CloudWatch Log Group for the Lambda function
    new logs.LogGroup(this, 'BlogProcessorLambdaLogGroup', {
      logGroupName: `/aws/lambda/${blogProcessorLambda.functionName}`,
      retention: logs.RetentionDays.ONE_WEEK, // Adjust retention as needed
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Adjust the removal policy as needed
    });
  }
}
