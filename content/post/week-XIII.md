+++
title = "The final phase"
description = "Google Summer of Code, week 13"
date = "2017-08-23T13:16:04+01:00"
+++

Since the last Google Summer of Code post a few weeks ago in which I promised to post weekly, I've mainly worked on the `kafka-cdi`
library, adding custom serializers/deserializers to automatically handle objects of any type `T`.

### Generic serializers and deserializers for Kafka
I ran into every problem imaginable - null serializers, problems with the library and problems with abstract class serialization.
Here is the list of what was done: 

* Added `GenericSerializer` and `GenericDeserializer` classes, which use Jackson's Json object mapper. I looked into `gson` as a possibility but Jackson was the better choice for what we needed. (Gson also doesn't enforce strict deserialization, which I'm not a huge fan of) [#17](https://github.com/matzew/kafka-cdi/pull/17), plus an [example](https://github.com/dimitraz/kafka-poc/commit/b797667b5d4c3d72704de10dbadcf18349e67a6d) of a generic gson ser/des.

* Used Producer/Consumer overloaded serializer/deserializer constructors. It turns out that if you don't pass the serializers in manually, Kafka will attempt to construct them itself using the default constructor (no typing), which is quite obvious when you eventually get some distance from the problem! [#17](https://github.com/matzew/kafka-cdi/pull/17)

* Default to generic serdes to handle unknown types (right now Apache only supports standard data types) [#17](https://github.com/matzew/kafka-cdi/pull/17)

* Added unit tests for all classes in the serialization package [#17](https://github.com/matzew/kafka-cdi/pull/17), [#23](https://github.com/matzew/kafka-cdi/pull/23)

* Added jackson type info for abstract classes (in our case, we only needed it for the `Variant` class and its subtypes) [#889](https://github.com/aerogear/aerogear-unifiedpush-server/pull/889)
 
* Matthias [refactored](https://github.com/matzew/kafka-cdi/pull/16) the library's `DelegationKafkaConsumer` to support custom Consumers, which were previously only consuming records of type `String, String` [#16](https://github.com/matzew/kafka-cdi/pull/16)

All PRs for this can be found here: [#16](https://github.com/matzew/kafka-cdi/pull/16), [#17](https://github.com/matzew/kafka-cdi/pull/17), [#23](https://github.com/matzew/kafka-cdi/pull/23), [#889](https://github.com/aerogear/aerogear-unifiedpush-server/pull/889), plus an [example](https://github.com/dimitraz/kafka-poc/commit/b797667b5d4c3d72704de10dbadcf18349e67a6d) of a generic gson ser/des.

And the mailing list threads: [#1](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012934.html), [#2](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012951.html)

### Kafka test environment for UPS consumers / producers
Polina worked on a more solid test environment which allows us to test real consumers/producers we are using in the UnifiedPush Server. 

We're using Debezium for setting up the Kafka Cluster in the mock environment and Mockito and Arquillian for constructing our test jar with the dependencies we need. 

So far the tests are working well but we're running into issues with circular dependencies, which means we're probably going to have to try rethink our `Kafka` module. 

The PR for this can be found here: [#895](https://github.com/aerogear/aerogear-unifiedpush-server/pull/895)


### JMS removal 
Matthias refactored the `Token Loader` class to replace the JMS queue with Kafka ([#894](https://github.com/aerogear/aerogear-unifiedpush-server/pull/894)).
After this, (and given the possibility of being able to send any objects with the generic ser/des) we slowly started replacing the rest of the push message flow with Kafka consumers, producers and streams:

* We replaced the old notification router with a new streams based approach [#900](https://github.com/aerogear/aerogear-unifiedpush-server/pull/900)

* We added a producer in the `Push Notification Sender` endpoint, for producing messages read by the streams [#896](https://github.com/aerogear/aerogear-unifiedpush-server/pull/896)

* We added a consumer in the `Token Loader` class, which reads from the streams output topics [#900](https://github.com/aerogear/aerogear-unifiedpush-server/pull/900/commits/0d5407e62ce8b15c1daabda29b56f2e2b85d6cf3)

* We added a consumer in the `Notification Dispatcher` class, which consumes messages from the `MessageHolderWithTokens` producer. [#897](https://github.com/aerogear/aerogear-unifiedpush-server/pull/894), [#894](https://github.com/aerogear/aerogear-unifiedpush-server/pull/894) (token loader producer)

We still have to test everything against all variant types, which we're going to use the [UPS mock data loader](https://github.com/aerogear/ups-mock-data-loader) for. I'm still trying to get it working with a local server though. 

### Metrics processing
Our plan for the next and last week of GSoC is to focus on logging responses and stats (for example, delivery successes and failures) to various topics for processing and analysis with Kafka streams at a later stage. 
Polina has already come up with a few jiras (see our [`gsoc_2017`](https://issues.jboss.org/issues/?jql=labels+%3D+gsoc_2017) label) and we've sent [an email](http://lists.jboss.org/pipermail/aerogear-dev/2017-August/012974.html) to the mailing list asking for ideas from the community as well. 

After that, we'll be publishing our final reports including what's left to do, and we'll probably be doing a "wrap-up webinar", going through our thoughts on the last three months of work and giving a small demo on the final result.