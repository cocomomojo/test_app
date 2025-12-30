#!/bin/bash
set -euo pipefail

echo "Create-resources ready.d script starting"

for i in $(seq 1 60); do
  if curl -sS http://localhost:4566/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Creating S3 bucket"

awslocal s3 mb s3://memo-bucket || true

mkdir -p /tmp/localstack-output
cat > /tmp/localstack-output/resources.json <<EOF
{
  "s3_bucket": "memo-bucket"
}
EOF

echo "Created resources:"
echo "  S3 bucket: memo-bucket"