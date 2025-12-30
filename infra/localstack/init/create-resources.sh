#!/bin/bash

set -euo pipefail

echo "Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/health | grep "running" >/dev/null 2>&1; do
  sleep 1
done

echo "Creating S3 bucket and Cognito resources via awslocal"

# Create S3 bucket
awslocal s3 mb s3://memo-bucket || true

# Create Cognito User Pool
POOL_ID=$(awslocal cognito-idp create-user-pool --pool-name local-pool --query 'UserPool.Id' --output text)

# Create User Pool Client
CLIENT_ID=$(awslocal cognito-idp create-user-pool-client --user-pool-id ${POOL_ID} --client-name local-client --query 'UserPoolClient.ClientId' --output text)

# Create test user
awslocal cognito-idp admin-create-user --user-pool-id ${POOL_ID} --username testuser --user-attributes Name=email,Value=test@example.com || true
awslocal cognito-idp admin-set-user-password --user-pool-id ${POOL_ID} --username testuser --password Test1234! --permanent || true

mkdir -p /tmp/localstack-output
cat > /tmp/localstack-output/resources.json <<EOF
{
  "s3_bucket": "memo-bucket",
  "cognito": {
    "userPoolId": "${POOL_ID}",
    "clientId": "${CLIENT_ID}"
  }
}
EOF

echo "Created resources:"
echo "  S3 bucket: memo-bucket"
echo "  Cognito userPoolId: ${POOL_ID}"
echo "  Cognito clientId: ${CLIENT_ID}"
