topics:
	docker exec -it mailer_kafka kafka-topics --zookeeper zookeeper:2181 --list

sendMail:
	docker exec -it mailer_kafka kafka-consumer-groups --bootstrap-server kafka:29092 --describe --group sendMail