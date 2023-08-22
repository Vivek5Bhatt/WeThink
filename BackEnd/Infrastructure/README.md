# Infrastructure Scripts
This folder contains the infrastructure Scripts to setup the WeThink Platform in the AWS Cloud.

## Documentation

https://docs.google.com/document/d/1aPvhrlAAhOOupmrJoA7G4Isjg-gXZFONN0u_Yw4IplM

## Prerequisites
In order for Terraform to work as expected, there should be some resources and configurations previous to run the scripts.

* An S3 BUCKET created in the `us-east-1` region with the name `wethink-terraform-state`. to store the terraform state in
* AWS KEYS of a user with ADMIN permissions to be used by Terraform. This are currently being loaded as env variables in bitbucket pipelines, of an specific created AWS IAM User `Terraform`

## Usage
In the root path of this repository there's the bitbucket configuration pipeline (`bitbucket-pipeline.yml`) which configures the automated pipelines to execute the
terraform scripts into the different environments.
It's configured to *execute the following steps upon commiting to any branch* :

* Build the Lambdas located under the `src` subfolders and create the artifacts.
* Run Terraform plan in DEV environment.
* Run Terraform plan in PRD environment.

*If its executed in master branch*, it will also add a manual step to run the *Terraform apply* in any of the two environemnts.

The approach should be:

* Execute changes in Terraform in a branch for Development.
* Commit and check the Terraform plan outputed in the pipeline.
* If ok, push to master and execute manually the Terraform Apply step for DEV.
* Repeat process (3 previous steps) for PRD environment.

## Structure
The Repository is structured in folders as follows:

* `env` folder contains a folder with the Terraform code for each of the envs. Currently `env/dev` and `env/prod`.
* `env/dev` contains an extra file `pre-dev.tf` which deploys an extra RDS Database in the public subnets of DEV VPC to be accessed by Developers, this is not connected to any other resource in the VPC, only for remote Developer access/testing.
* `env/prd` contains an extra file `users-iam.tf` which defines the users AWS IAM Groups and attaches the permissions to each group and users.
* `files` folder contains the different files in use by Terraform, such as `buildspecs` for defining the CI steps for each of the apps, `policies` templates of IAM policies to grant permissions, `user_data` EC2 init scripts for instances startup configurations
* `modules` folder contains the custom modules developed for this project, those will be referenced from within each of the env code
* `src` folder contains the src code for the lambdas, that will be builded as part of the CI pipeline and later use the created Artifact by Terraform
* `bitbucket-pipeline.yml` contains the bitbucket pipeline configuration

## Common tasks

* *Update Security Groups whitelisted Users IPs* : If a user IP changes and the Security Groups rules need to be update to reflect that change, one can follow the Workflow procedure explained at the Usage Section and update them, by previously changing the line. For example, to change the IP for the pre-dev RDS database access, refer to the file `env/dev/variables.tf` and update the `user_public_ip_<name>` varible default value with the following value `[<new_ip>/32]`.

## Known Issues
* Lambda Changes: each time the pipeline is run for either plan or apply, it could show that will update the Lambda functions even thought no changes have been performed. This is expected due to the way the Terraform module works, and that we build and zip each lambda for every Terraform plan/apply. Should be safe to proceed with the Terraform plan/apply.
