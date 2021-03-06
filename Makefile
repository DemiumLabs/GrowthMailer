create:
	docker exec -it kafka kafka-topics --create --zookeeper zookeeper:2181 --topic tasks --replication-factor 1 --partitions 60

topics:
	docker exec -it kafka kafka-topics --zookeeper zookeeper:2181 --list

sendMail:
	docker exec -it kafka kafka-consumer-groups --bootstrap-server kafka:29092 --describe --group sendMail

restart:
	docker restart mailer_services

services-start:
	docker-compose -f docker-compose.services.yml up -d

services-down:
	docker-compose -f docker-compose.services.yml down

services-logs:
	docker-compose -f docker-compose.services.yml logs -f --tail 50