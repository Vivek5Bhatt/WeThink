#!/bin/bash
set -x
touch /tmp/wethink-admin-panel_deploy_logs
if [ -s /home/ubuntu/wethink-admin-panel/dist ]
then
echo "dist folder is deleted" >> /tmp/wethink-admin-panel_deploy_logs
runuser -l ubuntu -c 'rm -rf /home/ubuntu/wethink-admin-panel/dist'
else
echo "dist folder will be created" >> /tmp/wethink-admin-panel_deploy_logs
fi
rm -rf /home/ubuntu/wethink-admin-panel >> /tmp/wethink-admin-panel_deploy_logs
if [ ! -d /home/ubuntu/wethink-admin-panel ]; then
runuser -l ubuntu -c 'mkdir -p /home/ubuntu/wethink-admin-panel' >> /tmp/wethink-admin-panel_deploy_logs
fi