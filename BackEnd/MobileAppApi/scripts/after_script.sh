#!/bin/bash
# wethink-mobile-app-api pipeline
echo "** Starting application **" >> /tmp/wethink-mobile-app-api_deploy_logs

echo "Grant ubuntu user read permissions on tmp folder"
chown ubuntu: /home/ubuntu/wethink-mobile-app-api/temp

echo "npm start"
runuser -l ubuntu -c 'cd /home/ubuntu/wethink-mobile-app-api && pm2 start --name wethink-mobile-app-api --silent npm -- start'

echo "process completed"

s1='runuser -l ubuntu -c  'pm2 status' | grep -we wethink-mobile-app-api | awk '{print $12}''
sleep 5
s2='runuser -l ubuntu -c  'pm2 status' | grep -we wethink-mobile-app-api | awk '{print $12}''

if [ $s1 == $s2 ]
then
echo "** BUILD SUCCESSFUL **" >> /tmp/wethink-mobile-app-api_deploy_logs
echo >> /tmp/wethink-mobile-app-api_deploy_logs
else
echo "** Node process is restarting **" >> /tmp/wethink-mobile-app-api_deploy_logs
echo >> /tmp/wethink-mobile-app-api_deploy_logs
fi
