#!/bin/bash

cd /home/ubuntu
mv server docker-image/server
cd /home/ubuntu
sudo cp -r /home/ubuntu/client/client-latest/build /home/ubuntu/docker-image/server/server-latest #build파일을 복사해서 서버폴더에 넣음
cd /home/ubuntu/docker-image #deploy.sh를 실행한다 무중단 배포
./deploy.sh > /dev/null 2> /dev/null < /dev/null &