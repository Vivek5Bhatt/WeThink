#!/bin/bash
set -x
echo "Sleep for 90 seconds to avoid colliding with other deployments"
sleep 90
echo "Run BeforeInstall.sh"
runuser -l ubuntu -c 'pm2 status' | grep -wo wethink-admin-panel-api
if [  $? -ne 0 ];
then
    echo "############################## pm2 not running #################################"
else
    echo "############################## pm2 already running Deleting ####################"
     runuser -l ubuntu -c 'pm2 delete wethink-admin-panel-api'
fi

rm -rf /home/ubuntu/wethink-admin-panel-api

if [ ! -d /home/ubuntu/wethink-admin-panel-api ]; then
	runuser -l  ubuntu -c ' mkdir -p /home/ubuntu/wethink-admin-panel-api'
fi