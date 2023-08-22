# This file contains resources which are not part of the DEV environment, but a pre development , accessed manually by devs

#==================
# RDS - PRE_DEV - DATABASE
#==================

# RDS DB SUBNET GROUP
resource "aws_db_subnet_group" "pre-dev" {
  name       = "wethink-pre-dev"
  subnet_ids = module.vpc.public_subnets

  tags = merge(
    {
      "Name"        = "wethink-pre-dev",
      "Environment" = "pre-dev"
    },
    var.tags,
  )
}

# RDS Security Group
resource "aws_security_group" "pre-dev-rds" {
  name        = "wethink-pre-dev-rds"
  description = "wethink-pre-dev Filters Database Traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    description = "PostgreSQL access from External Dev Users - Ankit"
    cidr_blocks = [var.user_public_ip_ankit]
  }
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    description = "PostgreSQL access from External Dev Users - Sheetal"
    cidr_blocks = [var.user_public_ip_sheetal]
  }
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    description = "PostgreSQL access from External Dev Users - Carlos"
    cidr_blocks = [var.user_public_ip_carlos]
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
      "Name"        = "wethink-pre-dev-rds",
      "Environment" = "pre-dev"
    },
    var.tags,
  )
}

# RDS Postgresql module

module "pre-dev-db" {
  source = "terraform-aws-modules/rds/aws"

  identifier        = "wethink-pre-dev"
  apply_immediately = true

  engine            = "postgres"
  engine_version    = "12.11"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  username = "postgres" #"user_pg"
  port     = "5432"

  vpc_security_group_ids = [aws_security_group.pre-dev-rds.id]

  maintenance_window      = "Mon:00:00-Mon:03:00"
  backup_window           = "03:00-06:00"
  backup_retention_period = 7

  db_subnet_group_name = aws_db_subnet_group.pre-dev.name

  # DB parameter group
  family = "postgres12"

  # DB option group
  major_engine_version = "12"

  skip_final_snapshot = true
  snapshot_identifier = "updated-v1-wethink-dev"

  # Encryption not suported
  storage_encrypted = false

  # ONLY FOR THIS DB
  publicly_accessible = true

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
      "Name"        = "wethink-pre-dev-rds",
      "Environment" = "pre-dev"
    },
    var.tags,
  )
}
