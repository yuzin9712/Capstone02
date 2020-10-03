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
<img src="./Images/21.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>


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
<img src="./Images/22.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>


## System Architecture
---
<img src="./Images/1.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>


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
<img src="./Images/2.jpg" width="300px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img>  <img src="./Images/3.jpg" width="300px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>

### 2. MAIN PAGE
----
<img src="./Images/4.jpg" width="300px" height="650px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>

### 3. PRODUCT DETAIL PAGE
---
<img src="./Images/5.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/6.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>

### 4. PURCHASE PROCESS/ DELIVERY
---
<img src="./Images/7.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/8.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/9.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>

### 5. COSTUME TOOL
---
<img src="./Images/10.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>

### 6. MY PAGE
---
<img src="./Images/17.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/11.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/18.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>

### 7. DESIGN PAGE & FASHION CARE COMMUNITY PAGE
---
<img src="./Images/12.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/13.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/14.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/15.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/16.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>

### 8. ANALYTICS
---
<img src="./Images/19.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>
<img src="./Images/20.jpg" width="450px" height="300px" title="px(픽셀) 크기 설정" alt="RubberDuck"></img><br/>

## Contributing

👩‍💻👨‍💻 Team softJS 👩‍💻👨‍💻 

@이건희  
@[ramram1048](https://github.com/ramram1048)  
@[epson220](https://github.com/epson220)  
@[yuzin9712](https://github.com/yuzin9712)
