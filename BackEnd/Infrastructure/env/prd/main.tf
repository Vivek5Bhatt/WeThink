provider "aws" {
  region = "us-east-1"

  allowed_account_ids = var.allowed_account_ids

  default_tags {
    tags = {
      Terraform   = "true"
      Environment = "prd"
      Project     = "wethink"
    }
  }
}

terraform {
  required_version = "~> 1.3.3"

  backend "s3" {
    bucket  = "wethink-terraform-state"
    region  = "us-east-1"
    key     = "prd/terraform.tfstate"
    encrypt = true
    acl     = "bucket-owner-full-control"
    #dynamodb_table = "wethink-terraform-state-prd-lock"
  }
}

locals {
  name = "${var.project}-${var.env}"
}

data "aws_region" "current" {}

resource "aws_ssm_parameter" "mobile-app-api-aws-region" {
  name        = "/${local.name}/mobile-app-api/AWS_REGION"
  description = ""
  type        = "String"
  value       = data.aws_region.current.name
}
resource "aws_ssm_parameter" "admin-panel-api-aws-region" {
  name        = "/${local.name}/admin-panel-api/AWS_REGION"
  description = ""
  type        = "String"
  value       = data.aws_region.current.name
}

# Route53  NS and Public Hosted Zone
resource "aws_route53_delegation_set" "main" {
  reference_name = "GoogleDNS"
}

resource "aws_route53_zone" "wethink" {
  name              = var.domain
  delegation_set_id = aws_route53_delegation_set.main.id

  tags = merge(
    {
      "Name" = local.name
    },
    var.tags,
  )
}

#================
# VPC
#================

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 3.0"

  name = local.name
  cidr = "10.8.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.8.0.0/20", "10.8.32.0/20", "10.8.64.0/20"]
  public_subnets  = ["10.8.128.0/20", "10.8.160.0/20", "10.8.192.0/20"]

  private_subnet_suffix = "priv"
  public_subnet_suffix  = "pub"

  enable_nat_gateway = true
  single_nat_gateway = true

  enable_vpn_gateway = false

  tags = var.tags
}

# VPC Endpoints for S3
module "vpc_endpoints" {
  source = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"

  vpc_id = module.vpc.vpc_id

  endpoints = {
    s3 = {
      service         = "s3"
      service_type    = "Gateway"
      route_table_ids = flatten([module.vpc.intra_route_table_ids, module.vpc.private_route_table_ids, module.vpc.public_route_table_ids])
      tags            = { Name = "${local.name}-s3" }
    }
  }
  tags = var.tags
}


#==================
# RDS - DATABASE
#==================

# RDS DB SUBNET GROUP
resource "aws_db_subnet_group" "this" {
  name       = local.name
  subnet_ids = module.vpc.private_subnets
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name        = "${local.name}-rds"
  description = "${local.name} Filters Database Traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    description = "PostgreSQL access from SGs of internal VPC resources"
    security_groups = [
      aws_security_group.node.id,
      aws_security_group.lambda_dbSyncVideoTranscoderFunction.id,
      aws_security_group.lambda_s3VideoTriggerForTranscoding.id,
      aws_security_group.lambda_sendPollNotification.id,
      module.mobile-app-api.codebuild_sg_id,
      module.admin-panel-api.codebuild_sg_id
    ]
  }

  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    description = "PostgreSQL access to within VPC CIDR Block"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  tags = merge(
    {
      "Name" = "${local.name}-rds"
    },
    var.tags,
  )
}

# RDS Postgresql module

module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier        = local.name
  apply_immediately = true

  engine                = "postgres"
  engine_version        = "12.11"
  instance_class        = "db.t3.medium"
  allocated_storage     = 20
  max_allocated_storage = 100

  username = "postgres" #"user_pg"
  port     = "5432"

  vpc_security_group_ids = [aws_security_group.rds.id]

  maintenance_window      = "Mon:00:00-Mon:03:00"
  backup_window           = "03:00-06:00"
  backup_retention_period = 7

  db_subnet_group_name = aws_db_subnet_group.this.name

  # DB parameter group
  family = "postgres12"

  # DB option group
  major_engine_version = "12"

  skip_final_snapshot = true
  snapshot_identifier = "updated-wethink-prd"

  # Encryption not suported
  storage_encrypted = false

  # logs
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  create_cloudwatch_log_group     = true

  #performance_insights_enabled          = true
  #performance_insights_retention_period = 7
  #create_monitoring_role                = true
  #monitoring_interval                   = 60
  #monitoring_role_name                  = "${local.name}rds-monitoring"
  #monitoring_role_description           = "${local.name} rds monitoring Role"

  tags = merge(
    {
      "Name" = local.name
    },
    var.tags,
  )
}

# RDS ParameterStore values
resource "aws_ssm_parameter" "mobile-app-api-host" {
  name        = "/${local.name}/mobile-app-api/DB_HOST"
  description = ""
  type        = "String"
  value       = module.db.db_instance_address
  tags = merge(
    {
      "Application" = "mobile-app-api"
    },
    var.tags,
  )
}

resource "aws_ssm_parameter" "mobile-app-api-port" {
  name        = "/${local.name}/mobile-app-api/DB_PORT"
  description = ""
  type        = "String"
  value       = module.db.db_instance_port
  tags = merge(
    {
      "Application" = "mobile-app-api"
    },
    var.tags,
  )
}

resource "aws_ssm_parameter" "admin-panel-api-host" {
  name        = "/${local.name}/admin-panel-api/DB_HOST"
  description = ""
  type        = "String"
  value       = module.db.db_instance_address
  tags = merge(
    {
      "Application" = "admin-panel-api"
    },
    var.tags,
  )
}

resource "aws_ssm_parameter" "admin-panel-api-port" {
  name        = "/${local.name}/admin-panel-api/DB_PORT"
  description = ""
  type        = "String"
  value       = module.db.db_instance_port
  tags = merge(
    {
      "Application" = "admin-panel-api"
    },
    var.tags,
  )
}

resource "aws_ssm_parameter" "lambda-db-user" {
  name        = "/${local.name}/lambda/DB_USER"
  description = ""
  type        = "String"
  value       = "wethink_prod"
  tags = merge(
    {
      "Application" = "lambda"
    },
    var.tags,
  )
}


#==========================
# IAM Policies for APPS
#==========================
module "iam_policy_s3" {
  source = "terraform-aws-modules/iam/aws//modules/iam-policy"

  name        = "${local.name}-AmazonS3EC2"
  path        = "/"
  description = "Policy to allow S3 Access to EC2 instances in ${local.name}"

  policy = templatefile("../../files/policies/AmazonS3EC2.json", {
    codepipeline_bucket_arn    = module.codepipeline_bucket.s3_bucket_arn,
    main_bucket_arn            = module.main_bucket.s3_bucket_arn,
    document_bucket_arn        = module.document_bucket.s3_bucket_arn,
    images_bucket_arn          = module.images_bucket.s3_bucket_arn,
    transcoded_bucket_arn      = module.transcoded_bucket.s3_bucket_arn,
    video_thumbnail_bucket_arn = module.video_thumbnail_bucket.s3_bucket_arn
  })
}

module "iam_policy_cloudwatch" {
  source = "terraform-aws-modules/iam/aws//modules/iam-policy"

  name        = "${local.name}-AmazonCloudWatchEC2"
  path        = "/"
  description = "Policy to allow Cloudwatch logs operations in EC2 instances on ${local.name}"

  policy = templatefile("../../files/policies/AmazonCloudWatchEC2.json", {})

}

module "iam_policy_parameterstore" {
  source = "terraform-aws-modules/iam/aws//modules/iam-policy"

  name        = "${local.name}-AmazonParameterStore"
  path        = "/"
  description = "Policy to allow EC2 instances to retrieve ParameterStore values on ${local.name}"

  policy = templatefile("../../files/policies/AmazonParameterStore.json", { region = data.aws_region.current.name, acc_id = var.allowed_account_ids[0], name = local.name })
}

module "iam_policy_stepfunction" {
  source = "terraform-aws-modules/iam/aws//modules/iam-policy"

  name        = "${local.name}-AmazonStepFunction"
  path        = "/"
  description = "Policy to allow EC2 instances to execute State Machines in ${local.name}"

  policy = templatefile("../../files/policies/AmazonStepFunctionsEC2.json", { region = data.aws_region.current.name, acc_id = var.allowed_account_ids[0], name = local.name })
}

#============================
# ASG / ALB - Module NodeJS
#============================
module "asg-node" {
  source = "terraform-aws-modules/autoscaling/aws"

  name = "${local.name}-node"

  image_id        = "ami-0b51ad78af849f718"
  instance_type   = "t3.small"
  security_groups = [aws_security_group.node.id]

  vpc_zone_identifier       = module.vpc.private_subnets
  health_check_type         = "ELB"
  min_size                  = 1
  max_size                  = 5
  desired_capacity          = 1
  wait_for_capacity_timeout = 0

  target_group_arns = module.alb-node.target_group_arns

  # IAM role & instance profile
  create_iam_instance_profile = true
  iam_role_name               = "${local.name}-node"
  iam_role_path               = "/ec2/"
  iam_role_description        = "${local.name}-node IAM role for EC2 instances"
  iam_role_tags = {
    CustomIamRole = "Yes"
  }
  iam_role_policies = {
    AmazonSSMManagedInstanceCore = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
    CloudWatchAgentServerPolicy  = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
    AmazonElasticTranscoder_JobsSubmitter = "arn:aws:iam::aws:policy/AmazonElasticTranscoder_JobsSubmitter"
  }

  scaling_policies = {
    avg-cpu-policy-greater-than-70 = {
      policy_type               = "TargetTrackingScaling"
      estimated_instance_warmup = 300
      target_tracking_configuration = {
        predefined_metric_specification = {
          predefined_metric_type = "ASGAverageCPUUtilization"
        }
        target_value = 70.0
      }
    }
  }

  tags = merge(
    {
      "Name"        = "${local.name}-node",
      "Application" = "NodeJS",
    },
    var.tags,
  )

}

module "alb-node" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 6.0"

  name = "${local.name}-node"

  load_balancer_type = "application"

  vpc_id          = module.vpc.vpc_id
  subnets         = module.vpc.public_subnets
  security_groups = [aws_security_group.alb-node.id]

  target_groups = [
    {
      name             = "${local.name}-node"
      backend_protocol = "HTTP"
      backend_port     = 80
      target_type      = "instance"
      health_check = {
        enabled             = true
        interval            = 30
        path                = "/we-think/v1/api/mobile/healthcheck" # only checking we-think app
        port                = "traffic-port"
        healthy_threshold   = 3
        unhealthy_threshold = 3
        timeout             = 6
        protocol            = "HTTP"
        matcher             = "200-399"
      }
    }
  ]

  https_listeners = [
    {
      port               = 443
      protocol           = "HTTPS"
      certificate_arn    = module.acm.acm_certificate_arn
      target_group_index = 0
    }
  ]

  http_tcp_listeners = [
    {
      port        = 80
      protocol    = "HTTP"
      action_type = "redirect"
      redirect = {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  ]


  tags = merge(
    {
      "Name"        = "${local.name}-node",
      "Application" = "NodeJS",
    },
    var.tags,
  )
}


## Attach IAM Policy for S3 to IAM Role for EC2
resource "aws_iam_role_policy_attachment" "s3_ec2_node" {
  role       = module.asg-node.iam_role_name
  policy_arn = module.iam_policy_s3.arn
}

## Attach IAM Policy for Cloudwatch to IAM Role for EC2
resource "aws_iam_role_policy_attachment" "cloudwatch_ec2_node" {
  role       = module.asg-node.iam_role_name
  policy_arn = module.iam_policy_cloudwatch.arn
}

## Attach IAM Policy for ParameterStore to IAM Role for EC2
resource "aws_iam_role_policy_attachment" "parameterstore_ec2_node" {
  role       = module.asg-node.iam_role_name
  policy_arn = module.iam_policy_parameterstore.arn
}

## Attach IAM Policy for Step Functions to IAM Role for EC2
resource "aws_iam_role_policy_attachment" "stepfunction_ec2_node" {
  role       = module.asg-node.iam_role_name
  policy_arn = module.iam_policy_stepfunction.arn
}

# SG - Nodejs
resource "aws_security_group" "node" {
  name        = "${local.name}-node"
  description = "${local.name} Node ec2 instances SG"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "HTTP from ALB Node"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb-node.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(
    {
      "Name"        = "${local.name}-node",
      "Application" = "NodeJS",
    },
    var.tags,
  )
}


resource "aws_security_group" "alb-node" {
  name        = "${local.name}-node-alb"
  description = "${local.name} Node ALB SG"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description      = "HTTPS from Everywhere"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "HTTP from Everywhere to redirect on ALB"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(
    {
      "Name"        = "${local.name}-node-alb",
      "Application" = "NodeJS",
    },
    var.tags,
  )
}


#=======================
# ASG - Module Angular
#=======================
module "asg-angular" {
  source = "terraform-aws-modules/autoscaling/aws"

  name = "${local.name}-angular"

  image_id        = "ami-0830034dd469b7d29"
  instance_type   = "t3.small"
  security_groups = [aws_security_group.angular.id]

  vpc_zone_identifier       = module.vpc.private_subnets
  health_check_type         = "ELB"
  min_size                  = 1
  max_size                  = 5
  desired_capacity          = 1
  wait_for_capacity_timeout = 0

  target_group_arns = module.alb-angular.target_group_arns

  # IAM role & instance profile
  create_iam_instance_profile = true
  iam_role_name               = "${local.name}-angular"
  iam_role_path               = "/ec2/"
  iam_role_description        = "${local.name}-angular IAM role for EC2 instances"
  iam_role_tags = {
    CustomIamRole = "Yes"
  }
  iam_role_policies = {
    AmazonSSMManagedInstanceCore = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
    CloudWatchAgentServerPolicy  = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  }

  scaling_policies = {
    avg-cpu-policy-greater-than-70 = {
      policy_type               = "TargetTrackingScaling"
      estimated_instance_warmup = 300
      target_tracking_configuration = {
        predefined_metric_specification = {
          predefined_metric_type = "ASGAverageCPUUtilization"
        }
        target_value = 70.0
      }
    }
  }

  tags = merge(
    {
      "Name"        = "${local.name}-angular",
      "Application" = "Angular",
    },
    var.tags,
  )

}

module "alb-angular" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 6.0"

  name = "${local.name}-angular"

  load_balancer_type = "application"

  vpc_id          = module.vpc.vpc_id
  subnets         = module.vpc.public_subnets
  security_groups = [aws_security_group.alb-angular.id]

  target_groups = [
    {
      name             = "${local.name}-angular"
      backend_protocol = "HTTP"
      backend_port     = 80
      target_type      = "instance"
      stickiness = {
        enabled = true
        type    = "lb_cookie"
      }
    }
  ]

  https_listeners = [
    {
      port               = 443
      protocol           = "HTTPS"
      certificate_arn    = module.acm.acm_certificate_arn
      target_group_index = 0
    }
  ]

  http_tcp_listeners = [
    {
      port        = 80
      protocol    = "HTTP"
      action_type = "redirect"
      redirect = {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  ]


  tags = merge(
    {
      "Name"        = "${local.name}-angular",
      "Application" = "Angular",
    },
    var.tags,
  )
}


## Attach IAM Policy for S3 to IAM Role for EC2
resource "aws_iam_role_policy_attachment" "s3_ec2_angular" {
  role       = module.asg-angular.iam_role_name
  policy_arn = module.iam_policy_s3.arn
}

## Attach IAM Policy for Cloudwatch to IAM Role for EC2
resource "aws_iam_role_policy_attachment" "cloudwatch_ec2_angular" {
  role       = module.asg-angular.iam_role_name
  policy_arn = module.iam_policy_cloudwatch.arn
}

## Attach IAM Policy for ParameterStore to IAM Role for EC2
resource "aws_iam_role_policy_attachment" "parameterstore_ec2_angular" {
  role       = module.asg-angular.iam_role_name
  policy_arn = module.iam_policy_parameterstore.arn
}

# SG - Angular
resource "aws_security_group" "angular" {
  name        = "${local.name}-angular"
  description = "${local.name} Angular ec2 instances SG"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "HTTP from ALB ANGULAR"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb-angular.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(
    {
      "Name"        = "${local.name}-angular",
      "Application" = "Angular",
    },
    var.tags,
  )
}

resource "aws_security_group" "alb-angular" {
  name        = "${local.name}-angular-alb"
  description = "${local.name} Angular ALB SG"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description      = "HTTPS from Everywhere"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "HTTP from Everywhere to redirect on ALB"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(
    {
      "Name"        = "${local.name}-angular-alb",
      "Application" = "NodeJS",
    },
    var.tags,
  )
}

#====================================================================
# ACM - Certificate creation and validation (DNS) for ALB HTTPS
#====================================================================
module "acm" {
  source      = "terraform-aws-modules/acm/aws"
  version     = "~> 4.0"
  domain_name = var.domain
  zone_id     = aws_route53_zone.wethink.zone_id
  subject_alternative_names = [
    "*.${var.domain}",
    "cloud.console.${var.domain}",
    "dev.cloud.${var.domain}"
  ]

  wait_for_validation = false
  tags = merge(
    {
      "Name" = local.name
    },
    var.tags,
  )
}


#=========================================
# Lambda - dbSyncVideoTranscoderFunction
#=========================================

## Password Created manually and retrieved with TF
data "aws_ssm_parameter" "db-user-password" {
  name = "/${local.name}/lambda/DB_PASSWORD"
}

module "lambda_s3VideoTriggerForTranscoding" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "${local.name}-s3VideoTriggerForTranscoding"
  description   = "s3 Video triggered Transcoder Function"
  handler       = "index.handler"
  runtime       = "nodejs14.x"

  # Check Specific permissions needed after creation

  create_package                          = false
  create_current_version_allowed_triggers = false
  local_existing_package                  = "../../src/s3VideoTriggerForTranscoding/artifact.zip"

  cloudwatch_logs_retention_in_days = 30

  vpc_subnet_ids         = module.vpc.private_subnets
  vpc_security_group_ids = [aws_security_group.lambda_s3VideoTriggerForTranscoding.id]

  attach_policy = true
  policy        = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  allowed_triggers = {
    s3 = {
      service    = "s3"
      source_arn = "arn:aws:s3:::${local.name}"
    }
  }

  environment_variables = {
    AWS_PIPELINE_ID         = "1615867094742-hquard"
    AWS_TRANSCODER_BUCKET   = module.transcoded_bucket.s3_bucket_id
    BUCKET_NAME             = module.main_bucket.s3_bucket_id
    DB_DATABASE             = local.name
    DB_HOST                 = module.db.db_instance_address
    DB_PASSWORD             = data.aws_ssm_parameter.db-user-password.value
    DB_PORT                 = module.db.db_instance_port
    DB_SYNC_LAMBDA_FUNCTION = "${local.name}-dbSyncVideoTranscoderFunction"
    DB_USER                 = aws_ssm_parameter.lambda-db-user.value
    LAMBDA_REGION           = data.aws_region.current.name
    TRANSCODER_REGION       = data.aws_region.current.name
  }

  tags = merge(
    {
      "Name"        = "${local.name}-s3VideoTriggerForTranscoding",
      "Application" = "s3VideoTriggerForTranscoding",
    },
    var.tags,
  )
}

# SG - dbSyncVideoTranscoderFunction
resource "aws_security_group" "lambda_s3VideoTriggerForTranscoding" {
  name        = "${local.name}-lambda-s3VideoTriggerForTranscoding"
  description = "${local.name} Filters Traffic for lambda Function s3VideoTriggerForTranscoding"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "Traffic from VPC Range"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(
    {
      "Name" = "${local.name}-lambda-s3VideoTriggerForTranscoding"
    },
    var.tags,
  )
}

# Notification for Lambda from s3 bucket
resource "aws_s3_bucket_notification" "lambda_s3VideoTriggerForTranscoding" {
  bucket = local.name

  lambda_function {
    lambda_function_arn = module.lambda_s3VideoTriggerForTranscoding.lambda_function_arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [module.lambda_s3VideoTriggerForTranscoding]
}

#=========================================
# Lambda - dbSyncVideoTranscoderFunction
#=========================================

module "lambda_dbSyncVideoTranscoderFunction" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "${local.name}-dbSyncVideoTranscoderFunction"
  description   = "DB Sync Video Transcoder Function"
  handler       = "index.handler"
  runtime       = "nodejs14.x"

  # Check Specific permissions needed after creation

  create_package                          = false
  create_current_version_allowed_triggers = false
  local_existing_package                  = "../../src/dbSyncVideoTranscoderFunction/artifact.zip"

  cloudwatch_logs_retention_in_days = 30

  vpc_subnet_ids         = module.vpc.private_subnets
  vpc_security_group_ids = [aws_security_group.lambda_dbSyncVideoTranscoderFunction.id]

  attach_policy = true
  policy        = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"

  environment_variables = {
    DB_DATABASE  = local.name
    DB_HOST      = module.db.db_instance_address
    DB_PASSWORD  = data.aws_ssm_parameter.db-user-password.value
    DB_PORT      = module.db.db_instance_port
    DB_USER      = aws_ssm_parameter.lambda-db-user.value
    FIREBASE_KEY = data.aws_ssm_parameter.lambda-firebase-key.value
  }

  tags = merge(
    {
      "Name"        = "${local.name}-dbSyncVideoTranscoderFunction",
      "Application" = "dbSyncVideoTranscoderFunction",
    },
    var.tags,
  )
}

# SG - dbSyncVideoTranscoderFunction
resource "aws_security_group" "lambda_dbSyncVideoTranscoderFunction" {
  name        = "${local.name}-lambda-dbSyncVideoTranscoderFunction"
  description = "${local.name} Filters Traffic for lambda Function dbSyncVideoTranscoderFunction"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "Traffic from VPC Range"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(
    {
      "Name" = "${local.name}-lambda-dbSyncVideoTranscoderFunction"
    },
    var.tags,
  )
}

## Key Created manually and retrieved with TF
data "aws_ssm_parameter" "lambda-firebase-key" {
  name = "/${local.name}/lambda/FIREBASE_KEY"
}


#=========================================
# Lambda - sendPollNotification
#=========================================

module "lambda_sendPollNotification" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "${local.name}-sendPollNotification"
  description   = "Send Poll Notification Function"
  handler       = "index.handler"
  runtime       = "nodejs14.x"

  # Check Specific permissions needed after creation

  create_package                          = false
  create_current_version_allowed_triggers = false
  local_existing_package                  = "../../src/sendPollNotification/artifact.zip"

  cloudwatch_logs_retention_in_days = 30

  vpc_subnet_ids         = module.vpc.private_subnets
  vpc_security_group_ids = [aws_security_group.lambda_sendPollNotification.id]

  attach_policy = true
  policy        = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"

  environment_variables = {
    DB_DATABASE  = local.name
    DB_HOST      = module.db.db_instance_address
    DB_PASSWORD  = data.aws_ssm_parameter.db-user-password.value
    DB_PORT      = module.db.db_instance_port
    DB_USER      = aws_ssm_parameter.lambda-db-user.value
    FIREBASE_KEY = data.aws_ssm_parameter.lambda-firebase-key.value
  }

  tags = merge(
    {
      "Name"        = "${local.name}-sendPollNotification",
      "Application" = "sendPollNotification",
    },
    var.tags,
  )
}

# SG - sendPollNotification
resource "aws_security_group" "lambda_sendPollNotification" {
  name        = "${local.name}-lambda-sendPollNotification"
  description = "${local.name} Filters Traffic for lambda Function sendPollNotification"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "Traffic from VPC Range"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(
    {
      "Name" = "${local.name}-lambda-sendPollNotification"
    },
    var.tags,
  )
}

#=================================
# Transcoding Pipeline for videos
#=================================

resource "aws_elastictranscoder_pipeline" "this" {
  input_bucket = module.main_bucket.s3_bucket_id
  name         = "${local.name}-videos"
  role         = aws_iam_role.transcoder.arn

  content_config {
    bucket        = module.transcoded_bucket.s3_bucket_id
    storage_class = "Standard"
  }
  content_config_permissions {
    access = ["Read","ReadAcp"]
    grantee = "AllUsers"
    grantee_type = "Group"
  }

  thumbnail_config {
    bucket        = module.transcoded_bucket.s3_bucket_id
    storage_class = "Standard"
  }
}
# IAM role for Transcoder
resource "aws_iam_role" "transcoder" {
  name  = "${local.name}-transcoder-videos"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "elastictranscoder.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
  tags = merge(
    {
      "Name" = "${local.name}-transcoder-videos"
    },
    var.tags,
  )
}
# Attach IAM Policy for Elastic transcoder to Role
resource "aws_iam_role_policy_attachment" "elastictranscoder_videos" {
  role       = aws_iam_role.transcoder.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonElasticTranscoderRole"
}

resource "aws_ssm_parameter" "elastictranscoder_pipeline_id" {
  name        = "/${local.name}/mobile-app-api/AWS_PIPELINE_ID"
  description = ""
  type        = "String"
  value       = aws_elastictranscoder_pipeline.this.id
  tags = merge(
    {
      "Application" = "mobile-app-api"
    },
    var.tags,
  )
}

#=================================
# CodePipeline + CodeDeploy
#=================================


# S3 bucket to store Codepipeline Artifacts and zip releases
module "codepipeline_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket                  = "${local.name}-codepipeline"
  acl                     = "private"
  block_public_policy     = true
  block_public_acls       = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  versioning = {
    enabled = true
  }

  tags = merge(
    {
      "Name" = "${local.name}-codepipeline"
    },
    var.tags,
  )
}

# module admin-panel-api
module "admin-panel-api" {
  source = "../../modules/tf-aws-codedeploy-codepipeline"

  env = var.env
  app = "admin-panel-api"

  account_id = var.allowed_account_ids[0]
  region     = data.aws_region.current.name

  asg_group_name              = [module.asg-node.autoscaling_group_name]
  s3_codepipeline_bucket_name = module.codepipeline_bucket.s3_bucket_id
  codestar_connection_arn     = var.codestar_connection_arn
  pipeline_repository_id      = "mmoirano/wethink_admin_panel_api"

  codebuild_buildspec = templatefile("../../files/buildspecs/admin-panel-api_buildspec.yml", { APP_ENV = local.name })
  vpc_id              = module.vpc.vpc_id
  vpc_subnets_private = module.vpc.private_subnets

  pipeline_approval_step = true

  tags = merge(
    {
      "Application" = "admin-panel-api",
    },
    var.tags,
  )
}

# module Admin Panel
module "admin-panel" {
  source = "../../modules/tf-aws-codedeploy-codepipeline"

  env = var.env
  app = "admin-panel"

  account_id = var.allowed_account_ids[0]
  region     = data.aws_region.current.name

  asg_group_name              = [module.asg-angular.autoscaling_group_name]
  s3_codepipeline_bucket_name = module.codepipeline_bucket.s3_bucket_id
  codebuild_base_image        = "aws/codebuild/standard:5.0"
  codestar_connection_arn     = var.codestar_connection_arn
  pipeline_repository_id      = "mmoirano/wethink_admin_panel"

  codebuild_buildspec = templatefile("../../files/buildspecs/admin-panel_buildspec.yml", { APP_ENV = local.name })
  vpc_id              = module.vpc.vpc_id
  vpc_subnets_private = module.vpc.private_subnets

  pipeline_approval_step = true

  tags = merge(
    {
      "Application" = "admin-panel",
    },
    var.tags,
  )
}

# module Mobile App Api
module "mobile-app-api" {
  source = "../../modules/tf-aws-codedeploy-codepipeline"

  env = var.env
  app = "mobile-app-api"

  account_id = var.allowed_account_ids[0]
  region     = data.aws_region.current.name

  asg_group_name              = [module.asg-node.autoscaling_group_name]
  s3_codepipeline_bucket_name = module.codepipeline_bucket.s3_bucket_id
  codestar_connection_arn     = var.codestar_connection_arn
  pipeline_repository_id      = "mmoirano/wethink_mobile_app_api"

  codebuild_buildspec = templatefile("../../files/buildspecs/mobile-app-api_buildspec.yml", { APP_ENV = local.name })
  vpc_id              = module.vpc.vpc_id
  vpc_subnets_private = module.vpc.private_subnets

  pipeline_approval_step = true

  tags = merge(
    {
      "Application" = "mobile-app-api",
    },
    var.tags,
  )
}

#==============
# S3 Buckets
#==============
module "main_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = local.name
  acl    = "private"

  versioning = {
    enabled = true
  }

  tags = merge(
    {
      "Name" = local.name
    },
    var.tags,
  )
}

# Store main bucket name for admin-panel-api
resource "aws_ssm_parameter" "admin-panel-api-main_bucket" {
  name        = "/${local.name}/admin-panel-api/USER_BUCKET_NAME"
  description = ""
  type        = "String"
  value       = module.main_bucket.s3_bucket_id
  tags = merge(
    {
      "Application" = "admin-panel-api"
    },
    var.tags,
  )
}

# Store main bucket name for mobile-app-api
resource "aws_ssm_parameter" "mobile-app-api-main_bucket" {
  name        = "/${local.name}/mobile-app-api/USER_BUCKET_NAME"
  description = ""
  type        = "String"
  value       = module.main_bucket.s3_bucket_id
  tags = merge(
    {
      "Application" = "mobile-app-api"
    },
    var.tags,
  )
}


module "document_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket                  = "${local.name}-document"
  acl                     = "private"
  block_public_policy     = true
  block_public_acls       = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  cors_rule = [
    {
      allowed_methods = ["GET"]
      allowed_origins = ["*"]
    }
  ]

  tags = merge(
    {
      "Name" = "${local.name}-document"
    },
    var.tags,
  )
}

# Store document bucket name for admin-panel-api
resource "aws_ssm_parameter" "admin-panel-api-document_bucket" {
  name        = "/${local.name}/admin-panel-api/DOCUMENT_BUCKET_NAME"
  description = ""
  type        = "String"
  value       = module.document_bucket.s3_bucket_id
  tags = merge(
    {
      "Application" = "admin-panel-api"
    },
    var.tags,
  )
}

# Store document bucket name for mobile-app-api
resource "aws_ssm_parameter" "mobile-app-api-document_bucket" {
  name        = "/${local.name}/mobile-app-api/DOCUMENT_BUCKET_NAME"
  description = ""
  type        = "String"
  value       = module.document_bucket.s3_bucket_id
  tags = merge(
    {
      "Application" = "mobile-app-api"
    },
    var.tags,
  )
}

module "images_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "${local.name}-images"

  tags = merge(
    {
      "Name" = "${local.name}-images"
    },
    var.tags,
  )
}

# Store images bucket name for mobile-app-api
resource "aws_ssm_parameter" "mobile-app-api-images_bucket" {
  name        = "/${local.name}/mobile-app-api/IMAGE_BUCKET_NAME"
  description = ""
  type        = "String"
  value       = module.images_bucket.s3_bucket_id
  tags = merge(
    {
      "Application" = "mobile-app-api"
    },
    var.tags,
  )
}

module "transcoded_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "${local.name}-transcoded"

  versioning = {
    enabled = true
  }

  tags = merge(
    {
      "Name" = "${local.name}-transcoded"
    },
    var.tags,
  )
}

# Store transcoded bucket name for mobile-app-api
resource "aws_ssm_parameter" "mobile-app-api-transcoded_bucket" {
  name        = "/${local.name}/mobile-app-api/AWS_TRANSCODER_BUCKET"
  description = ""
  type        = "String"
  value       = module.transcoded_bucket.s3_bucket_id
  tags = merge(
    {
      "Application" = "mobile-app-api"
    },
    var.tags,
  )
}
# Store transcoded bucket region for mobile-app-api
resource "aws_ssm_parameter" "mobile-app-api-transcoded_region" {
  name        = "/${local.name}/mobile-app-api/TRANSCODER_REGION"
  description = ""
  type        = "String"
  value       = data.aws_region.current.name
  tags = merge(
    {
      "Application" = "mobile-app-api"
    },
    var.tags,
  )
}


module "video_thumbnail_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "${local.name}-video-thumbnail"

  tags = merge(
    {
      "Name" = "${local.name}-video-thumbnail"
    },
    var.tags,
  )
}

#==========================================
# Step Function - Send-Poll-notification
#==========================================
module "send-poll-notification" {
  source = "terraform-aws-modules/step-functions/aws"

  name       = "${local.name}-send-poll-notification"
  definition = <<EOF
{
  "Comment": "This is for ${local.name} sending poll notification via lambda",
  "StartAt": "Wait",
  "States": {
    "Wait": {
      "Type": "Wait",
      "TimestampPath": "$.dueDate",
      "Next": "Lambda Invoke"
    },
    "Lambda Invoke": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "OutputPath": "$.Payload",
      "Parameters": {
        "Payload.$": "$",
        "FunctionName": "${module.lambda_sendPollNotification.lambda_function_arn}:$LATEST"
      },
      "Retry": [
        {
          "ErrorEquals": [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException"
          ],
          "IntervalSeconds": 2,
          "MaxAttempts": 6,
          "BackoffRate": 2
        }
      ],
      "End": true
    }
  }
}
EOF

  service_integrations = {
    lambda = {
      lambda = ["${module.lambda_sendPollNotification.lambda_function_arn}"]
    }
    xray = {
      xray = true
    }

  }

  type = "EXPRESS"

  tags = merge(
    {
      "Name"        = "${local.name}-sendPollNotification",
      "Application" = "sendPollNotification",
    },
    var.tags,
  )
}

# Store main Step function ARN for mobile-app-api
resource "aws_ssm_parameter" "mobile-app-api-poll-step-function" {
  name        = "/${local.name}/mobile-app-api/POLL_STEP_FUNCTION_ARN"
  description = ""
  type        = "String"
  value       = module.send-poll-notification.state_machine_arn
  tags = merge(
    {
      "Application" = "mobile-app-api"
    },
    var.tags,
  )
}


#===================================
# Website - S3 + Cloudfront (CDN)
#===================================


# s3 bucket for static Website
module "s3_website" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "${local.name}-website"
  acl    = "private"

  versioning = {
    enabled = true
  }

  tags = merge(
    {
      "Name" = "${local.name}-website"
    },
    var.tags,
  )
}

# Cloudfront, CDN, distribution for static website in s3
module "cdn_website" {
  source = "terraform-aws-modules/cloudfront/aws"

  #aliases = ["${var.domain}", "www.${var.domain}"]
  aliases = ["${var.domain}", "www.${var.domain}"]

  comment             = "${local.name}-website CDN distribution"
  enabled             = true
  default_root_object = "index.html"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_All"
  retain_on_delete    = false
  wait_for_deployment = false

  # When you enable additional metrics for a distribution, CloudFront sends up to 8 metrics to CloudWatch in the US East (N. Virginia) Region.
  # This rate is charged only once per month, per metric (up to 8 metrics per distribution).
  create_monitoring_subscription = false

  create_origin_access_identity = true
  origin_access_identities = {
    s3_website = "${local.name}-website s3 bucket access from CDN distribution"
  }

  origin = {
    s3_website = {
      domain_name = module.s3_website.s3_bucket_bucket_regional_domain_name
      s3_origin_config = {
        origin_access_identity = "s3_website"
      }
    }
  }

  default_cache_behavior = {
    target_origin_id       = "s3_website"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    query_string           = true
    use_forwarded_values   = false

    # https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/policies/cache
    cache_policy_id = data.aws_cloudfront_cache_policy.cache_policy.id
  }

  viewer_certificate = {
    acm_certificate_arn      = module.acm.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(
    {
      "Name" = "${local.name}"
    },
    var.tags,
  )
}

data "aws_cloudfront_cache_policy" "cache_policy" {
  name = "Managed-CachingOptimized"
}

# Origin Access Identities
data "aws_iam_policy_document" "website_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.s3_website.s3_bucket_arn}/*"]

    principals {
      type        = "AWS"
      identifiers = module.cdn_website.cloudfront_origin_access_identity_iam_arns
    }
  }
}

resource "aws_s3_bucket_policy" "website_policy" {
  bucket = module.s3_website.s3_bucket_id
  policy = data.aws_iam_policy_document.website_policy.json
}


#==============
# Route 53
#==============

# Referencing the route53 hosted zone created in TF PROD
data "aws_route53_zone" "this" {
  name = var.domain
}

# cloud.console.getwethink.com
resource "aws_route53_record" "console" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = "cloud.console.${data.aws_route53_zone.this.name}"
  type    = "A"

  alias {
    name                   = module.alb-angular.lb_dns_name
    zone_id                = module.alb-angular.lb_zone_id
    evaluate_target_health = true
  }
}

# api.getwethink.com
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = "api.${data.aws_route53_zone.this.name}"
  type    = "A"

  alias {
    name                   = module.alb-node.lb_dns_name
    zone_id                = module.alb-node.lb_zone_id
    evaluate_target_health = true
  }
}

# www.getwethink.com
resource "aws_route53_record" "www_website" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = "www.${data.aws_route53_zone.this.name}"
  type    = "A"

  alias {
    name                   = module.cdn_website.cloudfront_distribution_domain_name
    zone_id                = module.cdn_website.cloudfront_distribution_hosted_zone_id
    evaluate_target_health = true
  }
}
# getwethink.com
resource "aws_route53_record" "website" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = data.aws_route53_zone.this.name
  type    = "A"

  alias {
    name                   = module.cdn_website.cloudfront_distribution_domain_name
    zone_id                = module.cdn_website.cloudfront_distribution_hosted_zone_id
    evaluate_target_health = true
  }
}


#====================================
# ElasticSearch
#====================================

module "opensearch" {
  source = "../../modules/tf-aws-opensearch"
  env    = "prd"

  dns_zone_id = data.aws_route53_zone.this.zone_id

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  security_groups = [
    aws_security_group.node.id,
    module.mobile-app-api.codebuild_sg_id
  ]
  create_iam_service_linked_role = true # Created one per account, in use also by dev

  instance_count          = 3
  zone_awareness_count    = 3
  availability_zone_count = 3

  ebs_volume_size = "30"

  domain_hostname_enabled         = true
  opensearch_subdomain_name       = "${var.env}-os.${var.domain}"
  custom_endpoint_certificate_arn = module.acm.acm_certificate_arn

  advanced_options = {
    "rest.action.multi.allow_explicit_index" = "true"
  }
}
