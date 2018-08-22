+++
date = "2017-06-10T14:16:04+01:00"
title = "GSoC: First evaluation phase"
description = "The first four weeks of Google Summer of Code"
+++

It's been four weeks since Google Summer of Code officially started. In these past four weeks I've worked alongside fellow gsocer [Polina](http://polinankoleva.github.io) to integrate the first Kafka producers and consumers in the UnifiedPush Server code base. It has been a pretty good feeling and something I never really imagined I'd have the opportunity to work on, but I really couldn't have asked for a better project to be involved in.

The first few weeks were focussed on getting familiar with the codebase and the community, setting initial goal posts and defining the methodology we'll be using for the rest of the summer - a small two person agile team with one month sprints and monthly standups/retros with our mentors. 

Getting familiar with all the technologies we'll be using has definitely been quite a steep learning curve. This meant that progress up to now wasn't as quick as we hoped initially, but the process has been really enjoyable so far. I've been able to strengthen my knowledge of technologies I'm already somewhat familiar with (mostly Git and Java) and learn about completely new technologies, codebases and methodologies. 

Something else our mentors have encouraged is being more active within the community, on IRC and on the mailing list.
I'm quite a shy person so this has been more challenging than I thought, but it's something I'm going focus on improving a lot more in the coming weeks. 

In terms of technical progress, so far we've

- Set up the main working environment using Docker containers for Zookeeper and the Kafka Broker - not without a few headaches, but more on this soon.

- Integrated the first Kafka Producer! The producer simply sends a message to a topic called `installationMetrics` every time a push notification was used to launch an application. 

- Integrated the first Kafka Consumer! The consumer is initialized on startup and consumes unread messages from the same topic as the producer, updating the analytics for that application accordingly. 

- Looked at leveraging the Contexts and Dependency Injection (CDI) model for future (and current) producers & consumers. We've decided to go for [Kafka-CDI](https://github.com/matzew/kafka-cdi), a CDI extension built by Matthias for Kafka which provides the basic functionality for this, and which we may build on in the future.
 
I've really enjoyed learning about Kafka and I'm looking forward to getting a deeper understanding of it.
In the upcoming weeks we'll be looking at Kafka Security, Kafka on Openshift and Kafka Streams, hopefully with more regular updates of what I learn in the process! 
