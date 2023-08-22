#!/bin/bash
set -x
echo "** Starting application **" >> /tmp/wethink-admin-panel-api_deploy_logs

echo "npm start"
runuser -l ubuntu -c 'cd /home/ubuntu/wethink-admin-panel-api && pm2 start --name wethink-admin-panel-api --silent npm -- start'

echo "process completed"

s1='runuser -l ubuntu -c  'pm2 status' | grep -we wethink-admin-panel-api | awk '{print $12}''
sleep 5
s2='runuser -l ubuntu -c  'pm2 status' | grep -we wethink-admin-panel-api | awk '{print $12}''

if [ $s1 == $s2 ]
then
echo "** BUILD SUCCESSFUL **" >> /tmp/wethink-admin-panel-api_deploy_logs
echo >> /tmp/wethink-admin-panel-api_deploy_logs
else
echo "** Node process is restarting **" >> /tmp/wethink-admin-panel-api_deploy_logs
echo >> /tmp/wethink-admin-panel-api_deploy_logs
fi