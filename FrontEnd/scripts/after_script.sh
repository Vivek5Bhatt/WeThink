#!/bin/bash
set -x
echo "*** After script started to deploy dist***" >> /tmp/wethink-admin-panel_deploy_logs
cd /home/ubuntu/wethink-admin-panel/
chown -R ubuntu:ubuntu /home/ubuntu/wethink-admin-panel/

echo "***here we are not generating dist just copying from build step***" >> /tmp/wethink-admin-panel_deploy_logs

if [ -d "/home/ubuntu/wethink-admin-panel/dist" ]
then
echo "***removing & creating folder to deploy dist***" >> /tmp/wethink-admin-panel_deploy_logs

if [ -d "/var/www/html/wethink" ]
then
sleep 1
rm -rf /var/www/html/wethink
mkdir /var/www/html/wethink
else
mkdir /var/www/html/wethink
sleep 1
fi

echo "***deploying dist after changing base path if needed***" >> /tmp/wethink-admin-panel_deploy_logs
runuser -l ubuntu -c 'cd /home/ubuntu/wethink-admin-panel/dist'
#sed -i -e 's/href\=\"\/\"/href\=\"\/'wethink'\/\"/g' /home/ubuntu/wethink-admin-panel/dist/index.html
cp -ur /home/ubuntu/wethink-admin-panel/dist/*  /var/www/html/wethink/
# Restart Nginx Service to load latest changes
service nginx restart
else
exit 1
fi
