#!/usr/bin/env bash

export AWS_PROFILE=perfsys


aws cloudformation package --template-file ./setup-quicksight-deployment.yml \
	--output-template-file template.yml \
	--s3-bucket setup-quicksight-deployment


#aws s3 cp ./template.yml s3://cloud-bi-website-cloudformation/

aws cloudformation deploy --template-file ./template.yml \
    --region=us-east-1 \
    --capabilities CAPABILITY_IAM \
    --stack-name setup-quicksight-deployment \


#aws cloudformation describe-stack-events --region us-east-1 --stack-name cloud-bi-website

#aws cloudformation update-stack --stack-name cloud-bi-website \
#    --template-url s3://cloud-bi-website-cloudformation/template.yml
#    --parameters SubDomainNameWithDot=,HostedZoneName=cloud-bi.io.,HostedZoneId=Z2F2G1UIOT465N


