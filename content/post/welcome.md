+++
date = "2017-06-10T14:16:04+01:00"
title = "The evaluation phase"

+++

It's been four weeks since Google Summer of Code officially started, four weeks in which I've worked alongside fellow gsocer [Polina](http://polinankoleva.github.io) to integrate the first Kafka producers and consumers in the UnifiedPush Server code base. It has been a pretty good feeling and something I never really imagined I'd have the opportunity to work on, but I really couldn't have asked for a better project.

So far, we've

- Set up the main working environment using Docker containers for Zookeeper and the Kafka Broker - not without a few headaches, but more on this soon.

- Integrated the first Kafka Producer! The producer simply sends a message to a topic called `installationMetrics` every time a push notification was used to launch an application. 

- Integrated the first Kafka Consumer! The consumer is initialized on startup and consumes unread messages from the same topic as the producer, updating the analytics for that application accordingly. 

- Looked at leveraging the Contexts and Dependency Injection (CDI) model for future (and current) producers & consumers. We've decided to go for [Kafka-CDI](https://github.com/matzew/kafka-cdi), a CDI extension built by Matthias for Kafka which provides the basic functionality for this, and which we may build on in the future.
 
In the upcoming weeks we'll be looking at Kafka Security, Kafka on Openshift and Kafka Streams, hopefully with more regular updates of what I learn in the process! 
