#!/bin/bash
set -x
echo "Run BeforeInstall.sh"
runuser -l ubuntu -c 'pm2 status' | grep -wo wethink-mobile-app-api
if [  $? -ne 0 ];
then
    echo "############################## pm2 not running #################################"
else
    echo "############################## pm2 already running Deleting ####################"
     runuser -l ubuntu -c 'pm2 delete wethink-mobile-app-api'
fi

rm -rf /home/ubuntu/wethink-mobile-app-api

if [ ! -d /home/ubuntu/wethink-mobile-app-api ]; then
	runuser -l  ubuntu -c ' mkdir -p /home/ubuntu/wethink-mobile-app-api'
fi