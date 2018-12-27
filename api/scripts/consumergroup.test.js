const kafka = require('kafka-node');

const options = {
  groupId: 'hola',
  autoCommit: false,
  kafkaHost: 'kafka:29092',

//   host: '127.0.0.1:2181',
  sessionTimeout: 15000,
  protocol: ['roundrobin'],
  fromOffset: 'none'
};

const client = new kafka.Client();
const offset = new kafka.Offset(client);

const ConsumerGroup = kafka.ConsumerGroup;
const consumerGroup1 = new ConsumerGroup(options, ['tasks']);


offset.fetchCommits('hola', [{ topic: 'tasks', partition: 0 }], (error, offsets) => { console.log(offsets) })

consumerGroup1.on('message', (message) => {
  console.log(`topic ${message.topic} partition ${message.partition} offset ${message.offset}`);
  offset.commit('hola', [{
                                        topic: message.topic,
                                        partition: message.partition, //default 0
                                        offset: message.offset,
                                        metadata: 'm', //default 'm'
                                     }], (err, data) => {
                                     console.log("successfully committed");
                                     console.log("err:" + err);
                                     console.log("data: " + data);
                                     });
                                     setTimeout(()=>{
                                        console.log("terminado",message.offset);
                                    },1000);
});

consumerGroup1.on('error', (error) => {
  console.log('error',error);
});