#!/usr/bin/env bash

export AWS_PROFILE=perfsys

aws cloudformation deploy --template-file ./setup-quicksight-deployment.yml \
    --region=us-east-1 \
    --stack-name setup-quicksight-deployment
