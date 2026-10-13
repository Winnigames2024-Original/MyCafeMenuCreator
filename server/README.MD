# Create SERVER.jS
## Put server.js to your server into a /var/www/cafe-bot/

#
##

# DEPENDENCIES
## NGINX
sudo pm2 start server.js --name "cafe-terminal-api"
sudo pm2 save

sudo pm2 start server.js --name "cafe-terminal-api"
sudo pm2 save
