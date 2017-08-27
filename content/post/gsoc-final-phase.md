+++
title = "Google Summer of Code 2017"
description = "Final results"
date = "2017-08-27T14:16:04+01:00"
draft = "true"
+++

For the last three months I've worked on the [Aerogear UnifiedPush Server](https://github.com/aerogear/aerogear-unifiedpush-server) developing a proof of concept for utilizing Kafka producers, consumers and streams for push message routing and metrics analysis.

## Useful links
* [`GSoc 2017 Branch`](https://github.com/aerogear/aerogear-unifiedpush-server/tree/GSOC_2017_kafka) and [commits](https://github.com/aerogear/aerogear-unifiedpush-server/commits/GSOC_2017_kafka)
* All [UPS PRs](https://github.com/aerogear/aerogear-unifiedpush-server/pulls?utf8=✓&q=is%3Apr%20author%3Adimitraz%20) and [Kafka CDI PRs](https://github.com/matzew/kafka-cdi/pulls?q=is%3Apr+author%3Adimitraz) by me
* [`GSoC 2017 Jira board`](https://issues.jboss.org/browse/AGPUSH-2187?jql=labels%20%3D%20gsoc_2017)

## Overall Stats
* 87 total Jira Tasks created
* 36 pull requests to the UPS
* 7 pull requests to Kafka CDI 
* The GSoC branch is 58 commits ahead of the master

## What was done
With the help of our mentors, we managed to replace the Java Messaging System with a completely Kafka based workflow for push message routing: 

1. When the Push Notification Sender endpoint is invoked, a [Kafka producer](https://github.com/aerogear/aerogear-unifiedpush-server/pull/896) in that endpoint produces the request with key/value pair (`PushApplication`, `InternalUnifiedPushMessage`) to the `agpush_pushMessageProcessing` topic. 

2. The [`Notification Router` streams class](https://github.com/aerogear/aerogear-unifiedpush-server/pull/900) is initialized on application startup and begins its work when a message is sent to the above-mentioned topic. After some processing, it streams the push messages out (in the form of a `MessageHolderWithVariants` object) to 6 different output topics based on the message's variant type (Android, iOS, etc). 

3. The [`Token Loader` consumer](https://github.com/aerogear/aerogear-unifiedpush-server/pull/900/commits/0d5407e62ce8b15c1daabda29b56f2e2b85d6cf3) listens for messages on the 6 streams output topics and after [further complicated processing](https://github.com/aerogear/aerogear-unifiedpush-server/blob/5b268fcb80bd66a26b39147777061ff229ed39f9/push/sender/src/main/java/org/jboss/aerogear/unifiedpush/message/token/TokenLoader.java), loads batches of tokens for devices that match requested database parameters.

4. The messages with tokens are dispatched and received by the [`MessageHolderWithTokens` producer](https://github.com/aerogear/aerogear-unifiedpush-server/blob/5b268fcb80bd66a26b39147777061ff229ed39f9/push/sender/src/main/java/org/jboss/aerogear/unifiedpush/message/kafka/MessageHolderWithTokensKafkaProducer.java) which produces each message to its respective topic (again, based on variant type). 

5. Finally, we have a [`MessageHolderWithTokens` consumer](https://github.com/aerogear/aerogear-unifiedpush-server/blob/GSOC_2017_kafka/push/sender/src/main/java/org/jboss/aerogear/unifiedpush/message/kafka/MessageHolderWithTokensKafkaConsumer.java) which consumes the `MessageHolderWithTokens` objects and fires a CDI event. This event is handled on the other side by the [`NotificationDispatcher`](https://github.com/aerogear/aerogear-unifiedpush-server/blob/GSOC_2017_kafka/push/sender/src/main/java/org/jboss/aerogear/unifiedpush/message/NotificationDispatcher.java), which sends each message to its appropriate push network (Adm, Apns, etc).
We decided to stick with CDI events over regular Producers and Consumers to offer an extra layer of abstraction.

We've also looked at Kafka for collecting and processing push related metrics. So far, we have topics for invalid tokens (which will be used for removing them from the database), push message failures and successes, and iOS-specific token failures and successes. 
We're currently working on a demo application that will read from these topics and perform processing on the data using Kafka Streams.

This work can all be broken down into the PRs, blog posts, and mailing list threads below (along with PRs by [Polina](https://github.com/aerogear/aerogear-unifiedpush-server/pulls?q=is%3Apr+author%3Apolinankoleva) and [Matthias](https://github.com/aerogear/aerogear-unifiedpush-server/pulls?q=is%3Apr+author%3Amatzew), not listed):

### Kafka-CDI library
* Added default generic serializer/deseralizer to handle objects of type `T` ([#17](https://github.com/matzew/kafka-cdi/pull/17), [mailing list thread #1](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012934.html), [mailing list thread #2](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012951.html))

* Unit testing for `serialization` package ([#17](https://github.com/matzew/kafka-cdi/pull/17), [#23](https://github.com/matzew/kafka-cdi/pull/23))

### UnifiedPush Server
* Describe installation of Apache Kafka for dev environment on Docker and Openshift ([#838](https://github.com/aerogear/aerogear-unifiedpush-server/pull/838), [#862](https://github.com/aerogear/aerogear-unifiedpush-server/pull/862), [#902](https://github.com/aerogear/aerogear-unifiedpush-server/pull/902), [final readme](https://github.com/aerogear/aerogear-unifiedpush-server/tree/GSOC_2017_kafka/kafka))

* Setup Kafka test environment ([#848](https://github.com/aerogear/aerogear-unifiedpush-server/pull/848))

* Implementation of the first Kafka Producer in the `InstallationRegistrationEndpoint` ([#841](https://github.com/aerogear/aerogear-unifiedpush-server/pull/841), [#852](https://github.com/aerogear/aerogear-unifiedpush-server/pull/852))

* Integrating the `Kafka CDI` library, replacing producers with injection ([#857](https://github.com/aerogear/aerogear-unifiedpush-server/pull/857), [#861](https://github.com/aerogear/aerogear-unifiedpush-server/pull/860))

* Analysis of codebase with Structure 101 and SonarQube with JaCoCo code coverage ([#865](https://github.com/aerogear/aerogear-unifiedpush-server/pull/865), [#863](https://github.com/aerogear/aerogear-unifiedpush-server/pull/863), [blog post](https://dimitraz.github.io/blog/post/ups-metrics/), [mailing list thread #1](http://lists.jboss.org/pipermail/aerogear-dev/2017-July/012904.html))

* Create a Kafka module for Kafka related configuration and tests ([#870](https://github.com/aerogear/aerogear-unifiedpush-server/pull/870))

* Jackson polymorphic serialisation for abstract `Variant` class ([#889](https://github.com/aerogear/aerogear-unifiedpush-server/pull/889), [mailing list thread #1](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012951.html))

* Update Installation metrics producer ([#890](https://github.com/aerogear/aerogear-unifiedpush-server/pull/890))

* Create `NotificationDispatcher` consumer (closed, in favour of CDI events abstraction) ([#897](https://github.com/aerogear/aerogear-unifiedpush-server/pull/897))

* Use Kafka Streams for push message processing ([#900](https://github.com/aerogear/aerogear-unifiedpush-server/pull/900))

* Add a producer for APNS specific token metrics ([#908](https://github.com/aerogear/aerogear-unifiedpush-server/pull/908))

### Research & Other
* [AGPUSH-2098](https://issues.jboss.org/browse/AGPUSH-2098) Spike for initial Kafka integration 
* [AGPUSH-2107](https://issues.jboss.org/browse/AGPUSH-2107) Spike for Kafka Stream API usage
* [AGPUSH-2104](https://issues.jboss.org/browse/AGPUSH-2104) Research Java EE programming model for Kafka
* [AGPUSH-2108](https://issues.jboss.org/browse/AGPUSH-2108), [AGPUSH-2148](https://issues.jboss.org/browse/AGPUSH-2148) Research Kafka on Openshift 
* [AGPUSH-2109](https://issues.jboss.org/browse/AGPUSH-2109) Research Kafka Security
* [AGPUSH-2181](https://issues.jboss.org/browse/AGPUSH-2181) Research custom ser/des
* [AGPUSH-2110](https://issues.jboss.org/browse/AGPUSH-2110) Spike for Push notification delivery
* [AGPUSH-2111](https://issues.jboss.org/browse/AGPUSH-2111) Spike for Push notification Metrics
* [AGPUSH-2157](https://issues.jboss.org/browse/AGPUSH-2157) Kafka performance metrics
* Small tweaks to the UPS mock data loader ([#5](https://github.com/aerogear/ups-mock-data-loader/pull/5))
* Small tweaks to the Java-ADM library  ([#5](https://github.com/aerogear/java-adm/pull/5))

And finally, all mailing list updates: [1](http://lists.jboss.org/pipermail/aerogear-dev/2017-June/012887.html), [2](http://lists.jboss.org/pipermail/aerogear-dev/2017-June/012869.html), [3](http://lists.jboss.org/pipermail/aerogear-dev/2017-July/012894.html), [4](http://lists.jboss.org/pipermail/aerogear-dev/2017-July/012899.html), [5](http://lists.jboss.org/pipermail/aerogear-dev/2017-July/012904.html), [6](http://lists.jboss.org/pipermail/aerogear-dev/2017-July/012914.html), [7](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012934.html), [8](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012949.html), [9](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012955.html), [10](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012974.html), [11](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012976.html) (UPS roadmap)

All blog posts: [1](https://dimitraz.github.io/blog/post/welcome/), [2](https://dimitraz.github.io/blog/post/docker-networking/), [3](https://dimitraz.github.io/blog/post/ups-metrics/), [4](https://dimitraz.github.io/blog/post/phase-ii/), [5](https://dimitraz.github.io/blog/post/week-xiii/)


## What is left to do 
* **Migration to HBase**: Our project diverged naturally from the initial proposal. We encountered several unexpected roadbumps and we ran out of time for database migration (which is a huge task within itself). 

* **Unit and integration testing**: The UPS average code coverage percentage is quite low. Ideally I would liked to have be more thorough in the testing of our new branch, and improved the overall test coverage of the master branch. This is something we want to work on in the future.

* **Kafka Security**: Our final goal (as agreed upon with our mentors) was always a working proof of concept, as opposed to a production ready product. The remaining Jiras in our backlog are mostly related to security, which will be worked on after GSoC is over. 

* All other remaining tickets in our backlog can be found under the `gsoc_2017` label, [here](https://issues.jboss.org/browse/AGPUSH-2187?jql=labels%20%3D%20gsoc_2017)

