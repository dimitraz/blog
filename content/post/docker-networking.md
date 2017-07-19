+++
title = "Docker for Mac networking"
description = "Accessing services from containers with Docker for Mac"
date = "2017-07-19T13:16:04+01:00"
+++

When Google Summer of Code first began, one of our first tasks was describing the steps for the required Kafka-Zookeeper setup.
The most straightforward and uncomplicated solution was running the UPS locally, while Zookeeper and the Kafka broker would run in two separate Docker containers. 

From the very beginning I ran into loads of issues. Producers and consumers could be started easily from within the containers and communicate between themselves at that level. 

As soon as I attempted to establish a connection between the local UPS instance and the Kafka broker, however, all communication seemed to come to a standstill. 
Although the application could connect to the broker on its published port and the topics were being created, the messages sent from the UPS were not being properly published and the consumer wasn’t reading anything back.  

It wasn't the first time I had experienced service-container communication issues and a huge hint was of course the fact that this seemed to work seamlessly on Linux.
After many headaches, investigation, trial and error here are a few solutions I've gathered and tested that could be of help to you too.

## The problem
Docker for Mac uses Hyperkit to run a xhyve VM for the Docker daemon.
The VM uses VPNKit for exposing container ports to localhost, but the network settings and adapters are not configurable, meaning that containers cannot be accessed via their IPs and there is no network interface which bridges between the physical machine and the virtual machine.

In summary, this means it's pretty much impossible to directly reach a container via its internal address, while containers cannot access services on the host. 


## Connecting from a container to the host
1. **Route to the host**

Attempting to connect to the host's en0 interface address was the first breakthrough we had. Although this produces the expected results it's not an optimal solution, given the possibility of constantly changing IP addresses, or of no connection at all.

2. **Add the container IP to the lo0 interface**

The most reliable solution I've come across so far is to alias to the loopback 0 interface:
``` 
sudo ifconfig lo0 alias $CONTAINER_IP
```
 
It's a quick and easy option and works well for most use cases I've come across. You can use any unused IP address for this, but using the container IP is a personal preference of mine for easily keeping tabs.


3. **Use the `192.168.65.1` address**

The host can be accessed from the container using the address `192.168.65.1`.
As far as I know this is the address of the VM's eth0 interface, but it isn't very well documented (or documented at all, in that case).

4. **Use the `docker.for.mac.localhost` DNS name**

The most recent solution outlined in the docs recommends the following, from version `17.06` onwards:

> Connect to the special Mac-only DNS name `docker.for.mac.localhost` which will resolve to the internal IP address used by the host.

### Alternative solutions
There are a few interesting hacks that I've yet to try, but that are worth taking a look at:

1. [**Docker for Mac host bridge by @mal**](https://github.com/mal/docker-for-mac-host-bridge)

Uses `tuntap` to add a `tap` interface to the Docker VM for routing traffic back and forth between the containers and the host machine.

2. [**OpenVPN by @wojas**](https://github.com/wojas/docker-mac-network)

Uses `OpenVPN` to access internal Docker networks from the host machine.

## Connecting from the host to a container
There are two options here. Simply publishing the ports is the easiest route to go, but if you can't mess around with ports and are facing port conflicts, do the following:

1. Start the container
```
docker run -d -p 80:80 nginx
```

2. Add the alias to the loopback0 interface:
``` 
sudo ifconfig lo0 alias  172.17.0.4
```

3. `sudo vi /etc/hosts` and add a line for your service, for example: `172.17.0.4 nginx.local` 
 
You should be able to access it now at `nginx.local`.

**Note**: If you have multiple applications, just bind to a specific address and follow the same steps for all applications:

``` 
docker run -p 192.100.200.1:80:80 nginx
docker run -p 192.100.200.2:80:80 drupal
..,
```

```
sudo ifconfig lo0 alias 192.100.200.1/24
sudo ifconfig lo0 alias 192.100.200.2/24
...
```

``` 
192.100.200.1 nginx.local
192.100.200.2 drupal.local
...
```

## Further reading
* Github Issues: [docker/for-mac#1031](https://github.com/docker/for-mac/issues/1031), [docker/for-mac#155](https://github.com/docker/for-mac/issues/155), [docker/for-mac#68](https://github.com/docker/for-mac/issues/68), [docker/for-mac#57](https://github.com/docker/for-mac/issues/57), [moby/hyperkit#45](https://github.com/moby/hyperkit/issues/45), [moby/moby#22753](https://github.com/moby/moby/issues/22753), [moby/moby#22429](https://github.com/moby/moby/issues/22429)

* Docker forums: [#17835](https://forums.docker.com/t/support-tap-interface-for-direct-container-access-incl-multi-host/17835), [#8424](https://forums.docker.com/t/ip-routing-to-container/8424), [#12414](https://forums.docker.com/t/network-bridge-on-host/12414), [#18828](https://forums.docker.com/t/connect-directly-to-container/18828)

* [Docker for Mac docs](https://docs.docker.com/docker-for-mac/networking/)

* [Docker for Mac Host bridge](https://github.com/mal/docker-for-mac-host-bridge)

* [Access internal Docker networks using OpenVPN](https://github.com/wojas/docker-mac-network)


## Feedback 
This post is a combination of information gathered from perusing the Docker forums, Github issues, Stack Overflow and Docker docs. A huge thanks goes to @almirkadric for taking the time to answer all my questions on the forum. 
If you have anything to add or correct, please let me know.