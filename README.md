# HashTalk App


## Introduction

HashTalk is an innovative chat application that revolutionizes the way users interact with Hashnode blogs. By leveraging the power of Retrieval Augmented Generation, Pinecone vector embeddings, and MongoDB, HashTalk delivers a unique conversational experience, allowing users to engage in dynamic discussions with blog content. Developed for the Hashnode API hackathon, this application showcases the potential of integrating advanced AI and database technologies to enhance user engagement with digital content.

In addition to facilitating rich conversations, HashTalk enables users to comment on blogs, like posts, follow authors, and view detailed author profiles, all through a seamless interface that uses your personal access token obtained from the Hashnode dashboard. This README provides a comprehensive guide on setting up and deploying the HashTalk app, ensuring you can quickly get started with enhancing your Hashnode blog interaction experience.

## Features

-   **Conversational Engagement with Blogs**: Engage in interactive dialogues with Hashnode blog content using advanced AI technology.
-   **Commenting on Blogs**: Utilize Hashnode's API to post comments directly on blogs, fostering community discussions.
-   **Liking Blogs**: Express your appreciation for content by liking blogs.
-   **Following Authors**: Keep up with your favorite Hashnode authors by following them through the app.
-   **Viewing Author Details**: Access detailed profiles of Hashnode authors, enhancing your connection with the content creators.

## Important Note on Personal Access Token (PAT)

To fully utilize the HashTalk application as a user, a Personal Access Token (PAT) from Hashnode is required. The PAT allows HashTalk to securely access Hashnode data on your behalf, enabling features such as commenting on blogs, liking posts, following authors, and viewing detailed author profiles. Here's how you can create your PAT:

1.  Log in to your Hashnode account.
2.  Navigate to the Developer tab in your dashboard settings.
3.  Follow the instructions to generate a new PAT. Make sure to note down your token securely.
4.  Once you have your PAT, open the HashTalk application. Navigate to the menu, where you'll find an option to enter your Personal Access Token (PAT).
5.  Enter your PAT in the designated field and save it. This step is crucial for enabling all user-specific functionalities within the app, such as commenting on blogs, liking posts, following authors, and accessing detailed author profiles.

Remember, the PAT is essential for HashTalk to interact with Hashnode on your behalf. It's used to authenticate your account and perform actions as per your permissions set within the Hashnode platform. Ensure that you enter the PAT correctly in HashTalk to enjoy a seamless and personalized user experience.

**Please handle your PAT with care and never share it publicly.** The token provides access to your Hashnode account, and its confidentiality should be maintained at all times.

By following these instructions, you'll be equipped to configure HashTalk with your PAT, unlocking the full potential of this innovative chat application to engage with Hashnode blogs more interactively.

## Prerequisites

Before you begin, ensure you have the following installed:

-   Node.js (v14.x or later)
-   npm (v7.x or later)
-   AWS CLI (configured with your credentials)
-   An account on MongoDB, Pinecone, and Hashnode

## Local Setup Instructions

### Environment Variables

1.  Copy the `.env.example` file to a new file named `.env`.
2.  Fill in the environment variables in the `.env` file:
```bash
NEXTAUTH_SECRET=your-nextauth_secret
MONGODB_URI=your-mongodb_uri
RESEND_API_KEY=your-resend_api_key
OPENAI_API_KEY=your-openai_api_key
NEXTAUTH_URL=your-nextauth_url
EMAIL=your-email
NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT=your-next_public_hashnode_gql_endpoint
PINECONE_API_KEY=your-pinecone_api_key
PINECONE_INDEX=your-pinecone_index
PINECONE_ENVIRONMENT=your-pinecone_environment
AWS_ACCESS_KEY_ID=your-aws_access_key_id
AWS_SECRET_ACCESS_KEY=your-aws_secret_access_key
AWS_ACCOUNT=your-aws_account
AWS_REGION=your-aws_region
SQS_CREATE_EMBEDDINGS_QUEUE_URL=your-sqs_create_embeddings_queue_url
SQS_DELETE_EMBEDDINGS_QUEUE_URL=your-sqs_delete_embeddings_queue_url
```
### Pinecone Setup

To enable vector search capabilities in HashTalk, you'll need to set up a Pinecone pod. Pinecone is a vector database that allows you to efficiently search through high-dimensional data, making it ideal for applications like HashTalk that require quick and accurate retrieval of information based on vector embeddings.

1. **Create a Pinecone Account**: If you haven't already, sign up for an account at [Pinecone](https://www.pinecone.io/). Follow the sign-up process, and once your account is set up, you'll be able to access the Pinecone dashboard.

2. **Create a New Pinecone API Key**: In the Pinecone dashboard, navigate to the API keys section and create a new API key. This key will be used by your application to authenticate with Pinecone services.

3. **Set Up Your Pinecone Pod**:
   - In the Pinecone dashboard, go to the "Pods" section and click "Create Pod".
   - Choose a name for your pod, select an index type that best fits your application needs, and configure any other settings as necessary.
   - Once you've configured your pod settings, create the pod. It may take a few moments for the pod to become ready.

4. **Update Your Environment Variables**: After creating your pod, you need to update your `.env` file with the Pinecone API key, the name of your pod (Pinecone Index), and the Pinecone environment URL.

```bash
   PINECONE_API_KEY=your-pinecone_api_key
   PINECONE_INDEX=your-pinecone_index
   PINECONE_ENVIRONMENT=your-pinecone_environment
```


### AWS Setup

1. **Set up the AWS CDK stack** for your project to configure services such as SQS. This step involves deploying resources that your application will use, such as databases, queues, and other AWS services necessary for the operation of your app.

2. **Configure your AWS CLI** if you haven't done so already. Run `aws configure` in your terminal and follow the prompts to input your AWS Access Key ID, Secret Access Key, default region, and output format. This step ensures that your AWS CLI is ready to interact with your AWS account and manage resources.

3. **Deploy your AWS resources** using the AWS CDK. Navigate to the directory containing your CDK code (if separate from your main app codebase) and run:

```bash
   npm run deploy
``` 

This command initiates the deployment of your stack to AWS, creating or updating resources as defined in your CDK application.

4.  **Update your `.env` file with the SQS URL**: After the deployment is complete, AWS CDK will output the URLs for the SQS queues it created (`SQS_CREATE_EMBEDDINGS_QUEUE_URL` and `SQS_DELETE_EMBEDDINGS_QUEUE_URL`). You need to manually update these URLs in your `.env` file to ensure that your application can communicate with the SQS queues:
    ```bash
    SQS_CREATE_EMBEDDINGS_QUEUE_URL=your-sqs_create_embeddings_queue_url
    SQS_DELETE_EMBEDDINGS_QUEUE_URL=your-sqs_delete_embeddings_queue_url
    ```
    This step is crucial for integrating your application with AWS services, as it allows your app to send and receive messages from the queues for processing tasks such as creating or deleting embeddings.
    

Following these steps ensures that your application is properly configured to use AWS services, including SQS queues for managing tasks. Remember to check your AWS CDK output carefully for any additional resources that might require updating environment variables in your `.env` file.

### Generating a NextAuth Secret

Generate a secure secret for NextAuth:
```bash
openssl rand -hex 32
``` 

Copy the output and set it as the value for `NEXTAUTH_SECRET` in your `.env` file.

### Installing Dependencies

Install the required dependencies with npm:
```bash
npm install --legacy-peer-deps
``` 

### Running the Application

To run the application in development mode:
```bash
npm run dev
``` 

For production build and start:
```bash
npm run build
npm run start 
```
### Deploying with AWS CDK

To deploy your infrastructure with AWS CDK:
```bash
npm run deploy
```
Make sure you have configured your AWS credentials and filled in the necessary environment variables related to AWS.

### Email Verification Setup

Configure your email sending service (e.g., Resend) with the `RESEND_API_KEY` to send sign-up verification codes and other notifications.

## Deployment to Vercel

After setting up your environment variables and deploying your AWS infrastructure, you can deploy your Next.js app to Vercel by connecting your GitHub repository to Vercel and setting up the environment variables on Vercel's platform.

## Conclusion

This guide provides the steps needed to set up and deploy the HashTalk app. For further customization and scaling options, refer to the documentation of the respective technologies used (Next.js, MongoDB, Pinecone, AWS CDK, etc.).