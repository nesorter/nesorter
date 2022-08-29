env | grep SHOUT

sed -i "s/{SHOUT_ADMIN_EMAIL}/$SHOUT_ADMIN_EMAIL/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SOURCE_PASSWORD}/$SHOUT_SOURCE_PASSWORD/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_RELAY_PASSWORD}/$SHOUT_RELAY_PASSWORD/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_ADMIN_USERNAME}/$SHOUT_ADMIN_USERNAME/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_ADMIN_PASSWORD}/$SHOUT_ADMIN_PASSWORD/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_LOGLEVEL}/$SHOUT_SYSTEM_TUNE_LOGLEVEL/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_HOSTNAME}/$SHOUT_SYSTEM_TUNE_HOSTNAME/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_CLIENTS}/$SHOUT_SYSTEM_TUNE_CLIENTS/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_SOURCES}/$SHOUT_SYSTEM_TUNE_SOURCES/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_THREADPOOL}/$SHOUT_SYSTEM_TUNE_THREADPOOL/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_QUEUE_SIZE}/$SHOUT_SYSTEM_TUNE_QUEUE_SIZE/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_CLIENT_TIMEOUT}/$SHOUT_SYSTEM_TUNE_CLIENT_TIMEOUT/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_HEADER_TIMEOUT}/$SHOUT_SYSTEM_TUNE_HEADER_TIMEOUT/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_SOURCE_TIMEOUT}/$SHOUT_SYSTEM_TUNE_SOURCE_TIMEOUT/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_BURST_ON_CONNECT}/$SHOUT_SYSTEM_TUNE_BURST_ON_CONNECT/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_SYSTEM_TUNE_BURST_SIZE}/$SHOUT_SYSTEM_TUNE_BURST_SIZE/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_MOUNT}/$SHOUT_MOUNT/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_USER}/$SHOUT_USER/" /etc/icecast2/icecast.xml
sed -i "s/{SHOUT_PASSWORD}/$SHOUT_PASSWORD/" /etc/icecast2/icecast.xml

/etc/init.d/icecast2 start && tail -F /var/log/icecast2/error.log
