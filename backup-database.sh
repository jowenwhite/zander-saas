#!/bin/bash
BACKUP_DIR=~/dev/zander-backups
mkdir -p $BACKUP_DIR
FILENAME="zander_dev_$(date +%Y%m%d_%H%M%S).sql"
pg_dump zander_dev > "$BACKUP_DIR/$FILENAME"
echo "✅ Backup created: $BACKUP_DIR/$FILENAME"
ls -t $BACKUP_DIR/*.sql | tail -n +31 | xargs rm -f 2>/dev/null
ls -lh "$BACKUP_DIR/$FILENAME"
