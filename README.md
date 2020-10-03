# 🧙‍♂️멋쟁이마당

멋쟁이마당은 온라인 쇼핑몰의 다양한 상품에서 오는 선택과 정보 공유 및 소통의 문제를 해결합니다.

## Goal
---
```
이번 프로젝트는 일상 속 많은 부분을 차지하고 있는 패션을 컨텐츠로 모든 이들이 자유롭게 소통하고 공유하는 플랫폼 개발을 목표로 한다. 

이를 통해 패션에 대해 잘 알지 못하던 사람들도 패션을 보다 쉽게 접할 수 있게 하고자 한다. 특히 그래픽 프로세싱 캡스톤이라는 짧은 일정동안 플랫폼 개발이라는 커다란 프로젝트를 완성하기 위해 일정 관리가 상당히 중요한데, 이를 위해 burndown chart를 도입해 적극 활용한다.

burndown chart는 남은 작업과 시간을 시각적으로 보여주는 방법이다. 우리는 이번 과목에서 실제 프로젝트에 burndown chart를 적용하고 이에 맞춰 개발을 완수해보는 것을 목표로 했다. 
```

## Pain Points
---
```
1. 여러 쇼핑몰 사이트를 하나하나 검색해 쇼핑해야 한다는 번거로움

2.  쇼핑몰에 제품이 너무 많고 다양하여, 어떤 식으로 옷을 입고, 구매해야 할지 모르겠다. 

3. 온라인 쇼핑몰에서, 패션에 대해 누군가와 소통하고 공유하기 어렵다. 
```

## Solution
---
```
1. 여러 쇼핑몰의 제품을 한 곳에서 볼 수 있다.

2. 구매 전, 상품을 코디해 볼 수 있는 코디 툴을 이용해 코디해 볼 수 있다.

3. 유저들끼리 패션정보를 공유하고 소통할 수 있다.
```

## Main Target and Stakeholders
---
![21](https://user-images.githubusercontent.com/58067265/94992766-1ee6b900-05c7-11eb-88cf-2e6675e3d20c.JPG)


## Stack
---

|종류|사용 목적/ 선택 이유|
|---|---|
|React|- 컴포넌트 별 개발 용이|
||- DOM 관리 용이|
|Redux|- 컴포넌트 상태 관리|
|Fabric.js|- canvas 보다 단순|
||- 객체 집합과 사용자 interaction으로 빠른 결과물 구현|
|Node.js|- single thread 기반 비동기 I/O 처리 방식|
|Express.js|- 미들웨어 기능 제공으로 api 단순화|
|Mysql|- 빠르고 유연함|
||- 사용 쉬움|

## Software Architecture
---
![22](https://user-images.githubusercontent.com/58067265/94992771-25753080-05c7-11eb-9683-d086305914c7.JPG)


## System Architecture
---
![1](https://user-images.githubusercontent.com/58067265/94992602-23f73880-05c6-11eb-9094-28d63a3b946c.JPG)


👷‍♀️TRAVIS CI 

- Github과 연동이 뛰어나고, Jenkins와 달리 서버 구축할 필요가 없어서 선택했다.

- SW 프로젝트의 빌드 및 테스트 자동화 

🐳DOCKER  
- 별도의 서버 추가 필요 없이 컨테이너로 추상화하여 서비스 배포 및 관리에 사용
- docker-compose를 사용하여 블루-그린 배포 방식으로 무중단 배포

🟢NGINX  
- 로드 밸런싱을 통해 무중단 배포 환경을 만드는데 사용


🍪REDIS  
- 세션 저장 및 관리를 위함, 키-값 구조
- 서버 실행 중 에러 혹은 배포시 서버가 꺼지면 세션이 만료되는 현상 해소
  
  

## 🙌 PRODUCT
### 1. SIGN/LOG IN
----
![2](https://user-images.githubusercontent.com/58067265/94992631-6587e380-05c6-11eb-9a8a-df8aacb7b843.JPG)

![3](https://user-images.githubusercontent.com/58067265/94992640-70427880-05c6-11eb-9c5d-9f918ebe168a.jpg)

### 2. MAIN PAGE
----
![4](https://user-images.githubusercontent.com/58067265/94992650-7afd0d80-05c6-11eb-8ecc-6e9c0c350f7a.JPG)

### 3. PRODUCT DETAIL PAGE
---
![5](https://user-images.githubusercontent.com/58067265/94992657-83554880-05c6-11eb-8d60-5c4e6905d9c9.JPG)

![6](https://user-images.githubusercontent.com/58067265/94992665-8bad8380-05c6-11eb-83b8-64c80cc3d9a0.JPG)

### 4. PURCHASE PROCESS/ DELIVERY
---
![7](https://user-images.githubusercontent.com/58067265/94992672-99fb9f80-05c6-11eb-8b41-9851bd3491fc.JPG)

![8](https://user-images.githubusercontent.com/58067265/94992678-a2ec7100-05c6-11eb-81f2-22459dcc3cfd.JPG)

![9](https://user-images.githubusercontent.com/58067265/94992686-ad0e6f80-05c6-11eb-869f-714b0fba9363.JPG)

### 5. COSTUME TOOL
---
![10](https://user-images.githubusercontent.com/58067265/94992696-b4ce1400-05c6-11eb-87b5-350960cac090.JPG)

### 6. MY PAGE
---
![17](https://user-images.githubusercontent.com/58067265/94992744-f959af80-05c6-11eb-9b1e-27b8c0043965.JPG)

![11](https://user-images.githubusercontent.com/58067265/94992703-c1526c80-05c6-11eb-9371-58e708379da3.JPG)

![18](https://user-images.githubusercontent.com/58067265/94992747-04acdb00-05c7-11eb-8799-3ca0b7c514fb.JPG)

### 7. DESIGN PAGE & FASHION CARE COMMUNITY PAGE
---
![12](https://user-images.githubusercontent.com/58067265/94992714-cf07f200-05c6-11eb-8a84-34f4553e1e0c.JPG)

![13](https://user-images.githubusercontent.com/58067265/94992718-d929f080-05c6-11eb-9d2c-58cfce803970.JPG)

![14](https://user-images.githubusercontent.com/58067265/94992724-e1822b80-05c6-11eb-985a-f41cd5e58277.JPG)

![15](https://user-images.githubusercontent.com/58067265/94992733-eb0b9380-05c6-11eb-9281-fac34a8a9276.JPG)

![16](https://user-images.githubusercontent.com/58067265/94992739-f232a180-05c6-11eb-9c22-497ffbbf493d.JPG)

### 8. ANALYTICS
---
![19](https://user-images.githubusercontent.com/58067265/94992757-0d9dac80-05c7-11eb-9244-c3c48976de99.JPG)

![20](https://user-images.githubusercontent.com/58067265/94992762-18584180-05c7-11eb-8e05-62e57784b5d7.JPG)

## Contributing

👩‍💻👨‍💻 Team softJS 👩‍💻👨‍💻 

@이건희  
@[ramram1048](https://github.com/ramram1048)  
@[epson220](https://github.com/epson220)  
@[yuzin9712](https://github.com/yuzin9712)
