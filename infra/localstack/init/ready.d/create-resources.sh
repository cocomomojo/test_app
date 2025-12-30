#!/bin/bash

set -euo pipefail

echo "Create-resources ready.d script starting"

# When LocalStack runs scripts in ready.d, services should already be available.
# Still, wait a short while for AWS HTTP endpoint responsiveness.
for i in $(seq 1 30); do
  if curl -sS http://localhost:4566/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Creating S3 bucket and Cognito resources via awslocal"

# Create S3 bucket (ignore error if exists)
awslocal s3 mb s3://memo-bucket || true

# Create Cognito User Pool (ignore if already exists)
POOL_ID=$(awslocal cognito-idp create-user-pool --pool-name local-pool --query 'UserPool.Id' --output text || true)

if [ -z "${POOL_ID}" ] || [ "${POOL_ID}" = "null" ]; then
  # try to list first pool
  POOL_ID=$(awslocal cognito-idp list-user-pools --max-results 10 --query 'UserPools[0].Id' --output text || true)
fi

if [ -z "${POOL_ID}" ] || [ "${POOL_ID}" = "null" ]; then
  echo "Failed to determine or create Cognito user pool" >&2
else
  CLIENT_ID=$(awslocal cognito-idp create-user-pool-client --user-pool-id ${POOL_ID} --client-name local-client --query 'UserPoolClient.ClientId' --output text || true)

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
fi
