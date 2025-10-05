migrate-mongo migrations directory.

Install migrate-mongo locally and then use:

# create a new migration (timestamped file)
# npx migrate-mongo create add-example-field

# to run migrations
# npx migrate-mongo up

# to revert last migration
# npx migrate-mongo down

Place migration scripts here. Each migration exports `up(db, client)` and `down(db, client)` functions.
