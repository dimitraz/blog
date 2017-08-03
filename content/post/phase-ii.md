+++
title = "Evaluation phase II"
description = "Google Summer of Code second evaluation phase"
date = "2017-07-28T14:16:04+01:00"
+++

It's week 9 of Google Summer of Code and we've officially reached the second evaluation phase, which means we only have about four weeks left until our project comes to an end.

This last month has been heavily focused on research (a lot more so than I initally anticipated) and attempting to get more involved in the community, mostly since one of our mentors was away.
We faced a few blockers and experienced our fair share of ups and downs but we've managed to make a fair bit of progress, with support from the community:

* We created a new Kafka module in the UPS for Kafka related configs and tests ([#870](https://github.com/aerogear/aerogear-unifiedpush-server/pull/870)) 

* We’ve updated the README with instructions for running the Kafka cluster on Openshift using templates by the enmasse project  ([#862](https://github.com/aerogear/aerogear-unifiedpush-server/pull/862))

* We’ve been playing around with Structure101 and SonarQube to analyse the UPS codebase. We’ve managed to get SonarQube running with JaCoCo code coverage reports and that's all described a bit more in depth in my [last](https://dimitraz.github.io/blog/post/ups-metrics/) blog post. ([#865](https://github.com/aerogear/aerogear-unifiedpush-server/pull/865), [#866](https://github.com/aerogear/aerogear-unifiedpush-server/pull/866))

* We got the CDI library installed and the first producer [replaced](https://github.com/aerogear/aerogear-unifiedpush-server/pull/860). Getting the consumer injection going proved to be a slightly more difficult feat. We encountered multiple exceptions on redeployment of the UPS (see the [thread](http://lists.jboss.org/pipermail/aerogear-dev/2017-July/012899.html) on the mailing list, and these jiras: [AGPUSH-2139](https://issues.jboss.org/browse/AGPUSH-2139), [AGPUSH-2140](https://issues.jboss.org/browse/AGPUSH-2140), [AGPUSH-2145](https://issues.jboss.org/browse/AGPUSH-2145)). Polina got to work and spent loads of time working with the library to get this resolved, so we're hoping to have this up and running in the very near future.

* We’ve been researching Kafka Security and the Kafka Streams API. I've worked on a few small Streams examples which I'll hopefully be posting a blog about soon. As for security we started outlining the major points that will need to be worked on but we've decided to prioritize other tasks for the time being.

* We’ve made a few small Jira’s for minor UPS improvements which we’ve put under the `gsoc_2017` and `good_first_bug` labels.


The biggest goal we’ve set for ourselves in our 4 week plan is to replace the entire JMS messaging system with Kafka producers and consumers, hopefully leveraging streams where possible. I've started work on this this week and so far, so good! Things seem to be going moderately well for the time being. I'll hopefully be posting weekly updates from now on.
