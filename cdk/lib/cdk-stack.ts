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

    // Create a Dead Letter Queue for the deletion queue
    const deletionDLQ = new sqs.Queue(this, 'DeletionDLQ');

    // Create an SQS queue for deletion with a redrive policy
    const deletionQueue = new sqs.Queue(this, 'DeletionQueue', {
      visibilityTimeout: cdk.Duration.seconds(120), // 2 minutes visibility timeout
      deadLetterQueue: {
        queue: deletionDLQ,
        maxReceiveCount: 3, // After 3 failed attempts, move to DLQ
      },
    });

    // Create a Lambda function for deletion
    const deletionProcessorLambda = new lambdaNodejs.NodejsFunction(
      this,
      'DeletionProcessor',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '../delete-lambda/index.ts'), // Path to your deletion Lambda entry file
        handler: 'handler',
        timeout: cdk.Duration.seconds(120), // Set Lambda timeout to 2 minutes
        environment: {
          // Include any necessary environment variables
          PINECONE_INDEX: getConfig().PINECONE_INDEX,
          PINECONE_API_KEY: getConfig().PINECONE_API_KEY,
          PINECONE_ENVIRONMENT: getConfig().PINECONE_ENVIRONMENT,
          OPENAI_API_KEY: getConfig().OPENAI_API_KEY,
        },
        bundling: {
          externalModules: ['aws-sdk'], // Exclude AWS SDK from bundling
        },
      }
    );

    // Set the deletion SQS queue as an event source for the deletion Lambda function
    deletionProcessorLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(deletionQueue)
    );

    // Create a CloudWatch Log Group for the deletion Lambda function
    new logs.LogGroup(this, 'DeletionProcessorLambdaLogGroup', {
      logGroupName: `/aws/lambda/${deletionProcessorLambda.functionName}`,
      retention: logs.RetentionDays.ONE_WEEK, // Adjust retention as needed
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Adjust the removal policy as needed
    });
  }
}
