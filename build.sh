docker build -f Dockerfile.srv -t kugichka/nesorter-api:latest .
docker build -f Dockerfile.front -t kugichka/nesorter-front:latest .
docker build -f Dockerfile.icecast2 -t kugichka/nesorter-icecast:latest .
