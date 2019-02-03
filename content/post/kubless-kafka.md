+++
title = "Serverless on Kubernetes with Kubeless and Kafka"
description = "Event-driven functions on Kubernetes"
date = "2019-02-03T03:18:01+01:00"
+++

In this blog post I want to show how I used Kubeless and Strimzi (Apache Kafka) to set up event-driven serverless functions on Kubernetes and Openshift.

## The technologies

Kubeless is based on the idea of on premise serverless for Kubernetes, and uses built-in Kubernetes primitives to achieve this goal. Kubeless uses the [operator framework](https://coreos.com/operators/) and custom resource definitions (CRDs) to define objects like `functions` and `triggers` (more on this below).

Apache Kafka is a distributed, horizontally scaleable, fault tolerant messaging system.
Kafka combines ideas of traditional queueing and messaging systems, with nice features like strong order guarantees and distributed topic replication. These things have made it a good choice for large enterprise applications.

## Why?

Kubeless uses Apache Kafka as a messaging system under the hood and deploys its own Kafka instance in the Kubernetes cluster on installation. In my case, I already have a Kafka cluster for stream processing running in Kubernetes, in the form of Strimzi. Strimzi is a RedHat backed project which contains loads of useful deployment options and configuration for setting up Kafka on Kubernetes or Openshift. Like Kubeless, Strimzi also uses the operator framework, and allows you to define custom resources like `kafkas` and `topics` which will be automatically handled by its controllers/operators.

In order to use Kubless with the already running Kafka cluster, I created an [ansible playbook](https://github.com/dimitraz/kafkaless-installer) to manage the set up. If you're interested in trying it out yourself, make sure you have ansible installed and a running Kubernetes/Openshift cluster, and then run the playbook.

## Event triggers

Now that Kubernetes, Kafka (Strimzi) and Kubeless are all running, we can start invoking our serverless functions. In my case, I wanted to be able to invoke a function any time my Kafka producer publishes a message to a certain topic.

There are 3 steps to doing this:

### Step 1

Create your kubeless function.

```
apiVersion: kubeless.io/v1beta1
kind: Function
metadata:
  name: hello-world
  namespace: functions
  labels:
    created-by: kubeless
    function: hello-world
spec:
  handler: handler.hello
  runtime: nodejs6
  function: |
    module.exports = {
      hello: function(event, context) {
        return 'Hello friend..'
      }
    }
```

This does a few things:

- Defines a Kubeless function called `hello-world` using the `Function` custom resource
- Specifies the namespace the function should be deployed to (in this case "functions")
- Defines the runtime and the code that will be executed. This is just a simple Javascript function which returns a ["Hello friend"](https://media.giphy.com/media/250vleznvxXOM/200.gif) string.

### Step 2

Next, create a Kubeless event trigger. This will associate the `hello-world` function to a topic (let's say `hello-topic`), so that every time the topic is published to, the function will be invoked.

```
apiVersion: kubeless.io/v1beta1
kind: KafkaTrigger
metadata:
  clusterName: ""
  finalizers:
    - kubeless.io/kafkatrigger
  labels:
    created-by: kubeless
  name: hello-trigger
  namespace: functions
spec:
  functionSelector:
    matchLabels:
      created-by: kubeless
      function: hello-world
  topic: hello-topic
```

This does the following:

- Defines a `KafkaTrigger` custom resource called `hello-trigger` in the functions namespace
- Associates the function (spec.functionSelector.function) with the topic (spec.topic)

### Step 3

Lastly, publish a message to the `hello-topic` topic. I like to use [Shopify's Sarama client](https://github.com/dimitraz/kafka-go-clients/tree/master/sarama) when I'm testing. Check the pod logs for the function and make sure the function is correctly being invoked.

---

**Note** If you use that deployment file, make sure you update the _SERVERS_ env var to the location of your Kafka cluster. In my case, this is `my-cluster-kafka-bootstrap.strimzi:9092`, where _my-cluster_ is the name of the cluster, and _strimzi_ is the namespace where it is running. If you're using strimzi, you shouldn't need to change the port or the _-kafka-bootstrap_ suffix.

## Serverless framework

The same can be done using the [serverless framework](https://github.com/serverless/serverless-kubeless) to make things a bit easier to manage.

First, install serverless:

```
npm install -g serverless
```

Next, create a python (or any other language of your choice) function called `hello.py`:

```
def hello(event, context):
    print("Hello friend..")
```

Copy this `package.json` that will be used by serverless:

```
{
  "name": "hello-world",
  "version": "1.0.0",
  "description": "Example function for serverless kubeless",
  "dependencies": {
    "serverless-kubeless": "^0.7.0"
  },
  "devDependencies": {},
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "Apache-2.0"
}
```

Next, create the serverless yaml file, which will associate the function to the trigger topic:

```
service: hello-world

provider:
  name: kubeless
  runtime: python3.6

plugins:
  - serverless-kubeless

functions:
  hello-world:
    handler: handler.hello
    events:
      - trigger: 'hello-topic'
```

That's it! Run an `npm install` followed by a `serverless deploy`. Because Kubeless has been associated with the Strimzi cluster, no extra configuration is needed. Serverless deploys the function which can now be invoked by publishing to the hello topic.
A nice advantage of using serverless is being able to invoke the function for testing purposes using the serverless cli:

```
serverless invoke -f hello-world -l

Serverless: Calling function: hello...
--------------------------------------------------------------------
hello world
```

You can also see the logs of a function:

```
serverless logs -f hello
```

And get information about that function:

```
serverless info
```
