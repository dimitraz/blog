+++
title = "GSoC: Lessons from week 10"
description = "Week 11 of Google Summer of Code"
date = "2017-08-08T14:17:04+01:00"
+++

### How to make custom serializers and deserializers for Kafka

I've mainly been working on the Kafka-CDI library, adding custom serializers/deserializers to give us the ability to produce/consumer whatever we want to/from our topics.

Once I figured out how to get the job done in my own little projects (~post to follow~), I fell into the trap of thinking that it was going to be a really quick fix getting the same going for the UPS. Yet here I am, almost two weeks later. While I've managed to run into almost every problem imaginable, it's definitely been one of the most enjoyable things I've worked on so far.


On my first attempt, the serializers and deserializers would always return a null type, therefore throwing `NullPointerExceptions` despite the fact that I had explicitly passed in the object type myself. 
I eventually resorted to digging in to the actual upstream [source code](https://github.com/apache/kafka/tree/f87d58b796977fdaefb089d17cb30b2071cd4485/clients/src/main/java/org/apache/kafka/clients) where I found I had been using the wrong constructors. It turns out that if you pass the serializers in manually, Kafka will attempt to construct them itself using the default constructor (no typing), which is quite blatantly obvious when you eventually get some distance from the problem. 

(I also stumbled upon (and lost sleep over) type erasure and reflection for the first time, which was something I hadn't even _heard_ of in my two years so far at university). 

After that was sorted out, the next issue was related to the Consumer, which was only consuming records of type `String, String`. We made a Jira and Matthias [refactored](https://github.com/matzew/kafka-cdi/pull/16) the library's `DelegationKafkaConsumer` to support custom Consumers, which allowed me to [complete the work](https://github.com/matzew/kafka-cdi/pull/17#pullrequestreview-55203529) (for now) on the custom Ser/Des. 

There are still a few more issues. Polina has [made a PR](https://github.com/polinankoleva/aerogear-unifiedpush-server/commit/7c754932bed91afcdf72ed72c8072535ff07800a) for a [push notification producer](https://issues.jboss.org/browse/AGPUSH-2159) that sends the `pushApplication` and `message` to a topic for processing by the `NotificationRouter`. It won't work out of the box as the `PushApplication` class contains a list of type `Variant`, which is an abstract class (for obvious reasons, we can't serialise abstract classes). 
We also can't afford for topics to receive objects of all different types, or things might just implode. I assume this will have to be addressed with security at a later stage. 

### Unit testing
During my trials and tribulations with the custom ser/des, [my brother in law](http://marcotroisi.com) pointed out the fact that I wouldn't need to be debugging so much if the tests I wrote were up to scratch. I haven’t been writing many (or any) tests up till now so that made an impression. I hear a lot about TDD in school but in my own personal projects I usually slap a few tests together at the end of the project with some edge cases, convince myself of a job well done and call it a day. After reading more about it in the past few weeks, I’m definitely more aware of the importance of testing, but _true_ TDD is still something I’m not completely comfortable with yet. I’m going to try write some better tests for the work I’ve done so far, and I’m hoping to look at Test Driven Development in depth in my own projects once I’m back at university. 

### POC links 
I'll be carrying on with the serialisation work for the next few weeks, and hopefully I'll be back with another summary post after that. In the meantime, links to my small proof of concepts mentioned above can be found here:

- [Kafka Streams playground with custom serdes](https://github.com/dimitraz/kafka-streams-playground)
- [Kafka producers/consumers with custom serdes](https://github.com/dimitraz/kafka-poc)
- [Kafka CDI example usage](https://github.com/dimitraz/kafka-cdi-resteasy)