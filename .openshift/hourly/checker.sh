!#/bin/bash

cd $OPENSHIFT_REPO_DIR
node update.js > $OPENSHIFT_LOG_DIR/lol_updater.log 2>&1