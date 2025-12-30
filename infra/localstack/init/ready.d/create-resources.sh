#!/bin/bash
set -euo pipefail

echo "Create-resources ready.d script starting"

AWS="awslocal"
command -v awslocal >/dev/null 2>&1 || AWS="aws --endpoint-url=http://localhost:4566"

# Wait for LocalStack HTTP
for i in $(seq 1 180); do
  if curl -sS http://localhost:4566/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Wait for Cognito API readiness
for i in $(seq 1 60); do
  if ${AWS} cognito-idp list-user-pools --max-results 1 >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Creating S3 bucket and Cognito resources"

${AWS} s3 mb s3://memo-bucket || true

POOL_ID=$(${AWS} cognito-idp create-user-pool --pool-name local-pool --query 'UserPool.Id' --output text || true)

if [ -z "${POOL_ID}" ] || [ "${POOL_ID}" = "null" ]; then
  POOL_ID=$(${AWS} cognito-idp list-user-pools --max-results 10 --query 'UserPools[0].Id' --output text || true)
fi

if [ -z "${POOL_ID}" ] || [ "${POOL_ID}" = "null" ]; then
  echo "Failed to determine or create Cognito user pool" >&2
else
  CLIENT_ID=$(${AWS} cognito-idp create-user-pool-client --user-pool-id ${POOL_ID} --client-name local-client --query 'UserPoolClient.ClientId' --output text || true)

  ${AWS} cognito-idp admin-create-user --user-pool-id ${POOL_ID} --username testuser --user-attributes Name=email,Value=test@example.com || true
  ${AWS} cognito-idp admin-set-user-password --user-pool-id ${POOL_ID} --username testuser --password Test1234! --permanent || true

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