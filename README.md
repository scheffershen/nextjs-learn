## Next.js App Router Course - MySQL Version

This is a modified version of the Next.js App Router Course dashboard application, adapted to use MySQL instead of PostgreSQL.

## Quick Start

1. Clone the repository
2. Install dependencies:

	$ npm i

3. Set up MySQL database using Docker:

	$ docker compose up -d

4. Create `.env` file:

	$ cp .env.example .env

5. Run the development server:

	$ pnpm dev # or npm run dev

6. Seed the database:

	$ node scripts/seed.js

## Database Access

- **MySQL Database**: localhost:3306
  - Username: admin
  - Password: admin123
  - Database: nextjs_dashboard

- **PHPMyAdmin**: http://localhost:5050
  - Server: db
  - Username: admin
  - Password: admin123

## Project Structure

- `/app`: Application routes, components, and logic
- `/app/lib`: Reusable utility functions and data fetching
- `/app/ui`: UI components (cards, tables, forms)
- `/public`: Static assets
- `/scripts`: Database seeding and utility scripts

## Configuration Files

- `docker-compose.yml`: MySQL and PHPMyAdmin container configuration
- `next.config.js`: Next.js configuration
- `.env`: Environment variables (database connection, auth)

## Database Migration

If you need to reset the database:

1. Stop the application
2. Remove existing containers and volumes:

	$ docker compose down -v

3. Start fresh containers:

	$ node scripts/seed.js


## References

- [Next.js Documentation](https://nextjs.org/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Original Course](https://nextjs.org/learn/dashboard-app)

## Date

10/2024

## Notes

This is a modified version of the original Next.js dashboard example, adapted to use MySQL instead of PostgreSQL. The core functionality remains the same, but the database layer has been updated to work with MySQL.

## Troubleshooting

If you encounter database connection issues:
1. Ensure Docker containers are running: `docker-compose ps`
2. Check container logs: `docker-compose logs db`
3. Verify `.env` configuration matches Docker settings
4. Try restarting containers: `docker-compose restart`

## Development Tips

- Use PHPMyAdmin to inspect database structure and data
- Check Docker container status with `docker-compose ps`
- Monitor logs with `docker-compose logs -f`