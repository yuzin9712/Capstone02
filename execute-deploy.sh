#!/bin/bash

cd /home/ubuntu/docker-image #deploy.sh를 실행한다 무중단 배포
./deploy.sh > /dev/null 2> /dev/null < /dev/null &